const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User.model');
const { ProfileModel } = require('../models/Profile.model');
const { TransactionModel } = require('../models/Transactions.model');
const { AccountModel } = require('../models/Account.model');

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
        return {msg: `User account has been ${state? 'activated':'deactivated'}`}
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
        return {msg:'Profile updated by admin'}
    }

    static async listUsers(){
        const users = await UserModel.find().select('name email isActive createdAt');
        return users;
    }

    static async listTransactions(){
        const txns = await TransactionModel.find().sort({createdAt:-1}).populate('user','name email').populate('account','ac_type');
        return txns;
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
}

module.exports = AdminService;