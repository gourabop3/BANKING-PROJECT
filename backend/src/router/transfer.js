const express = require('express');
const TransferController = require('../controller/TransferController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Verify recipient account
router.post('/verify-account', AuthMiddleware, TransferController.verifyAccount);

// Initiate money transfer
router.post('/initiate', AuthMiddleware, TransferController.initiateTransfer);

// External bank transfer
router.post('/external', AuthMiddleware, TransferController.externalTransfer);

// Get transfer history
router.get('/history', AuthMiddleware, TransferController.getTransferHistory);

module.exports = router;