/**
 * Fraud Detection Utilities
 * Heuristics and checks for suspicious activity
 */

const User = require('../models/User.model');
const Activation = require('../models/Activation.model');
const config = require('../config');

/**
 * Check if user is under fraud hold
 */
async function isUserUnderFraudHold(userId) {
    const user = await User.findById(userId);

    if (!user) {
        return false;
    }

    // Check if fraud hold period has expired
    if (user.fraudHoldUntil && user.fraudHoldUntil > new Date()) {
        return true;
    }

    return false;
}

/**
 * Check if user is flagged for fraud
 */
async function isUserFraudFlagged(userId) {
    const user = await User.findById(userId);
    return user && user.isFraudFlagged;
}

/**
 * Check for suspicious activation patterns
 */
async function detectSuspiciousActivity(hashedUserId, ipAddress) {
    const flags = [];

    // Check 1: Too many activations in one day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayActivations = await Activation.countDocuments({
        hashedUserId,
        activatedAt: { $gte: oneDayAgo }
    });

    if (todayActivations >= config.MAX_ACTIVATIONS_PER_DAY) {
        flags.push({
            type: 'high_frequency',
            message: `${todayActivations} activations in 24h (limit: ${config.MAX_ACTIVATIONS_PER_DAY})`,
            severity: 'high'
        });
    }

    // Check 2: Multiple users from same IP
    const recentIPActivations = await Activation.countDocuments({
        ipAddress,
        activatedAt: { $gte: oneDayAgo }
    });

    if (recentIPActivations >= config.MAX_ACTIVATIONS_PER_IP_PER_DAY) {
        flags.push({
            type: 'ip_sharing',
            message: `${recentIPActivations} activations from same IP in 24h (limit: ${config.MAX_ACTIVATIONS_PER_IP_PER_DAY})`,
            severity: 'medium'
        });
    }

    // Check 3: Rapid activations (velocity check)
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    const rapidActivations = await Activation.countDocuments({
        hashedUserId,
        activatedAt: { $gte: last5Minutes }
    });

    if (rapidActivations >= 5) {
        flags.push({
            type: 'rapid_fire',
            message: `${rapidActivations} activations in 5 minutes`,
            severity: 'high'
        });
    }

    return flags;
}

/**
 * Check purchase timing (activation -> purchase should be realistic)
 */
function isPurchaseTimingRealistic(activationDate, purchaseDate) {
    const timeDiff = purchaseDate - activationDate;

    // Purchase within 1 minute is suspicious (not enough time to complete checkout)
    if (timeDiff < 60 * 1000) {
        return false;
    }

    // Purchase more than 30 days after activation is suspicious
    if (timeDiff > 30 * 24 * 60 * 60 * 1000) {
        return false;
    }

    return true;
}

/**
 * Flag user for manual review
 */
async function flagUserForReview(userId, reason) {
    await User.findByIdAndUpdate(userId, {
        isFraudFlagged: true,
        fraudReason: reason
    });

    console.warn(`User ${userId} flagged for fraud: ${reason}`);
}

/**
 * Auto-flag high-severity fraud
 */
async function autoFlagIfNecessary(user, fraudFlags) {
    const highSeverityFlags = fraudFlags.filter(f => f.severity === 'high');

    if (highSeverityFlags.length > 0) {
        const reasons = highSeverityFlags.map(f => f.message).join('; ');
        await flagUserForReview(user._id, reasons);
        return true;
    }

    return false;
}

module.exports = {
    isUserUnderFraudHold,
    isUserFraudFlagged,
    detectSuspiciousActivity,
    isPurchaseTimingRealistic,
    flagUserForReview,
    autoFlagIfNecessary
};
