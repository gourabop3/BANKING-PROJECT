const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum: [
            'account_opening',
            'deposit',
            'withdrawal', 
            'transfer_sent',
            'transfer_received',
            'atm_transaction',
            'fd_opened',
            'fd_claimed',
            'card_issued',
            'card_blocked',
            'general',
            'security_alert',
            'promotion'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient queries
Schema.index({ user: 1, createdAt: -1 });
Schema.index({ user: 1, isRead: 1 });

const model = mongoose.model("announcement", Schema);

exports.AnnouncementModel = model;