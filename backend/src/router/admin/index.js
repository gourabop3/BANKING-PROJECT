const express = require('express');
const router = express.Router();
const AdminController = require('../../controller/AdminController');
const AdminAuthMiddleware = require('../../middleware/AdminAuth');

// Admin login
router.post('/login', AdminController.loginAdmin);

// Enhanced user management
router.get('/users', AdminAuthMiddleware, AdminController.listUsers);
router.get('/users/:id', AdminAuthMiddleware, AdminController.getUserDetails);
router.get('/users/:id/transactions', AdminAuthMiddleware, AdminController.getUserTransactions);
router.get('/users/:id/kyc', AdminAuthMiddleware, AdminController.getUserKYC);
router.get('/users/:id/activity', AdminAuthMiddleware, AdminController.getUserActivity);
router.post('/users/:id/block', AdminAuthMiddleware, AdminController.blockUser);
router.post('/users/:id/unblock', AdminAuthMiddleware, AdminController.unblockUser);
router.post('/users/:id/reset-password', AdminAuthMiddleware, AdminController.resetUserPassword);

// Bulk user actions
router.post('/users/bulk/block', AdminAuthMiddleware, AdminController.bulkBlockUsers);
router.post('/users/bulk/unblock', AdminAuthMiddleware, AdminController.bulkUnblockUsers);

// KYC management
router.get('/kyc/pending', AdminAuthMiddleware, AdminController.getPendingKYC);
router.post('/kyc/:id/approve', AdminAuthMiddleware, AdminController.approveKYC);
router.post('/kyc/:id/reject', AdminAuthMiddleware, AdminController.rejectKYC);

// Transactions
router.get('/transactions', AdminAuthMiddleware, AdminController.listTransactions);
router.post('/transactions/:id/refund', AdminAuthMiddleware, AdminController.refundTransaction);

// Email notifications
router.post('/send-email', AdminAuthMiddleware, AdminController.sendEmail);

// Discounts
router.get('/discounts', AdminAuthMiddleware, AdminController.getDiscounts);
router.post('/discounts', AdminAuthMiddleware, AdminController.addDiscount);
router.delete('/discounts/:id', AdminAuthMiddleware, AdminController.deleteDiscount);

// Enhanced stats
router.get('/stats', AdminAuthMiddleware, AdminController.getStats);

module.exports = router;