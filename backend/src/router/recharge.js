const express = require('express');
const RechargeController = require('../controller/RechargeController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Mobile recharge
router.post('/mobile', AuthMiddleware, RechargeController.mobileRecharge);

// Bill payment
router.post('/bill-payment', AuthMiddleware, RechargeController.billPayment);

// Demo mode recharge (for testing)
router.post('/demo', AuthMiddleware, RechargeController.demoRecharge);

// Real mode recharge (for production)
router.post('/real', AuthMiddleware, RechargeController.realRecharge);

// Get recharge history
router.get('/history', AuthMiddleware, RechargeController.getRechargeHistory);

// Get operator details
router.get('/operators', AuthMiddleware, RechargeController.getOperators);

module.exports = router;