const PaymentGatewayService = require("../service/PaymentGatewayService")
const ApiError = require("../utils/ApiError")

class PaymentGatewayController {
    // Process payment transactions
    static ProcessPayment = async (req, res) => {
        try {
            const { amount, currency, customer_info, payment_method, callback_url } = req.body
            const merchant_id = req.headers['x-merchant-id']
            
            const result = await PaymentGatewayService.ProcessPayment({
                amount,
                currency,
                customer_info,
                payment_method,
                callback_url,
                merchant_id
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Payment processing error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Payment processing failed'
            })
        }
    }

    // Get bank accounts for merchant
    static GetBankAccounts = async (req, res) => {
        try {
            const result = await PaymentGatewayService.GetBankAccounts(req.user)
            res.status(200).json(result)
        } catch (error) {
            console.error("Get bank accounts error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to get bank accounts'
            })
        }
    }

    // Link bank account for merchant
    static LinkBankAccount = async (req, res) => {
        try {
            const { 
                account_number, 
                routing_number, 
                account_holder_name, 
                bank_name,
                account_type,
                verification_amount 
            } = req.body
            
            const result = await PaymentGatewayService.LinkBankAccount(req.user, {
                account_number,
                routing_number,
                account_holder_name,
                bank_name,
                account_type,
                verification_amount
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Bank linking error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Bank account linking failed'
            })
        }
    }

    // Verify bank account
    static VerifyBankAccount = async (req, res) => {
        try {
            const { verification_code, account_id } = req.body
            
            const result = await PaymentGatewayService.VerifyBankAccount(req.user, {
                verification_code,
                account_id
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Bank verification error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Bank account verification failed'
            })
        }
    }

    // Get payment status
    static GetPaymentStatus = async (req, res) => {
        try {
            const { transaction_id } = req.params
            
            const result = await PaymentGatewayService.GetPaymentStatus(transaction_id)
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Payment status error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to get payment status'
            })
        }
    }

    // Process refund
    static ProcessRefund = async (req, res) => {
        try {
            const { transaction_id, amount, reason } = req.body
            
            const result = await PaymentGatewayService.ProcessRefund({
                transaction_id,
                amount,
                reason
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Refund processing error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Refund processing failed'
            })
        }
    }

    // Get transaction history
    static GetTransactionHistory = async (req, res) => {
        try {
            const { page = 1, limit = 50, status, start_date, end_date } = req.query
            
            const result = await PaymentGatewayService.GetTransactionHistory({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                start_date,
                end_date
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Transaction history error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to get transaction history'
            })
        }
    }

    // Get account balance
    static GetAccountBalance = async (req, res) => {
        try {
            const result = await PaymentGatewayService.GetAccountBalance(req.user)
            res.status(200).json(result)
        } catch (error) {
            console.error("Balance check error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to get account balance'
            })
        }
    }

    // Webhook handler for bank notifications
    static HandleBankWebhook = async (req, res) => {
        try {
            const signature = req.headers['x-bank-signature']
            const payload = req.body
            
            const result = await PaymentGatewayService.HandleBankWebhook(payload, signature)
            
            res.status(200).json({ received: true })
        } catch (error) {
            console.error("Webhook handling error:", error)
            res.status(500).json({ error: 'Webhook processing failed' })
        }
    }

    // Generate payment link
    static GeneratePaymentLink = async (req, res) => {
        try {
            const { amount, currency, description, customer_email, expires_at } = req.body
            
            const result = await PaymentGatewayService.GeneratePaymentLink({
                amount,
                currency,
                description,
                customer_email,
                expires_at
            })
            
            res.status(200).json(result)
        } catch (error) {
            console.error("Payment link generation error:", error)
            res.status(error.statusCode || 500).json({
                error: error.message || 'Payment link generation failed'
            })
        }
    }
}

module.exports = PaymentGatewayController