// Azteka DSD Service Worker - PWA Support v40 (Jan 3 2026)
// NOTE: Admin/employee/customer routes are intentionally excluded from caching.
// v40: Fix composite key order submission bug
const CACHE_VERSION = 'v40'
const CACHE_NAME = `azteka-dsd-${CACHE_VERSION}`
const STATIC_CACHE = `azteka-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `azteka-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `azteka-images-${CACHE_VERSION}`

// Static assets to cache on install - PUBLIC ONLY
// Do NOT include auth-protected pages (e.g. /admin/*, /employee/*, /customer/*) here.
const STATIC_ASSETS = [
  '/',
  '/catalog',
  '/cart',
  '/login',
  '/manifest.json',
]

// Install event - cache static assets and PURGE all old caches
self.addEventListener('install', (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing service worker...`)
  event.waitUntil(
    // First, delete ALL old caches to force fresh content
    caches.keys().then((cacheNames) => {
      console.log(`[SW ${CACHE_VERSION}] Clearing all old caches:`, cacheNames)
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      )
    }).then(() => {
      // Now cache static assets
      return caches.open(STATIC_CACHE).then((cache) => {
        console.log(`[SW ${CACHE_VERSION}] Caching static assets`)
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.log(`[SW ${CACHE_VERSION}] Failed to cache ${url}, skipping...`, err)
              return null
            })
          )
        )
      })
    }).catch(err => {
      console.log(`[SW ${CACHE_VERSION}] Cache install error (non-fatal):`, err)
      return Promise.resolve()
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches (keep only current version)
self.addEventListener('activate', (event) => {
  console.log(`[SW ${CACHE_VERSION}] Activating service worker...`)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes(CACHE_VERSION))
          .map((name) => {
            console.log(`[SW ${CACHE_VERSION}] Deleting old cache:`, name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // Skip API requests (don't cache) - they need fresh data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'You are currently offline. Please check your connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // NEVER cache admin/employee/customer routes - always fetch fresh
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/employee') || url.pathname.startsWith('/customer')) {
    event.respondWith(fetch(request))
    return
  }

  // NEVER cache Next.js build assets - always fetch fresh after deploy
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request))
    return
  }

  // NEVER cache /uploads/ images - always fetch fresh
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(fetch(request))
    return
  }

  // Use cache-first for other images (icons, logos)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => cachedResponse)

          return cachedResponse || fetchPromise
        })
      })
    )
    return
  }

  // Handle navigation requests - network first, cache fallback for offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache public pages
          if (response.ok && !url.pathname.startsWith('/admin') &&
              !url.pathname.startsWith('/employee') && !url.pathname.startsWith('/customer')) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse
            return caches.match('/catalog') || caches.match('/')
          })
        })
    )
    return
  }

  // Handle other static assets - stale while revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return networkResponse
      }).catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Azteka DSD', body: event.data.text() }
  }

  const options = {
    body: data.body || 'New notification from Azteka DSD',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Azteka DSD', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders())
  }
  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventoryChanges())
  }
})

async function syncOfflineOrders() {
  console.log(`[SW ${CACHE_VERSION}] Syncing offline orders...`)
}

async function syncInventoryChanges() {
  console.log(`[SW ${CACHE_VERSION}] Syncing inventory changes...`)
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }
})

console.log(`[SW ${CACHE_VERSION}] Service worker loaded`)
