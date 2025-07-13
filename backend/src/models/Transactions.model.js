const mongoose= require("mongoose")

const Schema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true

    },
    amount:{
        type:Number,
        required:true
    },
    isSuccess:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        enum:['credit','debit','fix_deposit', 'atm_withdrawal', 'atm_deposit', 'upi_transfer'],
        required:true
    },
    razorpayPaymentId:{
        type:String,
        default:''
    },
    razorpayOrderId:{
        type:String,
        default:''
    },
    razorpaySignature:{
        type:String,
        default:''
    },
    remark:{
        type:String,
        default:'Payment Processing'
    },
    isRefunded:{
        type:Boolean,
        default:false
    },
    // Transfer related fields
    transferId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    transferType: {
        type: String,
        enum: ['NEFT', 'RTGS', 'IMPS', 'UPI']
    },
    recipientAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    },
    senderAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    },
    // UPI related fields
    sender_upi: {
        type: String,
        trim: true
    },
    recipient_upi: {
        type: String,
        trim: true
    },
    upi_transaction_id: {
        type: String,
        trim: true
    },
    // ATM related fields
    atmId: {
        type: String
    },
    atmLocation: {
        type: String
    },
    // FD related fields
    fdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fixdeposit'
    }
},{
    timestamps:true
})

const model = mongoose.model('transaction',Schema)

exports.TransactionModel = model