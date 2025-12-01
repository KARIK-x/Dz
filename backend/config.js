/**
 * Backend Configuration
 * IMPORTANT: Replace all PLACEHOLDER values before production deployment
 */

require('dotenv').config();

module.exports = {
    // Server Config
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database - PLACEHOLDER
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/daraz_cashback',

    // Security Secrets - PLACEHOLDERS - MUST REPLACE
    JWT_SECRET: process.env.JWT_SECRET || 'PLACEHOLDER_JWT_SECRET_REPLACE_ME',
    HMAC_SECRET: process.env.HMAC_SECRET || 'PLACEHOLDER_HMAC_SECRET_REPLACE_ME',

    // Affiliate Code - PLACEHOLDER - NEVER commit to public repos
    AFFILIATE_CODE: process.env.AFFILIATE_CODE || 'PLACEHOLDER_AFFILIATE_CODE',
    DARAZ_AFFILIATE_BASE_URL: 'https://www.daraz.com.np',

    // Payment Integration - PLACEHOLDERS
    ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || 'PLACEHOLDER_ESEWA_MERCHANT_ID',
    ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY || 'PLACEHOLDER_ESEWA_SECRET_KEY',
    KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY || 'PLACEHOLDER_KHALTI_SECRET_KEY',
    KHALTI_PUBLIC_KEY: process.env.KHALTI_PUBLIC_KEY || 'PLACEHOLDER_KHALTI_PUBLIC_KEY',

    // Admin - PLACEHOLDERS
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'PLACEHOLDER_ADMIN_PASSWORD',

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    RATE_LIMIT_MAX_ACTIVATIONS: 10,
    RATE_LIMIT_MAX_REQUESTS_PER_IP: 100,

    // Deduplication
    DEDUPLICATION_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours

    // HMAC Expiry
    HMAC_EXPIRY_WINDOW_MS: 5 * 60 * 1000, // 5 minutes

    // JWT Expiry
    JWT_EXPIRY: '7d', // 7 days for admin tokens
    REDIRECT_TOKEN_EXPIRY: '5m', // 5 minutes for redirect tokens

    // Cashback/Commission
    USER_CASHBACK_AMOUNT: 5,
    COMMISSION_AMOUNT: 30,
    MINIMUM_PAYOUT: 100,

    // Fraud Detection
    NEW_USER_HOLD_DAYS: 30,
    MAX_ACTIVATIONS_PER_DAY: 10,
    MAX_ACTIVATIONS_PER_IP_PER_DAY: 20,

    // Data Retention
    CONSENT_EVENT_RETENTION_MONTHS: 12,
    ACTIVATION_LOG_RETENTION_MONTHS: 12,

    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['chrome-extension://*', 'http://localhost:3000'],

    // Reconciliation
    RECONCILIATION_TOLERANCE_DAYS: 60,

    // Redirect URL (for signed tokens)
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
};
