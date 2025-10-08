// UI manipulation functions for the GetUp application

// Cache frequently accessed DOM elements for better performance
const DOM_CACHE = {
    elements: {},
    
    getElement(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    },
    
    clearCache() {
        this.elements = {};
    }
};

// A reusable function to add HTML anywhere
function newTextNode(newMessage, type, id) {
    const p = document.createElement(type);
    const node = document.createTextNode(newMessage);
    p.appendChild(node);
    const element = DOM_CACHE.getElement(id);
    if (element) {
        element.appendChild(p);
    }
}

// Create accordion for transaction details
function addAccordion(desc, type, val, time, status, text, message, roundup, count) {
    const accordion = document.createElement('div');
    accordion.className = 'panel-group';
    accordion.id = 'accordion';

    accordion.innerHTML = `<div class="accordion-item">
                            <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${count}">
                                ${desc} / ${type}$${val}         
                            </button>
                            </h2>
                            <div id="collapse${count}" class="accordion-collapse collapse">
                            <div class="accordion-body">
                            <span style="font-family: Circular-Black">Time received:</span> ${time} <br> <span style="font-family: Circular-Black">Status:</span> ${status} <br> <span style="font-family: Circular-Black"> Merchant details: </span> ${text} <br> <span style="font-family: Circular-Black"> Message: </span> ${message} <br> <span style="font-family: Circular-Black"> Round up: </span>${roundup}
                            </div>
                            </div>
                        </div> `;

    document.getElementById('activity').appendChild(accordion);
}

// Display account information with optimized rendering
function displayAccounts(account, balanceTotal) {
    const accountsContainer = DOM_CACHE.getElement("accounts");
    const totalBalanceContainer = DOM_CACHE.getElement("total-balance");
    
    if (!accountsContainer || !totalBalanceContainer) return;
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Display each account
    account.forEach((acc) => {
        const accountDiv = document.createElement('div');
        const emoji = acc.name === "Spending" ? "💸" : "";
        accountDiv.innerHTML = `<p>Your ${emoji} ${acc.name} balance is $${acc.balance}</p><hr>`;
        fragment.appendChild(accountDiv);
    });
    
    // Clear and update accounts container
    accountsContainer.innerHTML = '';
    accountsContainer.appendChild(fragment);

    // Display total balance
    totalBalanceContainer.innerHTML = `Total 💯 balance: $${balanceTotal.toFixed(2)} <hr>`;
}

// Display transaction information grouped by date
function displayTransactions(txn) {
    const activityContainer = document.getElementById('activity');
    
    // Clear existing content
    activityContainer.innerHTML = '';
    
    // Get unique dates
    const dates = txn.map(transaction => transaction.date);
    const uniqueDates = removeDuplicates(dates);
    
    // Convert dates to readable format
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const readableDates = uniqueDates.map(date => {
        const dateSplit = date.split("-");
        const dayFloat = parseFloat(dateSplit[2]);
        const monthFloat = parseFloat(dateSplit[1]);
        const monthName = months[monthFloat - 1];
        return `${dayFloat} ${monthName}`;
    });

    // Display transactions grouped by date
    uniqueDates.forEach((date, dateIndex) => {
        newTextNode(readableDates[dateIndex], "h4", "activity");

        txn.forEach((transaction, txnIndex) => {
            if (transaction.date === date) {
                addAccordion(
                    transaction.desc, 
                    transaction.type, 
                    transaction.val, 
                    transaction.time, 
                    transaction.status, 
                    transaction.text, 
                    transaction.msg, 
                    transaction.roundup, 
                    txnIndex
                );
            }
        });
        
        newTextNode("", "br", "activity");
        newTextNode("", "br", "activity");
    });
}

// Display spending statistics
function displaySpendingStats(stats, uniqueMerchantsCount) {
    const totalSpentContainer = document.getElementById("totalSpent");
    
    // Clear existing content
    totalSpentContainer.innerHTML = '';
    
    newTextNode(`$${stats.totalSpent} spent over the last ${stats.daysBetween} days`, "p", "totalSpent");
    newTextNode("", "hr", "totalSpent");
    newTextNode(`$${stats.averageDaily} average spent per day`, "p", "totalSpent");
    newTextNode("", "hr", "totalSpent");
    newTextNode(`${uniqueMerchantsCount} unique merchants`, "p", "totalSpent");
    newTextNode("", "hr", "totalSpent");
    newTextNode("", "br", "totalSpent");
}

// Enhanced notification system with animations
function showNotification(message, type = 'info', duration = 3000) {
    const notificationDiv = document.createElement('div');
    const typeClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
    
    notificationDiv.className = `alert ${typeClass} notification`;
    notificationDiv.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        z-index: 9999; 
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-radius: 8px;
        margin-bottom: 10px;
    `;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    notificationDiv.innerHTML = `
        <strong>${icon}</strong> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" 
                style="float: right; background: none; border: none; font-size: 20px; cursor: pointer; color: inherit;">&times;</button>
    `;
    
    document.body.appendChild(notificationDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        notificationDiv.style.opacity = '1';
        notificationDiv.style.transform = 'translateX(0)';
    });
    
    // Auto-remove with animation
    setTimeout(() => {
        if (notificationDiv.parentElement) {
            notificationDiv.style.opacity = '0';
            notificationDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificationDiv.parentElement) {
                    notificationDiv.remove();
                }
            }, 300);
        }
    }, duration);
}

// Add loading animation to elements
function addLoadingAnimation(elementId, text = 'Loading...') {
    const element = DOM_CACHE.getElement(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">${text}</span>
                </div>
                <span class="ms-2">${text}</span>
            </div>
        `;
    }
}

// Clear all displayed data with optimized DOM access
function clearDisplay() {
    const elementsToClear = [
        "user-name", "accounts", "activity", "total-balance", "totalSpent",
        "acc-status-successful", "acc-status-failed", 
        "txn-status-successful", "txn-status-failed"
    ];
    
    elementsToClear.forEach(id => {
        const element = DOM_CACHE.getElement(id);
        if (element) {
            element.innerHTML = '';
        }
    });
    
    // Clear DOM cache to ensure fresh lookups
    DOM_CACHE.clearCache();
}
