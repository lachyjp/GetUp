// API functions for the GetUp application

// API configuration
const API_CONFIG = {
    accountsUrl: "https://api.up.com.au/api/v1/accounts",
    transactionsUrl: "https://api.up.com.au/api/v1/transactions?page[size]=",
    statusElements: {
        accounts: ['acc-status-successful', 'acc-status-failed'],
        transactions: ['txn-status-successful', 'txn-status-failed']
    },
    cache: {
        accounts: null,
        transactions: null,
        cacheTime: 5 * 60 * 1000, // 5 minutes in milliseconds
        lastFetch: null
    }
};

// Cache management functions
function isCacheValid() {
    if (!API_CONFIG.cache.lastFetch) return false;
    return (Date.now() - API_CONFIG.cache.lastFetch) < API_CONFIG.cache.cacheTime;
}

function setCache(accountsData, transactionsData) {
    API_CONFIG.cache.accounts = accountsData;
    API_CONFIG.cache.transactions = transactionsData;
    API_CONFIG.cache.lastFetch = Date.now();
}

function getCachedData() {
    return {
        accounts: API_CONFIG.cache.accounts,
        transactions: API_CONFIG.cache.transactions
    };
}

function clearCache() {
    API_CONFIG.cache.accounts = null;
    API_CONFIG.cache.transactions = null;
    API_CONFIG.cache.lastFetch = null;
}

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
};

// Exponential backoff retry function
async function retryWithBackoff(fn, context = 'API call') {
    let lastError;
    
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === RETRY_CONFIG.maxRetries) {
                console.error(`${context} failed after ${RETRY_CONFIG.maxRetries + 1} attempts:`, error);
                throw error;
            }
            
            const delay = Math.min(
                RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
                RETRY_CONFIG.maxDelay
            );
            
            console.warn(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            showNotification(`Retrying ${context.toLowerCase()}... (attempt ${attempt + 2})`, 'info', 2000);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Fetch accounts data from Up API with retry logic
async function fetchAccounts(upKey) {
    showLoadingState('acc-status-loading');
    
    try {
        const response = await retryWithBackoff(async () => {
            const res = await fetch(API_CONFIG.accountsUrl, {
                headers: {
                    Authorization: 'Bearer ' + upKey
                },
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            return res;
        }, 'Accounts fetch');

        if (response.status >= 200 && response.status <= 299) {
            const obj = await response.json();
            console.log('Accounts data:', obj);
            
            // Validate API response structure
            if (!validateApiResponse(obj, 'accounts')) {
                console.error('Invalid accounts response structure:', obj);
                document.getElementById(API_CONFIG.statusElements.accounts[1]).innerHTML = '❌ Invalid response format from Up API';
                return { success: false, error: 'Invalid response format' };
            }
            
            showSuccessStatus(API_CONFIG.statusElements.accounts[0], response.status);
            return { success: true, data: obj };
        } else {
            const errorResponse = await response.json();
            handleApiError(errorResponse, API_CONFIG.statusElements.accounts[1]);
            return { success: false, error: errorResponse };
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
        document.getElementById(API_CONFIG.statusElements.accounts[1]).innerHTML = `Network Error: ${error.message}`;
        return { success: false, error: error.message };
    } finally {
        hideLoadingState('acc-status-loading');
    }
}

// Fetch transactions data from Up API
async function fetchTransactions(upKey, txnUserAmount) {
    showLoadingState('txn-status-loading');
    
    try {
        const response = await fetch(API_CONFIG.transactionsUrl + txnUserAmount, {
            headers: {
                Authorization: 'Bearer ' + upKey
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const obj = await response.json();
            console.log('Transactions data:', obj);
            
            // Validate API response structure
            if (!validateApiResponse(obj, 'transactions')) {
                console.error('Invalid transactions response structure:', obj);
                document.getElementById(API_CONFIG.statusElements.transactions[1]).innerHTML = '❌ Invalid response format from Up API';
                return { success: false, error: 'Invalid response format' };
            }
            
            showSuccessStatus(API_CONFIG.statusElements.transactions[0], response.status);
            return { success: true, data: obj };
        } else {
            const errorResponse = await response.json();
            handleApiError(errorResponse, API_CONFIG.statusElements.transactions[1]);
            return { success: false, error: errorResponse };
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        document.getElementById(API_CONFIG.statusElements.transactions[1]).innerHTML = `Network Error: ${error.message}`;
        return { success: false, error: error.message };
    } finally {
        hideLoadingState('txn-status-loading');
    }
}

// Main function to fetch all data with caching
async function fetchAllData(upKey, txnUserAmount, forceRefresh = false) {
    try {
        // Check if we have valid cached data and don't need to refresh
        if (!forceRefresh && isCacheValid()) {
            console.log('Using cached data');
            const cachedData = getCachedData();
            return {
                accounts: { success: true, data: cachedData.accounts },
                transactions: { success: true, data: cachedData.transactions }
            };
        }

        // Fetch accounts and transactions in parallel for better performance
        const [accountsResult, transactionsResult] = await Promise.all([
            fetchAccounts(upKey),
            fetchTransactions(upKey, txnUserAmount)
        ]);

        // Cache the results if both were successful
        if (accountsResult.success && transactionsResult.success) {
            setCache(accountsResult.data, transactionsResult.data);
        }

        return {
            accounts: accountsResult,
            transactions: transactionsResult
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to fetch data. Please try again.');
        return {
            accounts: { success: false, error: error.message },
            transactions: { success: false, error: error.message }
        };
    }
}
