import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  // For multi-store orders (bundle long-press)
  storeId?: string
  storeName?: string
}

interface CartState {
  items: CartItem[]
  customerId: string | null
  _hasHydrated: boolean
}

interface CartActions {
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  setQuantity: (productId: string, quantity: number, productData?: Partial<CartItem>) => void
  clearCart: () => void
  setCustomerId: (customerId: string | null) => void
  switchCustomer: (customerId: string) => void
  getTotal: () => number
  getQuantity: (productId: string) => number
  getCartCount: () => number
}

type CartStore = CartState & CartActions

// Initial state - ONLY data, no functions
const initialState: CartState = {
  items: [],
  customerId: null,
  _hasHydrated: false,
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        // Ensure price is a clean number
        let cleanPrice = 0
        if (item.price !== null && item.price !== undefined) {
          if (typeof item.price === 'number') {
            cleanPrice = item.price
          } else if (typeof item.price === 'string') {
            cleanPrice = parseFloat(item.price) || 0
          } else if (typeof item.price === 'object' && 'toNumber' in (item.price as object)) {
            cleanPrice = (item.price as { toNumber(): number }).toNumber()
          } else {
            cleanPrice = Number(item.price) || 0
          }
        }
        cleanPrice = Math.round(cleanPrice * 100) / 100

        const cleanItem = { ...item, price: cleanPrice }
        const safeQuantity = Math.min(Math.max(1, cleanItem.quantity || 1), 999)

        set((state) => {
          // For multi-store orders, use productId+storeId as unique key
          const itemKey = item.storeId ? `${item.id}-${item.storeId}` : item.id
          const existingItem = state.items.find((i) => {
            const existingKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
            return existingKey === itemKey
          })

          if (existingItem) {
            // Increment by 1 for existing items (prevents accumulation bugs)
            const newQty = Math.min(existingItem.quantity + 1, 999)
            return {
              items: state.items.map((i) => {
                const existingKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
                return existingKey === itemKey ? { ...i, quantity: newQty } : i
              }),
            }
          } else {
            // Add new item with the requested quantity
            return {
              items: [...state.items, { ...cleanItem, quantity: safeQuantity }],
            }
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          // Support both simple id and composite id (productId-storeId)
          items: state.items.filter((i) => {
            const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
            return i.id !== productId && itemKey !== productId
          }),
        }))
      },

      increment: (productId) => {
        set((state) => ({
          items: state.items.map((i) => {
            const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
            const matches = i.id === productId || itemKey === productId
            return matches ? { ...i, quantity: Math.min(i.quantity + 1, 999) } : i
          }),
        }))
      },

      decrement: (productId) => {
        set((state) => ({
          items: state.items
            .map((i) => {
              const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
              const matches = i.id === productId || itemKey === productId
              return matches ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
            })
            .filter((i) => i.quantity > 0),
        }))
      },

      setQuantity: (productId, quantity, productData?: Partial<CartItem>) => {
        const safeQty = Math.min(quantity, 999)
        if (safeQty <= 0) {
          set((state) => ({
            items: state.items.filter((i) => {
              const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
              return i.id !== productId && itemKey !== productId
            }),
          }))
        } else {
          set((state) => {
            const existingItem = state.items.find((i) => {
              const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
              return i.id === productId || itemKey === productId
            })
            if (existingItem) {
              return {
                items: state.items.map((i) => {
                  const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
                  const matches = i.id === productId || itemKey === productId
                  return matches ? { ...i, quantity: safeQty } : i
                }),
              }
            }
            // Item doesn't exist - add it if we have product data
            if (productData && productData.name && productData.price !== undefined) {
              // Extract actual product ID from composite key (productId-storeId) if needed
              // UUID format: 8-4-4-4-12 = 36 chars. Composite key would be 36 + 1 + 36 = 73 chars
              const actualProductId = productId.length > 36 && productData.storeId
                ? productId.substring(0, 36)  // Extract the first UUID (product ID)
                : productId
              return {
                items: [...state.items, {
                  id: actualProductId,
                  name: productData.name,
                  price: typeof productData.price === 'number' ? productData.price : parseFloat(String(productData.price)) || 0,
                  quantity: safeQty,
                  imageUrl: productData.imageUrl,
                  storeId: productData.storeId,
                  storeName: productData.storeName,
                }],
              }
            }
            return state
          })
        }
      },

      clearCart: () => {
        set({ items: [], customerId: null })
      },

      setCustomerId: (customerId) => {
        set({ customerId })
      },

      switchCustomer: (customerId) => {
        const currentCustomerId = get().customerId
        if (currentCustomerId && currentCustomerId !== customerId) {
          set({ items: [], customerId })
        } else {
          set({ customerId })
        }
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.price || 0) * item.quantity,
          0
        )
      },

      getQuantity: (productId) => {
        const item = get().items.find((i) => {
          const itemKey = i.storeId ? `${i.id}-${i.storeId}` : i.id
          return i.id === productId || itemKey === productId
        })
        return item ? item.quantity : 0
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'azteka-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: Only persist data fields, not functions
      partialize: (state) => ({
        items: state.items,
        customerId: state.customerId,
      }),
      // Set hydration flag when storage is rehydrated
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      },
    }
  )
)

// Export a function to check if we're on the client
export const isClient = typeof window !== 'undefined'
