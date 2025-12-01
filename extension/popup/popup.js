/**
 * Daraz Cashback - Popup Script
 * Manages popup UI, fetches balance, displays history
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize popup
    await loadUserData();
    await loadActivationHistory();
    setupEventListeners();
    loadSettings();
});

/**
 * Load user balance and stats
 */
async function loadUserData() {
    try {
        // Fetch balance from backend via service worker
        const response = await chrome.runtime.sendMessage({
            type: 'GET_USER_BALANCE'
        });

        if (response.error) {
            console.error('Failed to load balance:', response.error);
            return;
        }

        // Update balance display
        document.getElementById('amount-value').textContent = response.balance || 0;
        document.getElementById('total-earned').textContent = `Total earned: Rs. ${response.totalEarned || 0}`;

        // Enable payout button if balance >= 100
        const payoutBtn = document.getElementById('payout-btn');
        if (response.balance >= 100) {
            payoutBtn.disabled = false;
        } else {
            payoutBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

/**
 * Load activation history
 */
async function loadActivationHistory() {
    try {
        // Get activations from local storage
        const response = await chrome.runtime.sendMessage({
            type: 'GET_ACTIVATIONS'
        });

        const activations = response.activations || [];

        // Update stats
        document.getElementById('total-activations').textContent = activations.length;

        const pending = activations.filter(a => a.status === 'pending').length;
        const approved = activations.filter(a => a.status === 'completed').length;

        document.getElementById('pending-count').textContent = pending;
        document.getElementById('approved-count').textContent = approved;

        // Render history list
        const historyList = document.getElementById('history-list');
        const emptyState = document.getElementById('empty-state');

        if (activations.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';

        // Clear existing items (except empty state)
        const existingItems = historyList.querySelectorAll('.history-item');
        existingItems.forEach(item => item.remove());

        // Render activations (most recent first)
        const sortedActivations = activations.sort((a, b) => b.timestamp - a.timestamp);

        sortedActivations.forEach(activation => {
            const item = createHistoryItem(activation);
            historyList.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading history:', error);
    }
}

/**
 * Create history item element
 */
function createHistoryItem(activation) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const statusClass = activation.status === 'completed' ? 'status-approved' :
        activation.status === 'pending' ? 'status-pending' : 'status-rejected';

    const statusText = activation.status === 'completed' ? 'Approved' :
        activation.status === 'pending' ? 'Pending' : 'Rejected';

    const date = new Date(activation.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    item.innerHTML = `
    <div class="history-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 6L10 10L18 6L10 2Z" fill="currentColor"/>
      </svg>
    </div>
    <div class="history-details">
      <div class="history-title">${activation.productTitle || 'Product'}</div>
      <div class="history-meta">${dateStr}</div>
    </div>
    <div class="history-status">
      <span class="status-badge ${statusClass}">${statusText}</span>
      ${activation.status === 'completed' ? '<div class="history-amount">+Rs. 5</div>' : ''}
    </div>
  `;

    return item;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active states
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Payout button
    const payoutBtn = document.getElementById('payout-btn');
    const payoutModal = document.getElementById('payout-modal');
    const cancelPayoutBtn = document.getElementById('cancel-payout-btn');
    const confirmPayoutBtn = document.getElementById('confirm-payout-btn');

    payoutBtn.addEventListener('click', () => {
        const balance = parseFloat(document.getElementById('amount-value').textContent);
        document.getElementById('payout-amount').value = balance;
        payoutModal.style.display = 'block';
    });

    cancelPayoutBtn.addEventListener('click', () => {
        payoutModal.style.display = 'none';
    });

    confirmPayoutBtn.addEventListener('click', async () => {
        await requestPayout();
    });

    // Settings toggles
    const notificationsToggle = document.getElementById('notifications-toggle');
    const telemetryToggle = document.getElementById('telemetry-toggle');

    notificationsToggle.addEventListener('change', (e) => {
        saveSetting('notificationsEnabled', e.target.checked);
    });

    telemetryToggle.addEventListener('change', (e) => {
        saveSetting('telemetryEnabled', e.target.checked);
    });

    // Clear data button
    const clearDataBtn = document.getElementById('clear-data-btn');
    clearDataBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
            await chrome.storage.local.clear();
            alert('Local data cleared. Please refresh the popup.');
            window.close();
        }
    });
}

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['settings', 'hashedUserId']);
        const settings = result.settings || {
            notificationsEnabled: true,
            telemetryEnabled: false
        };

        document.getElementById('notifications-toggle').checked = settings.notificationsEnabled;
        document.getElementById('telemetry-toggle').checked = settings.telemetryEnabled;

        // Display user ID (truncated)
        if (result.hashedUserId) {
            const truncated = result.hashedUserId.substring(0, 12) + '...';
            document.getElementById('user-id-display').textContent = truncated;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Save setting
 */
async function saveSetting(key, value) {
    try {
        const result = await chrome.storage.local.get(['settings']);
        const settings = result.settings || {};

        settings[key] = value;
        await chrome.storage.local.set({ settings });

        console.log(`Setting ${key} saved:`, value);
    } catch (error) {
        console.error('Error saving setting:', error);
    }
}

/**
 * Request payout
 */
async function requestPayout() {
    const amount = parseFloat(document.getElementById('payout-amount').value);
    const method = document.getElementById('payout-method').value;
    const identifier = document.getElementById('payout-identifier').value;

    if (!identifier) {
        alert('Please enter your payment identifier');
        return;
    }

    if (amount < 100) {
        alert('Minimum payout is Rs. 100');
        return;
    }

    // Disable button
    const confirmBtn = document.getElementById('confirm-payout-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';

    try {
        // Hash the identifier for privacy
        const encoder = new TextEncoder();
        const data = encoder.encode(identifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedIdentifier = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Get user ID
        const result = await chrome.storage.local.get(['hashedUserId']);
        const hashedUserId = result.hashedUserId;

        // Call backend API
        const response = await fetch('http://localhost:3000/api/payout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hashedUserId,
                amount,
                method,
                payoutIdentifier: hashedIdentifier
            })
        });

        if (!response.ok) {
            throw new Error('Payout request failed');
        }

        const data = await response.json();

        alert('Payout request submitted! You will be notified when processed.');
        document.getElementById('payout-modal').style.display = 'none';

        // Reload data
        await loadUserData();

    } catch (error) {
        console.error('Payout error:', error);
        alert('Failed to request payout. Please try again later.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Request';
    }
}
