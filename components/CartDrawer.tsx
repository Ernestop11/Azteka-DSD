'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { calculateSubtotal } from '@/lib/calculateOrderTotal'
import CartItemRow from './CartItemRow'
import CartCheckoutBlocks from '@/components/cart/CartCheckoutBlocks'
import Link from 'next/link'
import { useCart as useCartContext } from '@/context/CartContext'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, increment, decrement, removeItem, setQuantity, clearCart, getCartCount } = useCartStore()
  const { add } = useCartContext()
  const subtotal = calculateSubtotal(items)
  const cartCount = getCartCount()

  const handleAddUpsellProduct = (product: CatalogProduct) => {
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
      sku: product.sku,
      unitsPerCase: product.unitsPerCase || 24,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[70vh] lg:max-h-[80vh] lg:max-w-[480px] lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Your Cart
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onIncrement={() => increment(item.id)}
                        onDecrement={() => decrement(item.id)}
                        onRemove={() => removeItem(item.id)}
                        onSetQuantity={(qty) => setQuantity(item.id, qty)}
                      />
                    ))}
                  </div>

                  {/* Cart Checkout Blocks - Upsells, Previously Ordered, etc */}
                  <CartCheckoutBlocks onAddProduct={handleAddUpsellProduct} />
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
