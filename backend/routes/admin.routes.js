/**
 * Admin Routes
 * Protected admin endpoints for dashboard, user management, etc.
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireSuperAdmin } = require('../middleware/auth.middleware');
const { adminLimiter } = require('../middleware/ratelimit.middleware');
const { generateAdminToken } = require('../utils/crypto.util');
const User = require('../models/User.model');
const Activation = require('../models/Activation.model');
const Purchase = require('../models/Purchase.model');
const Payout = require('../models/Payout.model');
const Admin = require('../models/Admin.model');

// Apply admin rate limiter to all routes
router.use(adminLimiter);

/**
 * POST /api/admin/login
 * Admin login
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }

        // Find admin
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = generateAdminToken(admin._id, admin.email, admin.role);

        res.status(200).json({
            success: true,
            token,
            admin: {
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/dashboard
 * Get dashboard metrics
 */
router.get('/dashboard', verifyToken, async (req, res, next) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total users
        const totalUsers = await User.countDocuments();

        // Activations
        const totalActivations = await Activation.countDocuments();
        const todayActivations = await Activation.countDocuments({ activatedAt: { $gte: today } });
        const weekActivations = await Activation.countDocuments({ activatedAt: { $gte: thisWeek } });
        const monthActivations = await Activation.countDocuments({ activatedAt: { $gte: thisMonth } });

        // Purchases
        const totalPurchases = await Purchase.countDocuments();
        const approvedPurchases = await Purchase.countDocuments({ status: 'approved' });
        const pendingPurchases = await Purchase.countDocuments({ status: 'pending_verification' });

        // Commission earned
        const commissionData = await Purchase.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
        ]);
        const totalCommission = commissionData.length > 0 ? commissionData[0].total : 0;

        // Cashback paid
        const cashbackData = await Purchase.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$cashbackAmount' } } }
        ]);
        const totalCashbackPaid = cashbackData.length > 0 ? cashbackData[0].total : 0;

        // Payouts
        const totalPayouts = await Payout.countDocuments();
        const pendingPayouts = await Payout.countDocuments({ status: 'pending' });
        const completedPayouts = await Payout.countDocuments({ status: 'completed' });

        const payoutAmountData = await Payout.aggregate([
            { $match: { status: { $in: ['pending', 'processing'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingPayoutAmount = payoutAmountData.length > 0 ? payoutAmountData[0].total : 0;

        // Fraud flags
        const fraudFlaggedUsers = await User.countDocuments({ isFraudFlagged: true });

        // Conversion rate
        const conversionRate = totalActivations > 0 ? ((approvedPurchases / totalActivations) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            metrics: {
                users: {
                    total: totalUsers,
                    fraudFlagged: fraudFlaggedUsers
                },
                activations: {
                    total: totalActivations,
                    today: todayActivations,
                    week: weekActivations,
                    month: monthActivations
                },
                purchases: {
                    total: totalPurchases,
                    approved: approvedPurchases,
                    pending: pendingPurchases
                },
                revenue: {
                    totalCommission,
                    totalCashbackPaid,
                    netProfit: totalCommission - totalCashbackPaid
                },
                payouts: {
                    total: totalPayouts,
                    pending: pendingPayouts,
                    completed: completedPayouts,
                    pendingAmount: pendingPayoutAmount
                },
                performance: {
                    conversionRate: `${conversionRate}%`
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/users
 * Get list of users (paginated)
 */
router.get('/users', verifyToken, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/pause
 * Emergency pause toggle for activations
 */
router.post('/pause', verifyToken, requireSuperAdmin, async (req, res, next) => {
    try {
        const { paused, reason } = req.body;

        // In production, store this in a global config collection or cache (Redis)
        // For now, we'll use an environment variable toggle

        if (paused) {
            console.warn(`[ADMIN] System paused by ${req.admin.email}: ${reason}`);
            // Set flag (implementation depends on deployment)
            process.env.SYSTEM_PAUSED = 'true';
            process.env.PAUSE_REASON = reason;
        } else {
            console.log(`[ADMIN] System unpaused by ${req.admin.email}`);
            process.env.SYSTEM_PAUSED = 'false';
            process.env.PAUSE_REASON = '';
        }

        res.status(200).json({
            success: true,
            paused,
            reason: reason || null
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
