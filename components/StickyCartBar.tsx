'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { calculateSubtotal } from '@/lib/calculateOrderTotal'

interface StickyCartBarProps {
  onOpen: () => void
}

export default function StickyCartBar({ onOpen }: StickyCartBarProps) {
  const { items, getCartCount } = useCartStore()
  const cartCount = getCartCount()
  const subtotal = calculateSubtotal(items)

  if (cartCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-gray-900">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                ${subtotal.toFixed(2)} total
              </p>
            </div>
          </div>
          <button
            onClick={onOpen}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  )
}

