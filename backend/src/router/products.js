const express = require('express');
const router = express.Router();
const ProductController = require('../controller/ProductController');

// Public product routes (no authentication required)
router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/categories', ProductController.getCategories);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/:id', ProductController.getProductById);

module.exports = router;