// Extension configuration
// IMPORTANT: Replace these placeholders before production deployment
const CONFIG = {
  // Backend API URL - UPDATE THIS
  API_URL: 'http://localhost:3000',  // PLACEHOLDER - Change to production URL
  
  // Rate limiting
  MAX_ACTIVATIONS_PER_HOUR: 10,
  DEDUPLICATION_WINDOW_HOURS: 24,
  
  // UI settings
  WIDGET_POSITION: 'bottom-right',
  ANIMATION_DURATION: 300,
  
  // Cashback amounts (for display only)
  USER_CASHBACK_AMOUNT: 5,
  COMMISSION_AMOUNT: 30,
  
  // Feature flags
  ENABLE_TELEMETRY: false,  // User opt-in required
  DEBUG_MODE: false
};

// Export for use in extension scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
