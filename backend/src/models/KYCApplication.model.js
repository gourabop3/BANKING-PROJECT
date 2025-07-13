const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
  },

  // New fields for enhanced KYC
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  documents: {
    aadhaarImage: {
      type: String, // URL
      required: true,
    },
    panImage: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const KYCApplicationModel = mongoose.model('kyc_application', kycSchema);

exports.KYCApplicationModel = KYCApplicationModel;