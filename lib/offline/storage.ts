/**
 * Offline Storage Utility
 * Tiny wrapper around localStorage with schema version + autosave
 */

const STORAGE_VERSION = '1.0.0'
const STORAGE_PREFIX = 'azteka_'

interface StoredData<T> {
  version: string
  timestamp: string
  data: T
}

/**
 * Get storage key with prefix
 */
function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * Save data to localStorage with versioning
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const stored: StoredData<T> = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data,
    }
    localStorage.setItem(getStorageKey(key), JSON.stringify(stored))
    return true
  } catch (error) {
    console.error(`Failed to save to storage (${key}):`, error)
    return false
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(getStorageKey(key))
    if (!stored) {
      return null
    }

    const parsed: StoredData<T> = JSON.parse(stored)

    // Check version compatibility (for future migrations)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch for ${key}: expected ${STORAGE_VERSION}, got ${parsed.version}`)
      // For now, we'll still return the data, but in the future we could migrate
    }

    return parsed.data
  } catch (error) {
    console.error(`Failed to load from storage (${key}):`, error)
    return null
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    localStorage.removeItem(getStorageKey(key))
    return true
  } catch (error) {
    console.error(`Failed to remove from storage (${key}):`, error)
    return false
  }
}

/**
 * Clear all Azteka storage
 */
export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

