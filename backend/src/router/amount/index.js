const express = require("express")
const AmountValidation = require("../../validations/AmountValidation")
const ValidationMiddleware = require("../../middleware/ValidationMiddleware")
const AuthMiddleware = require("../../middleware/AuthMiddleware")
const AmountController = require("../../controller/AmountController")
const router = express.Router()
 

router.post('/add-money',AuthMiddleware,AmountValidation.addMoney,ValidationMiddleware,AmountController.addMoney)

router.post('/add-account',AuthMiddleware,AmountValidation.addAccount,ValidationMiddleware,AmountController.addNewAccount)

router.post('/payment/:txn_id',AmountController.verifyPayment)
router.get('/transactions',AuthMiddleware,AmountController.getAllTransactions)

// New endpoint for checking transaction status
router.get('/status/:txn_id', AuthMiddleware, AmountController.checkTransactionStatus)

// Debug endpoints for troubleshooting
router.get('/debug/transaction/:txn_id', AuthMiddleware, AmountController.debugTransaction)
router.get('/debug/account/:account_id', AuthMiddleware, AmountController.debugAccount)
router.get('/debug/verification/:txn_id', (req,res)=>{
    const { get } = require('../../utils/PaymentDebug')
    const logs = get(req.params.txn_id)
    res.send({txn_id:req.params.txn_id, logs})
})

module.exports = router