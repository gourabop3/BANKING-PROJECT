const RechargeService = require("../service/RechargeService");

class RechargeController {
    static mobileRecharge = async (req, res) => {
        try {
            const result = await RechargeService.processMobileRecharge(req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Mobile recharge failed" 
            });
        }
    }

    static billPayment = async (req, res) => {
        try {
            const result = await RechargeService.processBillPayment(req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Bill payment failed" 
            });
        }
    }

    static getRechargeHistory = async (req, res) => {
        try {
            const result = await RechargeService.getRechargeHistory(req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Failed to fetch recharge history" 
            });
        }
    }

    static getOperators = async (req, res) => {
        try {
            const result = await RechargeService.getOperators();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Failed to fetch operators" 
            });
        }
    }
}

module.exports = RechargeController;