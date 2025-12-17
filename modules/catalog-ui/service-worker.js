/**
 * Catalog UI Service Worker
 * 
 * Provides offline caching strategies for the Azteka DSD catalog:
 * - Cache-first for product images (long TTL)
 * - Network-first for API calls with cache fallback
 * - Precache catalog layout assets
 * - Background sync for pending orders
 */

const CACHE_VERSION = 'azteka-catalog-v1';
const CACHE_NAMES = {
  images: `${CACHE_VERSION}-images`,
  api: `${CACHE_VERSION}-api`,
  static: `${CACHE_VERSION}-static`,
};

const CACHE_MAX_AGE = {
  images: 7 * 24 * 60 * 60 * 1000, // 7 days
  api: 5 * 60 * 1000, // 5 minutes
  static: 24 * 60 * 60 * 1000, // 24 hours
};

const STATIC_ASSETS = [
  '/',
  '/catalog',
  '/manifest.json',
  // Add other critical assets
];

const API_ENDPOINTS = [
  '/api/products',
  '/api/brands',
  '/api/categories',
  '/api/stores',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      console.log('[Service Worker] Precaching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch((error) => {
      console.error('[Service Worker] Precache failed:', error);
    })
  );
  
  // Force activation immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old versions
            return cacheName.startsWith('azteka-catalog-') && 
                   !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Image caching strategy: Cache-First with long TTL
  if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.images, CACHE_MAX_AGE.images));
    return;
  }
  
  // API caching strategy: Network-First with cache fallback
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.api, CACHE_MAX_AGE.api));
    return;
  }
  
  // Static assets: Cache-First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.static, CACHE_MAX_AGE.static));
    return;
  }
  
  // Default: Network only
  event.respondWith(fetch(request));
});

// Cache-First Strategy
async function cacheFirstStrategy(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0).getTime();
      const now = Date.now();
      
      if (now - cacheTime < maxAge) {
        console.log('[Service Worker] Cache hit (fresh):', request.url);
        return cachedResponse;
      }
      
      console.log('[Service Worker] Cache hit (stale), updating...:', request.url);
      // Return stale content immediately, update in background
      fetchAndCache(request, cache);
      return cachedResponse;
    }
    
    // Cache miss - fetch from network
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    await cacheResponse(cache, request, networkResponse.clone());
    return networkResponse;
    
  } catch (error) {
    console.error('[Service Worker] Cache-First failed:', error);
    
    // Try to return stale cache as last resort
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      console.log('[Service Worker] Returning stale cache due to error');
      return staleResponse;
    }
    
    // Return offline fallback
    return createOfflineResponse();
  }
}

// Network-First Strategy
async function networkFirstStrategy(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cacheResponse(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Cache fallback success');
      return cachedResponse;
    }
    
    // No cache available
    console.error('[Service Worker] Network-First failed, no cache available:', error);
    return createOfflineResponse();
  }
}

// Helper: Cache response with timestamp
async function cacheResponse(cache, request, response) {
  if (!response || response.status !== 200 || response.type === 'error') {
    return;
  }
  
  // Clone response and add cache timestamp header
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', new Date().toISOString());
  
  const cachedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  
  await cache.put(request, cachedResponse);
}

// Helper: Fetch and cache in background (fire and forget)
function fetchAndCache(request, cache) {
  fetch(request)
    .then((response) => {
      if (response && response.ok) {
        return cacheResponse(cache, request, response);
      }
    })
    .catch((error) => {
      console.error('[Service Worker] Background fetch failed:', error);
    });
}

// Helper: Check if request is for an image
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
         url.pathname.includes('/images/') ||
         url.pathname.includes('/product-images/');
}

// Helper: Check if request is for API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

// Helper: Check if request is for static asset
function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         STATIC_ASSETS.includes(url.pathname);
}

// Helper: Create offline response
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: 'offline',
      message: 'You are currently offline. Please check your internet connection.',
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }),
    }
  );
}

// Background Sync - for pending orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[Service Worker] Syncing pending orders...');
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    // Get pending orders from IndexedDB (implement as needed)
    const pendingOrders = await getPendingOrders();
    
    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('[Service Worker] No pending orders to sync');
      return;
    }
    
    // Submit each order
    const results = await Promise.allSettled(
      pendingOrders.map(order => submitOrder(order))
    );
    
    console.log('[Service Worker] Sync results:', results);
    
    // Clean up successfully synced orders
    const successfulOrderIds = results
      .filter(result => result.status === 'fulfilled')
      .map((result, index) => pendingOrders[index].id);
    
    await removeSyncedOrders(successfulOrderIds);
    
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error; // Retry sync
  }
}

// Placeholder functions - implement with IndexedDB
async function getPendingOrders() {
  // TODO: Implement IndexedDB read
  return [];
}

async function submitOrder(order) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  
  if (!response.ok) {
    throw new Error(`Order submission failed: ${response.status}`);
  }
  
  return response.json();
}

async function removeSyncedOrders(orderIds) {
  // TODO: Implement IndexedDB cleanup
  console.log('[Service Worker] Removing synced orders:', orderIds);
}

// Message handling - for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('azteka-catalog-'))
            .map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAMES.static).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

console.log('[Service Worker] Loaded successfully');
