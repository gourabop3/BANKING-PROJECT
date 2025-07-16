const express = require('express');
const router = express.Router();
const KYCController = require('../../controller/KYCController');
const AuthMiddleware = require('../../middleware/AuthMiddleware');
const AdminAuth = require('../../middleware/AdminAuth');

// User routes
router.post('/apply', AuthMiddleware, KYCController.apply);
router.get('/status', AuthMiddleware, KYCController.status);

// Admin routes
router.get('/pending', AdminAuth, KYCController.listPending);
router.put('/approve/:id', AdminAuth, KYCController.approve);
router.put('/reject/:id', AdminAuth, KYCController.reject);

module.exports = router;