/**
 * User Routes
 * GET /api/userBalance - Get user balance and stats
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Purchase = require('../models/Purchase.model');
const Payout = require('../models/Payout.model');

/**
 * GET /api/userBalance?userId=hashedUserId
 * Get user balance and earnings
 */
router.get('/userBalance', async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId parameter required'
            });
        }

        // Find user by hashed ID
        const user = await User.findOne({ hashedUserId: userId });

        if (!user) {
            // User doesn't exist yet, return default values
            return res.status(200).json({
                success: true,
                balance: 0,
                totalEarned: 0,
                activationCount: 0,
                pendingPayouts: 0,
                fraudHold: false
            });
        }

        // Get pending payouts total
        const pendingPayouts = await Payout.aggregate([
            {
                $match: {
                    userId: user._id,
                    status: { $in: ['pending', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const pendingPayoutAmount = pendingPayouts.length > 0 ? pendingPayouts[0].total : 0;

        // Check if under fraud hold
        const isUnderHold = user.fraudHoldUntil && user.fraudHoldUntil > new Date();

        res.status(200).json({
            success: true,
            balance: user.balance,
            totalEarned: user.totalEarned,
            activationCount: user.activationCount,
            pendingPayouts: pendingPayoutAmount,
            fraudHold: isUnderHold,
            fraudHoldUntil: isUnderHold ? user.fraudHoldUntil : null
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
