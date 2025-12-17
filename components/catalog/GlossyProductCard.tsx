'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Star, Award, Sparkles } from 'lucide-react'
import { useState } from 'react'
import TierRibbon from './TierRibbon'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface GlossyProductCardProps {
  product: {
    id: string
    name: string
    brand?: string | { name: string }
    category?: string | { name: string }
    price: number
    originalPrice?: number
    imageUrl: string
    backgroundColor?: string | null
    backgroundGradient?: string | null
    tier?: 'A' | 'B' | 'C'
    rewardsPoints?: number
    points?: number // Alternative field name for points
    rating?: number
    seasonal?: 'christmas' | 'summer' | 'dia-muertos'
    // Tier pricing
    priceTierA?: number | null
    priceTierB?: number | null
    priceTierC?: number | null
    activeTier?: 'A' | 'B' | 'C' | null // Current user's tier
    // Visual preset fields
    glossLevel?: 'none' | 'soft' | 'premium'
    sparkle?: boolean
    badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED' | null
    theme?: 'default' | 'holiday' | 'summer' | 'muertos'
  }
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
}

const tierColors = {
  A: 'from-amber-400 via-yellow-500 to-amber-600',
  B: 'from-slate-300 via-slate-400 to-slate-500',
  C: 'from-orange-600 via-amber-700 to-orange-800',
}

const badgeStyles = {
  NEW: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  SALE: 'bg-gradient-to-r from-red-500 to-pink-500',
  HOT: 'bg-gradient-to-r from-orange-500 to-red-600',
  LIMITED: 'bg-gradient-to-r from-purple-500 to-indigo-600',
}

const seasonalThemes = {
  christmas: 'from-red-600/20 via-green-600/20 to-red-600/20',
  summer: 'from-cyan-400/20 via-blue-500/20 to-purple-500/20',
  'dia-muertos': 'from-orange-500/20 via-pink-500/20 to-purple-600/20',
}

// Category-specific vibrant gradients for product backgrounds
const categoryGradients: Record<string, string> = {
  // Snacks & Chips
  'snacks': 'from-orange-400 via-amber-300 to-yellow-400',
  'chips': 'from-red-400 via-orange-400 to-yellow-500',
  'sabritas': 'from-red-500 via-yellow-400 to-orange-500',
  'tortilla chips': 'from-amber-400 via-orange-300 to-red-400',

  // Beverages
  'beverages': 'from-blue-400 via-cyan-300 to-teal-400',
  'drinks': 'from-sky-400 via-blue-400 to-indigo-500',
  'soda': 'from-blue-500 via-purple-400 to-pink-500',
  'water': 'from-cyan-300 via-blue-200 to-sky-300',
  'juice': 'from-orange-400 via-yellow-300 to-pink-400',

  // Candy & Sweets
  'candy': 'from-pink-400 via-purple-400 to-fuchsia-500',
  'chocolate': 'from-amber-600 via-orange-500 to-red-600',
  'gum': 'from-green-400 via-teal-400 to-cyan-500',

  // Bakery
  'bakery': 'from-amber-300 via-orange-200 to-yellow-300',
  'bread': 'from-yellow-200 via-amber-300 to-orange-400',
  'pastries': 'from-rose-300 via-pink-200 to-orange-200',

  // Default/Fallback - Vibrant multi-color
  'default': 'from-violet-400 via-fuchsia-400 to-pink-500',
}

// Get gradient based on product category
function getCategoryGradient(categoryName?: string | { name: string }): string {
  if (!categoryName) return categoryGradients.default

  const name = typeof categoryName === 'string'
    ? categoryName.toLowerCase()
    : categoryName.name?.toLowerCase() || ''

  // Direct match
  if (categoryGradients[name]) return categoryGradients[name]

  // Partial match
  for (const [key, gradient] of Object.entries(categoryGradients)) {
    if (name.includes(key) || key.includes(name)) {
      return gradient
    }
  }

  return categoryGradients.default
}

export default function GlossyProductCard({
  product,
  index = 0,
  onClick,
  onAddToCart,
}: GlossyProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Determine if tiered pricing exists
  const hasTieredPricing = Boolean(
    product.priceTierA !== null && product.priceTierA !== undefined ||
    product.priceTierB !== null && product.priceTierB !== undefined ||
    product.priceTierC !== null && product.priceTierC !== undefined
  )

  // Get price based on active tier
  const getDisplayPrice = (): number => {
    if (hasTieredPricing && product.activeTier) {
      const tierPrice = product[`priceTier${product.activeTier}` as 'priceTierA' | 'priceTierB' | 'priceTierC']
      if (tierPrice !== null && tierPrice !== undefined) {
        return tierPrice
      }
    }
    return product.price
  }

  const displayPrice = getDisplayPrice()
  const showTierRibbon = product.tier && (!hasTieredPricing || product.activeTier === product.tier)

  // Ensure tier is valid for TierRibbon
  const validTier: 'A' | 'B' | 'C' | null = product.tier && ['A', 'B', 'C'].includes(product.tier)
    ? (product.tier as 'A' | 'B' | 'C')
    : null

  // Get category-specific gradient for the image background
  const categoryGradient = getCategoryGradient(product.category)

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
      {/* Main Card Container with Glossy Effect */}
      <div
        className={`
        relative overflow-hidden rounded-2xl
        border border-gray-200
        shadow-lg hover:shadow-2xl
        transition-all duration-500
        ${product.backgroundGradient ? '' : product.backgroundColor ? '' : 'bg-gradient-to-br from-white via-gray-50 to-white'}
        ${product.seasonal ? `bg-gradient-to-br ${seasonalThemes[product.seasonal]}` : ''}
        ${product.theme === 'holiday' ? 'bg-gradient-to-br from-red-50 via-green-50 to-red-50' : ''}
        ${product.theme === 'summer' ? 'bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50' : ''}
        ${product.theme === 'muertos' ? 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50' : ''}
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
        {/* Glossy Overlay - Dynamic based on glossLevel */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
            product.glossLevel === 'none'
              ? 'opacity-0'
              : product.glossLevel === 'soft'
              ? 'opacity-40'
              : 'opacity-70'
          }`}
        />
        
        {/* Sparkle Effect */}
        {product.sparkle && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-60" />
            <div className="absolute top-8 left-6 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-6 right-8 w-1 h-1 bg-pink-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-10 left-4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1.5s' }} />
          </div>
        )}

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Tier Ribbon - Top Left */}
        {showTierRibbon && validTier && (
          <TierRibbon
            tier={validTier}
            position="top-left"
            size="md"
            animated={true}
          />
        )}

        {/* Active Tier Indicator - Show when tiered pricing exists and active tier is set */}
        {hasTieredPricing && product.activeTier && (
          <div className="absolute top-3 left-3 z-20">
            <div
              className={`
              px-3 py-1 rounded-full text-xs font-bold text-white
              bg-gradient-to-r ${tierColors[product.activeTier]}
              shadow-lg backdrop-blur-sm
              flex items-center gap-1
              border-2 border-white/50
            `}
            >
              <Award className="w-3 h-3" />
              Your Price: Tier {product.activeTier}
            </div>
          </div>
        )}

        {/* Badge - Top Right */}
        {product.badge && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute top-3 right-3 z-20"
          >
            <div
              className={`
              px-3 py-1 rounded-full text-xs font-bold text-white
              ${badgeStyles[product.badge]}
              shadow-lg backdrop-blur-sm
              ${product.sparkle ? 'animate-pulse' : ''}
            `}
            >
              {product.badge}
            </div>
          </motion.div>
        )}

        {/* Rewards Points Badge */}
        {(product.rewardsPoints || product.points) && (
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
            className="absolute top-14 right-3 z-20"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-bold">+{product.rewardsPoints || product.points || 0}</span>
            </div>
          </motion.div>
        )}

        {/* Image Container */}
        <div
          className={`relative aspect-square overflow-hidden cursor-pointer bg-gradient-to-br ${categoryGradient}`}
          onClick={onClick}
        >
          <img
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className={`
              w-full h-full object-contain p-4
              transition-all duration-700
              group-hover:scale-110
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Image Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}

          {/* Discount Badge - Overlaid on Image */}
          {discount > 0 && (
            <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
              -{discount}%
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3 relative z-10">
          {/* Brand */}
          {product.brand && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {typeof product.brand === 'string' ? product.brand : product.brand?.name || ''}
            </div>
          )}

          {/* Product Name */}
          <h3
            className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={onClick}
          >
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < product.rating!
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">({product.rating}.0)</span>
            </div>
          )}

          {/* Price Section */}
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </div>
              {product.originalPrice && product.originalPrice > displayPrice && (
                <div className="text-sm text-gray-500 line-through mb-1">
                  ${product.originalPrice.toFixed(2)}
                </div>
              )}
              {hasTieredPricing && product.activeTier && product.price !== displayPrice && (
                <div className="text-xs text-gray-500 line-through mb-1">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>
            {/* Tier Pricing Info */}
            {hasTieredPricing && (
              <div className="text-xs text-gray-600 space-y-0.5">
                {product.priceTierA !== null && product.priceTierA !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600">Tier A:</span>
                    <span className="font-semibold">${product.priceTierA.toFixed(2)}</span>
                  </div>
                )}
                {product.priceTierB !== null && product.priceTierB !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Tier B:</span>
                    <span className="font-semibold">${product.priceTierB.toFixed(2)}</span>
                  </div>
                )}
                {product.priceTierC !== null && product.priceTierC !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600">Tier C:</span>
                    <span className="font-semibold">${product.priceTierC.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
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
              w-full py-3 px-4 rounded-xl
              bg-gradient-to-r from-emerald-500 to-teal-600
              text-white font-bold
              shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2
              transition-all duration-300
              group-hover:from-emerald-600 group-hover:to-teal-700
            "
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </motion.button>
        </div>

        {/* Bottom Glossy Reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}
