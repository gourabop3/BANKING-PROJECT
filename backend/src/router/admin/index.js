const express = require('express');
const router = express.Router();
const AdminController = require('../../controller/AdminController');
const FileUploadController = require('../../controller/FileUploadController');
const AdminAuthMiddleware = require('../../middleware/AdminAuth');
const { upload } = require('../../config/cloudinary');

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

// Discount management
router.get('/discounts', AdminAuthMiddleware, AdminController.getDiscounts);
router.post('/discounts', AdminAuthMiddleware, AdminController.addDiscount);
router.delete('/discounts/:id', AdminAuthMiddleware, AdminController.deleteDiscount);

// Product management
router.get('/products', AdminAuthMiddleware, AdminController.getProducts);
router.get('/products/:id', AdminAuthMiddleware, AdminController.getProductById);
router.post('/products', AdminAuthMiddleware, AdminController.createProduct);
router.put('/products/:id', AdminAuthMiddleware, AdminController.updateProduct);
router.delete('/products/:id', AdminAuthMiddleware, AdminController.deleteProduct);
router.put('/products/:id/toggle-status', AdminAuthMiddleware, AdminController.toggleProductStatus);
router.put('/products/:id/toggle-featured', AdminAuthMiddleware, AdminController.toggleFeaturedProduct);
router.get('/product-categories', AdminAuthMiddleware, AdminController.getProductCategories);

// File upload routes
router.post('/upload/image', AdminAuthMiddleware, upload.single('image'), FileUploadController.uploadProductImage);
router.post('/upload/source-code', AdminAuthMiddleware, upload.single('sourceCode'), FileUploadController.uploadSourceCode);
router.post('/upload/images', AdminAuthMiddleware, upload.array('images', 10), FileUploadController.uploadMultipleImages);
router.post('/upload/thumbnail', AdminAuthMiddleware, upload.single('thumbnail'), FileUploadController.uploadThumbnail);
router.delete('/upload/delete', AdminAuthMiddleware, FileUploadController.deleteFile);

// Dashboard stats
router.get('/stats', AdminAuthMiddleware, AdminController.getDashboardStats);

module.exports = router;