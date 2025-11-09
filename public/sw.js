// Service Worker for Azteka DSD PWA
const CACHE_NAME = 'azteka-dsd-v2';  // Incremented to bust cache
const RUNTIME_CACHE = 'azteka-runtime-v2';

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW v2] Installing new service worker - will skip waiting');
  // Skip waiting immediately to activate new SW
  self.skipWaiting();
});

// Activate event - DELETE ALL CACHES (nuclear option)
self.addEventListener('activate', (event) => {
  console.log('[SW v2] Activating - deleting ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL caches, including old v1 caches
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW v2] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW v2] All caches deleted, claiming clients');
      // Take control of all pages immediately
      return self.clients.claim();
    }).then(() => {
      // Force reload all clients
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          console.log('[SW v2] Reloading client:', client.url);
          client.postMessage({ type: 'RELOAD' });
        });
      });
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network only with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              error: 'Offline',
              message: 'You are currently offline. Please check your connection.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200) {
            return response;
          }
          // Clone the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Navigation requests - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to cached index.html for SPA routing
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background sync for offline order submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // This would handle syncing offline orders when back online
  console.log('[SW] Syncing offline orders...');
  // Implementation would fetch from IndexedDB and POST to API
}

// Push notifications for order updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Azteka DSD', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
