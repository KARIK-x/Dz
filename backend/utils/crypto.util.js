/**
 * Crypto Utilities
 * HMAC signing, JWT generation, hashing functions
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate HMAC signature
 */
function generateHMAC(userId, productId, timestamp) {
    const payload = `${userId}|${productId}|${timestamp}`;
    return crypto
        .createHmac('sha256', config.HMAC_SECRET)
        .update(payload)
        .digest('hex');
}

/**
 * Verify HMAC signature
 */
function verifyHMAC(userId, productId, timestamp, providedHMAC) {
    const computedHMAC = generateHMAC(userId, productId, timestamp);

    // Constant-time comparison
    const providedBuffer = Buffer.from(providedHMAC, 'hex');
    const computedBuffer = Buffer.from(computedHMAC, 'hex');

    if (providedBuffer.length !== computedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(providedBuffer, computedBuffer);
}

/**
 * Generate JWT token for redirect (short-lived, 5 minutes)
 */
function generateRedirectToken(activationId, productId) {
    return jwt.sign(
        {
            type: 'redirect',
            activationId,
            productId
        },
        config.JWT_SECRET,
        { expiresIn: config.REDIRECT_TOKEN_EXPIRY }
    );
}

/**
 * Verify redirect token
 */
function verifyRedirectToken(token) {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        if (decoded.type !== 'redirect') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw error;
    }
}

/**
 * Generate admin JWT token
 */
function generateAdminToken(adminId, email, role) {
    return jwt.sign(
        {
            adminId,
            email,
            role
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRY }
    );
}

/**
 * Hash string (for identifiers)
 */
function hashData(data) {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
}

module.exports = {
    generateHMAC,
    verifyHMAC,
    generateRedirectToken,
    verifyRedirectToken,
    generateAdminToken,
    hashData
};
