/**
 * Utility functions for the GetUp application
 * @fileoverview Contains helper functions for error handling, validation, and data processing
 */

/**
 * Handles API errors and displays user-friendly error messages
 * @param {Object} response - The API error response object
 * @param {string} statusElementId - The DOM element ID to display the error message
 * @example
 * handleApiError({errors: [{status: 401, title: 'Unauthorized'}]}, 'error-display');
 */
function handleApiError(response, statusElementId) {
    const errorElement = document.getElementById(statusElementId);
    let errorMessage = '';
    
    if (response.errors && response.errors[0]) {
        const error = response.errors[0];
        // Make error messages more user-friendly
        if (error.status === 401) {
            errorMessage = '🔐 Authentication failed. Please check your API key and try again.';
        } else if (error.status === 403) {
            errorMessage = '🚫 Access denied. Your API key may not have the required permissions.';
        } else if (error.status === 429) {
            errorMessage = '⏱️ Too many requests. Please wait a moment and try again.';
        } else if (error.status >= 500) {
            errorMessage = '🔧 Server error. Please try again later.';
        } else {
            errorMessage = `❌ ${error.title}: ${error.detail}`;
        }
    } else {
        errorMessage = `❌ Error: ${response.status || 'Unknown error occurred'}`;
    }
    
    errorElement.innerHTML = errorMessage;
    console.log('API Error:', response);
}

// Utility function for displaying success status
function showSuccessStatus(statusElementId, statusCode) {
    document.getElementById(statusElementId).innerHTML = `${statusCode}: Success!`;
}

// Utility function for showing loading state
function showLoadingState(loadingElementId) {
    document.getElementById(loadingElementId).style.display = 'inline';
}

// Utility function for hiding loading state
function hideLoadingState(loadingElementId) {
    document.getElementById(loadingElementId).style.display = 'none';
}

/**
 * Security utility functions
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} The sanitized input string
 * @example
 * sanitizeInput('<script>alert("xss")</script>'); // Returns 'alert("xss")'
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and scripts
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateApiKey(apiKey) {
    // Basic validation for Up API key format
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // Up API keys typically start with "up:yeah:" followed by alphanumeric characters
    // Updated to handle the actual Up API key format with colons
    const trimmedKey = apiKey.trim();
    return trimmedKey.length >= 15 && /^up:yeah:[A-Za-z0-9_-]+$/.test(trimmedKey);
}

function validateApiResponse(response, expectedType) {
    if (!response || typeof response !== 'object') return false;
    
    // Check for required structure based on Up API format
    if (expectedType === 'accounts') {
        return response.data && Array.isArray(response.data) && 
               response.data.length > 0 && 
               response.data[0].attributes && 
               response.data[0].attributes.displayName;
    }
    
    if (expectedType === 'transactions') {
        return response.data && Array.isArray(response.data) && 
               response.data.length > 0 && 
               response.data[0].attributes && 
               response.data[0].attributes.description;
    }
    
    return false;
}

// Utility function for showing user-friendly error messages (with XSS protection)
function showError(message) {
    // Sanitize the message to prevent XSS
    const sanitizedMessage = escapeHtml(message);
    
    // Create a temporary error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${sanitizedMessage}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Utility function for removing duplicates from array
function removeDuplicates(array) {
    return array.filter((item, index) => array.indexOf(item) === index);
}

// Utility function for formatting dates
function formatDate(time) {
    const splitTimeDate = time.split("T");
    return splitTimeDate;
}

// Utility function for formatting time
function formatTime(time) {
    let shortTime = time.split("+");
    let shorterTime = shortTime[0].slice(0, 5);

    if (shorterTime.charAt(0) === "0") {
        shorterTime = shorterTime.slice(1, 5);
    }
    
    const newTime = parseFloat(shorterTime.slice(0, 2));

    if (newTime < 12) {
        shorterTime = shorterTime + "am";
    } else {
        shorterTime = shorterTime + "pm";
    }

    if (newTime > 12) {
        const pmTime = newTime - 12;
        shorterTime = pmTime + shorterTime.slice(2);
    }
    return shorterTime;
}
