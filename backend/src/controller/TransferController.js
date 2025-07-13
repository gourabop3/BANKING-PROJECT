const TransferService = require("../service/TransferService");

class TransferController {
    static verifyAccount = async (req, res) => {
        try {
            const result = await TransferService.verifyAccount(req.body.accountNumber, req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Failed to verify account" 
            });
        }
    }

    static initiateTransfer = async (req, res) => {
        try {
            const result = await TransferService.initiateTransfer(req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Transfer failed" 
            });
        }
    }

    static getTransferHistory = async (req, res) => {
        try {
            const result = await TransferService.getTransferHistory(req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                msg: error.message || "Failed to fetch transfer history" 
            });
        }
    }
}

module.exports = TransferController;