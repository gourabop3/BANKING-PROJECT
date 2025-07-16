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

    // Enhanced User Management
    static async listUsers(req, res, next) {
        try {
            const data = await AdminService.listUsers(req.query);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async getUserDetails(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserDetails(id);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async getUserTransactions(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserTransactions(id);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async getUserKYC(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserKYC(id);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async getUserActivity(req, res, next) {
        try {
            const { id } = req.params;
            const data = await AdminService.getUserActivity(id);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async blockUser(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.blockUser(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async unblockUser(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.unblockUser(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async resetUserPassword(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.resetUserPassword(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // Bulk User Actions
    static async bulkBlockUsers(req, res, next) {
        try {
            const { userIds } = req.body;
            const resObj = await AdminService.bulkBlockUsers(userIds);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async bulkUnblockUsers(req, res, next) {
        try {
            const { userIds } = req.body;
            const resObj = await AdminService.bulkUnblockUsers(userIds);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // KYC Management
    static async getPendingKYC(req, res, next) {
        try {
            const data = await AdminService.getPendingKYC();
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async approveKYC(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.approveKYC(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async rejectKYC(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.rejectKYC(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // Transactions
    static async listTransactions(req, res, next) {
        try {
            const data = await AdminService.listTransactions(req.query);
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async refundTransaction(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.refundTransaction(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // Email Notifications
    static async sendEmail(req, res, next) {
        try {
            const emailData = req.body;
            const resObj = await AdminService.sendEmail(emailData);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // Discounts
    static async getDiscounts(req, res, next) {
        try {
            const data = await AdminService.getDiscounts();
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    static async addDiscount(req, res, next) {
        try {
            const discountData = req.body;
            const resObj = await AdminService.addDiscount(discountData);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async deleteDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.deleteDiscount(id);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    // Enhanced Stats
    static async getStats(req, res, next) {
        try {
            const data = await AdminService.getStats();
            res.status(200).send(data);
        } catch (error) {
            next(error);
        }
    }

    // Legacy methods for backward compatibility
    static async toggleUserActivation(req, res, next) {
        try {
            const { id } = req.params;
            const { state } = req.body;
            const resObj = await AdminService.toggleUserActivation(id, state);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }

    static async updateUserProfile(req, res, next) {
        try {
            const { id } = req.params;
            const resObj = await AdminService.updateUserProfile(id, req.body);
            res.status(200).send(resObj);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;