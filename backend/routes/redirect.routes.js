/**
 * Redirect Routes
 * GET /r/:token - Verify token and redirect to Daraz affiliate URL
 */

const express = require('express');
const router = express.Router();
const { verifyRedirectToken } = require('../utils/crypto.util');
const Activation = require('../models/Activation.model');
const ClickLog = require('../models/ClickLog.model');
const config = require('../config');

/**
 * GET /r/:token
 * Verify token, build affiliate URL, log click, redirect
 */
router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify JWT token
    let decoded;
    try {
      decoded = verifyRedirectToken(token);
    } catch (error) {
      return res.status(401).send('Invalid or expired redirect token');
    }

    // Get activation
    const activation = await Activation.findById(decoded.activationId);

    if (!activation) {
      return res.status(404).send('Activation not found');
    }

    // Verify token matches
    if (activation.redirectToken !== token) {
      return res.status(401).send('Token mismatch');
    }

    // Build Daraz affiliate URL
    // IMPORTANT: AFFILIATE_CODE is only accessed here (server-side)
    const productUrl = activation.productUrl || `${config.DARAZ_AFFILIATE_BASE_URL}/products/${activation.productId || decoded.productId}`;
    const affiliateUrl = buildAffiliateURL(productUrl, activation._id);

    // Log click event (non-blocking - don't prevent redirect if logging fails)
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'];
    const referer = req.headers.referer || null;

    // Async click logging - don't await to avoid blocking redirect
    ClickLog.create({
      activationId: activation._id,
      ipAddress,
      userAgent,
      referer
    }).catch(err => {
      console.error('[ClickLog] Failed to log click:', err.message);
    });

    console.log(`[Redirect] ${activation._id} → ${affiliateUrl.substring(0, 60)}...`);

    // Redirect (302 temporary)
    res.redirect(302, affiliateUrl);

  } catch (error) {
    next(error);
  }
});

/**
 * Build affiliate URL with parameters
 * NEVER expose AFFILIATE_CODE to client
 */
function buildAffiliateURL(productUrl, activationId) {
  try {
    const url = new URL(productUrl);

    // Add affiliate parameters
    url.searchParams.set('aff_code', config.AFFILIATE_CODE); // PLACEHOLDER
    url.searchParams.set('aff_trace', activationId.toString());
    url.searchParams.set('aff_source', 'daraz_cashback_ext');

    return url.toString();
  } catch (error) {
    console.error('URL building error:', error);
    // Fallback: append as query string
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}aff_code=${config.AFFILIATE_CODE}&aff_trace=${activationId}`;
  }
}

module.exports = router;
