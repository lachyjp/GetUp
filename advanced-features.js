/**
 * Advanced Up API features
 * @fileoverview Extends the basic GetUp functionality with categories, tags, and attachments
 */

// Advanced API endpoints
const ADVANCED_API_CONFIG = {
    categoriesUrl: "https://api.up.com.au/api/v1/categories",
    tagsUrl: "https://api.up.com.au/api/v1/tags",
    attachmentsUrl: "https://api.up.com.au/api/v1/attachments"
};

/**
 * Fetch categories from Up API
 * @param {string} upKey - The Up API key
 * @returns {Promise<Object>} Categories data
 */
async function fetchCategories(upKey) {
    try {
        const response = await fetch(ADVANCED_API_CONFIG.categoriesUrl, {
            headers: {
                Authorization: 'Bearer ' + upKey
            }
        });

        if (response.ok) {
            return { success: true, data: await response.json() };
        } else {
            return { success: false, error: await response.json() };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetch tags from Up API
 * @param {string} upKey - The Up API key
 * @returns {Promise<Object>} Tags data
 */
async function fetchTags(upKey) {
    try {
        const response = await fetch(ADVANCED_API_CONFIG.tagsUrl, {
            headers: {
                Authorization: 'Bearer ' + upKey
            }
        });

        if (response.ok) {
            return { success: true, data: await response.json() };
        } else {
            return { success: false, error: await response.json() };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Add tags to a transaction
 * @param {string} upKey - The Up API key
 * @param {string} transactionId - The transaction ID
 * @param {Array<string>} tags - Array of tag names to add
 * @returns {Promise<Object>} Result of the operation
 */
async function addTagsToTransaction(upKey, transactionId, tags) {
    try {
        const response = await fetch(`${ADVANCED_API_CONFIG.tagsUrl}/${transactionId}/relationships/tags`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + upKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: tags.map(tag => ({
                    type: 'tags',
                    id: tag
                }))
            })
        });

        if (response.ok) {
            return { success: true, data: await response.json() };
        } else {
            return { success: false, error: await response.json() };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Categorize a transaction
 * @param {string} upKey - The Up API key
 * @param {string} transactionId - The transaction ID
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object>} Result of the operation
 */
async function categorizeTransaction(upKey, transactionId, categoryId) {
    try {
        const response = await fetch(`${ADVANCED_API_CONFIG.categoriesUrl}/${transactionId}/relationships/category`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + upKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    type: 'categories',
                    id: categoryId
                }
            })
        });

        if (response.ok) {
            return { success: true, data: await response.json() };
        } else {
            return { success: false, error: await response.json() };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Display categories in the UI
 * @param {Array} categories - Array of category objects
 */
function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = '<h3>📊 Spending Categories</h3><hr>';
    
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.innerHTML = `
            <div class="category-info">
                <span class="category-name">${category.attributes.name}</span>
                <span class="category-parent">${category.attributes.parent ? `(${category.attributes.parent.data.attributes.name})` : ''}</span>
            </div>
        `;
        categoriesContainer.appendChild(categoryDiv);
    });
}

/**
 * Display tags in the UI
 * @param {Array} tags - Array of tag objects
 */
function displayTags(tags) {
    const tagsContainer = document.getElementById('tags');
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '<h3>🏷️ Available Tags</h3><hr>';
    
    const tagsList = document.createElement('div');
    tagsList.className = 'tags-list';
    
    tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag-badge';
        tagSpan.textContent = tag.attributes.name;
        tagsList.appendChild(tagSpan);
    });
    
    tagsContainer.appendChild(tagsList);
}

/**
 * Enhanced transaction display with categories and tags
 * @param {Object} transaction - Transaction object with category and tag data
 * @param {number} count - Transaction count for accordion ID
 */
function addEnhancedAccordion(transaction, count) {
    const accordion = document.createElement('div');
    accordion.className = 'panel-group enhanced-transaction';
    accordion.id = 'accordion';

    const categoryInfo = transaction.category ? 
        `<span class="category-badge">${transaction.category.attributes.name}</span>` : '';
    
    const tagsInfo = transaction.tags && transaction.tags.length > 0 ? 
        `<div class="transaction-tags">${transaction.tags.map(tag => 
            `<span class="tag-badge small">${tag.attributes.name}</span>`
        ).join('')}</div>` : '';

    accordion.innerHTML = `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${count}">
                    ${transaction.attributes.description} / ${transaction.attributes.amount.value > 0 ? '+' : ''}$${Math.abs(transaction.attributes.amount.value)}
                    ${categoryInfo}
                </button>
            </h2>
            <div id="collapse${count}" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="transaction-details">
                        <div class="detail-row">
                            <span class="detail-label">Time received:</span> 
                            <span class="detail-value">${new Date(transaction.attributes.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span> 
                            <span class="detail-value status-${transaction.attributes.status.toLowerCase()}">${transaction.attributes.status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Merchant details:</span> 
                            <span class="detail-value">${transaction.attributes.rawText || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Message:</span> 
                            <span class="detail-value">${transaction.attributes.message || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Round up:</span> 
                            <span class="detail-value">${transaction.attributes.roundUp ? 'Yes' : 'No'}</span>
                        </div>
                        ${tagsInfo}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('activity').appendChild(accordion);
}

/**
 * Load advanced features data
 * @param {string} upKey - The Up API key
 */
async function loadAdvancedFeatures(upKey) {
    try {
        // Load categories and tags in parallel
        const [categoriesResult, tagsResult] = await Promise.all([
            fetchCategories(upKey),
            fetchTags(upKey)
        ]);

        if (categoriesResult.success) {
            displayCategories(categoriesResult.data.data);
        }

        if (tagsResult.success) {
            displayTags(tagsResult.data.data);
        }

        showNotification('Advanced features loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading advanced features:', error);
        showNotification('Failed to load advanced features', 'error');
    }
}
