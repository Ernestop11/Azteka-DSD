'use client'

import { motion } from 'framer-motion'
import { Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react'

interface BundleProduct {
  id: string
  name: string
  imageUrl: string
}

interface BundleCardProps {
  bundle: {
    id: string
    name: string
    description: string
    products: BundleProduct[]
    originalPrice: number
    bundlePrice: number
    savings: number
    badge?: 'BEST VALUE' | 'POPULAR' | 'LIMITED TIME'
  }
  index?: number
  onAddToCart?: () => void
  onClick?: () => void
}

export default function BundleCard({ bundle, index = 0, onAddToCart, onClick }: BundleCardProps) {
  const savingsPercent = Math.round((bundle.savings / bundle.originalPrice) * 100)

  const badgeStyles = {
    'BEST VALUE': 'from-amber-500 to-yellow-600',
    POPULAR: 'from-blue-500 to-cyan-600',
    'LIMITED TIME': 'from-red-500 to-pink-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.1, 0.4),
        type: 'spring',
      }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative"
    >
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Badge */}
        {bundle.badge && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute top-4 right-4 z-20"
          >
            <div
              className={`
              px-4 py-2 rounded-full text-xs font-bold text-white
              bg-gradient-to-r ${badgeStyles[bundle.badge]}
              shadow-lg backdrop-blur-sm
              flex items-center gap-1
            `}
            >
              <TrendingUp className="w-3 h-3" />
              {bundle.badge}
            </div>
          </motion.div>
        )}

        {/* Savings Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Save {savingsPercent}%
            </div>
          </div>
        </div>

        {/* Bundle Icon */}
        <div className="relative pt-16 pb-6 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Product Images */}
          <div className="flex justify-center items-center gap-2 mb-4">
            {bundle.products.slice(0, 3).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + idx * 0.1 + 0.2 }}
                className={`
                  relative w-20 h-20 rounded-xl overflow-hidden
                  border-2 border-white shadow-lg
                  ${idx > 0 ? '-ml-6' : ''}
                  z-${30 - idx * 10}
                `}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
            {bundle.products.length > 3 && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center -ml-6 z-0">
                <span className="text-lg font-bold text-gray-600">
                  +{bundle.products.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 relative z-10">
          {/* Bundle Name */}
          <h3
            className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={onClick}
          >
            {bundle.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>

          {/* Product Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>{bundle.products.length} items included</span>
          </div>

          {/* Pricing */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm text-gray-500 line-through">
                  ${bundle.originalPrice.toFixed(2)}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${bundle.bundlePrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">You Save</div>
                <div className="text-xl font-bold text-green-600">
                  ${bundle.savings.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart?.()
            }}
            className="
              w-full py-4 px-6 rounded-xl
              bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-bold text-lg
              shadow-lg hover:shadow-xl
              flex items-center justify-center gap-3
              transition-all duration-300
              group-hover:from-blue-700 group-hover:to-purple-700
            "
          >
            <ShoppingCart className="w-5 h-5" />
            Add Bundle to Cart
          </motion.button>
        </div>

        {/* Bottom Glossy Reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}
