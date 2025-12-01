const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    hashedUserId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    activationCount: {
        type: Number,
        default: 0
    },
    lastActivation: {
        type: Date
    },
    payoutMethod: {
        type: String,
        enum: ['esewa', 'khalti', null],
        default: null
    },
    payoutIdentifier: {
        type: String, // Hashed phone/email
        default: null
    },
    fraudHoldUntil: {
        type: Date,
        default: function () {
            // New users have 30-day fraud hold
            const holdDate = new Date();
            holdDate.setDate(holdDate.getDate() + 30);
            return holdDate;
        }
    },
    isFraudFlagged: {
        type: Boolean,
        default: false
    },
    fraudReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for quick lookups
UserSchema.index({ hashedUserId: 1 });
UserSchema.index({ fraudHoldUntil: 1 });

module.exports = mongoose.model('User', UserSchema);
