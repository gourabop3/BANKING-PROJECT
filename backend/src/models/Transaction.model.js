const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    transaction_id: {
        type: String,
        required: true,
        unique: true
    },
    original_transaction_id: {
        type: String,
        required: false // Only for refunds
    },
    merchant_id: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    bank_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount',
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refunded'],
        default: 'pending'
    },
    transaction_type: {
        type: String,
        enum: ['payment', 'refund', 'payout', 'transfer'],
        default: 'payment'
    },
    customer_info: {
        name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: false
        },
        address: {
            street: String,
            city: String,
            state: String,
            postal_code: String,
            country: String
        }
    },
    payment_method: {
        type: {
            type: String,
            enum: ['card', 'bank_transfer', 'upi', 'wallet', 'net_banking'],
            default: 'card'
        },
        details: {
            card_last_four: String,
            card_brand: String,
            bank_name: String,
            account_type: String
        }
    },
    callback_url: {
        type: String,
        required: false
    },
    return_url: {
        type: String,
        required: false
    },
    bank_reference: {
        type: String,
        required: false
    },
    gateway_reference: {
        type: String,
        required: false
    },
    processed_at: {
        type: Date,
        required: false
    },
    expires_at: {
        type: Date,
        required: false
    },
    // Fee and charges
    fees: {
        gateway_fee: {
            type: Number,
            default: 0
        },
        processing_fee: {
            type: Number,
            default: 0
        },
        total_fee: {
            type: Number,
            default: 0
        }
    },
    // Settlement information
    settlement: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'settled', 'failed'],
            default: 'pending'
        },
        settled_at: {
            type: Date,
            required: false
        },
        settlement_reference: {
            type: String,
            required: false
        },
        net_amount: {
            type: Number,
            required: false
        }
    },
    // Risk and fraud detection
    risk_assessment: {
        score: {
            type: Number,
            default: 0
        },
        level: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        },
        flags: [String]
    },
    // Webhook information
    webhook_status: {
        attempts: {
            type: Number,
            default: 0
        },
        last_attempt: {
            type: Date,
            required: false
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'delivered'],
            default: 'pending'
        }
    },
    // Additional metadata
    metadata: {
        environment: {
            type: String,
            enum: ['test', 'live'],
            default: 'test'
        },
        created_via: {
            type: String,
            enum: ['api', 'dashboard', 'mobile'],
            default: 'api'
        },
        user_agent: String,
        ip_address: String,
        refund_reason: String,
        refund_type: String,
        original_transaction: String
    },
    // Tracking information
    tracking: {
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        },
        notes: [String]
    }
}, {
    timestamps: true
})

// Add indexes for better performance
transactionSchema.index({ transaction_id: 1 })
transactionSchema.index({ merchant_id: 1, status: 1 })
transactionSchema.index({ user: 1, status: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ status: 1, createdAt: -1 })
transactionSchema.index({ 'customer_info.email': 1 })
transactionSchema.index({ amount: 1, currency: 1 })
transactionSchema.index({ original_transaction_id: 1 })

// Pre-save middleware
transactionSchema.pre('save', function(next) {
    // Calculate total fees
    if (this.fees) {
        this.fees.total_fee = (this.fees.gateway_fee || 0) + (this.fees.processing_fee || 0)
    }
    
    // Calculate net settlement amount
    if (this.settlement && this.amount) {
        this.settlement.net_amount = this.amount - (this.fees.total_fee || 0)
    }
    
    next()
})

// Virtual for formatted amount
transactionSchema.virtual('formatted_amount').get(function() {
    return `${this.currency} ${this.amount.toFixed(2)}`
})

// Method to check if transaction is refundable
transactionSchema.methods.isRefundable = function() {
    return this.status === 'completed' && this.transaction_type === 'payment'
}

// Method to calculate refund amount available
transactionSchema.methods.getRefundableAmount = function() {
    if (!this.isRefundable()) return 0
    
    // Calculate already refunded amount
    // This would need to be implemented based on your refund tracking
    return this.amount
}

const TransactionModel = mongoose.model('Transaction', transactionSchema)

module.exports = { TransactionModel }