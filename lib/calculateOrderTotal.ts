import { CartItem } from '@/store/cart'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
}

export function calculateOrderTotal(items: CartItem[], deliveryFee: number = 0): number {
  const subtotal = calculateSubtotal(items)
  return subtotal + deliveryFee
}
