const express = require("express")
const AuthMiddleware = require("../../middleware/AuthMiddleware")
const PaymentGatewayController = require("../../controller/PaymentGatewayController")
const { body, param, query } = require("express-validator")
const ValidationMiddleware = require("../../middleware/ValidationMiddleware")

const router = express.Router()

// Payment processing endpoints (for external integrations)
router.route('/process-payment')
.post([
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
    body('customer_info.email').isEmail().withMessage('Valid email required'),
    body('customer_info.name').optional().isString().withMessage('Customer name must be string'),
    body('payment_method.type').optional().isIn(['card', 'bank_transfer', 'upi', 'wallet', 'net_banking']).withMessage('Invalid payment method'),
    body('callback_url').optional().isURL().withMessage('Valid callback URL required'),
    ValidationMiddleware
], PaymentGatewayController.ProcessPayment)

// Get payment status
router.route('/payment-status/:transaction_id')
.get([
    param('transaction_id').isString().notEmpty().withMessage('Transaction ID required'),
    ValidationMiddleware
], PaymentGatewayController.GetPaymentStatus)

// Process refund
router.route('/process-refund')
.post([
    body('transaction_id').isString().notEmpty().withMessage('Transaction ID required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('reason').optional().isString().withMessage('Reason must be string'),
    ValidationMiddleware
], PaymentGatewayController.ProcessRefund)

// Get transaction history
router.route('/transactions')
.get([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    ValidationMiddleware
], PaymentGatewayController.GetTransactionHistory)

// Generate payment link
router.route('/generate-payment-link')
.post([
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
    body('description').optional().isString().withMessage('Description must be string'),
    body('customer_email').isEmail().withMessage('Valid customer email required'),
    body('expires_at').optional().isISO8601().withMessage('Invalid expiration date format'),
    ValidationMiddleware
], PaymentGatewayController.GeneratePaymentLink)

// Bank account management endpoints (for merchants)
router.route('/bank-accounts')
.get(AuthMiddleware, PaymentGatewayController.GetBankAccounts)

router.route('/bank-account/link')
.post(AuthMiddleware, [
    body('account_number').isString().notEmpty().withMessage('Account number required'),
    body('routing_number').isString().notEmpty().withMessage('Routing number required'),
    body('account_holder_name').isString().notEmpty().withMessage('Account holder name required'),
    body('bank_name').isString().notEmpty().withMessage('Bank name required'),
    body('account_type').isIn(['savings', 'current', 'checking']).withMessage('Invalid account type'),
    ValidationMiddleware
], PaymentGatewayController.LinkBankAccount)

router.route('/bank-account/verify')
.post(AuthMiddleware, [
    body('verification_code').isString().notEmpty().withMessage('Verification code required'),
    body('account_id').isString().notEmpty().withMessage('Account ID required'),
    ValidationMiddleware
], PaymentGatewayController.VerifyBankAccount)

// Account balance endpoint
router.route('/account/balance')
.get(AuthMiddleware, PaymentGatewayController.GetAccountBalance)

// Webhook endpoint for bank notifications
router.route('/webhook/bank')
.post(PaymentGatewayController.HandleBankWebhook)

module.exports = router