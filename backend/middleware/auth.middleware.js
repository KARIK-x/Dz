/**
 * Authentication Middleware
 * JWT verification for admin routes
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin.model');

/**
 * Verify JWT token
 */
async function verifyToken(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Check if admin exists and is active
        const admin = await Admin.findById(decoded.adminId);

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive admin account'
            });
        }

        // Attach admin to request
        req.admin = {
            id: admin._id,
            email: admin.email,
            role: admin.role
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Check if admin has super_admin role
 */
function requireSuperAdmin(req, res, next) {
    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions. Super admin required.'
        });
    }
    next();
}

module.exports = {
    verifyToken,
    requireSuperAdmin
};
