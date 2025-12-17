/**
 * Service Worker Registration Helper
 * 
 * Registers the catalog service worker and provides utilities
 * for managing the service worker lifecycle.
 */

export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  installing: boolean;
  waiting: boolean;
  error?: string;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      { scope: '/' }
    );

    console.log('[SW] Service Worker registered successfully');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[SW] New version available');
          notifyUpdate(registration);
        }
      });
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW] Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
    return false;
  }
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      active: false,
      installing: false,
      waiting: false,
      error: 'Service Worker not supported',
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return {
        registered: false,
        active: false,
        installing: false,
        waiting: false,
      };
    }

    return {
      registered: true,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
    };
  } catch (error) {
    return {
      registered: false,
      active: false,
      installing: false,
      waiting: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update to new service worker version
 */
export async function updateServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    if (registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page after activation
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return true;
    }

    // Check for updates
    await registration.update();
    return false;
  } catch (error) {
    console.error('[SW] Update failed:', error);
    return false;
  }
}

/**
 * Clear all service worker caches
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }

    // Also clear caches directly
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('azteka-catalog-'))
          .map(name => caches.delete(name))
      );
    }

    console.log('[SW] Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('[SW] Cache clear failed:', error);
    return false;
  }
}

/**
 * Precache specific URLs
 */
export async function precacheUrls(urls: string[]): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[SW] Precache failed:', error);
    return false;
  }
}

/**
 * Check if app is running in offline mode
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Add offline/online event listeners
 */
export function addNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('[SW] Network: Online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('[SW] Network: Offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Request persistent storage (for offline data)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator && 'persist' in navigator.storage)) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    console.log('[SW] Persistent storage:', isPersisted ? 'granted' : 'denied');
    return isPersisted;
  } catch (error) {
    console.error('[SW] Persistent storage request failed:', error);
    return false;
  }
}

/**
 * Estimate storage quota
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
} | null> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      usagePercent,
    };
  } catch (error) {
    console.error('[SW] Storage estimate failed:', error);
    return null;
  }
}

/**
 * Notify user about service worker update
 */
function notifyUpdate(registration: ServiceWorkerRegistration): void {
  // Dispatch custom event that can be listened to in the app
  const event = new CustomEvent('sw-update-available', {
    detail: { registration },
  });
  window.dispatchEvent(event);

  console.log('[SW] Update notification dispatched');
}

/**
 * Initialize service worker with default settings
 */
export async function initializeServiceWorker(): Promise<void> {
  // Register service worker
  const registration = await registerServiceWorker();
  
  if (!registration) {
    console.warn('[SW] Service Worker not initialized');
    return;
  }

  // Request persistent storage for offline data
  await requestPersistentStorage();

  // Log storage estimate
  const storage = await getStorageEstimate();
  if (storage) {
    console.log('[SW] Storage usage:', {
      used: `${(storage.usage / 1024 / 1024).toFixed(2)} MB`,
      total: `${(storage.quota / 1024 / 1024).toFixed(2)} MB`,
      percent: `${storage.usagePercent.toFixed(1)}%`,
    });
  }

  // Add network listeners
  addNetworkListeners(
    () => console.log('[SW] App is online'),
    () => console.log('[SW] App is offline - using cached data')
  );

  console.log('[SW] Initialization complete');
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  getServiceWorkerStatus,
  updateServiceWorker,
  clearServiceWorkerCache,
  precacheUrls,
  isOffline,
  addNetworkListeners,
  requestPersistentStorage,
  getStorageEstimate,
  initializeServiceWorker,
};
