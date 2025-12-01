/**
 * Payout Routes
 * POST /api/payout - Request payout
 */

const express = require('express');
const router = express.Router();
const { payoutLimiter } = require('../middleware/ratelimit.middleware');
const User = require('../models/User.model');
const Payout = require('../models/Payout.model');
const { processPayout } = require('../utils/payment.util');
const { isUserUnderFraudHold } = require('../utils/fraud-detection.util');
const config = require('../config');

/**
 * POST /api/payout
 * User requests payout
 */
router.post('/payout', payoutLimiter, async (req, res, next) => {
    try {
        const { hashedUserId, amount, method, payoutIdentifier } = req.body;

        // Validation
        if (!hashedUserId || !amount || !method || !payoutIdentifier) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: hashedUserId, amount, method, payoutIdentifier'
            });
        }

        if (!['esewa', 'khalti'].includes(method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method. Must be esewa or khalti'
            });
        }

        if (amount < config.MINIMUM_PAYOUT) {
            return res.status(400).json({
                success: false,
                message: `Minimum payout is Rs. ${config.MINIMUM_PAYOUT}`
            });
        }

        // Find user
        const user = await User.findOne({ hashedUserId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check fraud hold
        if (await isUserUnderFraudHold(user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Your account is under review. Payouts will be available after the hold period.',
                fraudHoldUntil: user.fraudHoldUntil
            });
        }

        // Check sufficient balance
        if (user.balance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: Rs. ${user.balance}`
            });
        }

        // Create payout record
        const payout = await Payout.create({
            userId: user._id,
            amount,
            method,
            payoutIdentifier // Already hashed by extension
        });

        // Deduct from balance immediately (prevent double payout)
        user.balance -= amount;
        user.payoutMethod = method; // Save preferred method
        user.payoutIdentifier = payoutIdentifier;
        await user.save();

        // Process payout (in production, this would be async/queue)
        // For now, we simulate immediately
        setTimeout(async () => {
            try {
                const result = await processPayout(method, amount, payoutIdentifier);

                if (result.success) {
                    payout.status = 'completed';
                    payout.transactionId = result.transactionId;
                    payout.processedAt = new Date();
                } else {
                    payout.status = 'failed';
                    payout.failureReason = result.message;

                    // Refund balance
                    user.balance += amount;
                    await user.save();
                }

                await payout.save();
                console.log(`[Payout] ${payout._id} - ${payout.status}`);
            } catch (error) {
                console.error('Payout processing error:', error);
                payout.status = 'failed';
                payout.failureReason = error.message;
                await payout.save();

                // Refund balance
                user.balance += amount;
                await user.save();
            }
        }, 2000); // Simulate processing delay

        res.status(200).json({
            success: true,
            payoutId: payout._id,
            amount,
            method,
            status: 'pending',
            message: 'Payout request submitted. Processing may take 7-14 days.'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
