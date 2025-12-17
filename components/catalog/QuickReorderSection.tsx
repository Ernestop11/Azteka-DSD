'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, RotateCcw } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { TOY_STORE_COLORS, TOY_STORE_SHADOWS } from '@/lib/theme/toyStoreTheme'
import type { PriceTier } from '@/lib/pricing/tierCalculator'

interface QuickReorderProduct {
  id: string
  name: string
  imageUrl?: string | null
  price: number
  lastOrderedQuantity: number
  unitsPerCase?: number
}

interface QuickReorderSectionProps {
  products: QuickReorderProduct[]
  customerTier?: PriceTier
  onAddToCart: (productId: string, quantity: number) => void
  onReorderAll: () => void
}

export default function QuickReorderSection({
  products,
  customerTier = 1,
  onAddToCart,
  onReorderAll,
}: QuickReorderSectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.lastOrderedQuantity }), {})
  )

  const handleIncrement = (productId: string) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }))
  }

  const handleAddToCart = (productId: string) => {
    const quantity = quantities[productId] || 0
    if (quantity > 0) {
      onAddToCart(productId, quantity)
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <motion.section
      className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: TOY_STORE_COLORS.primary.orange,
              boxShadow: TOY_STORE_SHADOWS.badge,
            }}
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Quick Reorder</h2>
            <p className="text-sm text-gray-600">
              Your most frequently ordered products - ready to reorder in 1 click!
            </p>
          </div>
        </div>

        {/* Reorder All Button */}
        <motion.button
          onClick={onReorderAll}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2"
          style={{
            background: TOY_STORE_COLORS.primary.green,
            boxShadow: TOY_STORE_SHADOWS.card,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Reorder All</span>
        </motion.button>
      </div>

      {/* Product Grid - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto -mx-6 px-6 pb-4">
        <div className="flex gap-4 min-w-max lg:grid lg:grid-cols-5 lg:min-w-0">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-xl p-4 shadow-md flex-shrink-0 w-64 lg:w-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Product Image */}
              <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-xs text-gray-400">No Image</div>
                )}
              </div>

              {/* Product Name */}
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                {product.name}
              </h3>

              {/* Last Order Info */}
              <p className="text-xs text-gray-600 mb-3">
                Last ordered: <span className="font-semibold">{product.lastOrderedQuantity} cases</span>
              </p>

              {/* Price */}
              <p className="text-lg font-black mb-3" style={{ color: TOY_STORE_COLORS.primary.red }}>
                ${product.price.toFixed(2)}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 mb-3">
                <motion.button
                  onClick={() => handleDecrement(product.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>

                <div className="flex-1 text-center">
                  <span className="text-xl font-bold">{quantities[product.id] || 0}</span>
                </div>

                <motion.button
                  onClick={() => handleIncrement(product.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Add to Cart Button (Domino's UX - 1 click) */}
              <motion.button
                onClick={() => handleAddToCart(product.id)}
                disabled={!quantities[product.id] || quantities[product.id] === 0}
                className={`w-full py-2 px-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  !quantities[product.id] || quantities[product.id] === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : ''
                }`}
                style={
                  quantities[product.id] && quantities[product.id] > 0
                    ? {
                        background: TOY_STORE_COLORS.primary.green,
                        boxShadow: TOY_STORE_SHADOWS.badge,
                      }
                    : {}
                }
                whileHover={
                  quantities[product.id] && quantities[product.id] > 0
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  quantities[product.id] && quantities[product.id] > 0
                    ? { scale: 0.95 }
                    : {}
                }
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Add to Cart</span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Message */}
      <motion.p
        className="text-center text-sm text-gray-600 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Tip: Adjust quantities and click "Reorder All" to add everything to your cart at once!
      </motion.p>
    </motion.section>
  )
}
