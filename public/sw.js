// Azteka DSD Service Worker - PWA Support v9 (Dec 26 2025)
// NOTE: Admin/employee routes are intentionally excluded from caching.
const CACHE_NAME = 'azteka-dsd-v9'
const STATIC_CACHE = 'azteka-static-v9'
const DYNAMIC_CACHE = 'azteka-dynamic-v9'
const IMAGE_CACHE = 'azteka-images-v9'

// Static assets to cache on install - PUBLIC ONLY
// Do NOT include auth-protected pages (e.g. /admin/*, /employee/*) here.
const STATIC_ASSETS = [
  '/',
  '/catalog',
  '/cart',
  '/login',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW v9] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW v9] Caching static assets')
      // Only cache assets that definitely exist - skip ones that might fail
      return Promise.allSettled(
        STATIC_ASSETS.map(url => 
          cache.add(url).catch(err => {
            console.log(`[SW v9] Failed to cache ${url}, skipping...`, err)
            return null
          })
        )
      ).then(() => {
        console.log('[SW v9] Static assets cached (some may have been skipped)')
        return Promise.resolve()
      })
    }).catch(err => {
      console.log('[SW v9] Cache install error (non-fatal):', err)
      return Promise.resolve()
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW v9] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes('-v9'))
          .map((name) => {
            console.log('[SW v9] Deleting old cache:', name)
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

  // Never cache admin/employee routes (avoid stale/broken authenticated UI)
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/employee')) {
    event.respondWith(fetch(request))
    return
  }

  // Never cache Next.js build assets to avoid serving stale JS/CSS after deploy
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request))
    return
  }

  // Handle image requests - NEVER cache /uploads/ images (bypass service worker entirely)
  if (url.pathname.startsWith('/uploads/')) {
    // Bypass service worker completely for uploads - go directly to network
    event.respondWith(fetch(request))
    return
  }
  
  // Use cache-first for other images (icons, logos)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    
    // For other images (icons, logos), use cache-first
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

  // Handle navigation requests - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
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
            // Fallback to appropriate cached page based on URL
            if (url.pathname.startsWith('/employee')) {
              return caches.match('/employee') || caches.match('/')
            }
            if (url.pathname.startsWith('/admin')) {
              return caches.match('/admin') || caches.match('/')
            }
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
  console.log('[SW v9] Syncing offline orders...')
  // Future: retrieve orders from IndexedDB and POST to API
}

async function syncInventoryChanges() {
  console.log('[SW v9] Syncing inventory changes...')
  // Future: retrieve inventory updates from IndexedDB and PATCH to API
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

console.log('[SW v9] Service worker loaded')
