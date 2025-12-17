'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Package, TrendingUp, Sparkles } from 'lucide-react'
import type { UpsellBundle } from '@/lib/upsells/smartUpsells'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface UpsellBundleCardProps {
  bundle: UpsellBundle
  onAddToCart: (bundle: UpsellBundle) => void
  index?: number
}

export default function UpsellBundleCard({ bundle, onAddToCart, index = 0 }: UpsellBundleCardProps) {
  const getIcon = () => {
    switch (bundle.type) {
      case 'variety':
        return <Sparkles className="w-4 h-4" />
      case 'bulk':
        return <Package className="w-4 h-4" />
      case 'complementary':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <ShoppingCart className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (bundle.type) {
      case 'variety':
        return 'from-purple-500 to-pink-500'
      case 'bulk':
        return 'from-blue-500 to-cyan-500'
      case 'complementary':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-emerald-500 to-teal-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Savings Badge */}
      {bundle.savings && bundle.savings > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`bg-gradient-to-r ${getColor()} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
            {getIcon()}
            Save ${bundle.savings.toFixed(2)}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Bundle Title */}
        <h4 className="font-bold text-gray-900 mb-1 pr-20">{bundle.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>

        {/* Product Images Preview */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {bundle.products.slice(0, 4).map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden"
            >
              <img
                src={getPublicImageUrl(product.imageUrl || '/placeholder-product.png')}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {bundle.products.length > 4 && (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
              +{bundle.products.length - 4}
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="mb-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <ul className="space-y-1 text-xs text-gray-700">
            {bundle.products.map((product, idx) => (
              <li key={`${product.id}-${idx}`} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                <span className="truncate">
                  {bundle.type === 'bulk' && idx > 0 ? '' : product.name}
                  {bundle.type === 'bulk' && idx === 0 && ` (x${bundle.products.length})`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            {bundle.savings && bundle.savings > 0 && (
              <div className="text-xs text-gray-500 line-through">
                ${(bundle.totalPrice + bundle.savings).toFixed(2)}
              </div>
            )}
            <div className="text-lg font-bold text-gray-900">
              ${bundle.totalPrice.toFixed(2)}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(bundle)}
            className={`bg-gradient-to-r ${getColor()} text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add Bundle
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
