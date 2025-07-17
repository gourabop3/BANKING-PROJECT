const AdminService = require('../service/AdminService');

class ProductController {
    static async getProducts(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                isActive: true, // Only show active products to public
                search: req.query.search
            };
            const data = await AdminService.getProducts(filters);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getProductById(id);
            
            // Only return active products to public
            if (!data.data.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getFeaturedProducts(req, res, next) {
        try {
            const filters = {
                isActive: true,
                isFeatured: true
            };
            const data = await AdminService.getProducts(filters);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getProductsByCategory(req, res, next) {
        try {
            const { category } = req.params;
            const filters = {
                category: category,
                isActive: true
            };
            const data = await AdminService.getProducts(filters);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getCategories(req, res, next) {
        try {
            const data = await AdminService.getProductCategories();
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ProductController;