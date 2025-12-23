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
  setQuantity: (productId: string, quantity: number) => void
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
        // Ensure price is a clean number (handles Prisma Decimal, strings, etc.)
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
        // Round to 2 decimal places
        cleanPrice = Math.round(cleanPrice * 100) / 100

        const cleanItem = { ...item, price: cleanPrice }
        const existingItem = get().items.find((i) => i.id === item.id)
        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + cleanItem.quantity }
                : i
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, cleanItem],
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

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          set((state) => ({
            items: state.items.filter((i) => i.id !== productId),
          }))
        } else {
          const existingItem = get().items.find((i) => i.id === productId)
          if (existingItem) {
            // Update existing item quantity
            set((state) => ({
              items: state.items.map((i) =>
                i.id === productId ? { ...i, quantity } : i
              ),
            }))
          }
          // Note: If item doesn't exist, setQuantity won't add it
          // Use addItem instead for new items
        }
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

