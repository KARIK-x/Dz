/**
 * Daraz Cashback - Content Script
 * Detects Daraz product pages and injects cashback widget
 */

(function () {
    'use strict';

    // Configuration
    const API_URL = 'http://localhost:3000'; // PLACEHOLDER - Will be loaded from config
    let widgetInjected = false;
    let currentProductData = null;

    /**
     * Detect if current page is a Daraz product page
     */
    function isDarazProductPage() {
        // Check URL pattern
        const url = window.location.href;
        const productUrlPattern = /\/products\/[^\/]+\.html/i;

        if (!productUrlPattern.test(url)) {
            return false;
        }

        // Verify with meta tags
        const ogType = document.querySelector('meta[property="og:type"]');
        if (ogType && ogType.content.includes('product')) {
            return true;
        }

        // Check for product schema
        const productSchema = document.querySelector('script[type="application/ld+json"]');
        if (productSchema) {
            try {
                const data = JSON.parse(productSchema.textContent);
                if (data['@type'] === 'Product') {
                    return true;
                }
            } catch (e) {
                console.debug('[Daraz Cashback] Schema parse error:', e);
            }
        }

        return true; // URL pattern matched
    }

    /**
     * Extract product information from page
     */
    function extractProductData() {
        const productData = {
            productId: null,
            productTitle: null,
            productPrice: null,
            sellerInfo: null,
            productUrl: window.location.href
        };

        // Extract product ID from URL
        const urlMatch = window.location.pathname.match(/\/products\/([^\/]+)\-i(\d+)/);
        if (urlMatch) {
            productData.productId = urlMatch[2];
        }

        // Extract title
        const titleElement = document.querySelector('h1.pdp-mod-product-badge-title') ||
            document.querySelector('h1[class*="title"]') ||
            document.querySelector('meta[property="og:title"]');
        if (titleElement) {
            productData.productTitle = titleElement.content || titleElement.textContent.trim();
        }

        // Extract price
        const priceElement = document.querySelector('.pdp-price_type_normal') ||
            document.querySelector('.pdp-price') ||
            document.querySelector('[class*="price"]');
        if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/Rs\.\s*([\d,]+)/);
            if (priceMatch) {
                productData.productPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
            }
        }

        // Extract seller info
        const sellerElement = document.querySelector('.pdp-seller-name') ||
            document.querySelector('[class*="seller"]');
        if (sellerElement) {
            productData.sellerInfo = sellerElement.textContent.trim();
        }

        return productData;
    }

    /**
     * Inject cashback widget into page
     */
    function injectWidget(productData) {
        if (widgetInjected) {
            console.debug('[Daraz Cashback] Widget already injected');
            return;
        }

        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'daraz-cashback-widget';
        widgetContainer.innerHTML = `
      <div class="dcb-widget" role="complementary" aria-label="Cashback offer">
        <div class="dcb-widget-content">
          <div class="dcb-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00BFA5"/>
              <path d="M2 17L12 22L22 17" stroke="#00BFA5" stroke-width="2"/>
            </svg>
          </div>
          <div class="dcb-message">
            <strong>Cashback Available: Get Rs. 5</strong>
            <p>Activate to earn cashback on this purchase</p>
          </div>
          <button class="dcb-activate-btn" aria-label="Activate cashback">
            Activate Cashback
          </button>
        </div>
        <button class="dcb-close-btn" aria-label="Close widget">×</button>
      </div>
      
      <!-- Confirmation Modal -->
      <div class="dcb-modal" role="dialog" aria-labelledby="dcb-modal-title" aria-modal="true" style="display: none;">
        <div class="dcb-modal-overlay"></div>
        <div class="dcb-modal-content">
          <h2 id="dcb-modal-title">Activate Cashback</h2>
          <div class="dcb-modal-body">
            <p class="dcb-disclosure">
              We will redirect you through our affiliate link.
            </p>
            <div class="dcb-commission-info">
              <div class="dcb-info-row">
                <span>We earn commission:</span>
                <strong>Rs. 30</strong>
              </div>
              <div class="dcb-info-row dcb-highlight">
                <span>You'll get:</span>
                <strong>Rs. 5</strong>
              </div>
            </div>
            <p class="dcb-legal">
              By proceeding, you consent to this affiliate arrangement. 
              Your privacy is protected—we don't collect personal information.
            </p>
          </div>
          <div class="dcb-modal-actions">
            <button class="dcb-btn dcb-btn-secondary" id="dcb-cancel-btn">
              Cancel
            </button>
            <button class="dcb-btn dcb-btn-primary" id="dcb-confirm-btn">
              Confirm & Activate
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(widgetContainer);
        widgetInjected = true;

        // Log consent event: widget shown
        logConsentEvent('widget_shown', productData);

        // Add event listeners
        setupWidgetEventListeners(productData);

        // Animate widget in
        setTimeout(() => {
            const widget = document.querySelector('.dcb-widget');
            if (widget) {
                widget.classList.add('dcb-visible');
            }
        }, 100);
    }

    /**
     * Setup event listeners for widget interactions
     */
    function setupWidgetEventListeners(productData) {
        const activateBtn = document.querySelector('.dcb-activate-btn');
        const closeBtn = document.querySelector('.dcb-close-btn');
        const modal = document.querySelector('.dcb-modal');
        const confirmBtn = document.getElementById('dcb-confirm-btn');
        const cancelBtn = document.getElementById('dcb-cancel-btn');
        const overlay = document.querySelector('.dcb-modal-overlay');

        // Show modal when activate button clicked
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                modal.style.display = 'block';
                logConsentEvent('modal_opened', productData);

                // Focus trap
                confirmBtn.focus();
            });
        }

        // Close widget
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const widget = document.querySelector('.dcb-widget');
                widget.classList.remove('dcb-visible');
                setTimeout(() => {
                    const container = document.getElementById('daraz-cashback-widget');
                    if (container) container.remove();
                    widgetInjected = false;
                }, 300);
            });
        }

        // Cancel modal
        const closeModal = () => {
            modal.style.display = 'none';
            logConsentEvent('consent_declined', productData);
        };

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Confirm activation
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                logConsentEvent('consent_given', productData);
                await handleActivation(productData);
            });
        }

        // Keyboard accessibility
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    /**
     * Log consent event for audit trail
     */
    function logConsentEvent(action, productData) {
        chrome.runtime.sendMessage({
            type: 'LOG_CONSENT_EVENT',
            data: {
                action: action,
                productId: productData?.productId,
                timestamp: Date.now(),
                url: window.location.href
            }
        });
    }

    /**
     * Handle cashback activation
     */
    async function handleActivation(productData) {
        const modal = document.querySelector('.dcb-modal');
        const confirmBtn = document.getElementById('dcb-confirm-btn');

        // Show loading state
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Activating...';

        try {
            // Send activation request to service worker
            const response = await chrome.runtime.sendMessage({
                type: 'ACTIVATE_CASHBACK',
                data: productData
            });

            if (response.success) {
                // Show success state
                showActivationSuccess();

                // Service worker will handle the redirect
            } else {
                throw new Error(response.error || 'Activation failed');
            }
        } catch (error) {
            console.error('[Daraz Cashback] Activation error:', error);
            showActivationError(error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm & Activate';
        }
    }

    /**
     * Show activation success message
     */
    function showActivationSuccess() {
        const modalBody = document.querySelector('.dcb-modal-body');
        modalBody.innerHTML = `
      <div class="dcb-success">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#00BFA5" opacity="0.1"/>
          <path d="M20 32L28 40L44 24" stroke="#00BFA5" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <h3>Cashback Activated!</h3>
        <p>Redirecting you to complete your purchase...</p>
      </div>
    `;
    }

    /**
     * Show activation error message
     */
    function showActivationError(message) {
        const modalBody = document.querySelector('.dcb-modal-body');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'dcb-error';
        errorDiv.innerHTML = `
      <p><strong>Error:</strong> ${message}</p>
      <p>Please try again or contact support if the issue persists.</p>
    `;
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }

    /**
     * Initialize cashback detection
     */
    function initialize() {
        console.debug('[Daraz Cashback] Initializing content script');

        if (isDarazProductPage()) {
            currentProductData = extractProductData();

            if (currentProductData.productId) {
                console.debug('[Daraz Cashback] Product detected:', currentProductData);

                // Check if already activated for this product
                checkActivationStatus(currentProductData.productId).then(alreadyActivated => {
                    if (!alreadyActivated) {
                        injectWidget(currentProductData);
                    } else {
                        console.debug('[Daraz Cashback] Product already activated');
                    }
                });
            } else {
                console.debug('[Daraz Cashback] Could not extract product ID');
            }
        }
    }

    /**
     * Check if cashback already activated for this product
     */
    async function checkActivationStatus(productId) {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CHECK_ACTIVATION_STATUS',
                data: { productId }
            });
            return response.alreadyActivated || false;
        } catch (error) {
            console.error('[Daraz Cashback] Status check error:', error);
            return false;
        }
    }

    /**
     * Listen for page changes (for SPA compatibility)
     */
    function observePageChanges() {
        let lastUrl = location.href;

        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                widgetInjected = false;

                // Remove existing widget
                const existingWidget = document.getElementById('daraz-cashback-widget');
                if (existingWidget) {
                    existingWidget.remove();
                }

                // Re-initialize
                setTimeout(initialize, 500);
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Observe for SPA navigation
    observePageChanges();

})();
