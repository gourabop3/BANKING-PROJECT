const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transactions.model");
const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { generateAccountNumber, getAccountTypeDisplayName } = require("../utils/accountNumberUtils");
const NotificationService = require("./NotificationService");
const mongoose = require("mongoose");

class TransferService {
    /**
     * Verify if recipient account exists and is valid
     */
    static async verifyAccount(accountNumber, currentUserId) {
        if (!accountNumber || accountNumber.length !== 12) {
            throw new ApiError(400, "Invalid account number format");
        }

        // Find all users and their accounts to match the account number
        const users = await UserModel.find({ isActive: true }).populate('account_no');
        
        let recipientAccount = null;
        let recipientUser = null;

        for (const user of users) {
            for (const account of user.account_no) {
                const generatedAccountNumber = generateAccountNumber(user._id, account._id, account.ac_type);
                if (generatedAccountNumber === accountNumber) {
                    recipientAccount = account;
                    recipientUser = user;
                    break;
                }
            }
            if (recipientAccount) break;
        }

        if (!recipientAccount || !recipientUser) {
            throw new ApiError(404, "Account not found");
        }

        // Check if user is trying to transfer to their own account
        if (recipientUser._id.toString() === currentUserId.toString()) {
            throw new ApiError(400, "Cannot transfer to your own account");
        }

        return {
            success: true,
            accountDetails: {
                accountId: recipientAccount._id,
                accountHolderName: recipientUser.name,
                accountType: getAccountTypeDisplayName(recipientAccount.ac_type),
                accountNumber: accountNumber
            }
        };
    }

    /**
     * Initiate money transfer between accounts
     */
    static async initiateTransfer(transferData, senderUserId) {
        const {
            recipientAccountNumber,
            recipientAccountId,
            amount,
            remark,
            transferType
        } = transferData;

        // Validate amount
        if (!amount || amount <= 0) {
            throw new ApiError(400, "Invalid transfer amount");
        }

        // Validate transfer type specific limits
        if (transferType === 'RTGS' && amount < 200000) {
            throw new ApiError(400, "RTGS minimum amount is ₹2,00,000");
        }

        // Get sender's account
        const senderUser = await UserModel.findById(senderUserId).populate('account_no');
        if (!senderUser || !senderUser.account_no || senderUser.account_no.length === 0) {
            throw new ApiError(404, "Sender account not found");
        }

        const senderAccount = senderUser.account_no[0]; // Primary account
        
        // Check sufficient balance
        if (senderAccount.amount < amount) {
            throw new ApiError(400, "Insufficient balance");
        }

        // Get recipient account
        const recipientAccount = await AccountModel.findById(recipientAccountId).populate('user');
        if (!recipientAccount) {
            throw new ApiError(404, "Recipient account not found");
        }

        const recipientUser = recipientAccount.user;

        // Start database transaction for atomicity
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create transfer transactions
            const transferId = new mongoose.Types.ObjectId();
            
            // Debit transaction for sender
            const debitTransaction = new TransactionModel({
                account: senderAccount._id,
                user: senderUserId,
                amount: amount,
                type: 'debit',
                isSuccess: true,
                remark: `${transferType} Transfer to ${recipientUser.name} - ${remark || 'Money Transfer'}`,
                transferId: transferId,
                transferType: transferType,
                recipientAccount: recipientAccountId
            });

            // Credit transaction for recipient
            const creditTransaction = new TransactionModel({
                account: recipientAccount._id,
                user: recipientUser._id,
                amount: amount,
                type: 'credit',
                isSuccess: true,
                remark: `${transferType} Transfer from ${senderUser.name} - ${remark || 'Money Transfer'}`,
                transferId: transferId,
                transferType: transferType,
                senderAccount: senderAccount._id
            });

            // Update account balances
            await AccountModel.findByIdAndUpdate(
                senderAccount._id,
                { $inc: { amount: -amount } },
                { session }
            );

            await AccountModel.findByIdAndUpdate(
                recipientAccount._id,
                { $inc: { amount: amount } },
                { session }
            );

            // Save transactions
            await debitTransaction.save({ session });
            await creditTransaction.save({ session });

            // Commit the transaction
            await session.commitTransaction();

            // Send email notifications asynchronously
            setImmediate(async () => {
                try {
                    // Send transfer confirmation to sender
                    await NotificationService.sendTransferSentEmail(
                        senderUser.name,
                        senderUser.email,
                        amount,
                        recipientUser.name,
                        recipientAccountNumber,
                        transferType,
                        transferId.toString()
                    );

                    // Send transfer received notification to recipient
                    await NotificationService.sendTransferReceivedEmail(
                        recipientUser.name,
                        recipientUser.email,
                        amount,
                        senderUser.name,
                        generateAccountNumber(senderUserId, senderAccount._id, senderAccount.ac_type),
                        transferType,
                        transferId.toString()
                    );

                    // Create announcements
                    await NotificationService.createAnnouncement(
                        senderUserId,
                        'transfer_sent',
                        `Money Transfer Successful`,
                        `₹${amount.toLocaleString()} transferred to ${recipientUser.name} via ${transferType}`
                    );

                    await NotificationService.createAnnouncement(
                        recipientUser._id,
                        'transfer_received',
                        `Money Received`,
                        `₹${amount.toLocaleString()} received from ${senderUser.name} via ${transferType}`
                    );
                } catch (emailError) {
                    console.error("Failed to send transfer notifications:", emailError);
                }
            });

            return {
                success: true,
                message: "Transfer completed successfully",
                transferId: transferId.toString(),
                transactionDetails: {
                    amount: amount,
                    transferType: transferType,
                    recipient: recipientUser.name,
                    remark: remark
                }
            };

        } catch (error) {
            await session.abortTransaction();
            throw new ApiError(500, "Transfer failed: " + error.message);
        } finally {
            session.endSession();
        }
    }

    /**
     * Get transfer history for a user
     */
    static async getTransferHistory(userId) {
        const transfers = await TransactionModel.find({
            user: userId,
            transferId: { $exists: true }
        })
        .sort({ createdAt: -1 })
        .populate('recipientAccount', 'user ac_type')
        .populate('senderAccount', 'user ac_type')
        .limit(50);

        const transferHistory = await Promise.all(transfers.map(async (transfer) => {
            let relatedUser = null;
            let relatedAccountNumber = null;

            if (transfer.type === 'debit' && transfer.recipientAccount) {
                const recipientAccount = await AccountModel.findById(transfer.recipientAccount).populate('user');
                if (recipientAccount) {
                    relatedUser = recipientAccount.user.name;
                    relatedAccountNumber = generateAccountNumber(
                        recipientAccount.user._id,
                        recipientAccount._id,
                        recipientAccount.ac_type
                    );
                }
            } else if (transfer.type === 'credit' && transfer.senderAccount) {
                const senderAccount = await AccountModel.findById(transfer.senderAccount).populate('user');
                if (senderAccount) {
                    relatedUser = senderAccount.user.name;
                    relatedAccountNumber = generateAccountNumber(
                        senderAccount.user._id,
                        senderAccount._id,
                        senderAccount.ac_type
                    );
                }
            }

            return {
                transferId: transfer.transferId,
                type: transfer.type,
                amount: transfer.amount,
                transferType: transfer.transferType,
                remark: transfer.remark,
                relatedUser: relatedUser,
                relatedAccountNumber: relatedAccountNumber,
                status: transfer.isSuccess ? 'Success' : 'Failed',
                date: transfer.createdAt
            };
        }));

        return {
            success: true,
            transfers: transferHistory
        };
    }
}

module.exports = TransferService;