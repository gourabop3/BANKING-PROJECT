const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  type: { type: String, enum: ['recharge', 'other'], required: true },
  value: { type: Number, required: true }, // percentage or flat
  isPercentage: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

DiscountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Discount', DiscountSchema);