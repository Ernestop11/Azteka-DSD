'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingCart, Package, Zap } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useQuery } from '@tanstack/react-query'
import type { CatalogProduct } from '@/lib/queries/catalog'
import { getUpsellBundles, type UpsellBundle } from '@/lib/upsells/smartUpsells'
import UpsellBundleCard from './UpsellBundleCard'

interface AddToCartModalProps {
  product: CatalogProduct
  isOpen: boolean
  onClose: () => void
  onAddComplete?: () => void
}

export default function AddToCartModal({
  product,
  isOpen,
  onClose,
  onAddComplete,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [showWholesaleOptions, setShowWholesaleOptions] = useState(false)
  const [upsellBundles, setUpsellBundles] = useState<UpsellBundle[]>([])
  const { add } = useCart()
  const unitsPerCase = product.unitsPerCase || 24

  // Fetch all products for upsell generation
  const { data: productsData } = useQuery<{ data: any[] }>({
    queryKey: ['catalog-products-upsell'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=200')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  // Generate upsell bundles when modal opens
  useEffect(() => {
    if (isOpen && productsData?.data) {
      const bundles = getUpsellBundles(product, productsData.data)
      setUpsellBundles(bundles)
    }
  }, [isOpen, product, productsData])

  const handleAddToCart = () => {
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrl,
      sku: product.sku,
      unitsPerCase,
    })
    onAddComplete?.()
    onClose()
  }

  const handleAddBundle = (bundle: UpsellBundle) => {
    // Add all products in the bundle
    bundle.products.forEach((bundleProduct, idx) => {
      add({
        id: bundleProduct.id,
        name: bundleProduct.name,
        price: Number(bundleProduct.price),
        quantity: 1,
        imageUrl: bundleProduct.imageUrl,
        sku: bundleProduct.sku,
        unitsPerCase: bundleProduct.unitsPerCase || 24,
      })
    })
    onAddComplete?.()
    onClose()
  }

  const handleIncrement = () => {
    setQuantity(quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, value))
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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add to Cart</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600">${Number(product.price).toFixed(2)} per case</p>
                    <p className="text-xs text-gray-500">{unitsPerCase} units per case</p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Quantity (Cases)</label>
                    <span className="text-xs text-gray-500">{unitsPerCase} units/case</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityInput}
                      min="1"
                      className="w-20 px-3 py-2 text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    />

                    <button
                      onClick={handleIncrement}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cases:</span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Units:</span>
                      <span className="font-semibold">{totalUnits}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total Price:</span>
                      <span className="font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wholesale Quick Add Options */}
              <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-blue-900">Wholesale Quick Add</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setQuantity(3)
                      setShowWholesaleOptions(true)
                    }}
                    className="px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    3 Cases
                  </button>
                  <button
                    onClick={() => {
                      setQuantity(6)
                      setShowWholesaleOptions(true)
                    }}
                    className="px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    6 Cases
                  </button>
                  <button
                    onClick={() => {
                      setQuantity(12)
                      setShowWholesaleOptions(true)
                    }}
                    className="px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    12 Cases
                  </button>
                </div>
              </div>

              {/* Upsell Bundles Section */}
              {upsellBundles.length > 0 && (
                <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Smart Bundle Deals
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {upsellBundles.map((bundle, idx) => (
                      <UpsellBundleCard
                        key={bundle.id}
                        bundle={bundle}
                        onAddToCart={handleAddBundle}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add {quantity} Case{quantity !== 1 ? 's' : ''} to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

