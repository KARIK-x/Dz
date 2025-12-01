/**
 * Consent Routes
 * POST /api/consent - Log consent events for audit trail
 */

const express = require('express');
const router = express.Router();
const ConsentEvent = require('../models/ConsentEvent.model');
const { v4: uuidv4 } = require('crypto').randomUUID ? require('crypto') : require('uuid');

/**
 * POST /api/consent
 * Log consent event
 */
router.post('/consent', async (req, res, next) => {
    try {
        const { hashedUserId, activationId, action, productId, url } = req.body;

        if (!hashedUserId || !action) {
            return res.status(400).json({
                success: false,
                message: 'hashedUserId and action required'
            });
        }

        const validActions = ['widget_shown', 'modal_opened', 'consent_given', 'consent_declined'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Invalid action. Must be one of: ${validActions.join(', ')}`
            });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Create consent event
        const consentId = uuidv4 ? uuidv4() : require('crypto').randomUUID();

        await ConsentEvent.create({
            consentId,
            hashedUserId,
            activationId: activationId || null,
            action,
            ipAddress,
            userAgent,
            productId: productId || null,
            url: url || null,
            consentText: action === 'consent_given' ?
                'We will redirect you through our affiliate link. We earn commission: Rs. 30. You\'ll get: Rs. 5.' :
                null
        });

        res.status(200).json({
            success: true,
            consentId
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
