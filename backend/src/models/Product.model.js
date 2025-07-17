const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        default: null,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['recharge', 'transfer', 'loan', 'investment', 'insurance', 'utilities', 'other']
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        altText: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    features: [{
        type: String,
        trim: true
    }],
    specifications: {
        type: Map,
        of: String
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    seoData: {
        metaTitle: {
            type: String,
            maxlength: 60
        },
        metaDescription: {
            type: String,
            maxlength: 160
        },
        keywords: [{
            type: String
        }]
    },
    createdBy: {
        type: String,
        required: true,
        default: 'admin'
    },
    updatedBy: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true
});

// Index for better search performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discounted price calculation
ProductSchema.virtual('finalPrice').get(function() {
    return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.discountPrice && this.discountPrice < this.price) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Virtual for primary image
ProductSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0] || null;
});

// Pre-save middleware to ensure only one primary image
ProductSchema.pre('save', function(next) {
    if (this.images && this.images.length > 0) {
        const primaryImages = this.images.filter(img => img.isPrimary);
        if (primaryImages.length === 0) {
            this.images[0].isPrimary = true;
        } else if (primaryImages.length > 1) {
            this.images.forEach((img, index) => {
                img.isPrimary = index === 0;
            });
        }
    }
    next();
});

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = { ProductModel };