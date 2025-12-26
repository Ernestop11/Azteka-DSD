'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShoppingCart,
  Package,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Clock
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useCart as useCartContext } from '@/context/CartContext'
import { calculateSubtotal } from '@/lib/calculateOrderTotal'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useQuery } from '@tanstack/react-query'
import type { CatalogProduct } from '@/lib/queries/catalog'
import { getQuickAddSuggestions, type CartItem } from '@/lib/upsells/smartUpsells'
import Link from 'next/link'

interface EnhancedCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  customerId?: string
}

export default function EnhancedCartDrawer({ isOpen, onClose, customerId }: EnhancedCartDrawerProps) {
  const { items, increment, decrement, removeItem, setQuantity, getCartCount } = useCartStore()
  const { add } = useCartContext()
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const subtotal = calculateSubtotal(items)
  const cartCount = getCartCount()
  const totalCases = items.reduce((sum, item) => sum + item.quantity, 0)

  // Fetch products for upsells
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-cart-upsell'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=100')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: isOpen,
  })

  // Fetch customer favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['customer-favorites-cart', customerId],
    queryFn: async () => {
      if (!customerId) return { data: [] }
      const res = await fetch(`/api/orders/reorder-template?customerId=${customerId}&limit=6`)
      if (!res.ok) return { data: [] }
      return res.json()
    },
    enabled: isOpen && !!customerId,
  })

  const allProducts = productsData?.data || []
  const cartProductIds = items.map(item => item.id)

  // Get suggestions (exclude cart items)
  const cartItemsForExclusion: CartItem[] = items.map(item => ({ id: item.id }))
  const quickAddProducts = allProducts.length > 0
    ? getQuickAddSuggestions(
        allProducts[0], // Use first product as seed
        allProducts,
        cartItemsForExclusion,
        4
      )
    : []

  // Filter favorites (exclude cart items)
  const favorites = (favoritesData?.data || [])
    .filter((f: any) => !cartProductIds.includes(f.id))
    .slice(0, 4)

  // Popular/trending products not in cart
  const trendingProducts = allProducts
    .filter(p => (p.featured || p.trending) && !cartProductIds.includes(p.id))
    .slice(0, 4)

  const handleAddProduct = (product: CatalogProduct | any) => {
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: product.lastOrderedQuantity || 1,
      imageUrl: product.imageUrl,
      sku: product.sku,
      unitsPerCase: product.unitsPerCase || 24,
    })
  }

  const handleQuantityBlur = (itemId: string) => {
    const value = inputValues[itemId]
    if (value !== undefined) {
      const newQty = parseInt(value) || 0
      if (newQty > 0) {
        setQuantity(itemId, newQty)
      } else {
        removeItem(itemId)
      }
    }
    setEditingId(null)
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col w-full max-w-md"
          >
            {/* Header - Domino's style */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Your Cart</h2>
                    <p className="text-sm text-white/80">
                      {totalCases} case{totalCases !== 1 ? 's' : ''} • ${subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 text-lg font-semibold mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mb-6">Add items from the catalog to get started</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Items in Cart</h3>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                        >
                          {/* Product Image */}
                          <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {item.imageUrl ? (
                              <img
                                src={getPublicImageUrl(item.imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">${item.price.toFixed(2)}/case</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-white rounded-lg border shadow-sm">
                            <button
                              onClick={() => decrement(item.id)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                            >
                              −
                            </button>
                            {editingId === item.id ? (
                              <input
                                type="number"
                                min="0"
                                value={inputValues[item.id] ?? item.quantity}
                                onChange={(e) => setInputValues({ ...inputValues, [item.id]: e.target.value })}
                                onBlur={() => handleQuantityBlur(item.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleQuantityBlur(item.id)
                                }}
                                autoFocus
                                className="w-10 text-center text-sm font-medium bg-gray-50 focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setInputValues({ ...inputValues, [item.id]: String(item.quantity) })
                                  setEditingId(item.id)
                                }}
                                className="w-10 text-center text-sm font-medium hover:bg-gray-50"
                              >
                                {item.quantity}
                              </button>
                            )}
                            <button
                              onClick={() => increment(item.id)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* COMPLETE YOUR ORDER - Quick Add Section */}
                  {quickAddProducts.length > 0 && (
                    <div className="p-4 bg-amber-50 border-b border-amber-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-amber-900">Complete Your Order</h3>
                      </div>
                      <p className="text-xs text-amber-700 mb-3">Perfect matches - tap to add!</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickAddProducts.map((product) => (
                          <motion.button
                            key={product.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddProduct(product)}
                            className="flex items-center gap-2 p-2 bg-white border border-amber-200 rounded-lg hover:border-amber-400 transition-all text-left"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(product.imageUrl)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-amber-600 font-semibold">${Number(product.price).toFixed(2)}</p>
                            </div>
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">+</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YOUR FAVORITES section moved to bottom as "Previously Ordered" */}

                  {/* TRENDING NOW */}
                  {trendingProducts.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-orange-900">Trending Now</h3>
                        <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-[10px] font-bold">HOT</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {trendingProducts.map((product) => (
                          <motion.button
                            key={product.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddProduct(product)}
                            className="flex-shrink-0 w-24 p-2 bg-white border border-orange-200 rounded-lg hover:border-orange-400 transition-all text-center shadow-sm"
                          >
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg overflow-hidden mb-1">
                              {product.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(product.imageUrl)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] font-medium text-gray-900 line-clamp-2">{product.name}</p>
                            <p className="text-xs text-orange-600 font-bold">${Number(product.price).toFixed(2)}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREVIOUSLY ORDERED - Horizontal scroll after Trending */}
                  {favorites.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-blue-900">Previously Ordered</h3>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-bold">QUICK ADD</span>
                      </div>
                      <p className="text-xs text-blue-700 mb-3">One-click to add your usual order</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                        {favorites.map((fav: any) => (
                          <motion.button
                            key={fav.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddProduct(fav)}
                            className="flex-shrink-0 w-28 p-3 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-center snap-start"
                          >
                            <div className="w-18 h-18 mx-auto bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                              {fav.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(fav.imageUrl)}
                                  alt={fav.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              {/* Quantity badge */}
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                                <span className="text-white text-xs font-bold">+{fav.lastOrderedQuantity || 1}</span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">{fav.name}</p>
                            <p className="text-sm text-blue-600 font-bold">${Number(fav.price).toFixed(2)}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bundle Deal Prompt */}
                  {totalCases < 3 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900">
                            Add {3 - totalCases} more case{3 - totalCases !== 1 ? 's' : ''} for 15% off!
                          </p>
                          <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((totalCases / 3) * 100, 100)}%` }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            />
                          </div>
                          <p className="text-xs text-green-700 mt-1">{totalCases}/3 cases</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
                {/* Summary */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal ({totalCases} cases)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</p>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Proceed to Checkout
                  <ChevronRight className="w-5 h-5" />
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-3 text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
