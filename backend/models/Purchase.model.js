const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    activationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activation',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    commissionEarned: {
        type: Number,
        required: true,
        default: 30 // Rs. 30 commission
    },
    cashbackAmount: {
        type: Number,
        required: true,
        default: 5 // Rs. 5 cashback to user
    },
    orderId: {
        type: String,
        default: null // From Daraz order confirmation
    },
    status: {
        type: String,
        enum: ['approved', 'rejected', 'pending_verification'],
        default: 'pending_verification',
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
PurchaseSchema.index({ activationId: 1 });
PurchaseSchema.index({ userId: 1, purchaseDate: -1 });
PurchaseSchema.index({ status: 1 });

module.exports = mongoose.model('Purchase', PurchaseSchema);
