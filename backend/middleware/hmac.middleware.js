/**
 * HMAC Middleware
 * Verifies HMAC signatures on incoming requests
 */

const crypto = require('crypto');
const config = require('../config');

/**
 * Verify HMAC signature
 */
function verifyHMAC(req, res, next) {
    try {
        const { hashedUserId, productId, timestamp, hmac } = req.body;

        // Check required fields
        if (!hashedUserId || !productId || !timestamp || !hmac) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields for HMAC verification'
            });
        }

        // Check timestamp within expiry window (5 minutes)
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(now - requestTime);

        if (timeDiff > config.HMAC_EXPIRY_WINDOW_MS) {
            return res.status(401).json({
                success: false,
                message: 'Request expired. Please try again.'
            });
        }

        // Compute HMAC
        const payload = `${hashedUserId}|${productId}|${timestamp}`;
        const computedHMAC = crypto
            .createHmac('sha256', config.HMAC_SECRET)
            .update(payload)
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        const providedBuffer = Buffer.from(hmac, 'hex');
        const computedBuffer = Buffer.from(computedHMAC, 'hex');

        if (providedBuffer.length !== computedBuffer.length) {
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        const isValid = crypto.timingSafeEqual(providedBuffer, computedBuffer);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // HMAC is valid, proceed
        next();

    } catch (error) {
        console.error('HMAC verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
}

module.exports = verifyHMAC;
