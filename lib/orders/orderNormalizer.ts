/**
 * Order Normalization Utilities
 * Converts cart context → final DB payload
 */

import type { CartProduct, StoreGroup } from '@/context/CartContext'
import { getTierPrice, type PriceTier } from '@/lib/price/tierPrice'

export interface NormalizedOrderItem {
  productId: string
  quantity: number
  priceCase: number
}

export interface NormalizedOrder {
  customerId: string
  items: NormalizedOrderItem[]
  metadata?: {
    deviceInfo?: {
      isMobile: boolean
      isTablet: boolean
      isDesktop: boolean
      userAgent?: string
    }
    timestamp?: string
    source?: string
    [key: string]: any
  }
}

/**
 * Normalize a cart product to order item
 */
function normalizeCartProduct(
  product: CartProduct,
  activeTier: PriceTier | null = null
): NormalizedOrderItem | null {
  if (!product.id || !product.quantity || product.quantity <= 0) {
    return null
  }

  let finalPrice = product.price

  // Apply tier pricing if available
  if (product.tierPricing && activeTier) {
    const tierResult = getTierPrice(product.tierPricing, activeTier)
    finalPrice = tierResult.price
  } else if (product.tierPricing) {
    // Use default priceCase if no active tier
    finalPrice = product.tierPricing.priceCase || product.price
  }

  return {
    productId: product.id,
    quantity: Math.floor(product.quantity), // Ensure integer
    priceCase: Number(finalPrice.toFixed(2)), // Round to 2 decimals
  }
}

/**
 * Get device info for metadata
 */
function getDeviceInfo(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent?: string
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }
  }

  const width = window.innerWidth
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width <= 1024,
    isDesktop: width > 1024,
    userAgent: navigator.userAgent,
  }
}

/**
 * Normalize store group to order payload
 */
export function normalizeStoreGroupToOrder(
  storeGroup: StoreGroup,
  activeTier: PriceTier | null = null,
  additionalMetadata?: Record<string, any>
): NormalizedOrder | null {
  if (!storeGroup.storeId || !storeGroup.items || storeGroup.items.length === 0) {
    return null
  }

  const normalizedItems: NormalizedOrderItem[] = []
  
  for (const product of storeGroup.items) {
    const normalized = normalizeCartProduct(product, activeTier)
    if (normalized) {
      normalizedItems.push(normalized)
    }
  }

  if (normalizedItems.length === 0) {
    return null
  }

  const deviceInfo = getDeviceInfo()

  return {
    customerId: storeGroup.storeId,
    items: normalizedItems,
    metadata: {
      deviceInfo,
      timestamp: new Date().toISOString(),
      source: 'multistore-order',
      ...additionalMetadata,
    },
  }
}

/**
 * Normalize cart items to order payload (single store)
 */
export function normalizeCartToOrder(
  customerId: string,
  items: CartProduct[],
  activeTier: PriceTier | null = null,
  additionalMetadata?: Record<string, any>
): NormalizedOrder | null {
  if (!customerId || !items || items.length === 0) {
    return null
  }

  const normalizedItems: NormalizedOrderItem[] = []
  
  for (const product of items) {
    const normalized = normalizeCartProduct(product, activeTier)
    if (normalized) {
      normalizedItems.push(normalized)
    }
  }

  if (normalizedItems.length === 0) {
    return null
  }

  const deviceInfo = getDeviceInfo()

  return {
    customerId,
    items: normalizedItems,
    metadata: {
      deviceInfo,
      timestamp: new Date().toISOString(),
      source: 'catalog',
      ...additionalMetadata,
    },
  }
}

/**
 * Normalize multiple store groups to multi-order payload
 */
export function normalizeStoreGroupsToMultiOrder(
  storeGroups: StoreGroup[],
  activeTier: PriceTier | null = null,
  additionalMetadata?: Record<string, any>
): NormalizedOrder[] {
  const orders: NormalizedOrder[] = []

  for (const storeGroup of storeGroups) {
    const order = normalizeStoreGroupToOrder(storeGroup, activeTier, additionalMetadata)
    if (order) {
      orders.push(order)
    }
  }

  return orders
}

