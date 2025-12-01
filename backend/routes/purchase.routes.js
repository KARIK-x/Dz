/**
 * Purchase Routes
 * POST /api/trackPurchase - Record purchase from Daraz (webhook or manual)
 */

const express = require('express');
const router = express.Router();
const Activation = require('../models/Activation.model');
const Purchase = require('../models/Purchase.model');
const User = require('../models/User.model');
const { isPurchaseTimingRealistic } = require('../utils/fraud-detection.util');
const config = require('../config');

/**
 * POST /api/trackPurchase
 * Record a purchase completion (webhook-style)
 */
router.post('/trackPurchase', async (req, res, next) => {
    try {
        const { activationId, orderId, purchaseDate, webhookSignature } = req.body;

        if (!activationId) {
            return res.status(400).json({
                success: false,
                message: 'activationId required'
            });
        }

        // TODO: Verify webhook signature from Daraz (if they provide one)
        // if (webhookSignature) {
        //   const isValid = verifyDarazWebhook(req.body, webhookSignature);
        //   if (!isValid) {
        //     return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        //   }
        // }

        // Find activation
        const activation = await Activation.findById(activationId).populate('userId');

        if (!activation) {
            return res.status(404).json({
                success: false,
                message: 'Activation not found'
            });
        }

        // Check if activation already has a purchase
        const existingPurchase = await Purchase.findOne({ activationId: activation._id });

        if (existingPurchase) {
            return res.status(409).json({
                success: false,
                message: 'Purchase already recorded for this activation'
            });
        }

        // Validate purchase timing
        const purchaseTimestamp = purchaseDate ? new Date(purchaseDate) : new Date();
        const isTimingRealistic = isPurchaseTimingRealistic(activation.activatedAt, purchaseTimestamp);

        if (!isTimingRealistic) {
            console.warn(`Suspicious purchase timing for activation ${activationId}`);
            // Still create purchase but mark for review
        }

        // Create purchase record
        const purchase = await Purchase.create({
            activationId: activation._id,
            userId: activation.userId._id,
            purchaseDate: purchaseTimestamp,
            commissionEarned: config.COMMISSION_AMOUNT,
            cashbackAmount: config.USER_CASHBACK_AMOUNT,
            orderId: orderId || null,
            status: isTimingRealistic ? 'approved' : 'pending_verification',
            approvedAt: isTimingRealistic ? new Date() : null
        });

        // Update activation status
        activation.status = 'completed';
        await activation.save();

        // Credit user balance (if approved)
        if (purchase.status === 'approved') {
            const user = activation.userId;
            user.balance += config.USER_CASHBACK_AMOUNT;
            user.totalEarned += config.USER_CASHBACK_AMOUNT;
            await user.save();
        }

        res.status(200).json({
            success: true,
            purchaseId: purchase._id,
            cashbackAmount: config.USER_CASHBACK_AMOUNT,
            status: purchase.status
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
