const mongoose = require("mongoose")

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    routing_number: {
        type: String,
        required: true
    },
    account_holder_name: {
        type: String,
        required: true
    },
    bank_name: {
        type: String,
        required: true
    },
    account_type: {
        type: String,
        enum: ['savings', 'current', 'checking'],
        required: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: false
    },
    verification_code: {
        type: String,
        required: false
    },
    verification_attempts: {
        type: Number,
        default: 0
    },
    verified_at: {
        type: Date,
        default: null
    },
    // Additional bank details for real integration
    bank_code: {
        type: String,
        required: false
    },
    swift_code: {
        type: String,
        required: false
    },
    // Account balance tracking
    current_balance: {
        type: Number,
        default: 0
    },
    last_balance_update: {
        type: Date,
        default: Date.now
    },
    // Security and compliance
    encryption_key: {
        type: String,
        required: false
    },
    compliance_status: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    // Metadata
    metadata: {
        linked_via: {
            type: String,
            enum: ['api', 'dashboard', 'mobile'],
            default: 'dashboard'
        },
        verification_method: {
            type: String,
            enum: ['micro_deposit', 'instant', 'manual'],
            default: 'micro_deposit'
        },
        risk_score: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
})

// Add indexes for better performance
bankAccountSchema.index({ user: 1, is_active: 1 })
bankAccountSchema.index({ account_number: 1 })
bankAccountSchema.index({ is_verified: 1 })
bankAccountSchema.index({ user: 1, is_verified: 1, is_active: 1 })

// Pre-save middleware to encrypt sensitive data
bankAccountSchema.pre('save', function(next) {
    if (this.isModified('account_number')) {
        // In production, encrypt account number
        // this.account_number = encrypt(this.account_number)
    }
    next()
})

const BankAccountModel = mongoose.model('BankAccount', bankAccountSchema)

module.exports = { BankAccountModel }