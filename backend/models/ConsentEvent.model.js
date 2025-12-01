const mongoose = require('mongoose');

const ConsentEventSchema = new mongoose.Schema({
    consentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    hashedUserId: {
        type: String,
        required: true,
        index: true
    },
    activationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activation',
        default: null
    },
    action: {
        type: String,
        required: true,
        enum: ['widget_shown', 'modal_opened', 'consent_given', 'consent_declined'],
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    consentText: {
        type: String,
        default: null // Snapshot of disclosure text shown
    },
    productId: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// TTL index for data retention (12 months)
ConsentEventSchema.index(
    { timestamp: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60 } // 12 months
);

// Compound indexes
ConsentEventSchema.index({ hashedUserId: 1, timestamp: -1 });
ConsentEventSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ConsentEvent', ConsentEventSchema);
