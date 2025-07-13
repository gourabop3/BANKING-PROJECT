const express = require('express');
const authRoutes = require('./auth');
const amountRoutes = require('./amount');
const transferRoutes = require('./transfer');
const kycRoutes = require('./kyc');
const atmCardRoutes = require('./atm-card');
const fdRoutes = require('./fd');
const apiKeyRoutes = require('./api-keys');
const adminRoutes = require('./admin');
const rechargeRoutes = require('./recharge');
const upiRoutes = require('./upi');
const supportRoutes = require('./support');
const paymentGatewayRoutes = require('./payment-gateway');

const router = express.Router();

// Route definitions
router.use('/auth', authRoutes);
router.use('/amount', amountRoutes);
router.use('/transfer', transferRoutes);
router.use('/kyc', kycRoutes);
router.use('/atm-card', atmCardRoutes);
router.use('/fd', fdRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/admin', adminRoutes);
router.use('/recharge', rechargeRoutes);
router.use('/upi', upiRoutes);
router.use('/support', supportRoutes);
router.use('/payment-gateway', paymentGatewayRoutes);

module.exports = router;