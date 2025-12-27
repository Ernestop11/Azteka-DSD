'use client'

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useCartStore, type CartItem } from '@/store/cart'
import { getTierPrice, type PriceTier, type TierPricing } from '@/lib/price/tierPrice'

export interface CartProduct extends CartItem {
  storeId?: string
  sku?: string
  tierPricing?: TierPricing
  activeTier?: PriceTier | null
}

export interface StoreGroup {
  storeId: string
  items: CartProduct[]
  subtotal: number
  discount: number
  tax: number
  total: number
}

interface CartContextValue {
  // Core cart operations
  add: (product: CartProduct, storeId?: string) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  setQuantity: (productId: string, qty: number) => void
  clear: () => void

  // Customer management for sales rep flow
  customerId: string | null
  setCustomerId: (customerId: string | null) => void
  switchCustomer: (customerId: string) => void

  // Getters
  items: CartProduct[]
  totals: {
    subtotal: number
    discounts: number
    tax: number
    total: number
  }

  // Store grouping for MultiStoreOrder
  storeGroups: StoreGroup[]

  // Utilities
  getQuantity: (productId: string) => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const TAX_RATE = 0.08 // 8% tax estimate
const DISCOUNT_RATE = 0.0 // No default discount, can be overridden

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    items: zustandItems,
    addItem,
    removeItem,
    increment,
    decrement,
    setQuantity: setZustandQuantity,
    clearCart,
    getTotal,
    getQuantity: getZustandQuantity,
    getCartCount: getZustandCartCount,
    customerId,
    setCustomerId,
    switchCustomer,
  } = useCartStore()

  // Convert Zustand items to CartProduct with tier pricing
  const items: CartProduct[] = useMemo(() => {
    return zustandItems.map(item => ({
      ...item,
      storeId: (item as any).storeId,
      sku: (item as any).sku,
      tierPricing: (item as any).tierPricing,
      activeTier: (item as any).activeTier,
    }))
  }, [zustandItems])

  // Calculate totals with tier pricing
  const totals = useMemo(() => {
    let subtotal = 0
    let discounts = 0

    items.forEach(item => {
      let itemPrice = item.price

      // Apply tier pricing if available
      if (item.tierPricing && item.activeTier) {
        const tierResult = getTierPrice(item.tierPricing, item.activeTier)
        itemPrice = tierResult.price
      }

      const itemSubtotal = itemPrice * item.quantity
      subtotal += itemSubtotal
      
      // Calculate discounts (if any)
      const itemDiscount = itemSubtotal * DISCOUNT_RATE
      discounts += itemDiscount
    })

    const tax = subtotal * TAX_RATE
    const total = subtotal - discounts + tax

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discounts: Number(discounts.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    }
  }, [items])

  // Group items by storeId for MultiStoreOrder
  const storeGroups: StoreGroup[] = useMemo(() => {
    const groups = new Map<string, CartProduct[]>()

    items.forEach(item => {
      const storeId = item.storeId || 'default'
      if (!groups.has(storeId)) {
        groups.set(storeId, [])
      }
      groups.get(storeId)!.push(item)
    })

    return Array.from(groups.entries()).map(([storeId, groupItems]) => {
      let groupSubtotal = 0
      let groupDiscounts = 0

      groupItems.forEach(item => {
        let itemPrice = item.price

        if (item.tierPricing && item.activeTier) {
          const tierResult = getTierPrice(item.tierPricing, item.activeTier)
          itemPrice = tierResult.price
        }

        const itemSubtotal = itemPrice * item.quantity
        groupSubtotal += itemSubtotal
        groupDiscounts += itemSubtotal * DISCOUNT_RATE
      })

      const groupTax = groupSubtotal * TAX_RATE
      const groupTotal = groupSubtotal - groupDiscounts + groupTax

      return {
        storeId,
        items: groupItems,
        subtotal: Number(groupSubtotal.toFixed(2)),
        discount: Number(groupDiscounts.toFixed(2)),
        tax: Number(groupTax.toFixed(2)),
        total: Number(groupTotal.toFixed(2)),
      }
    })
  }, [items])

  const add = (product: CartProduct, storeId?: string) => {
    const cartProduct: CartItem & Partial<CartProduct> = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
      imageUrl: product.imageUrl,
      storeId: storeId || product.storeId,
      sku: product.sku,
      tierPricing: product.tierPricing,
      activeTier: product.activeTier,
    }
    addItem(cartProduct as CartItem)
  }

  const remove = (productId: string) => {
    removeItem(productId)
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      remove(productId)
      return
    }

    const currentQty = getZustandQuantity(productId)
    const diff = qty - currentQty

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        increment(productId)
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        decrement(productId)
      }
    }
  }

  const clear = () => {
    clearCart()
  }

  const value: CartContextValue = {
    add,
    remove,
    updateQty,
    setQuantity: setZustandQuantity,
    clear,
    customerId,
    setCustomerId,
    switchCustomer,
    items,
    totals,
    storeGroups,
    getQuantity: getZustandQuantity,
    getCartCount: getZustandCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

