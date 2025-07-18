const AdminService = require('../service/AdminService');
const KYCService = require('../service/KYCService');

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

    // KYC Management Methods
    static async getKYCPending(req, res, next) {
        try {
            const data = await KYCService.listPending();
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async approveKYC(req, res, next) {
        try {
            const { id } = req.params;
            const data = await KYCService.approve(id);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }

    static async rejectKYC(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const data = await KYCService.reject(id, reason);
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AdminController;