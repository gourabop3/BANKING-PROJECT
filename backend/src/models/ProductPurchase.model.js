const mongoose = require('mongoose');

const ProductPurchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'emi'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'stripe', 'paytm', 'phonepe'],
        required: true
    },
    gatewayTransactionId: {
        type: String
    },
    gatewayOrderId: {
        type: String
    },
    downloadAttempts: {
        type: Number,
        default: 0
    },
    maxDownloads: {
        type: Number,
        default: 5
    },
    downloads: [{
        downloadedAt: {
            type: Date,
            default: Date.now
        },
        ipAddress: {
            type: String
        },
        userAgent: {
            type: String
        }
    }],
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from purchase
        }
    },
    refundDetails: {
        refundAmount: {
            type: Number
        },
        refundDate: {
            type: Date
        },
        refundReason: {
            type: String
        },
        refundTransactionId: {
            type: String
        }
    },
    metadata: {
        productName: {
            type: String
        },
        productSku: {
            type: String
        },
        productVersion: {
            type: String
        },
        discountApplied: {
            type: Number,
            default: 0
        },
        couponCode: {
            type: String
        }
    }
}, {
    timestamps: true
});

// Index for better query performance
ProductPurchaseSchema.index({ user: 1, product: 1 });
ProductPurchaseSchema.index({ transactionId: 1 });
ProductPurchaseSchema.index({ paymentStatus: 1 });
ProductPurchaseSchema.index({ createdAt: -1 });
ProductPurchaseSchema.index({ expiresAt: 1 });

// Virtual for download availability
ProductPurchaseSchema.virtual('canDownload').get(function() {
    return this.paymentStatus === 'completed' && 
           this.downloadAttempts < this.maxDownloads && 
           new Date() < this.expiresAt;
});

// Virtual for remaining downloads
ProductPurchaseSchema.virtual('remainingDownloads').get(function() {
    return Math.max(0, this.maxDownloads - this.downloadAttempts);
});

// Virtual for days until expiry
ProductPurchaseSchema.virtual('daysUntilExpiry').get(function() {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update metadata
ProductPurchaseSchema.pre('save', async function(next) {
    if (this.isNew && this.product) {
        try {
            const Product = mongoose.model('Product');
            const product = await Product.findById(this.product);
            if (product) {
                this.metadata.productName = product.name;
                this.metadata.productSku = product.sku;
                this.metadata.productVersion = product.version;
            }
        } catch (error) {
            console.error('Error updating purchase metadata:', error);
        }
    }
    next();
});

const ProductPurchaseModel = mongoose.model('ProductPurchase', ProductPurchaseSchema);

module.exports = { ProductPurchaseModel };