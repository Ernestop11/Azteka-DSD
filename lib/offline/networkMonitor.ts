/**
 * Network Monitor
 * Tracks online/offline status and fires events
 */

export interface NetworkStatus {
  isOnline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

type NetworkStatusListener = (status: NetworkStatus) => void

class NetworkMonitor {
  private listeners: Set<NetworkStatusListener> = new Set()
  private status: NetworkStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastOnlineAt: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null,
    lastOfflineAt: null,
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
    }
  }

  private handleOnline() {
    this.status = {
      isOnline: true,
      lastOnlineAt: new Date(),
      lastOfflineAt: this.status.lastOfflineAt,
    }
    this.notifyListeners()
  }

  private handleOffline() {
    this.status = {
      isOnline: false,
      lastOnlineAt: this.status.lastOnlineAt,
      lastOfflineAt: new Date(),
    }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener)
    // Immediately call with current status
    listener(this.status)
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.status }
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.status.isOnline
  }
}

// Singleton instance
let monitorInstance: NetworkMonitor | null = null

export function getNetworkMonitor(): NetworkMonitor {
  if (!monitorInstance) {
    monitorInstance = new NetworkMonitor()
  }
  return monitorInstance
}

// Export convenience functions
export function isOnline(): boolean {
  return getNetworkMonitor().isOnline()
}

export function getNetworkStatus(): NetworkStatus {
  return getNetworkMonitor().getStatus()
}

