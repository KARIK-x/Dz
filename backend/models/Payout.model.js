const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 100 // Minimum Rs. 100
    },
    method: {
        type: String,
        required: true,
        enum: ['esewa', 'khalti']
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    processedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    transactionId: {
        type: String,
        default: null // From eSewa/Khalti API
    },
    failureReason: {
        type: String,
        default: null
    },
    payoutIdentifier: {
        type: String,
        required: true // Hashed phone/email for payment
    }
}, {
    timestamps: true
});

// Indexes
PayoutSchema.index({ userId: 1, requestedAt: -1 });
PayoutSchema.index({ status: 1 });

module.exports = mongoose.model('Payout', PayoutSchema);
