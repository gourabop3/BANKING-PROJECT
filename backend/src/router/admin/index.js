const express = require('express');
const router = express.Router();
const AdminController = require('../../controller/AdminController');
const AdminAuthMiddleware = require('../../middleware/AdminAuth');

// Admin login
router.post('/login', AdminController.loginAdmin);

// User management
router.put('/user/:id/toggle-activation', AdminAuthMiddleware, AdminController.toggleUserActivation);
router.put('/user/:id/update-profile', AdminAuthMiddleware, AdminController.updateUserProfile);
router.get('/user/:id/profile', AdminAuthMiddleware, AdminController.getUserProfile);
router.get('/user/:id/transactions', AdminAuthMiddleware, AdminController.getUserTransactions);

// Email functionality
router.post('/send-email', AdminAuthMiddleware, AdminController.sendEmailToUser);

// List users
router.get('/users', AdminAuthMiddleware, AdminController.listUsers);

// Transactions
router.get('/transactions', AdminAuthMiddleware, AdminController.listTransactions);
router.post('/transactions/:id/refund', AdminAuthMiddleware, AdminController.refundTransaction);

// KYC Management
router.get('/kyc/pending', AdminAuthMiddleware, AdminController.getKYCPending);
router.put('/kyc/:id/approve', AdminAuthMiddleware, AdminController.approveKYC);
router.put('/kyc/:id/reject', AdminAuthMiddleware, AdminController.rejectKYC);

// Discount management
router.get('/discounts', AdminAuthMiddleware, AdminController.getDiscounts);
router.post('/discounts', AdminAuthMiddleware, AdminController.addDiscount);
router.delete('/discounts/:id', AdminAuthMiddleware, AdminController.deleteDiscount);

// Example protected route (placeholder for dashboard APIs)
router.get('/stats', AdminAuthMiddleware, (req, res)=>{
    res.send({msg:'Protected admin stats endpoint', userCount:0});
});

module.exports = router;