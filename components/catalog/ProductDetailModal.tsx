'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingCart, Package, TrendingUp, Sparkles, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import GlossyProductCard from './GlossyProductCard'

interface Product {
  id: string
  name: string
  imageUrl?: string
  price: number
  brand?: string | { name: string }
  category?: string | { name: string }
  description?: string
  casePackSize?: number
  minOrderQty?: number
}

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, isWholesale: boolean) => void
  relatedProducts?: Product[]
  suggestedBundles?: Array<{
    id: string
    name: string
    products: Product[]
    price: number
    savings: number
  }>
}

// Wholesale pricing tiers
interface PricingTier {
  minQty: number
  maxQty?: number
  discount: number
  label: string
}

const PRICING_TIERS: PricingTier[] = [
  { minQty: 1, maxQty: 11, discount: 0, label: 'Retail Price' },
  { minQty: 12, maxQty: 35, discount: 0.10, label: '12+ Units (10% off)' },
  { minQty: 36, maxQty: 71, discount: 0.15, label: '36+ Units (15% off)' },
  { minQty: 72, discount: 0.20, label: '72+ Units (20% off)' }
]

function getCurrentTier(quantity: number): PricingTier {
  for (let i = PRICING_TIERS.length - 1; i >= 0; i--) {
    const tier = PRICING_TIERS[i]
    if (quantity >= tier.minQty) {
      if (!tier.maxQty || quantity <= tier.maxQty) {
        return tier
      }
    }
  }
  return PRICING_TIERS[0]
}

function getCategoryGradient(categoryName?: string | { name: string }): string {
  const categoryGradients: Record<string, string> = {
    'snacks': 'from-orange-400 via-amber-300 to-yellow-400',
    'chips': 'from-red-400 via-orange-400 to-yellow-500',
    'beverages': 'from-blue-400 via-cyan-300 to-teal-400',
    'candy': 'from-pink-400 via-purple-400 to-fuchsia-500',
    'default': 'from-violet-400 via-fuchsia-400 to-pink-500',
  }

  if (!categoryName) return categoryGradients.default
  const name = typeof categoryName === 'string'
    ? categoryName.toLowerCase()
    : categoryName.name?.toLowerCase() || ''

  if (categoryGradients[name]) return categoryGradients[name]

  for (const [key, gradient] of Object.entries(categoryGradients)) {
    if (name.includes(key) || key.includes(name)) {
      return gradient
    }
  }

  return categoryGradients.default
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  relatedProducts = [],
  suggestedBundles = []
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWholesale, setIsWholesale] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setIsWholesale(false)
      setSelectedBundle(null)
    }
  }, [isOpen, product])

  if (!product) return null

  const currentTier = getCurrentTier(quantity)
  const unitPrice = product.price
  const discountedPrice = unitPrice * (1 - currentTier.discount)
  const totalPrice = discountedPrice * quantity
  const totalSavings = (unitPrice - discountedPrice) * quantity
  const casePackSize = product.casePackSize || 12
  const minOrderQty = product.minOrderQty || 1

  const gradient = getCategoryGradient(product.category)

  const handleIncrement = () => {
    if (isWholesale) {
      setQuantity(prev => prev + casePackSize)
    } else {
      setQuantity(prev => prev + 1)
    }
  }

  const handleDecrement = () => {
    if (isWholesale) {
      setQuantity(prev => Math.max(casePackSize, prev - casePackSize))
    } else {
      setQuantity(prev => Math.max(minOrderQty, prev - 1))
    }
  }

  const handleWholesaleToggle = () => {
    if (!isWholesale) {
      // Switching to wholesale - round up to nearest case pack
      const newQty = Math.ceil(quantity / casePackSize) * casePackSize
      setQuantity(Math.max(casePackSize, newQty))
    }
    setIsWholesale(!isWholesale)
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity, isWholesale)
    onClose()
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto">
              <div className="p-6 md:p-10 lg:p-12">
                {/* Product Section */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12">
                  {/* Left: Product Image */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl opacity-20 blur-2xl`} />

                    {/* Product Image Container */}
                    <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12">
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-3xl`} />

                      <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        src={product.imageUrl || '/placeholder-product.png'}
                        alt={product.name}
                        className="relative w-full h-auto object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Category Badge */}
                    {product.category && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {typeof product.category === 'string' ? product.category : product.category.name}
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* Right: Product Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Brand */}
                    {product.brand && (
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {typeof product.brand === 'string' ? product.brand : product.brand.name}
                      </div>
                    )}

                    {/* Product Name */}
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                      {product.name}
                    </h1>

                    {/* Description */}
                    {product.description && (
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Wholesale Toggle */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                      <button
                        onClick={handleWholesaleToggle}
                        className={`
                          relative w-16 h-8 rounded-full transition-all duration-300
                          ${isWholesale ? 'bg-blue-600' : 'bg-gray-300'}
                        `}
                      >
                        <motion.div
                          animate={{ x: isWholesale ? 32 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                      <div>
                        <div className="font-bold text-gray-900">Wholesale Mode</div>
                        <div className="text-sm text-gray-600">
                          {isWholesale ? `Orders in case packs of ${casePackSize}` : 'Individual unit orders'}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="space-y-4">
                      {/* Current Tier */}
                      <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-sm font-bold uppercase tracking-wider">
                            {currentTier.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          {currentTier.discount > 0 && (
                            <span className="text-2xl line-through opacity-75">
                              ${unitPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-5xl font-black">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-xl opacity-90">per unit</span>
                        </div>
                        {totalSavings > 0 && (
                          <div className="mt-3 text-sm font-semibold">
                            You save ${totalSavings.toFixed(2)} on this order!
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleDecrement}
                          className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                        >
                          <Minus className="w-6 h-6 text-gray-700" />
                        </button>

                        <div className="flex-1 text-center">
                          <div className="text-5xl font-black text-gray-900">{quantity}</div>
                          <div className="text-sm text-gray-600 font-semibold mt-1">
                            {isWholesale ? `${Math.floor(quantity / casePackSize)} case${Math.floor(quantity / casePackSize) !== 1 ? 's' : ''}` : 'unit' + (quantity !== 1 ? 's' : '')}
                          </div>
                        </div>

                        <button
                          onClick={handleIncrement}
                          className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                        >
                          <Plus className="w-6 h-6 text-gray-700" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="p-6 bg-gray-900 rounded-2xl text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold">Total</span>
                          <span className="text-4xl font-black">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className={`
                          w-full py-6 rounded-2xl font-black text-xl
                          bg-gradient-to-r ${gradient} text-white
                          shadow-2xl hover:shadow-3xl
                          flex items-center justify-center gap-3
                          transition-all duration-300
                        `}
                      >
                        <ShoppingCart className="w-6 h-6" />
                        Add {quantity} to Cart - ${totalPrice.toFixed(2)}
                      </motion.button>
                    </div>

                    {/* Pricing Tiers Info */}
                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-blue-900">Volume Discounts</span>
                      </div>
                      <div className="space-y-2">
                        {PRICING_TIERS.map((tier, idx) => (
                          <div
                            key={idx}
                            className={`
                              flex items-center justify-between text-sm
                              ${quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)
                                ? 'font-bold text-blue-900'
                                : 'text-blue-700'
                              }
                            `}
                          >
                            <span>{tier.label}</span>
                            <span>${(unitPrice * (1 - tier.discount)).toFixed(2)}/unit</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Suggested Bundles */}
                {suggestedBundles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                      <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                        Complete Your Display
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {suggestedBundles.map((bundle) => (
                        <motion.div
                          key={bundle.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedBundle(bundle.id)}
                          className={`
                            p-6 rounded-2xl cursor-pointer transition-all
                            ${selectedBundle === bundle.id
                              ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-400 shadow-xl'
                              : 'bg-white border-2 border-gray-200 hover:border-purple-300 shadow-lg'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-black text-gray-900">{bundle.name}</h3>
                              <div className="text-sm text-gray-600 mt-1">
                                {bundle.products.length} products included
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-purple-600">
                                ${bundle.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-green-600 font-bold">
                                Save ${bundle.savings.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {bundle.products.slice(0, 4).map((p, idx) => (
                              <div
                                key={idx}
                                className="flex-shrink-0 w-16 h-16 bg-white rounded-lg p-2 shadow-sm"
                              >
                                <img
                                  src={p.imageUrl || '/placeholder-product.png'}
                                  alt={p.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                            {bundle.products.length > 4 && (
                              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">
                                  +{bundle.products.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Package className="w-8 h-8 text-blue-600" />
                      <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                        You May Also Like
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {relatedProducts.slice(0, 4).map((relatedProduct, idx) => (
                        <motion.div
                          key={relatedProduct.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                        >
                          <GlossyProductCard
                            product={relatedProduct}
                            index={idx}
                            onClick={() => {
                              // Replace current product in modal
                              onClose()
                              setTimeout(() => {
                                // This would trigger opening the modal with the new product
                                // Parent component handles this via product state change
                              }, 300)
                            }}
                            onAddToCart={() => onAddToCart(relatedProduct, 1, false)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
