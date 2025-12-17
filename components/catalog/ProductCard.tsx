'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { resolveVisualPreset, applyCardTheme } from '@/lib/cards/resolvePresets'
import { mapProductToVisual } from '@/lib/cards/productMapper'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Product {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number | string
  unitsPerCase: number
  imageUrl?: string | null
  backgroundColor?: string | null
  backgroundGradient?: string | null
  featured?: boolean
  seasonal?: boolean
  newArrival?: boolean
  trending?: boolean
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  // Visual preset fields
  gradientPresetId?: string | number | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  splashOverlay?: string | null
  seasonalStart?: string | null
  seasonalEnd?: string | null
  seasonalTheme?: string | null
  badgeText?: string | null
  badgeColor?: string | null
  cardTheme?: 'basic' | 'gradient' | 'splash' | null
}

interface ProductCardProps {
  product: Product
  index?: number
  mode?: 'default' | 'preview'
  onCardClick?: (product: Product) => void
}


export default function ProductCard({ product, index = 0, mode = 'default', onCardClick }: ProductCardProps) {
  const { addItem, increment, decrement, getQuantity } = useCartStore()
  const [imageError, setImageError] = useState(false)
  const isPreview = mode === 'preview'
  const quantity = isPreview ? 0 : getQuantity(product.id)

  // Map product to VisualProduct format and resolve preset
  const visualProduct = mapProductToVisual(
    product,
    product.category?.name,
    product.brand?.name
  )
  const resolvedPreset = resolveVisualPreset(visualProduct)
  const appliedTheme = applyCardTheme(resolvedPreset)

  // Build background style object
  const backgroundStyle = appliedTheme.background_classes
    ? {}
    : { background: appliedTheme.background }

  const priceValue = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: priceValue,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    })
  }

  const handleIncrement = () => {
    increment(product.id)
  }

  const handleDecrement = () => {
    decrement(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.1, 0.5),
      }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden rounded-2xl
        ${appliedTheme.background_classes || ''}
        ${appliedTheme.border_classes}
        ${appliedTheme.shadow_classes}
        ${appliedTheme.glow_classes || ''}
        ${appliedTheme.text_color}
        transition-all duration-500
        hover:shadow-2xl
      `}
      style={backgroundStyle}
    >
      {/* Layer 3: Splash Overlay (if enabled) */}
      {appliedTheme.splash_overlay_url && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `url(${appliedTheme.splash_overlay_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'screen',
            opacity: 0.7,
          }}
        />
      )}

      {/* Layer 2: Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      {/* Layer 1: Hover Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]" />

      {/* Layer 0: Content Container */}
      <div className="relative p-6 z-[3]">
        {/* Badges (from resolved preset) */}
        {(appliedTheme.badges.featured || appliedTheme.badges.seasonal || appliedTheme.badges.new || appliedTheme.badges.trending || product.badgeText) && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {appliedTheme.badges.featured && (
              <span className="px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-black">
                FEATURED
              </span>
            )}
            {appliedTheme.badges.seasonal && (
              <span className="px-2 py-1 bg-rose-300 text-rose-900 rounded-full text-xs font-black">
                SEASONAL
              </span>
            )}
            {appliedTheme.badges.new && (
              <span className="px-2 py-1 bg-emerald-400 text-emerald-900 rounded-full text-xs font-black">
                NEW
              </span>
            )}
            {appliedTheme.badges.trending && (
              <span className="px-2 py-1 bg-purple-400 text-purple-900 rounded-full text-xs font-black">
                TRENDING
              </span>
            )}
            {product.badgeText && (
              <span
                className="px-3 py-1 rounded-full text-xs font-black text-white animate-pulse"
                style={{
                  backgroundColor: product.badgeColor || '#EF4444',
                }}
              >
                {product.badgeText}
              </span>
            )}
          </div>
        )}

        {/* Layer 4: Product Image Container */}
        <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm shadow-inner relative">
          {/* Radial gradient tint */}
          {product.backgroundColor && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${product.backgroundColor}88 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Product Image */}
          {!imageError && product.imageUrl ? (
            <img
              src={getPublicImageUrl(product.imageUrl)}
              alt={product.name}
              className="relative w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 drop-shadow-2xl"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* Layer 5: Product Info */}
        <div className={`space-y-3 ${appliedTheme.text_color}`}>
          {/* Product Name */}
          <h3 className="text-xl font-bold line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm line-clamp-2 opacity-80">
              {product.description}
            </p>
          )}

          {/* Units Info */}
          <p className="text-xs opacity-70">
            {product.unitsPerCase} units per case
          </p>

          {/* Category/Brand (if available) */}
          {(product.category || product.brand) && (
            <div className="text-xs opacity-60 space-y-1">
              {product.category && (
                <div>Category: {product.category.name}</div>
              )}
              {product.brand && (
                <div>Brand: {product.brand.name}</div>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="pt-3 border-t border-gray-300/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold">
                  ${priceValue.toFixed(2)}
                </p>
                <p className="text-xs opacity-70">per case</p>
              </div>
            </div>

            {/* Layer 6: Add to Cart Button */}
            {isPreview ? (
              <div className="text-center py-2 text-xs text-gray-500 italic">
                Preview Mode
              </div>
            ) : quantity > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-gray-300/50 rounded-xl bg-white/20 backdrop-blur-sm flex-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDecrement}
                    className="px-3 py-2 hover:bg-white/20 transition-colors rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    −
                  </motion.button>
                  <span className="px-3 py-2 text-sm font-medium min-w-[2ch] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleIncrement}
                    className="px-3 py-2 hover:bg-white/20 transition-colors rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    +
                  </motion.button>
                </div>
                {onCardClick && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCardClick(product)}
                    className="px-3 py-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Edit
                  </motion.button>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="relative w-full py-3 px-4 overflow-hidden rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                }}
              >
                {/* Gradient swap on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
                  }}
                />
                <span className="relative">Add to Cart</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

