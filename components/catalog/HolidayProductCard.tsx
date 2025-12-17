'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Star, Award, Sparkles, Snowflake } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import TierRibbon from './TierRibbon'

interface HolidayProductCardProps {
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
    discountText?: string
    rewardsPoints?: number
    seasonal?: 'christmas' | 'summer' | 'dia-muertos'
    theme?: 'default' | 'holiday' | 'summer' | 'muertos' | 'black-friday'
    badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED' | null
  }
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
}

const holidayThemes = {
  'black-friday': {
    border: 'border-red-500',
    badgeBg: 'bg-gradient-to-r from-red-600 to-yellow-500',
    accent: 'text-red-600',
  },
  'christmas': {
    border: 'border-red-500',
    badgeBg: 'bg-gradient-to-r from-red-600 to-green-600',
    accent: 'text-red-600',
  },
  'holiday': {
    border: 'border-red-500',
    badgeBg: 'bg-gradient-to-r from-red-600 to-green-600',
    accent: 'text-red-600',
  },
  'summer': {
    border: 'border-cyan-500',
    badgeBg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    accent: 'text-cyan-600',
  },
  'default': {
    border: 'border-blue-500',
    badgeBg: 'bg-gradient-to-r from-blue-600 to-purple-600',
    accent: 'text-blue-600',
  },
}

export default function HolidayProductCard({
  product,
  index = 0,
  onClick,
  onAddToCart,
}: HolidayProductCardProps) {
  const theme = product.theme || 'default'
  const themeStyle = holidayThemes[theme] || holidayThemes.default
  const discount = product.discount || (product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.08, 0.4),
        type: 'spring',
        stiffness: 100,
      }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      {/* Main Card Container */}
      <div
        className={`
        relative overflow-hidden rounded-2xl
        border-2 ${themeStyle.border}
        shadow-xl hover:shadow-2xl
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
        {/* Holiday Decorative Elements */}
        {theme === 'christmas' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Snowflake className="w-3 h-3" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Discount Badge - Top Left */}
        {discount > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute top-3 left-3 z-20"
          >
            <div className={`${themeStyle.badgeBg} text-white px-4 py-2 rounded-full font-black text-lg shadow-lg flex items-center gap-1`}>
              <span>-{discount}%</span>
            </div>
          </motion.div>
        )}

        {/* Tier Ribbon */}
        {product.tier && ['A', 'B', 'C'].includes(product.tier) && (
          <div className="absolute top-3 right-3 z-20">
            <TierRibbon
              tier={product.tier as 'A' | 'B' | 'C'}
              position="top-right"
              size="md"
              animated={true}
            />
          </div>
        )}

        {/* Badge - Top Right (if no tier) */}
        {product.badge && !product.tier && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute top-3 right-3 z-20"
          >
            <div className={`${themeStyle.badgeBg} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
              {product.badge}
            </div>
          </motion.div>
        )}

        {/* Image Container */}
        <div
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
          onClick={onClick}
        >
          <img
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3 relative z-10">
          {/* Brand */}
          {product.brand && (
            <div className={`text-xs font-semibold ${themeStyle.accent} uppercase tracking-wider`}>
              {typeof product.brand === 'string' ? product.brand : product.brand || ''}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className={`text-2xl font-black ${themeStyle.accent}`}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart?.()
            }}
            className={`w-full py-3 ${themeStyle.badgeBg} text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  )
}

