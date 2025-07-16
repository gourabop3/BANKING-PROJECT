const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { UserModel } = require('../models/User.model');
const { ProfileModel } = require('../models/Profile.model');
const { TransactionModel } = require('../models/Transactions.model');
const { AccountModel } = require('../models/Account.model');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || '@@adminjwt';

// Email configuration
const emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'admin@cbibank.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

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

    // Enhanced User Management
    static async listUsers(query = {}) {
        try {
            const { search, status, kyc, page = 1, limit = 10 } = query;
            let filter = {};
            
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (status && status !== 'all') {
                filter.isActive = status === 'active';
            }
            
            if (kyc && kyc !== 'all') {
                filter.kyc_status = kyc;
            }

            const users = await UserModel.find(filter)
                .populate('profile')
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const totalUsers = await UserModel.countDocuments(filter);

            return {
                users,
                total: totalUsers,
                page: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit)
            };
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch users');
        }
    }

    static async getUserDetails(userId) {
        try {
            const user = await UserModel.findById(userId)
                .populate('profile')
                .select('-password');
            
            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            return user;
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch user details');
        }
    }

    static async getUserTransactions(userId) {
        try {
            const transactions = await TransactionModel.find({ user: userId })
                .populate('user', 'name email')
                .sort({ createdAt: -1 });
            
            return transactions;
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch user transactions');
        }
    }

    static async getUserKYC(userId) {
        try {
            // This would typically be a separate KYC model
            // For now, we'll use the user's kyc_status and profile
            const user = await UserModel.findById(userId)
                .populate('profile')
                .select('kyc_status');
            
            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            return {
                status: user.kyc_status || 'pending',
                documents: user.profile?.documents || {},
                user: {
                    name: user.name,
                    email: user.email
                }
            };
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch user KYC');
        }
    }

    static async getUserActivity(userId) {
        try {
            // This would typically be a separate activity/audit log model
            // For now, we'll return sample activity data
            const activities = [
                {
                    action: 'Account created',
                    date: new Date(),
                    details: 'User account was created'
                },
                {
                    action: 'Profile updated',
                    date: new Date(Date.now() - 86400000), // 1 day ago
                    details: 'User updated their profile information'
                }
            ];

            return activities;
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch user activity');
        }
    }

    static async blockUser(userId) {
        try {
            await UserModel.findByIdAndUpdate(userId, { isActive: false });
            return { msg: 'User blocked successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to block user');
        }
    }

    static async unblockUser(userId) {
        try {
            await UserModel.findByIdAndUpdate(userId, { isActive: true });
            return { msg: 'User unblocked successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to unblock user');
        }
    }

    static async resetUserPassword(userId) {
        try {
            const newPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            
            await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
            
            // In a real app, you'd send this password via email
            return { 
                msg: 'Password reset successfully', 
                newPassword: newPassword // Remove this in production
            };
        } catch (error) {
            throw new ApiError(500, 'Failed to reset user password');
        }
    }

    // Bulk User Actions
    static async bulkBlockUsers(userIds) {
        try {
            await UserModel.updateMany(
                { _id: { $in: userIds } },
                { isActive: false }
            );
            return { msg: `${userIds.length} users blocked successfully` };
        } catch (error) {
            throw new ApiError(500, 'Failed to block users');
        }
    }

    static async bulkUnblockUsers(userIds) {
        try {
            await UserModel.updateMany(
                { _id: { $in: userIds } },
                { isActive: true }
            );
            return { msg: `${userIds.length} users unblocked successfully` };
        } catch (error) {
            throw new ApiError(500, 'Failed to unblock users');
        }
    }

    // KYC Management
    static async getPendingKYC() {
        try {
            const pendingKYC = await UserModel.find({ 
                kyc_status: { $in: ['pending', 'submitted'] } 
            })
                .populate('profile')
                .select('name email kyc_status profile');
            
            return pendingKYC.map(user => ({
                _id: user._id,
                user: {
                    name: user.name,
                    email: user.email
                },
                status: user.kyc_status,
                documents: user.profile?.documents || {}
            }));
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch pending KYC');
        }
    }

    static async approveKYC(userId) {
        try {
            await UserModel.findByIdAndUpdate(userId, { kyc_status: 'verified' });
            return { msg: 'KYC approved successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to approve KYC');
        }
    }

    static async rejectKYC(userId) {
        try {
            await UserModel.findByIdAndUpdate(userId, { kyc_status: 'rejected' });
            return { msg: 'KYC rejected successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to reject KYC');
        }
    }

    // Enhanced Transactions
    static async listTransactions(query = {}) {
        try {
            const { search, type, status, page = 1, limit = 10 } = query;
            let filter = {};
            
            if (search) {
                // Search in user name or email
                const users = await UserModel.find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }).select('_id');
                
                filter.user = { $in: users.map(u => u._id) };
            }
            
            if (type && type !== 'all') {
                filter.type = type;
            }
            
            if (status && status !== 'all') {
                filter.status = status;
            }

            const transactions = await TransactionModel.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            return transactions;
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch transactions');
        }
    }

    static async refundTransaction(transactionId) {
        try {
            const transaction = await TransactionModel.findById(transactionId);
            if (!transaction) {
                throw new ApiError(404, 'Transaction not found');
            }

            // Update transaction status
            await TransactionModel.findByIdAndUpdate(transactionId, { 
                status: 'refunded' 
            });

            return { msg: 'Transaction refunded successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to refund transaction');
        }
    }

    // Email Notifications
    static async sendEmail(emailData) {
        try {
            const { recipients, subject, message, template } = emailData;
            
            const emailPromises = recipients.map(async (recipient) => {
                let personalizedMessage = message;
                
                // Replace placeholders with actual data
                if (recipient.name) {
                    personalizedMessage = personalizedMessage.replace(/{name}/g, recipient.name);
                }
                
                const mailOptions = {
                    from: process.env.EMAIL_USER || 'admin@cbibank.com',
                    to: recipient.email,
                    subject: subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
                                <h1>CBI Banking</h1>
                            </div>
                            <div style="padding: 20px; background-color: #f9fafb;">
                                <div style="white-space: pre-line; line-height: 1.6;">
                                    ${personalizedMessage}
                                </div>
                            </div>
                            <div style="background-color: #e5e7eb; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
                                <p>This is an automated message from CBI Banking System.</p>
                            </div>
                        </div>
                    `
                };

                return emailTransporter.sendMail(mailOptions);
            });

            await Promise.all(emailPromises);
            return { msg: `Email sent to ${recipients.length} recipients successfully` };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new ApiError(500, 'Failed to send email');
        }
    }

    // Discount Management
    static async getDiscounts() {
        try {
            // This would typically be a separate discount model
            // For now, we'll return sample data
            const discounts = [
                {
                    _id: '1',
                    value: 10,
                    type: 'percent',
                    description: 'New user discount',
                    active: true,
                    createdAt: new Date()
                },
                {
                    _id: '2',
                    value: 50,
                    type: 'amount',
                    description: 'Transaction fee discount',
                    active: true,
                    createdAt: new Date()
                }
            ];

            return discounts;
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch discounts');
        }
    }

    static async addDiscount(discountData) {
        try {
            const { value, type, description } = discountData;
            
            // In a real app, you'd save to a discount model
            const newDiscount = {
                _id: Date.now().toString(),
                value: parseInt(value),
                type: type,
                description: description || 'No description',
                active: true,
                createdAt: new Date()
            };

            return { 
                msg: 'Discount added successfully',
                discount: newDiscount
            };
        } catch (error) {
            throw new ApiError(500, 'Failed to add discount');
        }
    }

    static async deleteDiscount(discountId) {
        try {
            // In a real app, you'd delete from discount model
            return { msg: 'Discount deleted successfully' };
        } catch (error) {
            throw new ApiError(500, 'Failed to delete discount');
        }
    }

    // Enhanced Stats
    static async getStats() {
        try {
            const totalUsers = await UserModel.countDocuments();
            const activeUsers = await UserModel.countDocuments({ isActive: true });
            const blockedUsers = await UserModel.countDocuments({ isActive: false });
            const verifiedUsers = await UserModel.countDocuments({ kyc_status: 'verified' });
            const pendingKYC = await UserModel.countDocuments({ 
                kyc_status: { $in: ['pending', 'submitted'] } 
            });

            const totalTransactions = await TransactionModel.countDocuments();
            const todayTransactions = await TransactionModel.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            });

            // Calculate total amount
            const amountResult = await TransactionModel.aggregate([
                { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
            ]);
            const totalAmount = amountResult.length > 0 ? amountResult[0].totalAmount : 0;

            return {
                totalUsers,
                activeUsers,
                blockedUsers,
                verifiedUsers,
                pendingKYC,
                totalTransactions,
                todayTransactions,
                totalAmount
            };
        } catch (error) {
            throw new ApiError(500, 'Failed to fetch stats');
        }
    }

    // Legacy methods for backward compatibility
    static async toggleUserActivation(userId, state) {
        await UserModel.findByIdAndUpdate(userId, { isActive: state });
        return { msg: `User account has been ${state ? 'activated' : 'deactivated'}` };
    }

    static async updateUserProfile(userId, body) {
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
        return { msg: 'Profile updated by admin' };
    }
}

module.exports = AdminService;