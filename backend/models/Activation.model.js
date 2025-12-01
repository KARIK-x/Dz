const mongoose = require('mongoose');

const ActivationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    hashedUserId: {
        type: String,
        required: true,
        index: true
    },
    productId: {
        type: String,
        required: true,
        index: true
    },
    productTitle: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        default: 0
    },
    sellerInfo: {
        type: String,
        default: null
    },
    activatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: function () {
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + 24);
            return expiry;
        },
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired', 'rejected'],
        default: 'pending',
        index: true
    },
    hmacSignature: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    clickId: {
        type: String,
        default: null // From Daraz affiliate tracking (if provided)
    },
    redirectToken: {
        type: String,
        default: null // JWT token used for redirect
    }
}, {
    timestamps: true
});

// Compound indexes for deduplication and queries
ActivationSchema.index({ hashedUserId: 1, productId: 1, activatedAt: -1 });
ActivationSchema.index({ status: 1, activatedAt: -1 });
ActivationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Activation', ActivationSchema);
