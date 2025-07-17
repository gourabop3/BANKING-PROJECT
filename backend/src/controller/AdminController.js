const AdminService = require('../service/AdminService');

class AdminController {
    static async loginAdmin(req, res, next) {
        try {
            const resObj = await AdminService.loginAdmin(req.body);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async toggleUserActivation(req,res,next){
        try{
            const {id} = req.params;
            const {state} = req.body; // true/false
            const resObj = await AdminService.toggleUserActivation(id,state);
            res.status(200).send(resObj);
        }catch(err){
            next(err);
        }
    }

    static async updateUserProfile(req,res,next){
        try{
            const {id} = req.params;
            const resObj = await AdminService.updateUserProfile(id,req.body);
            res.status(200).send(resObj);
        }catch(err){
            next(err);
        }
    }

    static async listUsers(req,res,next){
        try{
            const data = await AdminService.listUsers();
            res.status(200).send(data);
        }catch(err){
            next(err);
        }
    }

    static async getUserProfile(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserProfile(id);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getUserTransactions(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserTransactions(id);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async sendEmailToUser(req, res, next) {
        try {
            const { userId, subject, message } = req.body;
            const data = await AdminService.sendEmailToUser(userId, subject, message);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async listTransactions(req,res,next){
        try{
            const data = await AdminService.listTransactions();
            res.status(200).send(data);
        }catch(err){
            next(err);
        }
    }

    static async refundTransaction(req,res,next){
        try{
            const {id} = req.params;
            const data = await AdminService.refundTransaction(id);
            res.status(200).send(data);
        }catch(err){
            next(err);
        }
    }

    static async getDiscounts(req, res, next) {
        try {
            const data = await AdminService.getDiscounts();
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async addDiscount(req, res, next) {
        try {
            const data = await AdminService.addDiscount(req.body);
            res.status(201).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async deleteDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.deleteDiscount(id);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    // Product Management Methods
    static async getProducts(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
                isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
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
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async createProduct(req, res, next) {
        try {
            const data = await AdminService.createProduct(req.body);
            res.status(201).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.updateProduct(id, req.body);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.deleteProduct(id);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async toggleProductStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const data = await AdminService.toggleProductStatus(id, isActive);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async toggleFeaturedProduct(req, res, next) {
        try {
            const { id } = req.params;
            const { isFeatured } = req.body;
            const data = await AdminService.toggleFeaturedProduct(id, isFeatured);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async uploadProductImage(req, res, next) {
        try {
            const { id } = req.params;
            const imageData = {
                url: req.body.url,
                altText: req.body.altText || '',
                isPrimary: req.body.isPrimary || false
            };
            const data = await AdminService.uploadProductImage(id, imageData);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async removeProductImage(req, res, next) {
        try {
            const { id, imageIndex } = req.params;
            const data = await AdminService.removeProductImage(id, parseInt(imageIndex));
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getProductCategories(req, res, next) {
        try {
            const data = await AdminService.getProductCategories();
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async getDashboardStats(req, res, next) {
        try {
            const data = await AdminService.getDashboardStats();
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AdminController;