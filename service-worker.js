/* =====================================================
   NEXT — SERVICE WORKER
   PWA Offline Support + Cache Management
   ===================================================== */

const CACHE_VERSION = 'next-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;

/* =====================================================
   ASSETS TO PRECACHE
   ===================================================== */

const PRECACHE_ASSETS = [
    /* Root */
    '/',
    '/index.html',
    '/offline.html',

    /* Core Pages */
    '/login.html',
    '/register.html',
    '/welcome.html',
    '/dashboard.html',
    '/goal-selection.html',
    '/goal-definition.html',
    '/current-state.html',
    '/profile.html',
    '/assessment-introduction.html',
    '/adaptive-question.html',
    '/assessment-processing.html',
    '/analysis.html',
    '/what-you-can-control.html',
    '/next-steps.html',
    '/action-details.html',
    '/goal-details.html',
    '/progress.html',
    '/notifications.html',
    '/settings.html',
    '/reassessment.html',

    /* Core CSS */
    '/styles/tokens.css',
    '/styles/base.css',
    '/styles/components.css',
    '/styles/layout.css',
    '/styles/motion.css',

    /* Core JS */
    '/scripts/core/storage.js',
    '/scripts/core/session.js',
    '/scripts/core/ui.js',
    '/scripts/core/motion.js',
    '/scripts/core/nav-config.js',
    '/scripts/core/components.js',
    '/scripts/core/pwa.js'
];


/* =====================================================
   INSTALL EVENT
   ===================================================== */

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches
            .open(CACHE_STATIC)
            .then((cache) => {
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Precache complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precache failed:', error);
            })
    );
});


/* =====================================================
   ACTIVATE EVENT
   ===================================================== */

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('next-') &&
                                   name !== CACHE_STATIC &&
                                   name !== CACHE_DYNAMIC;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activate complete');
                return self.clients.claim();
            })
    );
});


/* =====================================================
   FETCH EVENT
   ===================================================== */

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    /* Skip non-GET requests */
    if (request.method !== 'GET') return;

    /* Skip cross-origin requests (fonts, CDN) */
    if (url.origin !== location.origin) {
        /* Try network first for external resources */
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(request);
            })
        );
        return;
    }

    /* Skip chrome-extension and other schemes */
    if (!url.protocol.startsWith('http')) return;

    /* HTML pages: Network First, fallback to cache, then offline */
    if (request.mode === 'navigate' ||
        (request.headers.get('accept') || '').includes('text/html')) {

        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses
                    const responseClone = response.clone();
                    caches.open(CACHE_DYNAMIC).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Try cache first
                    return caches.match(request).then((cached) => {
                        return cached || caches.match('/offline.html');
                    });
                })
        );
        return;
    }

    /* Static assets: Cache First, fallback to network */
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                // Update cache in background
                fetch(request)
                    .then((response) => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_DYNAMIC).then((cache) => {
                                cache.put(request, response);
                            });
                        }
                    })
                    .catch(() => {});

                return cached;
            }

            // Not in cache: fetch and cache
            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(CACHE_DYNAMIC).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            });
        })
    );
});


/* =====================================================
   MESSAGE EVENT (skip waiting)
   ===================================================== */

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});


/* =====================================================
   PUSH NOTIFICATIONS (مستقبلاً)
   ===================================================== */

self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || 'إشعار جديد من NEXT',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/dashboard.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'NEXT', options)
    );
});


/* =====================================================
   NOTIFICATION CLICK
   ===================================================== */

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/dashboard.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Focus existing window
                for (const client of windowClients) {
                    if (client.url.includes(targetUrl) && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});