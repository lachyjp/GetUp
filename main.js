// Main application logic for GetUp
// This file coordinates between the different modules

// Constants
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Input validation and form submission with security measures
function submitUpKey() {
    // Sanitize all inputs
    const rawUpKey = document.getElementById("upKeyInput").value;
    const rawTxnUserAmount = document.getElementById("txnUserAmountInput").value;
    const rawUserName = document.getElementById("userNameInput").value;
    
    const upKey = sanitizeInput(rawUpKey).trim();
    let txnUserAmount = sanitizeInput(rawTxnUserAmount).trim();
    const userName = sanitizeInput(rawUserName).trim();

    // Input validation with better error messages
    if (!upKey) {
        showError("❌ Please enter your Up API key to continue");
        return;
    }

    if (!userName) {
        showError("❌ Please enter your name to personalize your experience");
        return;
    }

    // Validate API key format using proper validation
    if (!validateApiKey(upKey)) {
        showError("❌ Invalid API key format. Please check your key and try again. You can get your API key from the Up mobile app.");
        return;
    }

    // Validate transaction count
    if (txnUserAmount === "") {
        txnUserAmount = 20; // Default to 20 instead of 7
    } else {
        const txnCount = parseInt(txnUserAmount);
        if (isNaN(txnCount) || txnCount < 1 || txnCount > 100) {
            showError("❌ Transaction count must be a number between 1 and 100");
            return;
        }
        txnUserAmount = txnCount;
    }

    // Clear previous data
    clearDisplay();

    // Store current session data
    currentUpKey = upKey;
    currentTxnAmount = txnUserAmount;

    // Show welcome message
    newTextNode(`Welcome, ${userName}!`, "h1", "user-name");
    newTextNode("", "br", "user-name");

    // Fetch and display data
    loadUserData(upKey, txnUserAmount);
}

// Main function to load and display user data using modern JS features
const loadUserData = async (upKey, txnUserAmount) => {
    try {
        // Fetch all data
        const data = await fetchAllData(upKey, txnUserAmount);

        // Process and display accounts using destructuring
        if (data.accounts.success) {
            const { account } = processAccountData(data.accounts.data);
            
            // Calculate total balance using modern array methods
            const balanceTotal = account.reduce((total, acc) => total + acc.balance, 0);
            
            // Display accounts
            displayAccounts(account, balanceTotal);
        }

        // Process and display transactions using destructuring
        if (data.transactions.success) {
            const { txn } = processTransactionData(data.transactions.data);
            
            // Display transactions
            displayTransactions(txn);
            
            // Calculate and display statistics using modern array methods
            const stats = calculateSpendingStats(txn);
            const uniqueMerchantsCount = countUniqueMerchants(txn);
            displaySpendingStats(stats, uniqueMerchantsCount);
        }

        // Update UI buttons using modern DOM methods
        updateUIButtons();

    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load your data. Please check your API key and try again.');
    }
};

// Helper function to update UI buttons
const updateUIButtons = () => {
    const loginButton = document.getElementById("thebutton");
    const refreshButton = document.getElementById("refreshButton");
    
    // Use optional chaining and modern assignment
    loginButton?.style.setProperty('display', 'none');
    refreshButton?.style.setProperty('display', 'inline-block');
};

// Global variables to store current session data
let currentUpKey = null;
let currentTxnAmount = null;

// Refresh data function using modern JS features
const refreshData = async () => {
    if (currentUpKey && currentTxnAmount) {
        showError('🔄 Refreshing data...');
        await loadUserData(currentUpKey, currentTxnAmount, true); // Force refresh
    }
};

// PWA Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showNotification('App update available! Refresh to get the latest version.', 'info', 10000);
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Initialize the application when the page loads using modern JS
document.addEventListener('DOMContentLoaded', () => {
    console.log('GetUp application loaded successfully');
    
    // Register service worker for PWA functionality
    registerServiceWorker();
    
    // Add any initialization code here if needed
    // For example, setting up event listeners, initializing UI state, etc.
});
