'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

// Types
interface CatalogProduct {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  imageUrl?: string
  unitsPerCase: number
  inStock: boolean
  brand?: { id: string; name: string }
  category?: { id: string; name: string }
}

interface CatalogBlock {
  id: string
  type: 'HERO' | 'PRODUCT_GRID' | 'PRODUCT_CARDS' | 'BANNER' | 'CATEGORY_ROW' | 'PROMO_SECTION' | 'RACK_BUNDLE' | 'VENDOR_SPOTLIGHT' | 'CASE_DEAL' | 'NEW_ARRIVALS' | 'QUICK_REORDER' | 'BULK_BUILDER' | 'SEASONAL_THEME' | 'BRAND_SHOWCASE'
  title: string | null
  subtitle: string | null
  badgeText: string | null
  ctaText: string | null
  ctaLink: string | null
  position: number
  config: Record<string, unknown>
  products: { id: string; productId: string; displayOrder: number; product: CatalogProduct }[]
}

interface CatalogSettings {
  backgroundGradient: string
  backgroundPattern?: string | null
  patternOpacity?: number
  patternSize?: string | null
  primaryColor?: string
  secondaryColor?: string
  animation?: string | null
  glowEffect?: boolean
  particleEffect?: string | null
}

// Product Image with fallback
function ProductImage({ src, alt, className, style }: { src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 ${className}`} style={style}>
        <Package className="w-12 h-12 text-slate-600" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setError(true)} loading="lazy" />
}

// Default hero gradient
const DEFAULT_HERO_GRADIENT = 'linear-gradient(135deg, #1a472a 0%, #d97706 50%, #dc2626 100%)'

// Hero Block Component - Adobada-style design
function HeroBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const products = block.products.map(p => p.product) || []

  // Get gradient from block config or use default
  const gradient = (block.config as { gradient?: string }).gradient || DEFAULT_HERO_GRADIENT

  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => setCurrentIndex((i) => (i + 1) % products.length), 5000)
    return () => clearInterval(timer)
  }, [products.length])

  if (products.length === 0) return null
  const product = products[currentIndex]
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const pricePerUnit = product.unitsPerCase > 0 ? price / product.unitsPerCase : price
  const casePrice = price

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl" style={{ background: gradient }}>
      {/* Decorative overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Radial glow behind product */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />

      <div className="relative flex flex-col md:flex-row items-center min-h-[420px] px-6 md:px-12 lg:px-16 py-10">
        {/* Navigation arrows */}
        {products.length > 1 && (
          <button
            onClick={() => setCurrentIndex((i) => (i - 1 + products.length) % products.length)}
            className="absolute left-3 md:left-6 z-10 p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}

        {/* Product Image */}
        <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 flex-shrink-0 flex items-center justify-center">
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent rounded-full blur-2xl scale-110" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full h-full flex items-center justify-center relative z-10"
            >
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="flex-1 text-center md:text-left max-w-xl mt-6 md:mt-0 md:ml-10 lg:ml-14">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-slate-900 font-bold text-sm mb-4 shadow-lg"
          >
            <span className="text-base">🔥</span>
            <span className="uppercase tracking-wide">{block.badgeText || 'HOT DEAL'}</span>
          </motion.div>

          {/* Product Name */}
          <motion.h2
            key={`name-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg"
          >
            {product.name}
          </motion.h2>

          {/* Description */}
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-base md:text-lg mb-6 max-w-md"
          >
            {product.description || `${product.unitsPerCase} units per case • Mexican snack`}
          </motion.p>

          {/* Pricing */}
          <div className="flex flex-wrap items-end gap-4 mb-6 justify-center md:justify-start">
            <div>
              <p className="text-white/50 text-sm line-through mb-1">${(pricePerUnit * 1.05).toFixed(2)} / each</p>
              <p className="text-white text-3xl md:text-4xl font-black">
                ${pricePerUnit.toFixed(2)}
                <span className="text-lg md:text-xl font-medium ml-1">/ each</span>
              </p>
              <p className="text-amber-300 text-sm mt-1">${casePrice.toFixed(2)} per case of {product.unitsPerCase}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg border border-red-400/30">
              <p className="text-white font-black text-xl">-5%</p>
              <p className="text-red-100 text-xs uppercase tracking-wide">Save Now</p>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={() => onAddToCart(product, 1)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-amber-50 inline-flex items-center gap-3 text-lg shadow-xl transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span>ADD TO CART</span>
          </motion.button>
        </div>

        {/* Navigation arrow right */}
        {products.length > 1 && (
          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % products.length)}
            className="absolute right-3 md:right-6 z-10 p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}
      </div>

      {/* Pagination dots */}
      {products.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-white w-8 shadow-lg'
                  : 'bg-white/40 w-2.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 🔥 DSD Showcase Product Card - Tap to Select, Glowing Borders
function ProductCard({ product, style, onAddToCart, cardStyle }: { product: CatalogProduct; style?: string; onAddToCart: (p: CatalogProduct, q: number) => void; cardStyle?: Record<string, unknown> }) {
  const [isSelected, setIsSelected] = useState(false)
  const [orderMode, setOrderMode] = useState<'case' | 'half' | 'pieces'>('case')
  const [quantity, setQuantity] = useState(1)

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const unitsPerCase = product.unitsPerCase || 24
  const pricePerUnit = unitsPerCase > 0 ? price / unitsPerCase : price
  const halfCasePrice = price / 2
  const halfCaseUnits = Math.floor(unitsPerCase / 2)

  // Calculate display price and quantity label based on mode
  const getDisplayInfo = () => {
    switch (orderMode) {
      case 'case':
        return { price: price, label: 'Case', shortLabel: 'case', units: unitsPerCase }
      case 'half':
        return { price: halfCasePrice, label: '½ Case', shortLabel: '½', units: halfCaseUnits }
      case 'pieces':
        return { price: pricePerUnit, label: 'Pc', shortLabel: 'pc', units: 1 }
    }
  }
  const displayInfo = getDisplayInfo()

  // Card styling from block config - with better defaults
  const cardBg = (cardStyle?.cardBg as string) || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
  const cardImageBg = (cardStyle?.cardImageBg as string) || 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
  const cardBorderColor = (cardStyle?.cardBorderColor as string) || '#334155'
  const cardAccentColor = (cardStyle?.cardAccentColor as string) || '#ef4444'
  const cardImageEffect = (cardStyle?.cardImageEffect as string) || ''
  const cardTextLight = (cardStyle?.cardTextLight as boolean) !== false // Default to light text for dark cards
  const cardGlowColor = (cardStyle?.cardGlowColor as string) || cardAccentColor
  const cardBackdropUrl = (cardStyle?.cardBackdropUrl as string) || '' // Custom product backdrop image

  // Secret mode toggle - tap on "Case" text to cycle
  const cycleOrderMode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (orderMode === 'case') setOrderMode('half')
    else if (orderMode === 'half') setOrderMode('pieces')
    else setOrderMode('case')
  }

  const handleCardClick = () => {
    if (!product.inStock) return
    if (!isSelected) {
      setIsSelected(true)
      onAddToCart(product, quantity)
    }
  }

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newQty = Math.max(0, quantity + delta)
    if (newQty === 0) {
      setIsSelected(false)
      setQuantity(1)
      onAddToCart(product, -quantity) // Remove all
    } else {
      const qtyDelta = newQty - quantity
      setQuantity(newQty)
      onAddToCart(product, qtyDelta)
    }
  }

  // Glow animation styles - clean border glow when selected
  const glowStyle = isSelected ? {
    boxShadow: `0 0 25px ${cardGlowColor}70, 0 0 50px ${cardGlowColor}40`,
    borderColor: cardAccentColor,
  } : {}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300`}
      style={{
        background: cardBg,
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: isSelected ? cardAccentColor : cardBorderColor,
        ...glowStyle,
      }}
    >
      {/* PRODUCT IMAGE - BIGGER SHOWCASE STYLE */}
      <div
        className="relative h-56 overflow-hidden flex items-center justify-center p-4"
        style={{
          background: cardBackdropUrl ? `url(${cardBackdropUrl}) center/cover` : cardImageBg
        }}
      >
        {/* Subtle glow behind product when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at center, ${cardAccentColor}50 0%, transparent 60%)`
            }}
          />
        )}

        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className={`max-h-full max-w-full object-contain transition-all duration-500 z-10 ${
            isSelected ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{
            filter: cardImageEffect || (isSelected ? `drop-shadow(0 0 20px ${cardAccentColor}70)` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'),
          }}
        />
      </div>

      {/* Product Info - Clean & Minimal */}
      <div className="p-3" style={{ background: cardBg.includes('gradient') ? 'transparent' : cardBg }}>
        {/* Product Name */}
        <h3 className={`font-bold text-sm mb-1 line-clamp-2 leading-tight ${cardTextLight ? 'text-white' : 'text-slate-900'}`}>
          {product.name}
        </h3>

        {/* Price Row - with secret mode toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-xl ${cardTextLight ? 'text-white' : 'text-slate-900'}`}>
              ${displayInfo.price.toFixed(2)}
            </span>
            {/* Secret mode toggle - tap to cycle case/half/pieces */}
            <button
              onClick={cycleOrderMode}
              className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                cardTextLight
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              /{displayInfo.label}
            </button>
          </div>

          {/* Units per case indicator */}
          <span className={`text-[10px] ${cardTextLight ? 'text-white/40' : 'text-slate-400'}`}>
            {unitsPerCase}ct
          </span>
        </div>
      </div>

      {/* Quantity Controls - Clean Panda Express Style */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-6 py-3 px-4 bg-white/5">
              {/* Minus Button - Round */}
              <button
                onClick={(e) => handleQuantityChange(-1, e)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl transition-all hover:scale-110 active:scale-95 border-2"
                style={{
                  borderColor: cardAccentColor,
                  color: cardAccentColor,
                  background: 'transparent'
                }}
              >
                −
              </button>

              {/* Quantity Display - Bold Number */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg text-white"
                style={{ background: cardAccentColor }}
              >
                {quantity}
              </div>

              {/* Plus Button - Round */}
              <button
                onClick={(e) => handleQuantityChange(1, e)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl transition-all hover:scale-110 active:scale-95 border-2"
                style={{
                  borderColor: cardAccentColor,
                  color: cardAccentColor,
                  background: 'transparent'
                }}
              >
                +
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Out of Stock Overlay */}
      {!product.inStock && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-red-600/80 text-white font-bold text-sm">
            Out of Stock
          </span>
        </div>
      )}
    </motion.div>
  )
}

// Helper to extract card style from block config
function getCardStyleFromBlock(block: CatalogBlock) {
  return {
    cardBg: block.config.cardBg,
    cardImageBg: block.config.cardImageBg,
    cardBorderColor: block.config.cardBorderColor,
    cardAccentColor: block.config.cardAccentColor,
    cardImageEffect: block.config.cardImageEffect,
    cardTextLight: block.config.cardTextLight,
    cardGlowColor: block.config.cardGlowColor,
    cardShowBrand: block.config.cardShowBrand,
    cardShowCategory: block.config.cardShowCategory,
    cardCompact: block.config.cardCompact,
    cardBackdropUrl: block.config.cardBackdropUrl, // Custom product backdrop image
  }
}

// Product Grid Block
function ProductGridBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const columns = (block.config as { columns?: number }).columns || 4
  const cardStyle = getCardStyleFromBlock(block)

  // Block background settings
  const blockBackgroundUrl = (block.config.blockBackgroundUrl as string) || ''
  const blockBackgroundPosition = (block.config.blockBackgroundPosition as string) || 'center'
  const blockBackgroundSize = (block.config.blockBackgroundSize as string) || 'cover'

  const sectionStyle = blockBackgroundUrl ? {
    backgroundImage: `url(${blockBackgroundUrl})`,
    backgroundPosition: blockBackgroundPosition,
    backgroundSize: blockBackgroundSize,
    backgroundRepeat: 'no-repeat',
  } : {}

  return (
    <section
      className="mb-8 rounded-2xl overflow-hidden relative"
      style={sectionStyle}
    >
      {/* Overlay for readability if background exists */}
      {blockBackgroundUrl && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      <div className={`relative z-10 ${blockBackgroundUrl ? 'p-6' : ''}`}>
        {block.title && (
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">{block.title}</h2>
            {block.badgeText && <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-emerald-600">{block.badgeText}</span>}
            <span className="text-slate-400 text-sm">({products.length})</span>
          </div>
        )}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Banner Block
function BannerBlock({ block }: { block: CatalogBlock }) {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-900/80 to-red-800/80 border border-red-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥦</span>
          <div>
            <h3 className="text-white font-bold">{block.title || "Don't forget to order food!"}</h3>
            <p className="text-white/70 text-sm">{block.subtitle || 'Browse our authentic Mexican menu'}</p>
          </div>
        </div>
        {block.ctaText && (
          <a href={block.ctaLink || '#'} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">
            {block.ctaText}
          </a>
        )}
      </div>
    </div>
  )
}

// Promo Section Block
function PromoSectionBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)

  // Block background settings
  const blockBackgroundUrl = (block.config.blockBackgroundUrl as string) || ''
  const blockBackgroundPosition = (block.config.blockBackgroundPosition as string) || 'center'
  const blockBackgroundSize = (block.config.blockBackgroundSize as string) || 'cover'

  const hasCustomBackground = !!blockBackgroundUrl
  const sectionStyle = hasCustomBackground ? {
    backgroundImage: `url(${blockBackgroundUrl})`,
    backgroundPosition: blockBackgroundPosition,
    backgroundSize: blockBackgroundSize,
    backgroundRepeat: 'no-repeat',
  } : {}

  return (
    <section
      className={`mb-8 p-6 rounded-2xl relative overflow-hidden ${!hasCustomBackground ? 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/30' : ''}`}
      style={sectionStyle}
    >
      {/* Overlay for readability if background exists */}
      {hasCustomBackground && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-400">{block.title || 'Special Offers'}</h2>
            {block.subtitle && <p className="text-amber-200/70">{block.subtitle}</p>}
          </div>
          {block.badgeText && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-900 font-bold text-sm">
              {block.badgeText}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Rack Bundle Block - DSD Feature
function RackBundleBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    rackImageUrl?: string
    bundleDiscount?: number
    showOneClickOrder?: boolean
    backgroundColor?: string
  }

  const handleOrderAll = () => {
    products.forEach(product => onAddToCart(product, 1))
  }

  const totalPrice = products.reduce((sum, p) => sum + (typeof p.price === 'string' ? parseFloat(p.price) : p.price), 0)
  const discountedPrice = totalPrice * (1 - (config.bundleDiscount || 0) / 100)

  return (
    <section className="mb-8 rounded-3xl overflow-hidden" style={{ backgroundColor: config.backgroundColor || '#1a1a2e' }}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Rack Image */}
          {config.rackImageUrl && (
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800">
                <img src={config.rackImageUrl} alt="Rack Display" className="w-full h-full object-cover" />
                {config.bundleDiscount && config.bundleDiscount > 0 && (
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-red-600 text-white font-black text-lg">
                    -{config.bundleDiscount}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{block.title || 'Rack Display Bundle'}</h2>
                {block.subtitle && <p className="text-slate-400">{block.subtitle}</p>}
              </div>
              {config.showOneClickOrder && products.length > 0 && (
                <button
                  onClick={handleOrderAll}
                  className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order All (${discountedPrice.toFixed(2)})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Case Deal Block - DSD Feature
function CaseDealBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    minCases?: number
    discountPercent?: number
    dealBadge?: string
  }

  return (
    <section className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-700/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-sm">
              {config.dealBadge || 'VOLUME DEAL'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">{block.title || 'Case Deal'}</h2>
          <p className="text-orange-300">
            Buy {config.minCases || 3}+ cases and save {config.discountPercent || 10}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-orange-400">-{config.discountPercent || 10}%</p>
          <p className="text-orange-200 text-sm">on {config.minCases || 3}+ cases</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  )
}

// Vendor Spotlight Block - DSD Feature
function VendorSpotlightBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    vendorName?: string
    vendorLogoUrl?: string
    showTopSellers?: boolean
  }

  return (
    <section className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
      {/* Vendor Header */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-6">
        {config.vendorLogoUrl && (
          <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center">
            <img src={config.vendorLogoUrl} alt={config.vendorName || 'Vendor'} className="max-h-full max-w-full object-contain" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-white">{config.vendorName || block.title || 'Featured Vendor'}</h2>
          {block.subtitle && <p className="text-slate-400">{block.subtitle}</p>}
        </div>
        {config.showTopSellers && (
          <span className="ml-auto px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/30">
            ⭐ Top Sellers
          </span>
        )}
      </div>

      {/* Products */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Bulk Builder Block - DSD Feature
function BulkBuilderBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    minItems?: number
    mixMatchDiscount?: number
  }

  return (
    <section className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-700/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏗️</span>
            <h2 className="text-2xl font-bold text-white">{block.title || 'Bulk Builder'}</h2>
          </div>
          <p className="text-blue-300">
            Mix & Match any {config.minItems || 6}+ items for {config.mixMatchDiscount || 5}% off
          </p>
        </div>
        <div className="px-5 py-3 rounded-xl bg-blue-600/30 border border-blue-500/30">
          <p className="text-blue-200 text-sm">Mix & Match Discount</p>
          <p className="text-3xl font-black text-blue-400">-{config.mixMatchDiscount || 5}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  )
}

// Brand Showcase Block - DSD Feature
function BrandShowcaseBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    brandLogoUrl?: string
    brandColor?: string
  }

  return (
    <section className="mb-8 rounded-3xl overflow-hidden">
      {/* Brand Banner */}
      <div
        className="p-6 flex items-center justify-center"
        style={{ backgroundColor: config.brandColor || '#1e293b' }}
      >
        {config.brandLogoUrl ? (
          <img src={config.brandLogoUrl} alt="Brand" className="h-16 object-contain" />
        ) : (
          <h2 className="text-2xl font-bold text-white">{block.title}</h2>
        )}
      </div>

      {/* Products Carousel */}
      <div className="p-6 bg-slate-900">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

// New Arrivals Block - DSD Feature
function NewArrivalsBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const products = block.products.map(p => p.product) || []
  const cardStyle = getCardStyleFromBlock(block)

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🆕</span>
        <h2 className="text-2xl font-bold text-white">{block.title || 'New Arrivals'}</h2>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm font-bold animate-pulse">
          JUST IN
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <div className="absolute -top-2 -right-2 z-10 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
              NEW
            </div>
            <ProductCard product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Block Renderer
function BlockRenderer({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  switch (block.type) {
    case 'HERO': return <HeroBlock block={block} onAddToCart={onAddToCart} />
    case 'PRODUCT_GRID': return <ProductGridBlock block={block} onAddToCart={onAddToCart} />
    case 'PRODUCT_CARDS': return <ProductGridBlock block={block} onAddToCart={onAddToCart} />
    case 'BANNER': return <BannerBlock block={block} />
    case 'PROMO_SECTION': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} />
    case 'CATEGORY_ROW': return <ProductGridBlock block={block} onAddToCart={onAddToCart} />
    // DSD Block Types
    case 'RACK_BUNDLE': return <RackBundleBlock block={block} onAddToCart={onAddToCart} />
    case 'VENDOR_SPOTLIGHT': return <VendorSpotlightBlock block={block} onAddToCart={onAddToCart} />
    case 'CASE_DEAL': return <CaseDealBlock block={block} onAddToCart={onAddToCart} />
    case 'NEW_ARRIVALS': return <NewArrivalsBlock block={block} onAddToCart={onAddToCart} />
    case 'QUICK_REORDER': return <ProductGridBlock block={block} onAddToCart={onAddToCart} />
    case 'BULK_BUILDER': return <BulkBuilderBlock block={block} onAddToCart={onAddToCart} />
    case 'SEASONAL_THEME': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} />
    case 'BRAND_SHOWCASE': return <BrandShowcaseBlock block={block} onAddToCart={onAddToCart} />
    default: return null
  }
}

// Cart Drawer
function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove, totals }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 z-50 flex flex-col border-l border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 bg-slate-800 rounded-xl p-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
                        <ProductImage src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain p-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                        <p className="text-lg font-bold text-amber-500">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-slate-700 rounded-lg overflow-hidden">
                            <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1.5"><Minus className="w-3 h-3 text-white" /></button>
                            <span className="px-3 text-sm text-white font-medium">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1.5"><Plus className="w-3 h-3 text-white" /></button>
                          </div>
                          <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-700">
                <div className="flex justify-between mb-4">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-2xl font-bold text-amber-500">${totals.subtotal.toFixed(2)}</span>
                </div>
                <button className="w-full py-4 rounded-xl font-bold text-lg bg-amber-500 text-slate-900 hover:bg-amber-400">Checkout</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main Catalog Component
export default function CatalogContent() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { add, items, updateQty, remove, totals, getCartCount } = useCart()

  // Fetch catalog settings (background gradient, pattern) - auto-refresh every 3 seconds for live preview
  const { data: settingsData } = useQuery<{ data: CatalogSettings }>({
    queryKey: ['catalog-settings'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/settings')
      if (!res.ok) return { data: { backgroundGradient: 'linear-gradient(180deg, #0f3d0f 0%, #1a4d1a 50%, #0d2e0d 100%)' } }
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  })

  // Fetch catalog blocks - auto-refresh every 3 seconds for live preview
  const { data: blocksData, isLoading, error } = useQuery<{ data: CatalogBlock[] }>({
    queryKey: ['catalog-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/blocks')
      if (!res.ok) throw new Error('Failed to fetch blocks')
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  })

  const settings = settingsData?.data || { backgroundGradient: 'linear-gradient(180deg, #0f3d0f 0%, #1a4d1a 50%, #0d2e0d 100%)' }
  const blocks = blocksData?.data || []

  const handleAddToCart = (product: CatalogProduct, quantity: number) => {
    add({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      imageUrl: product.imageUrl || '/placeholder-product.png',
      quantity,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: settings.backgroundGradient }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading catalog...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: settings.backgroundGradient }}>
        <div className="text-center">
          <p className="text-red-400 text-lg">Failed to load catalog</p>
          <p className="text-slate-500 mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ background: settings.backgroundGradient }}>
      {/* Background Pattern Overlay - CSS gradient patterns */}
      {settings.backgroundPattern && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: settings.backgroundPattern,
            backgroundSize: settings.patternSize || '40px 40px',
            backgroundRepeat: 'repeat',
            opacity: settings.patternOpacity || 0.1,
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* Glow Effect Overlay */}
      {settings.glowEffect && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${settings.primaryColor || '#d4a853'}40 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${settings.secondaryColor || '#059669'}30 0%, transparent 50%)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Animation Overlay - GPU-optimized */}
      {settings.animation && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            settings.animation === 'pulse' ? 'animate-pulse-glow' :
            settings.animation === 'shimmer' ? 'animate-shimmer' :
            settings.animation === 'gradient-shift' ? 'animate-gradient-shift' :
            settings.animation === 'aurora' ? 'animate-aurora' : ''
          }`}
          style={{
            background: settings.animation === 'shimmer'
              ? `radial-gradient(ellipse at 50% 0%, ${settings.primaryColor || '#d4a853'}30 0%, transparent 70%)`
              : settings.animation === 'aurora'
              ? `linear-gradient(135deg, ${settings.primaryColor || '#d4a853'}15 0%, transparent 40%, ${settings.secondaryColor || '#059669'}15 60%, transparent 100%)`
              : settings.animation === 'gradient-shift'
              ? `radial-gradient(ellipse at 30% 50%, ${settings.primaryColor || '#d4a853'}20 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, ${settings.secondaryColor || '#059669'}20 0%, transparent 50%)`
              : settings.animation === 'pulse'
              ? `radial-gradient(circle at 50% 30%, ${settings.primaryColor || '#d4a853'}25 0%, transparent 60%)`
              : undefined
          }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <h1 className="text-lg md:text-xl font-bold text-white">Azteka DSD - Grocery Store</h1>
              <p className="text-slate-400 text-xs md:text-sm">Fresh Produce & Pantry Staples</p>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <ShoppingCart className="w-6 h-6 text-white" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-amber-500 text-slate-900">
                  {getCartCount() > 9 ? '9+' : getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Render Blocks */}
      <main className="relative max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {blocks.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No blocks configured yet</h2>
            <p className="text-slate-400 mb-6">Go to the admin Menu Editor to build your catalog</p>
            <a href="/admin/block-builder" className="inline-block px-6 py-3 rounded-xl font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors">
              Open Block Builder
            </a>
          </div>
        ) : (
          blocks.sort((a, b) => a.position - b.position).map((block) => (
            <BlockRenderer key={block.id} block={block} onAddToCart={handleAddToCart} />
          ))
        )}
      </main>

      {/* Mobile Cart FAB */}
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl bg-amber-500 md:hidden">
        <ShoppingCart className="w-6 h-6 text-slate-900" />
        {getCartCount() > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-slate-900 text-amber-500">
            {getCartCount() > 9 ? '9+' : getCartCount()}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={items} onUpdateQuantity={updateQty} onRemove={remove} totals={totals} />
    </div>
  )
}
