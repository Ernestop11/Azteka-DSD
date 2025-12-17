'use client'

import { useCartStore } from '@/store/cart'
import { calculateSubtotal, calculateOrderTotal } from '@/lib/calculateOrderTotal'
import CartItemRow from '@/components/CartItemRow'
import Link from 'next/link'

export default function CartPage() {
  const { items, increment, decrement, removeItem, clearCart } = useCartStore()
  const subtotal = calculateSubtotal(items)
  const deliveryFee = 0 // Placeholder for delivery fee
  const total = calculateOrderTotal(items, deliveryFee)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Summary
          </h1>
          <p className="text-gray-600">
            Review your items before placing your order
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </p>
              <p className="text-gray-600 mb-6">
                Add items to your cart to get started
              </p>
              <Link
                href="/catalog"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onIncrement={() => increment(item.id)}
                      onDecrement={() => decrement(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Totals Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium">
                      {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'TBD'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info Placeholder */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Delivery Information:</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery details will be calculated at checkout
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  disabled
                >
                  Place Order
                </button>

                <Link
                  href="/catalog"
                  className="block w-full mt-3 py-3 px-4 text-center text-blue-600 hover:text-blue-700 font-medium rounded-lg border border-blue-600 hover:border-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
