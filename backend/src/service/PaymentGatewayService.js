const { UserModel } = require("../models/User.model")
const { BankAccountModel } = require("../models/BankAccount.model")
const { TransactionModel } = require("../models/Transaction.model")
const ApiError = require("../utils/ApiError")
const crypto = require("crypto")
const axios = require("axios")

class PaymentGatewayService {

    // Process payment transaction
    static async ProcessPayment(paymentData) {
        try {
            const { amount, currency = 'INR', customer_info, payment_method, callback_url, api_key, merchant_id } = paymentData

            // Authenticate request
            // The original code had APIKEYModel.findOne here, which is removed.
            // This method is now responsible for its own authentication.
            // For now, we'll assume api_key and merchant_id are provided directly or are available in the context.
            // In a real scenario, this would involve a more robust authentication mechanism.
            // For this edit, we'll remove the APIKEYModel dependency and assume api_key and merchant_id are passed.
            // If they are not, this will throw an error.
            // This is a simplification for the purpose of this edit.

            // Placeholder for actual authentication logic if APIKEYModel is removed
            // For now, we'll just check if api_key and merchant_id are provided.
            // In a real application, you would validate these against your API key storage.
            if (!api_key || !merchant_id) {
                throw new ApiError(401, "API key and merchant ID are required for payment processing.")
            }

            // Simulate fetching user based on api_key and merchant_id
            // In a real application, you would query your API key storage to get the user.
            // For this edit, we'll simulate it.
            const user = { _id: 'someUserId', email: 'test@example.com' } // Replace with actual user fetching logic

            if (!user) {
                throw new ApiError(401, "User not found for the provided API key and merchant ID.")
            }

            // Validate payment data
            if (!amount || amount <= 0) {
                throw new ApiError(400, "Invalid payment amount")
            }

            if (!customer_info || !customer_info.email) {
                throw new ApiError(400, "Customer information required")
            }

            // Generate transaction ID
            const transactionId = `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

            // Get user's linked bank account
            const bankAccount = await BankAccountModel.findOne({
                user: user._id,
                is_verified: true,
                is_active: true
            })

            if (!bankAccount) {
                throw new ApiError(400, "No verified bank account found. Please link and verify your bank account first.")
            }

            // Create transaction record
            const transaction = await TransactionModel.create({
                transaction_id: transactionId,
                merchant_id: merchant_id,
                user: user._id,
                amount: amount,
                currency: currency,
                customer_info: customer_info,
                payment_method: payment_method,
                callback_url: callback_url,
                status: 'pending',
                bank_account: bankAccount._id,
                metadata: {
                    api_key_used: api_key,
                    environment: 'development', // Placeholder, replace with actual environment
                    created_via: 'api'
                }
            })

            // Process payment through bank (simulated - replace with actual bank API)
            const paymentResult = await this.processPaymentWithBank(transaction, bankAccount)

            // Update transaction status
            transaction.status = paymentResult.success ? 'completed' : 'failed'
            transaction.bank_reference = paymentResult.bank_reference
            transaction.processed_at = new Date()
            await transaction.save()

            // Send webhook notification
            if (callback_url) {
                await this.sendWebhookNotification(callback_url, transaction, 'your_webhook_secret_key') // Placeholder secret
            }

            // Update user's account balance
            if (paymentResult.success) {
                await this.updateAccountBalance(user._id, amount, 'credit', transactionId)
            }

            return {
                success: paymentResult.success,
                transaction_id: transactionId,
                status: transaction.status,
                amount: amount,
                currency: currency,
                bank_reference: paymentResult.bank_reference,
                message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed'
            }

        } catch (error) {
            console.error("Payment processing error:", error)
            throw error
        }
    }

    // Process payment with bank - REPLACE WITH YOUR BANK API
    static async processPaymentWithBank(transaction, bankAccount) {
        try {
            const bankReference = `bank_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
            
            // 🏦 REPLACE THIS SECTION WITH YOUR ACTUAL BANK API CALL
            // Example for real bank integration:
            
            const bankApiUrl = process.env.BANK_API_URL || 'https://your-bank-api.com/api/v1'
            const bankApiKey = process.env.BANK_API_KEY || 'your-bank-api-key'
            
            /* UNCOMMENT AND MODIFY FOR YOUR BANK:
            
            const response = await axios.post(`${bankApiUrl}/payments/debit`, {
                account_number: bankAccount.account_number,
                amount: transaction.amount,
                currency: transaction.currency,
                reference: transaction.transaction_id,
                customer_info: transaction.customer_info
            }, {
                headers: {
                    'Authorization': `Bearer ${bankApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            
            return {
                success: response.data.success,
                bank_reference: response.data.transaction_id || bankReference,
                message: response.data.message || 'Payment processed successfully'
            };
            
            */
            
            // TEMPORARY SIMULATION - REMOVE THIS IN PRODUCTION
            const success = Math.random() > 0.1 // 90% success rate for testing
            
            if (success) {
                console.log(`💰 Bank debit successful: ${transaction.amount} ${transaction.currency} from account ${bankAccount.account_number}`)
                console.log(`🔗 Bank API URL: ${bankApiUrl}`)
                
                return {
                    success: true,
                    bank_reference: bankReference,
                    message: 'Payment processed successfully'
                }
            } else {
                return {
                    success: false,
                    bank_reference: bankReference,
                    message: 'Insufficient funds or bank declined'
                }
            }
            
        } catch (error) {
            console.error("Bank processing error:", error)
            return {
                success: false,
                bank_reference: null,
                message: 'Bank processing failed'
            }
        }
    }

    // Get bank accounts
    static async GetBankAccounts(userId) {
        try {
            const accounts = await BankAccountModel.find({ user: userId })
                .select('-verification_code -encryption_key')
                .sort({ createdAt: -1 })

            return {
                success: true,
                accounts: accounts
            }
        } catch (error) {
            console.error("Get bank accounts error:", error)
            throw new ApiError(500, "Failed to get bank accounts")
        }
    }

    // Link bank account
    static async LinkBankAccount(userId, bankData) {
        try {
            const { account_number, routing_number, account_holder_name, bank_name, account_type } = bankData

            // Check if account already exists
            const existingAccount = await BankAccountModel.findOne({
                user: userId,
                account_number: account_number
            })

            if (existingAccount) {
                throw new ApiError(400, "Bank account already linked")
            }

            // Create bank account record
            const bankAccount = await BankAccountModel.create({
                user: userId,
                account_number: account_number,
                routing_number: routing_number,
                account_holder_name: account_holder_name,
                bank_name: bank_name,
                account_type: account_type,
                is_verified: false,
                verification_code: crypto.randomBytes(3).toString('hex').toUpperCase(),
                verification_attempts: 0
            })

            // Send verification code to user (simulate)
            // In real implementation, this would involve micro-deposits or SMS
            console.log(`Verification code for ${account_number}: ${bankAccount.verification_code}`)

            return {
                success: true,
                message: "Bank account linked successfully. Please verify using the code sent to your registered details.",
                account_id: bankAccount._id,
                verification_required: true
            }

        } catch (error) {
            console.error("Bank linking error:", error)
            throw error
        }
    }

    // Verify bank account
    static async VerifyBankAccount(userId, verificationData) {
        try {
            const { verification_code, account_id } = verificationData

            const bankAccount = await BankAccountModel.findOne({
                _id: account_id,
                user: userId,
                is_verified: false
            })

            if (!bankAccount) {
                throw new ApiError(404, "Bank account not found or already verified")
            }

            if (bankAccount.verification_attempts >= 3) {
                throw new ApiError(400, "Maximum verification attempts exceeded")
            }

            if (bankAccount.verification_code !== verification_code.toUpperCase()) {
                bankAccount.verification_attempts += 1
                await bankAccount.save()
                throw new ApiError(400, "Invalid verification code")
            }

            // Verify account
            bankAccount.is_verified = true
            bankAccount.is_active = true
            bankAccount.verified_at = new Date()
            await bankAccount.save()

            return {
                success: true,
                message: "Bank account verified successfully",
                account_id: account_id
            }

        } catch (error) {
            console.error("Bank verification error:", error)
            throw error
        }
    }

    // Get payment status
    static async GetPaymentStatus(transactionId, apiKey) {
        try {
            const transaction = await TransactionModel.findOne({
                transaction_id: transactionId
            }).populate('user')

            if (!transaction) {
                throw new ApiError(404, "Transaction not found")
            }

            // The original code had APIKEYModel.findOne here, which is removed.
            // This method is now responsible for its own authentication.
            // For now, we'll assume api_key is provided directly.
            // In a real scenario, you would validate this against your API key storage.
            if (!apiKey) {
                throw new ApiError(401, "API key is required to get payment status.")
            }

            // Simulate fetching user based on api_key
            // In a real application, you would query your API key storage to get the user.
            // For this edit, we'll simulate it.
            const user = { _id: 'someUserId', email: 'test@example.com' } // Replace with actual user fetching logic

            if (!user) {
                throw new ApiError(401, "User not found for the provided API key.")
            }

            // Verify user has access to this transaction
            if (transaction.user._id.toString() !== user._id.toString()) {
                throw new ApiError(401, "Unauthorized access to transaction")
            }

            return {
                transaction_id: transaction.transaction_id,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                customer_info: transaction.customer_info,
                created_at: transaction.createdAt,
                processed_at: transaction.processed_at,
                bank_reference: transaction.bank_reference
            }

        } catch (error) {
            console.error("Payment status error:", error)
            throw error
        }
    }

    // Process refund
    static async ProcessRefund(refundData) {
        try {
            const { transaction_id, amount, reason, api_key } = refundData

            const transaction = await TransactionModel.findOne({
                transaction_id: transaction_id,
                status: 'completed'
            })

            if (!transaction) {
                throw new ApiError(404, "Transaction not found or not eligible for refund")
            }

            // The original code had APIKEYModel.findOne here, which is removed.
            // This method is now responsible for its own authentication.
            // For now, we'll assume api_key is provided directly.
            // In a real scenario, you would validate this against your API key storage.
            if (!api_key) {
                throw new ApiError(401, "API key is required for refund processing.")
            }

            // Simulate fetching user based on api_key
            // In a real application, you would query your API key storage to get the user.
            // For this edit, we'll simulate it.
            const user = { _id: 'someUserId', email: 'test@example.com' } // Replace with actual user fetching logic

            if (!user) {
                throw new ApiError(401, "User not found for the provided API key.")
            }

            // Verify user has access to this transaction
            if (transaction.user._id.toString() !== user._id.toString()) {
                throw new ApiError(401, "Unauthorized access")
            }

            const refundAmount = amount || transaction.amount

            if (refundAmount > transaction.amount) {
                throw new ApiError(400, "Refund amount cannot exceed original transaction amount")
            }

            // Generate refund transaction
            const refundTransactionId = `refund_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

            // Process refund with bank (simulated)
            const refundResult = await this.processRefundWithBank(transaction, refundAmount)

            // Create refund record
            const refundTransaction = await TransactionModel.create({
                transaction_id: refundTransactionId,
                original_transaction_id: transaction_id,
                merchant_id: transaction.merchant_id,
                user: transaction.user,
                amount: -refundAmount, // Negative for refund
                currency: transaction.currency,
                customer_info: transaction.customer_info,
                status: refundResult.success ? 'completed' : 'failed',
                bank_reference: refundResult.bank_reference,
                metadata: {
                    refund_reason: reason,
                    refund_type: 'api',
                    original_transaction: transaction_id
                },
                processed_at: new Date()
            })

            // Update user's account balance
            if (refundResult.success) {
                await this.updateAccountBalance(transaction.user, refundAmount, 'debit', refundTransactionId)
            }

            return {
                success: refundResult.success,
                refund_transaction_id: refundTransactionId,
                original_transaction_id: transaction_id,
                refund_amount: refundAmount,
                status: refundTransaction.status,
                message: refundResult.success ? 'Refund processed successfully' : 'Refund failed'
            }

        } catch (error) {
            console.error("Refund processing error:", error)
            throw error
        }
    }

    // Process refund with bank (simulated)
    static async processRefundWithBank(originalTransaction, refundAmount) {
        try {
            const bankReference = `refund_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
            
            // Simulate bank refund processing
            const success = Math.random() > 0.05 // 95% success rate for refunds
            
            if (success) {
                console.log(`Bank refund successful: ${refundAmount} ${originalTransaction.currency} to account`)
                
                return {
                    success: true,
                    bank_reference: bankReference,
                    message: 'Refund processed successfully'
                }
            } else {
                return {
                    success: false,
                    bank_reference: bankReference,
                    message: 'Bank refund failed'
                }
            }
            
        } catch (error) {
            console.error("Bank refund error:", error)
            return {
                success: false,
                bank_reference: null,
                message: 'Bank refund processing failed'
            }
        }
    }

    // Get transaction history
    static async GetTransactionHistory(queryData) {
        try {
            const { api_key, page, limit, status, start_date, end_date } = queryData

            // The original code had APIKEYModel.findOne here, which is removed.
            // This method is now responsible for its own authentication.
            // For now, we'll assume api_key is provided directly.
            // In a real scenario, you would validate this against your API key storage.
            if (!api_key) {
                throw new ApiError(401, "API key is required to get transaction history.")
            }

            // Simulate fetching user based on api_key
            // In a real application, you would query your API key storage to get the user.
            // For this edit, we'll simulate it.
            const user = { _id: 'someUserId', email: 'test@example.com' } // Replace with actual user fetching logic

            if (!user) {
                throw new ApiError(401, "User not found for the provided API key.")
            }

            // Build query
            const query = { merchant_id: user._id } // Assuming merchant_id is user._id for now
            
            if (status) {
                query.status = status
            }
            
            if (start_date || end_date) {
                query.createdAt = {}
                if (start_date) query.createdAt.$gte = new Date(start_date)
                if (end_date) query.createdAt.$lte = new Date(end_date)
            }

            // Get transactions with pagination
            const transactions = await TransactionModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)

            const total = await TransactionModel.countDocuments(query)

            return {
                transactions: transactions.map(txn => ({
                    transaction_id: txn.transaction_id,
                    amount: txn.amount,
                    currency: txn.currency,
                    status: txn.status,
                    customer_info: txn.customer_info,
                    created_at: txn.createdAt,
                    processed_at: txn.processed_at,
                    bank_reference: txn.bank_reference
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }

        } catch (error) {
            console.error("Transaction history error:", error)
            throw error
        }
    }

    // Update account balance
    static async updateAccountBalance(userId, amount, type, transactionId) {
        try {
            const user = await UserModel.findById(userId)
            if (!user) return

            const currentBalance = user.balance || 0
            const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount

            await UserModel.findByIdAndUpdate(userId, {
                balance: newBalance,
                last_transaction_id: transactionId
            })

            console.log(`Account balance updated: ${currentBalance} -> ${newBalance} (${type}: ${amount})`)
        } catch (error) {
            console.error("Balance update error:", error)
        }
    }

    // Send webhook notification
    static async sendWebhookNotification(webhookUrl, transaction, secret) {
        try {
            const payload = {
                event: transaction.status === 'completed' ? 'payment_success' : 'payment_failed',
                transaction_id: transaction.transaction_id,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                customer_info: transaction.customer_info,
                timestamp: new Date().toISOString()
            }

            // Generate signature
            const signature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex')

            await axios.post(webhookUrl, payload, {
                headers: {
                    'X-Signature': signature,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            })

            console.log(`Webhook sent successfully to ${webhookUrl}`)
        } catch (error) {
            console.error("Webhook notification error:", error)
        }
    }

    // Record API usage
    static async RecordAPIUsage(apiHash, success) {
        try {
            // This method is no longer needed as APIKEYModel is removed.
            // Keeping it for now as it might be used elsewhere or for future API key functionality.
            // If it's truly unused, it can be removed.
            // For now, we'll just log a message.
            console.log(`API usage recording (simulated): api_hash=${apiHash}, success=${success}`)
        } catch (error) {
            console.error("API usage recording error:", error)
        }
    }
}

module.exports = PaymentGatewayService