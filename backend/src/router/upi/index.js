const express = require('express');
const UPIController = require('../../controller/UPIController');
const router = express.Router();
const AuthMiddleware = require('../../middleware/AuthMiddleware');

// Apply authentication to all UPI routes
router.use(AuthMiddleware);

// QR Code Generation
router.get('/qr', UPIController.generateQR);
router.post('/qr/payment', UPIController.generatePaymentQR);

// Register new UPI handle
router.post('/register', UPIController.registerUPI);

// Payment Processing
router.post('/pay', UPIController.processPayment);

// Transaction Management
router.get('/transactions', UPIController.getTransactions);

// UPI Validation
router.get('/validate/:upi_id', UPIController.validateUPI);

// UPI Limits and Info
router.get('/limits', UPIController.getLimits);
router.get('/info', UPIController.getUserUPIInfo);

// PIN reset
router.post('/send-otp', UPIController.sendResetPinOTP);
router.post('/reset-pin', UPIController.resetUPIPin);

// Money Request Routes
router.post('/request-money', UPIController.sendMoneyRequest);
router.get('/money-requests', UPIController.getMoneyRequests);
router.post('/money-requests/:requestId/respond', UPIController.respondToMoneyRequest);

module.exports = router;