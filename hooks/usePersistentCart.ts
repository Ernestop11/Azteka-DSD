'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { saveToStorage, loadFromStorage, removeFromStorage } from '@/lib/offline/storage'

const ORDER_IN_PROGRESS_KEY = 'order_in_progress'

/**
 * Hook for cart persistence utilities
 *
 * NOTE: Cart item persistence is handled by Zustand's persist middleware.
 * This hook only handles:
 * 1. Manual hydration trigger for Zustand (since we use skipHydration: true)
 * 2. In-progress order saving for offline support
 */
export function usePersistentCart() {
  // Trigger Zustand rehydration on mount (client-side only)
  useEffect(() => {
    // This manually triggers the persist middleware to load from localStorage
    useCartStore.persist.rehydrate()
  }, [])

  /**
   * Save in-progress order
   */
  const saveInProgressOrder = (orderData: {
    storeGroups: any[]
    timestamp: string
  }): boolean => {
    return saveToStorage(ORDER_IN_PROGRESS_KEY, orderData)
  }

  /**
   * Load in-progress order
   */
  const loadInProgressOrder = (): {
    storeGroups: any[]
    timestamp: string
  } | null => {
    return loadFromStorage(ORDER_IN_PROGRESS_KEY)
  }

  /**
   * Clear in-progress order (called after successful submission)
   */
  const clearInProgressOrder = (): boolean => {
    return removeFromStorage(ORDER_IN_PROGRESS_KEY)
  }

  return {
    saveInProgressOrder,
    loadInProgressOrder,
    clearInProgressOrder,
  }
}

