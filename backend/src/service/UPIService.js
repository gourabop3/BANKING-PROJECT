const QRCode = require('qrcode');
const bcryptjs = require('bcryptjs');
const { UserModel } = require('../models/User.model');
const { AccountModel } = require('../models/Account.model');
const { TransactionModel } = require('../models/Transactions.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const NodeMailerService = require('../utils/NodeMail');

class UPIService {
    /**
     * Generate a QR code (base64 PNG) for the given user's UPI ID.
     * Optionally include amount and note to create an intent QR.
     */
    static async generateUPIQR(userId, { amount, note } = {}) {
        const user = await UserModel.findById(userId).select('upi_id name');
        if (!user || !user.upi_id) {
            throw new ApiError(404, 'User or UPI handle not found');
        }

        // Create the UPI payment URL (Paytm/BHIM compatible deep link)
        let upiUrl = `upi://pay?pa=${encodeURIComponent(user.upi_id)}&pn=${encodeURIComponent(user.name)}`;
        if (amount) {
            upiUrl += `&am=${encodeURIComponent(amount)}`;
        }
        if (note) {
            upiUrl += `&tn=${encodeURIComponent(note)}`;
        }
        upiUrl += '&cu=INR';

        // Convert to QR code (returns base64 PNG string)
        const qrDataUrl = await QRCode.toDataURL(upiUrl, { type: 'image/png', errorCorrectionLevel: 'H' });
        return {
            upi_id: user.upi_id,
            qr: qrDataUrl,
            upi_url: upiUrl,
            amount: amount || null,
            note: note || null
        };
    }

    /**
     * Register a new UPI handle and PIN for the authenticated user
     */
    static async createUPI(userId, { upi_id, pin }) {
        console.log('Creating UPI for user:', userId, 'with UPI ID:', upi_id);
        
        // Validate required params
        if (!upi_id || !pin) {
            throw new ApiError(400, 'UPI ID and PIN are required');
        }

        // Check if user exists
        const currentUser = await UserModel.findById(userId).select('upi_id name');
        if (!currentUser) {
            throw new ApiError(404, 'User not found');
        }

        // Basic format validation
        const upiRegex = /^[\w.-]+@cbibank$/;
        if (!upiRegex.test(upi_id)) {
            throw new ApiError(400, 'UPI ID must end with @cbibank');
        }

        // Extract username part for better error messages
        const username = upi_id.split('@')[0];
        if (username.length < 2) {
            throw new ApiError(400, 'UPI ID username must be at least 2 characters long');
        }

        // PIN length validation (4 or 6 digits)
        const pinRegex = /^\d{4}$|^\d{6}$/;
        if (!pinRegex.test(pin)) {
            throw new ApiError(400, 'PIN must be 4 or 6 digits');
        }

        // Check for uniqueness and provide suggestions if taken
        const existing = await UserModel.findOne({ upi_id });
        if (existing && existing._id.toString() !== userId) {
            // Generate suggestions for alternative UPI IDs
            const baseName = username;
            const suggestions = [
                `${baseName}${Math.floor(Math.random() * 100)}@cbibank`,
                `${baseName}${new Date().getFullYear()}@cbibank`,
                `${baseName}.${currentUser.name.toLowerCase().split(' ')[0]}@cbibank`,
                `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@cbibank`
            ];
            
            throw new ApiError(400, `UPI ID "${upi_id}" is already taken. Try these suggestions: ${suggestions.slice(0, 2).join(', ')}`);
        }

        // Hash the PIN before storing
        const hashedPin = await bcryptjs.hash(pin, 10);

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { upi_id, upi_pin: hashedPin },
            { new: true }
        ).select('upi_id');

        if (!updatedUser) {
            throw new ApiError(404, 'User not found during update');
        }

        console.log('UPI created successfully for user:', userId, 'with UPI ID:', upi_id);
        return {
            upi_id: updatedUser.upi_id
        };
    }

    /**
     * Process UPI payment between two UPI IDs
     */
    static async processUPIPayment(senderId, { recipient_upi, amount, note, pin }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Validate sender
            // Include +upi_pin because the field is excluded by default for security
            const sender = await UserModel.findById(senderId).select('+upi_pin').populate('account_no');
            if (!sender || !sender.upi_id) {
                throw new ApiError(404, 'Sender UPI ID not found');
            }

            // Validate recipient UPI
            const recipient = await UserModel.findOne({ upi_id: recipient_upi }).populate('account_no');
            if (!recipient) {
                throw new ApiError(404, 'Recipient UPI ID not found');
            }

            // Get sender's primary account
            const senderAccount = sender.account_no[0];
            if (!senderAccount) {
                throw new ApiError(404, 'Sender account not found');
            }

            // Get recipient's primary account
            const recipientAccount = recipient.account_no[0];
            if (!recipientAccount) {
                throw new ApiError(404, 'Recipient account not found');
            }

            // Validate amount
            const transferAmount = parseFloat(amount);
            if (transferAmount <= 0) {
                throw new ApiError(400, 'Invalid amount');
            }

            // Check sufficient balance
            if (senderAccount.amount < transferAmount) {
                throw new ApiError(400, 'Insufficient balance');
            }

            // Validate UPI PIN
            if (!pin) {
                throw new ApiError(400, 'UPI PIN is required');
            }

            const isPinValid = await bcryptjs.compare(pin, sender.upi_pin || '');
            if (!isPinValid) {
                throw new ApiError(401, 'Invalid UPI PIN');
            }

            // Debit from sender
            await AccountModel.findByIdAndUpdate(
                senderAccount._id,
                { $inc: { amount: -transferAmount } },
                { session }
            );

            // Credit to recipient
            await AccountModel.findByIdAndUpdate(
                recipientAccount._id,
                { $inc: { amount: transferAmount } },
                { session }
            );

            // Create transaction records
            const transactionData = {
                amount: transferAmount,
                type: 'upi_transfer',
                isSuccess: true,
                remark: note || `UPI transfer to ${recipient.name}`,
                recipient_upi: recipient_upi,
                sender_upi: sender.upi_id
            };

            // Sender transaction (debit)
            await TransactionModel.create([{
                ...transactionData,
                user: senderId,
                account: senderAccount._id,
                type: 'debit',
                remark: `UPI payment to ${recipient.name} (${recipient_upi})`
            }], { session });

            // Recipient transaction (credit)
            await TransactionModel.create([{
                ...transactionData,
                user: recipient._id,
                account: recipientAccount._id,
                type: 'credit',
                remark: `UPI payment from ${sender.name} (${sender.upi_id})`
            }], { session });

            await session.commitTransaction();

            const paymentResult = {
                transaction_id: new mongoose.Types.ObjectId().toString(),
                amount: transferAmount,
                sender_upi: sender.upi_id,
                recipient_upi: recipient_upi,
                status: 'success',
                timestamp: new Date(),
                note: note || null
            };

            // Send payment success email (don't await to avoid blocking the response)
            this.sendPaymentSuccessEmail(senderId, paymentResult).catch(error => {
                console.error('Email sending failed:', error);
            });

            return paymentResult;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get UPI transaction history for a user
     */
    static async getUPITransactions(userId, { page = 1, limit = 10 } = {}) {
        const user = await UserModel.findById(userId).populate('account_no');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const accountIds = user.account_no.map(acc => acc._id);

        const transactions = await TransactionModel.find({
            account: { $in: accountIds },
            $or: [
                { sender_upi: { $exists: true } },
                { recipient_upi: { $exists: true } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('amount type remark createdAt sender_upi recipient_upi isSuccess');

        const total = await TransactionModel.countDocuments({
            account: { $in: accountIds },
            $or: [
                { sender_upi: { $exists: true } },
                { recipient_upi: { $exists: true } }
            ]
        });

        return {
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total
        };
    }

    /**
     * Validate UPI ID format and existence
     */
    static async validateUPIID(upi_id) {
        // Basic UPI ID format validation
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiRegex.test(upi_id)) {
            return { valid: false, message: 'Invalid UPI ID format' };
        }

        // Check if UPI ID exists in our system
        const user = await UserModel.findOne({ upi_id }).select('name upi_id');
        if (!user) {
            return { valid: false, message: 'UPI ID not found' };
        }

        return {
            valid: true,
            user: {
                name: user.name,
                upi_id: user.upi_id
            }
        };
    }

    /**
     * Get UPI payment limits and settings
     */
    static async getUPILimits(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Default UPI limits (can be made configurable per user)
        return {
            daily_limit: 100000, // ₹1,00,000
            per_transaction_limit: 50000, // ₹50,000
            monthly_limit: 1000000, // ₹10,00,000
            remaining_daily_limit: 100000, // This should be calculated based on today's transactions
            remaining_monthly_limit: 1000000 // This should be calculated based on current month's transactions
        };
    }

    /**
     * Generate dynamic UPI QR with payment intent
     */
    static async generatePaymentQR(userId, paymentData) {
        const user = await UserModel.findById(userId).select('upi_id name');
        if (!user || !user.upi_id) {
            throw new ApiError(404, 'User or UPI handle not found');
        }

        const { amount, note, merchant_code } = paymentData;
        
        // Create enhanced UPI URL with merchant details
        let upiUrl = `upi://pay?pa=${encodeURIComponent(user.upi_id)}&pn=${encodeURIComponent(user.name)}`;
        
        if (amount) {
            upiUrl += `&am=${encodeURIComponent(amount)}`;
        }
        if (note) {
            upiUrl += `&tn=${encodeURIComponent(note)}`;
        }
        if (merchant_code) {
            upiUrl += `&mc=${encodeURIComponent(merchant_code)}`;
        }
        
        upiUrl += '&cu=INR';
        upiUrl += `&tr=${Date.now()}`; // Unique transaction reference

        const qrDataUrl = await QRCode.toDataURL(upiUrl, { 
            type: 'image/png', 
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2
        });

        return {
            upi_id: user.upi_id,
            qr: qrDataUrl,
            upi_url: upiUrl,
            payment_data: paymentData,
            expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        };
    }

    /**
     * Send payment success email to user
     */
    static async sendPaymentSuccessEmail(userId, paymentDetails) {
        try {
            const user = await UserModel.findById(userId).select('name email');
            if (!user || !user.email) {
                console.log('User not found or email not available for payment confirmation');
                return;
            }

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="background-color: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px;">
                                ✓
                            </div>
                            <h2 style="color: #10b981; margin: 0;">Payment Successful!</h2>
                        </div>
                        
                        <p>Dear ${user.name},</p>
                        <p>Your UPI payment has been processed successfully. Here are the details:</p>
                        
                        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">Amount:</td>
                                    <td style="padding: 8px 0; color: #166534;">₹${paymentDetails.amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">Transaction ID:</td>
                                    <td style="padding: 8px 0; color: #166534; font-family: monospace;">${paymentDetails.transaction_id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">From:</td>
                                    <td style="padding: 8px 0; color: #166534; font-family: monospace;">${paymentDetails.sender_upi}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">To:</td>
                                    <td style="padding: 8px 0; color: #166534; font-family: monospace;">${paymentDetails.recipient_upi}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">Date:</td>
                                    <td style="padding: 8px 0; color: #166534;">${paymentDetails.timestamp.toLocaleString('en-IN')}</td>
                                </tr>
                                ${paymentDetails.note ? `
                                <tr>
                                    <td style="padding: 8px 0; color: #166534; font-weight: bold;">Note:</td>
                                    <td style="padding: 8px 0; color: #166534;">${paymentDetails.note}</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                                <strong>Security Reminder:</strong> Keep this transaction ID safe for your records. Never share your UPI PIN or personal banking details with anyone.
                            </p>
                        </div>
                        
                        <p>Thank you for using CBI Bank UPI services!</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/upi/payment-success?transaction_id=${paymentDetails.transaction_id}&amount=${paymentDetails.amount}&recipient_upi=${paymentDetails.recipient_upi}&sender_upi=${paymentDetails.sender_upi}&note=${encodeURIComponent(paymentDetails.note || '')}&timestamp=${paymentDetails.timestamp.toISOString()}" 
                               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                View Transaction Details
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        <p style="color: #6b7280; font-size: 12px; text-align: center;">
                            This is an automated email from CBI Bank UPI. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `;

            await NodeMailerService.sendEmail({
                to: user.email,
                subject: `UPI Payment Successful - ₹${paymentDetails.amount.toLocaleString('en-IN')} - ${paymentDetails.transaction_id}`,
                html: emailHtml
            });

            console.log('Payment success email sent to:', user.email);
        } catch (error) {
            console.error('Error sending payment success email:', error);
            // Don't throw error as email failure shouldn't fail the payment
        }
    }
}

module.exports = UPIService;