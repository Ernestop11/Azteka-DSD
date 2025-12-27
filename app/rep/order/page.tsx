'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCartStore } from '@/store/cart'

interface Customer {
  id: string
  businessName: string
  priceTier: string
}

interface FavoriteProduct {
  id: string
  name: string
  sku: string
  price: number
  customerPrice: number
  imageUrl: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
  inStock: boolean
  allowPresell?: boolean
  unitsPerCase: number
  featured?: boolean
  seasonal?: boolean
  newArrival?: boolean
  trending?: boolean
  backgroundColor?: string | null
  backgroundGradient?: string | null
  badgeText?: string | null
  badgeColor?: string | null
  // Order stats
  totalQuantityOrdered: number
  orderCount: number
  lastOrderDate: string
  suggestedQuantity: number
}

function FavoritesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = searchParams.get('customer')

  const { addItem, increment, decrement, getQuantity, setQuantity, items, clearCart, switchCustomer, customerId: cartCustomerId } = useCartStore()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingQty, setEditingQty] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [showCart, setShowCart] = useState(false)

  // Customer-specific prices map
  const [customerPrices, setCustomerPrices] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (customerId) {
      // Clear cart if switching to a different customer
      switchCustomer(customerId)
      loadFavorites()
    }
  }, [customerId])

  const loadFavorites = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/favorites`)
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
        setCustomer(data.customer)

        // Build customer price map
        const priceMap = new Map<string, number>()
        data.favorites?.forEach((p: FavoriteProduct) => {
          priceMap.set(p.id, p.customerPrice)
        })
        setCustomerPrices(priceMap)
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: FavoriteProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.customerPrice,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    })
  }

  const handleQuickAdd = (product: FavoriteProduct) => {
    // Add suggested quantity
    const currentQty = getQuantity(product.id)
    if (currentQty === 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        quantity: product.suggestedQuantity,
        imageUrl: product.imageUrl || undefined,
      })
    } else {
      setQuantity(product.id, currentQty + product.suggestedQuantity)
    }
  }

  const submitOrder = async () => {
    if (!customer || items.length === 0) return

    setSubmitting(true)
    try {
      const orderData = {
        customerId: customer.id,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const data = await res.json()
        // Update last visit date
        await fetch(`/api/rep/customer/${customerId}/visit`, { method: 'POST' })

        alert(`Order submitted! ${data.data?.workflow?.printed ? 'Picking list printed.' : ''}`)
        clearCart()
        router.push('/rep')
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate cart total with customer prices
  const cartTotal = items.reduce((sum, item) => {
    const price = customerPrices.get(item.id) || item.price
    return sum + price * item.quantity
  }, 0)

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!customerId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No customer selected</p>
          <Link href="/rep" className="text-blue-400 hover:text-blue-300">
            Go back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading favorites...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/rep"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold">{customer?.businessName}</h1>
              <p className="text-slate-400 text-xs">
                Tier {customer?.priceTier} • {favorites.length} favorites
              </p>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Favorites Info Banner */}
      {favorites.length > 0 && (
        <div className="bg-blue-900/30 border-b border-blue-800/50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-blue-200">
                Products this customer orders regularly
              </span>
            </div>
            <Link
              href={`/catalog?customer=${customerId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Full Catalog →
            </Link>
          </div>
        </div>
      )}

      {/* No Favorites State */}
      {favorites.length === 0 && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No Order History</h2>
          <p className="text-slate-400 mb-6">
            This customer hasn't ordered before. Start by browsing the catalog.
          </p>
          <Link
            href={`/catalog?customer=${customerId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors"
          >
            Browse Catalog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Favorites Grid */}
      {favorites.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product, index) => {
              const quantity = getQuantity(product.id)
              const isEditing = editingQty === product.id

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                  style={{
                    background: product.backgroundGradient || product.backgroundColor
                      ? `linear-gradient(135deg, ${product.backgroundColor || '#ffffff'}dd 0%, ${product.backgroundColor || '#f9fafb'}22 100%)`
                      : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                  }}
                >
                  {/* Order Stats Badge */}
                  <div className="absolute top-3 left-3 z-10 flex gap-1">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                      {product.orderCount}x ordered
                    </span>
                  </div>

                  {/* Suggested Qty Quick Add */}
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="absolute top-3 right-3 z-10 px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-xs font-bold transition-colors"
                    title={`Quick add ${product.suggestedQuantity} (avg order)`}
                  >
                    +{product.suggestedQuantity}
                  </button>

                  {/* Product Badges */}
                  {(product.featured || product.seasonal || product.newArrival || product.trending) && (
                    <div className="absolute top-10 left-3 z-10 flex flex-wrap gap-1">
                      {product.featured && (
                        <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded-full text-[10px] font-black">
                          FEATURED
                        </span>
                      )}
                      {product.newArrival && (
                        <span className="px-2 py-0.5 bg-emerald-400 text-emerald-900 rounded-full text-[10px] font-black">
                          NEW
                        </span>
                      )}
                    </div>
                  )}

                  {/* Product Content */}
                  <div className="p-4 pt-12">
                    {/* Image */}
                    <div className="aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-white/90 shadow-inner relative">
                      {product.imageUrl ? (
                        <img
                          src={getPublicImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📦</div>
                      )}

                      {/* Out of Stock */}
                      {!product.inStock && !product.allowPresell && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold -rotate-12">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500">
                        SKU: {product.sku} • {product.unitsPerCase} units/case
                      </p>

                      {product.brand && (
                        <p className="text-xs text-gray-400">
                          {product.brand.name}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-600">
                          ${product.customerPrice.toFixed(2)}
                        </span>
                        {product.customerPrice < product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart / Quantity Controls */}
                      <div className="pt-2">
                        {quantity > 0 ? (
                          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() => decrement(product.id)}
                              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-50 rounded-lg text-lg font-bold text-gray-700 shadow-sm transition-colors"
                            >
                              −
                            </button>

                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={() => {
                                  const newQty = parseInt(inputValue) || 0
                                  setQuantity(product.id, newQty)
                                  setEditingQty(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newQty = parseInt(inputValue) || 0
                                    setQuantity(product.id, newQty)
                                    setEditingQty(null)
                                  }
                                }}
                                autoFocus
                                className="flex-1 px-2 py-2 text-center text-lg font-bold bg-white rounded-lg border-2 border-emerald-500 text-gray-900 focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setInputValue(String(quantity))
                                  setEditingQty(product.id)
                                }}
                                className="flex-1 py-2 text-center text-lg font-bold text-gray-900 hover:bg-white rounded-lg transition-colors"
                              >
                                {quantity}
                              </button>
                            )}

                            <button
                              onClick={() => increment(product.id)}
                              className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 rounded-lg text-lg font-bold text-white shadow-sm transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : product.inStock === false && !product.allowPresell ? (
                          <div className="w-full py-3 rounded-xl font-medium text-center bg-gray-200 text-gray-500 text-sm">
                            Out of Stock
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-3 rounded-xl font-medium text-white transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg"
                          >
                            Add to Cart
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-4 py-3 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm">{cartItemCount} items</p>
              <p className="text-xl font-bold">${cartTotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/catalog?customer=${customerId}`}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors text-sm"
              >
                + Add More
              </Link>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl font-bold transition-colors"
              >
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold">Cart ({cartItemCount})</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {items.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const customerPrice = customerPrices.get(item.id) || item.price
                      return (
                        <div key={item.id} className="bg-slate-800 rounded-xl p-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(item.imageUrl)}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <p className="text-emerald-400 text-sm">${customerPrice.toFixed(2)}/case</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => decrement(item.id)}
                                  className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => increment(item.id)}
                                  className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                                >
                                  +
                                </button>
                                <span className="ml-auto font-bold text-sm">
                                  ${(customerPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t border-slate-700 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/catalog?customer=${customerId}`}
                    onClick={() => setShowCart(false)}
                    className="block w-full py-3 text-center bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                  >
                    Browse Catalog for More
                  </Link>
                  <button
                    onClick={() => {
                      setShowCart(false)
                      submitOrder()
                    }}
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 rounded-xl font-bold transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Place Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom padding for sticky bar */}
      {items.length > 0 && <div className="h-24" />}
    </div>
  )
}

export default function RepOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <FavoritesContent />
    </Suspense>
  )
}
