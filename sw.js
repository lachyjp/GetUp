/**
 * Service Worker for GetUp PWA
 * @fileoverview Provides offline functionality and caching for the GetUp application
 */

const CACHE_NAME = 'getup-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/api.js',
    '/data.js',
    '/ui.js',
    '/utils.js',
    '/advanced-features.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip API requests to Up Bank (they need to be fresh)
    if (event.request.url.includes('api.up.com.au')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(fetchResponse => {
                        // Don't cache if not a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(error => {
                        console.log('Network request failed, serving offline page:', error);
                        
                        // If it's a navigation request, serve the offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New transaction detected',
        icon: '/images/favicon.ico',
        badge: '/images/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/images/favicon.ico'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/favicon.ico'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('GetUp - Transaction Alert', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked');
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Get any pending actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            try {
                await processPendingAction(action);
                await removePendingAction(action.id);
            } catch (error) {
                console.error('Failed to process pending action:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Helper functions for offline storage
async function getPendingActions() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

async function processPendingAction(action) {
    // Process the pending action
    console.log('Processing pending action:', action);
}

async function removePendingAction(actionId) {
    // Remove the processed action
    console.log('Removing pending action:', actionId);
}
