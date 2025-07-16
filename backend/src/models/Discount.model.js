const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: '',
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['percent', 'amount'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true,
    min: 0 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  category: {
    type: String,
    enum: ['recharge', 'transfer', 'general', 'other'],
    default: 'general'
  },
  maxUsage: {
    type: Number,
    default: null // null means unlimited
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null // null means no expiry
  }
}, {
  timestamps: true
});

DiscountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better performance
DiscountSchema.index({ active: 1, validFrom: 1, validUntil: 1 });
DiscountSchema.index({ category: 1 });

const DiscountModel = mongoose.model('Discount', DiscountSchema);

module.exports = { DiscountModel };