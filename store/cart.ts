import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  clearCart: () => void
  getTotal: () => number
  getQuantity: (productId: string) => number
  getCartCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id)
        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, item],
          }))
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }))
      },

      increment: (productId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }))
      },

      decrement: (productId) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === productId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
            )
            .filter((i) => i.quantity > 0),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.price || 0) * item.quantity,
          0
        )
      },

      getQuantity: (productId) => {
        const item = get().items.find((i) => i.id === productId)
        return item ? item.quantity : 0
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'azteka-cart-storage',
    }
  )
)

