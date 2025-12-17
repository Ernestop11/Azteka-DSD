'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/hooks/useCart'
import { saveToStorage, loadFromStorage, removeFromStorage } from '@/lib/offline/storage'
import type { CartProduct } from '@/context/CartContext'

const CART_STORAGE_KEY = 'cart'
const ORDER_IN_PROGRESS_KEY = 'order_in_progress'

/**
 * Hook to persist cart to localStorage and restore on mount
 */
export function usePersistentCart() {
  const { items, add, clear } = useCart()
  const isRestoringRef = useRef(false)

  // Restore cart on mount
  useEffect(() => {
    if (isRestoringRef.current) return

    try {
      const savedCart = loadFromStorage<CartProduct[]>(CART_STORAGE_KEY)
      if (savedCart && Array.isArray(savedCart) && savedCart.length > 0) {
        isRestoringRef.current = true
        // Restore each item
        savedCart.forEach(item => {
          add(item, item.storeId)
        })
        isRestoringRef.current = false
      }
    } catch (error) {
      console.error('Failed to restore cart from storage:', error)
    }
  }, []) // Only run on mount

  // Save cart whenever it changes
  useEffect(() => {
    if (isRestoringRef.current) return

    try {
      if (items.length > 0) {
        saveToStorage(CART_STORAGE_KEY, items)
      } else {
        removeFromStorage(CART_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to save cart to storage:', error)
    }
  }, [items])

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

