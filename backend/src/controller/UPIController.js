const UPIService = require('../service/UPIService');

class UPIController {
    static async generateQR(req, res, next) {
        try {
            const data = await UPIService.generateUPIQR(req.user, {
                amount: req.query.amount,
                note: req.query.note,
            });
            res.json({
                msg: 'UPI QR generated',
                ...data,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Register UPI ID and PIN for the authenticated user
     */
    static async registerUPI(req, res, next) {
        try {
            const { upi_id, pin } = req.body;

            if (!upi_id || !pin) {
                return res.status(400).json({ msg: 'UPI ID and PIN are required' });
            }

            const data = await UPIService.createUPI(req.user, { upi_id, pin });

            res.json({
                msg: 'UPI ID created successfully',
                ...data,
            });
        } catch (err) {
            next(err);
        }
    }

    static async generatePaymentQR(req, res, next) {
        try {
            const { amount, note, merchant_code } = req.body;
            const data = await UPIService.generatePaymentQR(req.user, {
                amount,
                note,
                merchant_code
            });
            res.json({
                msg: 'Payment QR generated',
                ...data,
            });
        } catch (err) {
            next(err);
        }
    }

    static async processPayment(req, res, next) {
        try {
            const { recipient_upi, amount, note, pin } = req.body;
            
            if (!recipient_upi || !amount) {
                return res.status(400).json({
                    msg: 'Recipient UPI ID and amount are required'
                });
            }

            const result = await UPIService.processUPIPayment(req.user, {
                recipient_upi,
                amount,
                note,
                pin
            });

            res.json({
                msg: 'Payment processed successfully',
                ...result,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getTransactions(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const data = await UPIService.getUPITransactions(req.user, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                msg: 'UPI transactions retrieved',
                ...data,
            });
        } catch (err) {
            next(err);
        }
    }

    static async validateUPI(req, res, next) {
        try {
            const { upi_id } = req.params;
            const result = await UPIService.validateUPIID(upi_id);

            res.json({
                msg: result.valid ? 'UPI ID is valid' : 'UPI ID is invalid',
                ...result,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getLimits(req, res, next) {
        try {
            const limits = await UPIService.getUPILimits(req.user);

            res.json({
                msg: 'UPI limits retrieved',
                limits,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getUserUPIInfo(req, res, next) {
        try {
            const { UserModel } = require('../models/User.model');
            const { AccountModel } = require('../models/Account.model');
            
            const user = await UserModel.findById(req.user).populate('account_no');
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const primaryAccount = user.account_no[0];
            
            res.json({
                msg: 'UPI info retrieved',
                upi_info: {
                    upi_id: user.upi_id,
                    name: user.name,
                    balance: primaryAccount ? primaryAccount.amount : 0,
                    account_type: primaryAccount ? primaryAccount.ac_type : 'saving'
                }
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UPIController;