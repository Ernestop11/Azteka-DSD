'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingCart, Package, Zap, Check, Star, TrendingUp } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useQuery } from '@tanstack/react-query'
import type { CatalogProduct } from '@/lib/queries/catalog'
import { getUpsellBundles, getQuickAddSuggestions, type UpsellBundle, type CartItem } from '@/lib/upsells/smartUpsells'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface AddToCartModalProps {
  product: CatalogProduct
  isOpen: boolean
  onClose: () => void
  onAddComplete?: () => void
  customerId?: string
  // For delegated orders - attach store info to cart items
  storeId?: string
  storeName?: string
}

export default function AddToCartModal({
  product,
  isOpen,
  onClose,
  onAddComplete,
  customerId,
  storeId,
  storeName,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [upsellBundles, setUpsellBundles] = useState<UpsellBundle[]>([])
  const [quickAddProducts, setQuickAddProducts] = useState<CatalogProduct[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [addedToCart, setAddedToCart] = useState(false)
  const { add, items: cartItems } = useCart()
  const unitsPerCase = product.unitsPerCase || 24

  // Fetch all products for upsell generation
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-upsell'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=200')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  // Fetch customer favorites if customerId provided
  const { data: favoritesData } = useQuery({
    queryKey: ['customer-favorites', customerId],
    queryFn: async () => {
      if (!customerId) return { data: [] }
      const res = await fetch(`/api/orders/reorder-template?customerId=${customerId}&limit=6`)
      if (!res.ok) return { data: [] }
      return res.json()
    },
    enabled: !!customerId,
  })

  // Generate upsell bundles and quick-add suggestions when modal opens
  useEffect(() => {
    if (isOpen && productsData?.data) {
      // Convert cart items to the format expected by upsell functions
      const cartItemsForExclusion: CartItem[] = cartItems.map(item => ({ id: item.id }))

      // Get bundles (cart-aware)
      const bundles = getUpsellBundles(product, productsData.data, cartItemsForExclusion)
      setUpsellBundles(bundles)

      // Get quick-add complementary products (cart-aware)
      const quickAdd = getQuickAddSuggestions(product, productsData.data, cartItemsForExclusion, 4)
      setQuickAddProducts(quickAdd)
    }
  }, [isOpen, product, productsData, cartItems])

  // Load favorites
  useEffect(() => {
    if (favoritesData?.data) {
      // Filter out current product and items in cart
      const filtered = favoritesData.data
        .filter((f: any) => f.id !== product.id && !cartItems.find(c => c.id === f.id))
        .slice(0, 4)
      setFavorites(filtered)
    }
  }, [favoritesData, product.id, cartItems])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setAddedToCart(false)
    }
  }, [isOpen])

  const handleAddToCart = () => {
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrl,
      sku: product.sku,
      unitsPerCase,
      // Attach store info for delegated orders (Carlos multi-store)
      storeId,
      storeName,
    })
    setAddedToCart(true)
    onAddComplete?.()
    // Don't close - let user see upsells
  }

  const handleAddBundle = (bundle: UpsellBundle) => {
    bundle.products.forEach((bundleProduct) => {
      add({
        id: bundleProduct.id,
        name: bundleProduct.name,
        price: Number(bundleProduct.price),
        quantity: 1,
        imageUrl: bundleProduct.imageUrl,
        sku: bundleProduct.sku,
        unitsPerCase: bundleProduct.unitsPerCase || 24,
        storeId,
        storeName,
      })
    })
    onAddComplete?.()
    onClose()
  }

  const handleQuickAdd = (p: CatalogProduct) => {
    add({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      quantity: 1,
      imageUrl: p.imageUrl,
      sku: p.sku,
      unitsPerCase: p.unitsPerCase || 24,
      storeId,
      storeName,
    })
    // Remove from suggestions
    setQuickAddProducts(prev => prev.filter(prod => prod.id !== p.id))
  }

  const handleAddFavorite = (fav: any) => {
    add({
      id: fav.id,
      name: fav.name,
      price: Number(fav.price),
      quantity: fav.lastOrderedQuantity || 1,
      imageUrl: fav.imageUrl,
      sku: fav.sku,
      unitsPerCase: fav.unitsPerCase || 24,
      storeId,
      storeName,
    })
    setFavorites(prev => prev.filter(f => f.id !== fav.id))
  }

  const totalUnits = quantity * unitsPerCase
  const totalPrice = quantity * Number(product.price)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal - prevent Android context menu on long-press */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pwa-touch">
              {/* Success Header or Add Header */}
              {addedToCart ? (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">Added to Cart!</p>
                      <p className="text-sm text-white/80">{quantity} case{quantity !== 1 ? 's' : ''} of {product.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={getPublicImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">${Number(product.price).toFixed(2)}/case</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Quantity Selector (only show if not added yet) */}
              {!addedToCart && (
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="w-16 px-2 py-2 text-center border-2 border-gray-200 rounded-lg font-bold text-lg"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-500 ml-2">cases</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{totalUnits} units</p>
                    </div>
                  </div>

                  {/* Quick quantity buttons */}
                  <div className="flex gap-2 mt-3">
                    {[3, 6, 12].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                          quantity === qty
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {qty} Cases
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              )}

              {/* COMPLETE YOUR ORDER - Quick Add Section (Domino's style) */}
              {quickAddProducts.length > 0 && (
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Complete Your Order
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Perfect matches - add with one tap!</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAddProducts.map((p) => (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAdd(p)}
                        className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-left"
                      >
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={getPublicImageUrl(p.imageUrl)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-amber-700">${Number(p.price).toFixed(2)}</p>
                        </div>
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* YOUR FAVORITES - Quick reorder */}
              {favorites.length > 0 && (
                <div className="p-4 border-b bg-purple-50">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    Your Favorites
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {favorites.map((fav) => (
                      <motion.button
                        key={fav.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddFavorite(fav)}
                        className="flex-shrink-0 w-24 p-2 bg-white border border-purple-200 rounded-lg hover:border-purple-400 transition-all text-center"
                      >
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg overflow-hidden mb-1">
                          {fav.imageUrl ? (
                            <img
                              src={getPublicImageUrl(fav.imageUrl)}
                              alt={fav.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-2">{fav.name}</p>
                        <p className="text-xs text-purple-600">+{fav.lastOrderedQuantity || 1}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* BUNDLE DEALS - Prominent savings */}
              {upsellBundles.length > 0 && (
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Bundle & Save
                  </h3>
                  <div className="space-y-3">
                    {upsellBundles.map((bundle) => (
                      <motion.div
                        key={bundle.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">{bundle.title}</p>
                            <p className="text-sm text-gray-600">{bundle.description}</p>
                          </div>
                          {bundle.savingsPercent && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              SAVE {bundle.savingsPercent}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {bundle.products.slice(0, 4).map((p, idx) => (
                              <div
                                key={`${p.id}-${idx}`}
                                className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200"
                              >
                                {p.imageUrl ? (
                                  <img
                                    src={getPublicImageUrl(p.imageUrl)}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {bundle.products.length > 4 && (
                              <span className="text-xs text-gray-500">+{bundle.products.length - 4}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-700">
                                ${bundle.totalPrice.toFixed(2)}
                              </p>
                              {bundle.savings && (
                                <p className="text-xs text-gray-500 line-through">
                                  ${(bundle.totalPrice + bundle.savings).toFixed(2)}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddBundle(bundle)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                              Add All
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {addedToCart ? 'Continue Shopping' : 'Cancel'}
                </button>
                {addedToCart && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    View Cart
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
