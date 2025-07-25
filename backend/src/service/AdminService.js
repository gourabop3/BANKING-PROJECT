const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User.model');
const { ProfileModel } = require('../models/Profile.model');
const { TransactionModel } = require('../models/Transactions.model');
const { AccountModel } = require('../models/Account.model');
const { DiscountModel } = require('../models/Discount.model');
const NodeMailerService = require('../utils/NodeMail');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || '@@adminjwt';

class AdminService {
    static async loginAdmin(body) {
        const { email, password } = body;
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            throw new ApiError(401, 'Invalid admin credentials');
        }
        const token = jwt.sign({ isAdmin: true }, ADMIN_JWT_SECRET, {
            algorithm: 'HS256',
            expiresIn: '1d',
        });
        return { msg: 'Admin login success', token };
    }

    static async toggleUserActivation(userId, state){
        await UserModel.findByIdAndUpdate(userId,{ isActive: state});
        return {
            success: true,
            message: `User account has been ${state? 'activated':'deactivated'}`
        }
    }

    static async updateUserProfile(userId, body){
        await UserModel.findByIdAndUpdate(
            userId,
            {
                name: body.name,
                email: body.email
            },
            { new: true, runValidators: true }
        );

        await ProfileModel.findOneAndUpdate(
            { user: userId },
            {
                mobile_no: body.mobile_no,
                bio: body.bio,
                lastProfileUpdate: new Date()
            },
            { new: true }
        );
        return {
            success: true,
            message: 'Profile updated by admin'
        }
    }

    static async listUsers(){
        const users = await UserModel.find()
            .select('name email isActive createdAt ac_type')
            .populate('account_no', 'ac_no amount')
            .lean();
        
        // Get profile data for each user
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                const profile = await ProfileModel.findOne({ user: user._id })
                    .select('mobile_no bio isEmailVerified kyc_status image')
                    .lean();
                
                return {
                    ...user,
                    profile: profile || {
                        mobile_no: '',
                        bio: '',
                        isEmailVerified: false,
                        kyc_status: 'not_submitted',
                        image: { image_uri: '', public_id: '' }
                    }
                };
            })
        );
        
        return { success: true, data: usersWithProfiles };
    }

    static async getUserProfile(userId) {
        const user = await UserModel.findById(userId)
            .select('name email isActive createdAt ac_type')
            .populate('account_no', 'ac_no amount')
            .lean();
        
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        
        const profile = await ProfileModel.findOne({ user: userId })
            .select('mobile_no bio isEmailVerified kyc_status image lastProfileUpdate')
            .lean();
        
        return {
            success: true,
            data: {
                ...user,
                profile: profile || {
                    mobile_no: '',
                    bio: '',
                    isEmailVerified: false,
                    kyc_status: 'not_submitted',
                    image: { image_uri: '', public_id: '' }
                }
            }
        };
    }

    static async getUserTransactions(userId) {
        const transactions = await TransactionModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .select('amount type remark isSuccess createdAt status')
            .limit(10)
            .lean();
        
        return {
            success: true,
            data: transactions.map(txn => ({
                ...txn,
                description: txn.remark || 'Transaction',
                status: txn.isSuccess ? 'completed' : 'failed'
            }))
        };
    }

    static async sendEmailToUser(userId, subject, message) {
        const user = await UserModel.findById(userId).select('name email');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        try {
            // Send email using NodeMailer service
            await NodeMailerService.sendEmail({
                to: user.email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
                            Message from CBI Banking Admin
                        </h2>
                        <p style="color: #666; font-size: 16px;">Dear ${user.name},</p>
                        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                                ${message.replace(/\n/g, '<br>')}
                            </p>
                        </div>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            Best regards,<br>
                            CBI Banking Admin Team
                        </p>
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                            This is an automated message from CBI Banking System. Please do not reply to this email.
                        </p>
                    </div>
                `
            });

            return {
                success: true,
                message: `Email sent successfully to ${user.email}`
            };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new ApiError(500, 'Failed to send email');
        }
    }

    static async listTransactions(){
        const txns = await TransactionModel.find()
            .sort({createdAt:-1})
            .populate('user','name email')
            .populate('account','ac_type')
            .lean();
        
        return {
            success: true,
            data: txns.map(txn => ({
                ...txn,
                status: txn.isSuccess ? 'completed' : 'failed'
            }))
        };
    }

    static async refundTransaction(txnId){
        const txn = await TransactionModel.findById(txnId);
        if(!txn){
            throw new ApiError(404,'Transaction not found');
        }
        if(txn.isRefunded){
            throw new ApiError(400,'Transaction already refunded');
        }
        // Reverse only if it was a debit
        const account = await AccountModel.findById(txn.account);
        if(!account){
            throw new ApiError(404,'Account not found for transaction');
        }
        // Credit back the amount
        account.amount += txn.amount;
        await account.save();

        // Mark the original txn
        txn.isRefunded = true;
        txn.remark += ' (Refunded)';
        await txn.save();

        // Create refund transaction record
        await TransactionModel.create({
            account: account._id,
            user: txn.user,
            amount: txn.amount,
            isSuccess: true,
            type: 'credit',
            remark: 'Refund issued by admin',
            transferId: txn._id
        });

        return {msg:'Refund processed successfully'};
    }

    static async getDiscounts() {
        const discounts = await DiscountModel.find().sort({ createdAt: -1 }).lean();
        return {
            success: true,
            data: discounts
        };
    }

    static async addDiscount(body) {
        const { name, description, value, type } = body;
        
        if (!name || !value || !type) {
            throw new ApiError(400, 'Name, value, and type are required');
        }
        
        const discount = await DiscountModel.create({
            name,
            description: description || '',
            value: parseFloat(value),
            type: type // 'percent' or 'amount'
        });
        
        return {
            success: true,
            message: 'Discount added successfully',
            data: discount
        };
    }

    static async deleteDiscount(discountId) {
        const discount = await DiscountModel.findById(discountId);
        if (!discount) {
            throw new ApiError(404, 'Discount not found');
        }
        
        await DiscountModel.findByIdAndDelete(discountId);
        
        return {
            success: true,
            message: 'Discount deleted successfully'
        };
    }
}

module.exports = AdminService;