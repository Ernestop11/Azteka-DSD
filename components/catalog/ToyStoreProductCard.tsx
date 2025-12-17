'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import PriceTierBadge from './PriceTierBadge'
import TieredPriceDisplay from './TieredPriceDisplay'
import {
  TOY_STORE_COLORS,
  TOY_STORE_SHADOWS,
  TOY_STORE_ANIMATIONS,
  getToyStorePattern,
} from '@/lib/theme/toyStoreTheme'
import { useTheme } from '@/context/ThemeContext'
import { getCategoryGradientForTheme } from '@/lib/theme/themeVariants'
import type { PriceTier } from '@/lib/pricing/tierCalculator'
import type { ProductPricing } from '@/lib/pricing/priceDisplay'

interface ToyStoreProductCardProps {
  product: {
    id: string
    name: string
    sku: string
    description?: string | null
    price: number | string
    imageUrl?: string | null
    unitsPerCase?: number
    category?: { id: string; name: string } | string | null
    brand?: { id: string; name: string } | null
    // Pricing fields
    isCompetitive?: boolean
    isExclusive?: boolean
    discountTier1?: number | null
    discountTier2?: number | null
    discountTier3?: number | null
    exclusiveDiscount?: number | null
    // Visual fields
    badge?: string | null
    featured?: boolean
    trending?: boolean
    seasonal?: boolean
  }
  customerTier?: PriceTier
  onAddToCart?: (product: any) => void
  onQuickView?: (product: any) => void
  onWishlist?: (product: any) => void
  onClick?: (product: any) => void
}

export default function ToyStoreProductCard({
  product,
  customerTier = 1,
  onAddToCart,
  onQuickView,
  onWishlist,
  onClick,
}: ToyStoreProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { currentTheme, themeDefinition } = useTheme()

  const basePrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0

  const pricing: ProductPricing = {
    basePrice,
    isCompetitive: product.isCompetitive || false,
    isExclusive: product.isExclusive || false,
    discountTier1: product.discountTier1,
    discountTier2: product.discountTier2,
    discountTier3: product.discountTier3,
    exclusiveDiscount: product.exclusiveDiscount,
  }

  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name
  const categoryGradient = getCategoryGradientForTheme(currentTheme, categoryName)
  const patternStyle = getToyStorePattern('dots')

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product)
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.(product)
  }

  return (
    <motion.div
      variants={TOY_STORE_ANIMATIONS.cardLift}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: TOY_STORE_SHADOWS.card,
      }}
      onClick={() => onClick?.(product)}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={patternStyle}
      />

      {/* Card Content */}
      <div className="relative p-4">
        {/* Top Row: Badges + Wishlist */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            {/* Custom Badge */}
            {product.badge && (
              <motion.span
                className="px-2 py-1 rounded-full text-xs font-black text-white uppercase"
                style={{
                  backgroundColor: TOY_STORE_COLORS.badge.hot,
                  boxShadow: TOY_STORE_SHADOWS.badge,
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
              >
                {product.badge}
              </motion.span>
            )}

            {/* Feature Badges */}
            {product.featured && (
              <span
                className="px-2 py-1 rounded-full text-xs font-black text-white uppercase"
                style={{
                  backgroundColor: TOY_STORE_COLORS.badge.featured,
                  boxShadow: TOY_STORE_SHADOWS.badge,
                }}
              >
                ⭐ FEATURED
              </span>
            )}

            {product.trending && (
              <span
                className="px-2 py-1 rounded-full text-xs font-black text-white uppercase"
                style={{
                  backgroundColor: TOY_STORE_COLORS.badge.hot,
                  boxShadow: TOY_STORE_SHADOWS.badge,
                }}
              >
                🔥 HOT
              </span>
            )}

            {product.seasonal && (
              <span
                className="px-2 py-1 rounded-full text-xs font-black text-white uppercase"
                style={{
                  backgroundColor: TOY_STORE_COLORS.badge.limited,
                  boxShadow: TOY_STORE_SHADOWS.badge,
                }}
              >
                ❄️ SEASONAL
              </span>
            )}
          </div>

          {/* Wishlist Heart */}
          <motion.button
            onClick={handleWishlistClick}
            className={`p-2 rounded-full transition-colors ${
              isWishlisted ? 'bg-red-100' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </motion.button>
        </div>

        {/* Product Image with Gradient Background (Amazon style) */}
        <div
          className="relative aspect-square mb-4 rounded-xl overflow-hidden"
          style={{
            background: categoryGradient,
            boxShadow: TOY_STORE_SHADOWS.product,
          }}
        >
          {/* Product Image (SHINE with shadow) */}
          {!imageError && product.imageUrl ? (
            <motion.img
              src={getPublicImageUrl(product.imageUrl)}
              alt={product.name}
              className="relative w-full h-full object-contain p-4 z-10"
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))',
              }}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              whileHover={{
                scale: 1.1,
                rotate: 2,
              }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500">
              No Image
            </div>
          )}

          {/* Quick View Button (appears on hover) */}
          <motion.button
            onClick={handleQuickViewClick}
            className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Product Name (Bold - Toy Store style) */}
          <h3 className="text-base font-bold text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Units Per Case */}
          {product.unitsPerCase && (
            <p className="text-xs text-gray-600">
              {product.unitsPerCase} units per case
            </p>
          )}

          {/* Price Tier Badge */}
          <PriceTierBadge tier={customerTier} size="sm" showName={false} />

          {/* Price Display (BIG & BOLD) */}
          <TieredPriceDisplay
            pricing={pricing}
            customerTier={customerTier}
            size="md"
            layout="detailed"
          />

          {/* Add to Cart Button (Domino's style - 1 click) */}
          <motion.button
            onClick={handleAddToCartClick}
            className="w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: TOY_STORE_COLORS.primary.green,
              boxShadow: TOY_STORE_SHADOWS.card,
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: TOY_STORE_SHADOWS.cardHover,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 107, 0, 0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
