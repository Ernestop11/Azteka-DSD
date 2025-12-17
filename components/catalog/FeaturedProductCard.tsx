'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Star, Award, Sparkles } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import TierRibbon from './TierRibbon'

interface FeaturedProductCardProps {
  product: {
    id: string
    name: string
    brand?: string
    price: number
    originalPrice?: number
    imageUrl: string
    backgroundColor?: string | null
    backgroundGradient?: string | null
    tier?: 'A' | 'B' | 'C'
    discount?: number
    rewardsPoints?: number
    rating?: number
    badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED' | null
  }
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
}

export default function FeaturedProductCard({
  product,
  index = 0,
  onClick,
  onAddToCart,
}: FeaturedProductCardProps) {
  const discount = product.discount || (product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.1, 0.5),
        type: 'spring',
      }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.03 }}
      className="group relative"
    >
      {/* Main Card - 2x larger */}
      <div
        className={`
        relative overflow-hidden rounded-3xl
        border-2 border-gray-200
        shadow-2xl hover:shadow-3xl
        transition-all duration-500
        ${product.backgroundGradient ? '' : product.backgroundColor ? '' : 'bg-gradient-to-br from-white via-gray-50 to-white'}
      `}
        style={{
          ...(product.backgroundGradient 
            ? { background: product.backgroundGradient }
            : product.backgroundColor 
            ? { backgroundColor: product.backgroundColor }
            : {}
          ),
        }}
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none opacity-70" />
        
        {/* Sparkle Effects */}
        {product.badge === 'NEW' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute top-4 left-4 z-20"
          >
            <div className="bg-gradient-to-r from-red-600 to-pink-500 text-white px-5 py-3 rounded-full font-black text-xl shadow-xl">
              -{discount}%
            </div>
          </motion.div>
        )}

        {/* Tier Ribbon */}
        {product.tier && ['A', 'B', 'C'].includes(product.tier) && (
          <div className="absolute top-4 right-4 z-20">
            <TierRibbon
              tier={product.tier as 'A' | 'B' | 'C'}
              position="top-right"
              size="lg"
              animated={true}
            />
          </div>
        )}

        {/* Badge */}
        {product.badge && !product.tier && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {product.badge}
            </div>
          </motion.div>
        )}

        {/* Large Image */}
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <img
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Brand */}
          {product.brand && (
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {typeof product.brand === 'string' ? product.brand : product.brand || ''}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-black text-gray-900 text-2xl line-clamp-2 min-h-[4rem]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-4xl font-black text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Rewards Points */}
          {product.rewardsPoints && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">+{product.rewardsPoints} Points</span>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart?.()
            }}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xl"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  )
}

