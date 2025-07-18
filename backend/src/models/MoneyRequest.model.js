const mongoose = require('mongoose');

const moneyRequestSchema = new mongoose.Schema({
  from_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  to_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  from_upi: {
    type: String,
    required: true,
  },
  to_upi: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  note: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  expires_at: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  },
  responded_at: {
    type: Date,
  },
  rejection_reason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
moneyRequestSchema.index({ from_user: 1, status: 1 });
moneyRequestSchema.index({ to_user: 1, status: 1 });
moneyRequestSchema.index({ expires_at: 1 });

// Auto-expire requests after 24 hours
moneyRequestSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const MoneyRequestModel = mongoose.model('MoneyRequest', moneyRequestSchema);

module.exports = { MoneyRequestModel };