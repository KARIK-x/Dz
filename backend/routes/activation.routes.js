/**
 * Activation Routes
 * POST /api/activate - Activate cashback for a product
 */

const express = require('express');
const router = express.Router();
const verifyHMAC = require('../middleware/hmac.middleware');
const { activationLimiter } = require('../middleware/ratelimit.middleware');
const User = require('../models/User.model');
const Activation = require('../models/Activation.model');
const { generateRedirectToken } = require('../utils/crypto.util');
const { detectSuspiciousActivity, autoFlagIfNecessary, isUserFraudFlagged } = require('../utils/fraud-detection.util');
const config = require('../config');

/**
 * POST /api/activate
 * Create activation and return signed redirect URL
 */
router.post('/activate', activationLimiter, verifyHMAC, async (req, res, next) => {
    try {
        const { hashedUserId, productId, productTitle, productPrice, sellerInfo } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Find or create user
        let user = await User.findOne({ hashedUserId });

        if (!user) {
            user = await User.create({ hashedUserId });
        }

        // Check if user is fraud flagged
        if (await isUserFraudFlagged(user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Account flagged for review. Please contact support.'
            });
        }

        // Check for duplicate activation (deduplication)
        const dedupWindow = new Date(Date.now() - config.DEDUPLICATION_WINDOW_MS);
        const existingActivation = await Activation.findOne({
            hashedUserId,
            productId,
            activatedAt: { $gte: dedupWindow }
        });

        if (existingActivation) {
            return res.status(409).json({
                success: false,
                message: 'Cashback already activated for this product within 24 hours'
            });
        }

        // Fraud detection checks
        const fraudFlags = await detectSuspiciousActivity(hashedUserId, ipAddress);

        if (fraudFlags.length > 0) {
            console.warn(`Fraud flags detected for ${hashedUserId}:`, fraudFlags);

            // Auto-flag if high severity
            await autoFlagIfNecessary(user, fraudFlags);

            // Allow activation but log flags
            if (fraudFlags.some(f => f.severity === 'high')) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many activation requests. Please wait and try again.'
                });
            }
        }

        // Create activation record
        const activation = await Activation.create({
            userId: user._id,
            hashedUserId,
            productId,
            productTitle,
            productPrice,
            sellerInfo,
            hmacSignature: req.body.hmac,
            ipAddress,
            userAgent
        });

        // Update user stats
        user.activationCount += 1;
        user.lastActivation = new Date();
        await user.save();

        // Generate short-lived JWT token for redirect
        const redirectToken = generateRedirectToken(activation._id, productId);

        // Store token in activation
        activation.redirectToken = redirectToken;
        await activation.save();

        // Build redirect URL (server-side endpoint)
        const redirectUrl = `${config.BASE_URL}/r/${redirectToken}`;

        res.status(200).json({
            success: true,
            activationId: activation._id,
            redirectUrl,
            expiresIn: 300 // 5 minutes
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
