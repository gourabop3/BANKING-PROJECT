const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: true
    },
    rechargeType: {
        type: String,
        enum: ['mobile', 'bill'],
        required: true
    },
    // Mobile recharge specific fields
    mobileNumber: {
        type: String,
        validate: {
            validator: function(v) {
                // Only validate if rechargeType is mobile
                if (this.rechargeType === 'mobile') {
                    return /^[6-9]\d{9}$/.test(v);
                }
                return true;
            },
            message: 'Invalid mobile number format'
        }
    },
    operator: {
        type: String,
        enum: ['jio', 'airtel', 'vi', 'bsnl', 'mtnl', 'reliance', 'tata', 'telenor']
    },
    // Bill payment specific fields
    billType: {
        type: String,
        enum: ['electricity', 'water', 'gas', 'credit_card', 'broadband', 'dth']
    },
    consumerNumber: {
        type: String
    },
    serviceProvider: {
        type: String // For bill payments - provider name
    },
    // Common fields
    amount: {
        type: Number,
        required: true,
        min: 10
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        default: function() {
            return 'RCH' + Date.now() + Math.floor(Math.random() * 1000);
        }
    },
    description: {
        type: String
    },
    failureReason: {
        type: String
    },
    // Related transaction in main transactions collection
    transactionRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction'
    },
    // Processing details
    processedAt: {
        type: Date
    },
    // Metadata for additional details
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
Schema.index({ user: 1, createdAt: -1 });
Schema.index({ transactionId: 1 });
Schema.index({ status: 1 });
Schema.index({ rechargeType: 1 });

// Virtual for formatted transaction ID
Schema.virtual('formattedTransactionId').get(function() {
    return this.transactionId;
});

// Pre-save middleware to set description
Schema.pre('save', function(next) {
    if (!this.description) {
        if (this.rechargeType === 'mobile') {
            const operatorNames = {
                jio: 'Jio',
                airtel: 'Airtel',
                vi: 'Vi (Vodafone Idea)',
                bsnl: 'BSNL',
                mtnl: 'MTNL',
                reliance: 'Reliance',
                tata: 'Tata Docomo',
                telenor: 'Telenor'
            };
            this.description = `Mobile Recharge - ${operatorNames[this.operator]} - ${this.mobileNumber}`;
        } else if (this.rechargeType === 'bill') {
            const billTypeNames = {
                electricity: 'Electricity Bill',
                water: 'Water Bill',
                gas: 'Gas Bill',
                credit_card: 'Credit Card Payment',
                broadband: 'Broadband/Internet Bill',
                dth: 'DTH/Cable TV Bill'
            };
            this.description = `${billTypeNames[this.billType]} - ${this.consumerNumber}`;
        }
    }
    next();
});

const model = mongoose.model("recharge", Schema);

exports.RechargeModel = model;