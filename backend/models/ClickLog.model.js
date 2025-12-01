const mongoose = require('mongoose');

const ClickLogSchema = new mongoose.Schema({
    activationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activation',
        required: true,
        index: true
    },
    clickedAt: {
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
    affiliateClickId: {
        type: String,
        default: null, // From Daraz affiliate tracking (for reconciliation)
        index: true
    },
    referer: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// TTL index for data retention (12 months)
ClickLogSchema.index(
    { clickedAt: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Compound index for reconciliation
ClickLogSchema.index({ affiliateClickId: 1, activationId: 1 });

module.exports = mongoose.model('ClickLog', ClickLogSchema);
