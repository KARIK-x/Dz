/**
 * Rate Limit Middleware
 * Custom rate limiting for activation endpoints
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter for activation endpoint
 * 10 activations per hour per user
 */
const activationLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_ACTIVATIONS,
    message: {
        success: false,
        message: `Too many activation requests. Maximum ${config.RATE_LIMIT_MAX_ACTIVATIONS} per hour.`
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Key generator: use hashedUserId from request body
    keyGenerator: (req) => {
        return req.body.hashedUserId || req.ip;
    },
    skip: (req) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    }
});

/**
 * Rate limiter for admin endpoints
 * 1000 requests per hour
 */
const adminLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: 1000,
    message: {
        success: false,
        message: 'Too many admin requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for payout requests
 * 5 requests per day to prevent spam
 */
const payoutLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5,
    message: {
        success: false,
        message: 'Too many payout requests. Maximum 5 per day.'
    },
    keyGenerator: (req) => {
        return req.body.hashedUserId || req.ip;
    }
});

module.exports = {
    activationLimiter,
    adminLimiter,
    payoutLimiter
};
