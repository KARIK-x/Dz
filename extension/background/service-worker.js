/**
 * Daraz Cashback - Background Service Worker
 * Handles activation requests, HMAC signing, and affiliate redirects
 */

// Configuration - IMPORTANT: Update API_URL before production
const API_URL = 'http://localhost:3000'; // PLACEHOLDER
const HMAC_SECRET = 'PLACEHOLDER_HMAC_SECRET'; // PLACEHOLDER - Will be handled server-side
const MAX_ACTIVATIONS_PER_HOUR = 10;
const DEDUPLICATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate hashed user ID (persistent across sessions)
 */
async function getHashedUserId() {
    let result = await chrome.storage.local.get(['hashedUserId']);

    if (!result.hashedUserId) {
        // Generate unique ID based on installation time + random
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniqueId));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        await chrome.storage.local.set({ hashedUserId: hashHex });
        return hashHex;
    }

    return result.hashedUserId;
}

/**
 * Generate HMAC signature for activation request
 */
async function generateHMACSignature(userId, productId, timestamp) {
    const payload = `${userId}|${productId}|${timestamp}`;
    const encoder = new TextEncoder();

    // Import key
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(HMAC_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Sign
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
    );

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if activation already exists for this product
 */
async function checkActivationStatus(productId) {
    const result = await chrome.storage.local.get(['activations']);
    const activations = result.activations || [];

    const recentActivation = activations.find(act =>
        act.productId === productId &&
        (Date.now() - act.timestamp < DEDUPLICATION_WINDOW_MS)
    );

    return !!recentActivation;
}

/**
 * Check rate limit (max 10 activations per hour)
 */
async function checkRateLimit() {
    const result = await chrome.storage.local.get(['activations']);
    const activations = result.activations || [];

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentActivations = activations.filter(act => act.timestamp > oneHourAgo);

    return recentActivations.length < MAX_ACTIVATIONS_PER_HOUR;
}

/**
 * Store activation locally
 */
async function storeActivation(activationData) {
    const result = await chrome.storage.local.get(['activations']);
    const activations = result.activations || [];

    // Add new activation
    activations.push(activationData);

    // Keep only last 100 activations (prevent storage bloat)
    const trimmedActivations = activations.slice(-100);

    await chrome.storage.local.set({ activations: trimmedActivations });
}

/**
 * Log consent event
 */
async function logConsentEvent(eventData) {
    const result = await chrome.storage.local.get(['consentEvents']);
    const events = result.consentEvents || [];

    events.push({
        ...eventData,
        timestamp: Date.now()
    });

    // Keep last 500 events
    const trimmedEvents = events.slice(-500);
    await chrome.storage.local.set({ consentEvents: trimmedEvents });

    // Optional: Send to backend for audit trail
    try {
        const hashedUserId = await getHashedUserId();
        await fetch(`${API_URL}/api/consent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hashedUserId,
                ...eventData
            })
        });
    } catch (error) {
        console.error('[Daraz Cashback] Failed to log consent event:', error);
    }
}

/**
 * Activate cashback (call backend and redirect)
 */
async function activateCashback(productData) {
    try {
        // Check deduplication
        const alreadyActivated = await checkActivationStatus(productData.productId);
        if (alreadyActivated) {
            throw new Error('Cashback already activated for this product in the last 24 hours');
        }

        // Check rate limit
        const withinRateLimit = await checkRateLimit();
        if (!withinRateLimit) {
            throw new Error('Rate limit exceeded. Maximum 10 activations per hour.');
        }

        // Get hashed user ID
        const hashedUserId = await getHashedUserId();
        const timestamp = Date.now();

        // Generate HMAC signature
        const hmac = await generateHMACSignature(hashedUserId, productData.productId, timestamp);

        // Call backend activation API
        const response = await fetch(`${API_URL}/api/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hashedUserId,
                productId: productData.productId,
                productTitle: productData.productTitle,
                productPrice: productData.productPrice,
                sellerInfo: productData.sellerInfo,
                timestamp,
                hmac
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Activation failed');
        }

        const result = await response.json();

        if (!result.redirectUrl) {
            throw new Error('No redirect URL received from server');
        }

        // Store activation locally
        await storeActivation({
            activationId: result.activationId,
            productId: productData.productId,
            productTitle: productData.productTitle,
            timestamp,
            status: 'pending'
        });

        // Return success with redirect URL
        return {
            success: true,
            activationId: result.activationId,
            redirectUrl: result.redirectUrl
        };

    } catch (error) {
        console.error('[Daraz Cashback] Activation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Perform redirect to affiliate URL
 */
async function performRedirect(tabId, redirectUrl) {
    try {
        // Update tab to redirect URL
        await chrome.tabs.update(tabId, { url: redirectUrl });
        return { success: true };
    } catch (error) {
        console.error('[Daraz Cashback] Redirect error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user balance from backend
 */
async function getUserBalance() {
    try {
        const hashedUserId = await getHashedUserId();

        const response = await fetch(`${API_URL}/api/userBalance?userId=${hashedUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch balance');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[Daraz Cashback] Balance fetch error:', error);
        return { balance: 0, totalEarned: 0, error: error.message };
    }
}

/**
 * Message listener for content script and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.debug('[Daraz Cashback] Received message:', message.type);

    switch (message.type) {
        case 'CHECK_ACTIVATION_STATUS':
            checkActivationStatus(message.data.productId)
                .then(alreadyActivated => {
                    sendResponse({ alreadyActivated });
                })
                .catch(error => {
                    sendResponse({ alreadyActivated: false, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'ACTIVATE_CASHBACK':
            activateCashback(message.data)
                .then(result => {
                    if (result.success && result.redirectUrl) {
                        // Perform redirect
                        performRedirect(sender.tab.id, result.redirectUrl)
                            .then(() => {
                                sendResponse(result);
                            });
                    } else {
                        sendResponse(result);
                    }
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'GET_USER_BALANCE':
            getUserBalance()
                .then(balance => {
                    sendResponse(balance);
                })
                .catch(error => {
                    sendResponse({ balance: 0, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'LOG_CONSENT_EVENT':
            logConsentEvent(message.data)
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'GET_ACTIVATIONS':
            chrome.storage.local.get(['activations'])
                .then(result => {
                    sendResponse({ activations: result.activations || [] });
                });
            return true; // Will respond asynchronously

        default:
            sendResponse({ error: 'Unknown message type' });
    }
});

/**
 * Installation handler
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[Daraz Cashback] Extension installed');

        // Initialize storage
        chrome.storage.local.set({
            activations: [],
            consentEvents: [],
            settings: {
                telemetryEnabled: false,
                notificationsEnabled: true
            }
        });

        // Open welcome page (optional)
        // chrome.tabs.create({ url: 'https://your-website.com/welcome' });
    }
});

console.log('[Daraz Cashback] Service worker loaded');
