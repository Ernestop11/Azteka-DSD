'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, Package, ChevronLeft, ChevronRight, Box } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getPublicImageUrl } from '@/lib/imageUrl'

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

interface BusinessSettings {
  name: string
  phone: string
  email: string
  website: string
}

// Product Image with fallback - v2.0 style (no overlapping squares)
function ProductImage({ src, alt, className, style }: { src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-transparent relative z-10 ${className || ''}`} style={style}>
        <Package className="w-12 h-12 text-slate-600 relative z-10" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={`${className || ''} relative z-10`} style={style} onError={() => setError(true)} loading="lazy" />
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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-8 shadow-2xl" style={{ background: gradient }}>
      {/* Decorative overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Radial glow behind product - smaller on mobile */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-white/15 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />

      <div className="relative flex flex-col md:flex-row items-center min-h-[320px] sm:min-h-[380px] md:min-h-[420px] px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10">
        {/* Navigation arrows */}
        {products.length > 1 && (
          <button
            onClick={() => setCurrentIndex((i) => (i - 1 + products.length) % products.length)}
            className="absolute left-2 sm:left-3 md:left-6 z-10 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}

        {/* Product Image - Smaller on mobile */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 flex-shrink-0 flex items-center justify-center">
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-gradient-radial from-white/25 to-transparent rounded-full blur-xl sm:blur-2xl scale-110" />
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
                src={getPublicImageUrl(product.imageUrl)}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Product Info - Compact on mobile */}
        <div className="flex-1 text-center md:text-left max-w-xl mt-3 sm:mt-6 md:mt-0 md:ml-10 lg:ml-14">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500 text-slate-900 font-bold text-xs sm:text-sm mb-2 sm:mb-4 shadow-lg"
          >
            <span className="text-sm sm:text-base">🔥</span>
            <span className="uppercase tracking-wide">{block.badgeText || 'HOT DEAL'}</span>
          </motion.div>

          {/* Product Name */}
          <motion.h2
            key={`name-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-3 leading-tight drop-shadow-lg"
          >
            {product.name}
          </motion.h2>

          {/* Description - Hidden on mobile */}
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden sm:block text-white/80 text-sm md:text-lg mb-4 md:mb-6 max-w-md"
          >
            {product.description || `${product.unitsPerCase} units per case • Mexican snack`}
          </motion.p>

          {/* Pricing - Compact on mobile */}
          <div className="flex flex-wrap items-end gap-2 sm:gap-4 mb-3 sm:mb-6 justify-center md:justify-start">
            <div>
              <p className="text-white/50 text-xs sm:text-sm line-through mb-0.5 sm:mb-1">${(pricePerUnit * 1.05).toFixed(2)} / each</p>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black">
                ${pricePerUnit.toFixed(2)}
                <span className="text-sm sm:text-lg md:text-xl font-medium ml-1">/ each</span>
              </p>
              <p className="text-amber-300 text-xs sm:text-sm mt-0.5 sm:mt-1">${casePrice.toFixed(2)} per case of {product.unitsPerCase}</p>
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg border border-red-400/30">
              <p className="text-white font-black text-base sm:text-xl">-5%</p>
              <p className="text-red-100 text-[10px] sm:text-xs uppercase tracking-wide">Save Now</p>
            </div>
          </div>

          {/* CTA Button - Premium Hero Style */}
          <motion.button
            onClick={() => onAddToCart(product, 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-900 inline-flex items-center gap-3 text-lg sm:text-xl shadow-2xl transition-all overflow-hidden"
            style={{
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), 0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
            <span className="relative z-10 uppercase tracking-wide">Add to Cart</span>
          </motion.button>
        </div>

        {/* Navigation arrow right */}
        {products.length > 1 && (
          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % products.length)}
            className="absolute right-2 sm:right-3 md:right-6 z-10 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}
      </div>

      {/* Pagination dots */}
      {products.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
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

// Bulk Order Quick Picks
const BULK_QUANTITIES = [5, 10, 15, 20, 25, 50]

// 🔥 DSD Showcase Product Card - Tap to Select, Glowing Borders, Long-Press for Bulk
function ProductCard({ product, style, onAddToCart, cardStyle, cartQuantity = 0, onSetQuantity }: { product: CatalogProduct; style?: string; onAddToCart: (p: CatalogProduct, q: number) => void; cardStyle?: Record<string, unknown>; cartQuantity?: number; onSetQuantity?: (productId: string, qty: number) => void }) {
  // Derive isSelected from cart quantity - if in cart, it's selected
  const isInCart = cartQuantity > 0
  const [showControls, setShowControls] = useState(isInCart)
  const [orderMode, setOrderMode] = useState<'case' | 'half' | 'pieces'>('case')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [modalQuantity, setModalQuantity] = useState(1) // Local modal qty for preview
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  // Sync showControls with cart state
  useEffect(() => {
    setShowControls(isInCart)
  }, [isInCart])

  // Long press handlers for bulk order modal
  const handleTouchStart = () => {
    isLongPress.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPress.current = true
      // Initialize modal quantity from cart or default to 1
      setModalQuantity(cartQuantity > 0 ? cartQuantity : 1)
      // Clear any existing auto-close timer
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
        autoCloseTimerRef.current = null
      }
      setShowBulkModal(true)
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50)
    }, 500) // 500ms for long press
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const handleBulkSelect = (qty: number) => {
    // Update modal preview immediately
    setModalQuantity(qty)

    // Save to cart
    if (onSetQuantity) {
      onSetQuantity(product.id, qty)
    } else {
      onAddToCart(product, qty)
    }
    setShowControls(true)

    // Clear any existing auto-close timer
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
    }

    // Start 3-second auto-close timer
    autoCloseTimerRef.current = setTimeout(() => {
      setShowBulkModal(false)
    }, 3000)
  }

  // Cleanup auto-close timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  // Use cart quantity as the displayed quantity
  const displayQuantity = cartQuantity > 0 ? cartQuantity : 1

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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Don't trigger click if it was a long press
    if (isLongPress.current) {
      isLongPress.current = false
      return
    }
    if (!product.inStock) return

    if (!showControls) {
      // First tap - show controls and add 1 to cart
      setShowControls(true)
      onAddToCart(product, 1)
    }
    // Note: Deselect is handled by tapping the image area (handleImageTap)
  }

  // TAP TO DESELECT - Tapping the image area when selected removes from cart
  const handleImageTap = (e: React.MouseEvent) => {
    // Only handle deselect when already in cart - otherwise let it bubble to card click
    if (!showControls) return

    e.stopPropagation() // Only stop propagation when we're actually handling deselect

    // Remove from cart entirely
    setShowControls(false)
    if (onSetQuantity) {
      onSetQuantity(product.id, 0)
    }
  }

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newQty = Math.max(0, cartQuantity + delta)
    if (newQty === 0) {
      // Remove from cart entirely
      setShowControls(false)
      if (onSetQuantity) {
        onSetQuantity(product.id, 0)
      }
    } else if (onSetQuantity) {
      // Use direct set quantity for cleaner cart management
      onSetQuantity(product.id, newQty)
    } else {
      // Fallback to delta-based add
      onAddToCart(product, delta)
    }
  }

  // Handle direct quantity input
  const handleQuantityEdit = () => {
    setEditValue(String(displayQuantity))
    setIsEditing(true)
  }

  const handleQuantitySubmit = () => {
    const newQty = parseInt(editValue) || 0
    setIsEditing(false)
    if (newQty === 0) {
      setShowControls(false)
      if (onSetQuantity) {
        onSetQuantity(product.id, 0)
      }
    } else if (onSetQuantity) {
      onSetQuantity(product.id, newQty)
    }
  }

  // OPTIMIZED: Simpler glow for better performance - no complex shadows
  const glowStyle = showControls ? {
    boxShadow: `0 0 12px ${cardGlowColor}60`,
    borderColor: cardAccentColor,
  } : {
    boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
  }

  return (
    <>
    {/* PERFORMANCE OPTIMIZED: Removed heavy Framer animations, using CSS transforms */}
    <div
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer flex flex-col active:scale-[0.98] transition-transform duration-100`}
      style={{
        background: cardBg,
        border: `2px solid ${showControls ? cardAccentColor : cardBorderColor}`,
        ...glowStyle,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        willChange: 'transform', // GPU acceleration hint
      }}
    >
      {/* PRODUCT IMAGE - v2.0 style: transparent background when image exists, shorter on mobile */}
      {/* TAP TO DESELECT: Tapping image area when selected removes from cart */}
      <div
        onClick={handleImageTap}
        className={`relative h-36 sm:h-44 md:h-52 overflow-hidden flex items-center justify-center p-2 sm:p-3 md:p-4 ${showControls ? 'cursor-pointer' : ''}`}
        style={{
          background: product.imageUrl
            ? `radial-gradient(ellipse at center, ${cardImageBg.replace('linear-gradient', '').includes('#') ? 'rgba(30,41,59,0.3)' : 'rgba(30,41,59,0.2)'} 0%, transparent 70%)`
            : (cardBackdropUrl ? `url(${cardBackdropUrl}) center/cover` : cardImageBg)
        }}
      >
        {/* Ambient glow behind product - always visible for premium look */}
        <div
          className="absolute inset-0 z-[8]"
          style={{
            background: showControls
              ? `radial-gradient(circle at center, ${cardAccentColor}40 0%, transparent 60%)`
              : `radial-gradient(ellipse at center bottom, rgba(255,255,255,0.08) 0%, transparent 50%)`
          }}
        />

        {product.imageUrl ? (
          <ProductImage
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className={`max-h-full max-w-full object-contain transition-all duration-500 relative z-10 ${
              showControls ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              filter: cardImageEffect || (showControls ? `drop-shadow(0 0 20px ${cardAccentColor}70)` : 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'),
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info - Clean & Minimal - Fixed height for alignment */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col" style={{ background: cardBg.includes('gradient') ? 'transparent' : cardBg }}>
        {/* Product Name - Fixed height container for consistent alignment */}
        <h3 className={`font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 leading-tight h-8 sm:h-10 ${cardTextLight ? 'text-white' : 'text-slate-900'}`}>
          {product.name}
        </h3>

        {/* Price Row - with 3D box toggle icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className={`font-black text-lg sm:text-xl ${cardTextLight ? 'text-white' : 'text-slate-900'}`}>
              ${displayInfo.price.toFixed(2)}
            </span>
            <span className={`text-[10px] sm:text-xs ${cardTextLight ? 'text-white/50' : 'text-slate-500'}`}>
              /{displayInfo.label}
            </span>
          </div>

          {/* 3D Box Icon Toggle - cycles case/half/pieces */}
          <button
            onClick={cycleOrderMode}
            className="relative p-1 rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{
              background: orderMode !== 'case' ? `${cardAccentColor}30` : 'rgba(255,255,255,0.1)',
              boxShadow: orderMode !== 'case'
                ? `0 2px 8px ${cardAccentColor}40, inset 0 1px 2px rgba(255,255,255,0.2)`
                : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)',
            }}
          >
            <Box
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                orderMode === 'case'
                  ? (cardTextLight ? 'text-white/50' : 'text-slate-400')
                  : 'text-white'
              }`}
              style={{
                filter: orderMode !== 'case' ? `drop-shadow(0 0 4px ${cardAccentColor})` : 'none'
              }}
            />
            {/* Mode indicator badge */}
            {orderMode !== 'case' && (
              <span
                className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full text-white"
                style={{ background: cardAccentColor }}
              >
                {orderMode === 'half' ? '½' : 'pc'}
              </span>
            )}
          </button>
        </div>

        {/* Units per case - smaller text below */}
        <span className={`text-[9px] sm:text-[10px] mt-0.5 ${cardTextLight ? 'text-white/40' : 'text-slate-400'}`}>
          {unitsPerCase} units/case
        </span>
      </div>

      {/* Quantity Controls - OPTIMIZED: No AnimatePresence, instant show/hide */}
      {showControls && (
        <div
          className="border-t-2"
          style={{ borderColor: cardAccentColor }}
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 sm:py-3 px-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
            {/* Minus Button */}
            <button
              onClick={(e) => handleQuantityChange(-1, e)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-2xl active:scale-90 border-2"
              style={{
                borderColor: cardAccentColor,
                color: cardAccentColor,
                background: 'white'
              }}
            >
              −
            </button>

            {/* Quantity Display - Tap to edit */}
            {isEditing ? (
              <input
                type="number"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleQuantitySubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuantitySubmit()
                  if (e.key === 'Escape') setIsEditing(false)
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-14 h-12 rounded-full text-center font-black text-2xl border-3"
                style={{
                  background: 'white',
                  color: cardAccentColor,
                  borderColor: cardAccentColor,
                  boxShadow: `0 0 15px ${cardAccentColor}`,
                  outline: 'none',
                }}
              />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleQuantityEdit() }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xl text-white active:scale-95"
                style={{ background: cardAccentColor }}
              >
                {displayQuantity}
              </button>
            )}

            {/* Plus Button */}
            <button
              onClick={(e) => handleQuantityChange(1, e)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-2xl active:scale-90 border-2"
              style={{
                borderColor: cardAccentColor,
                color: cardAccentColor,
                background: 'white'
              }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Out of Stock Banner */}
      {!product.inStock && (
        <div className="absolute top-0 left-0 right-0 h-36 sm:h-44 md:h-52 flex items-center justify-center pointer-events-none z-[15]">
          <div className="bg-red-600 text-white font-bold text-xs sm:text-sm px-8 sm:px-12 py-1.5 sm:py-2 -rotate-12 shadow-lg uppercase tracking-wide">
            Out of Stock
          </div>
        </div>
      )}
    </div>

    {/* Bulk Order Modal - Portal to body to prevent scroll issues */}
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end justify-center"
            onClick={() => setShowBulkModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

            {/* Modal Content - Fixed at bottom, no scroll issues */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md rounded-t-3xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, #1e293b 0%, #0f172a 100%)`,
                boxShadow: `0 -10px 60px ${cardAccentColor}30, 0 0 100px ${cardAccentColor}20`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowBulkModal(false)}
                className="absolute top-3 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Product Image with Glow - Same style as card */}
              <div className="px-6 pt-2 pb-3">
                <div
                  className="relative w-full aspect-square max-w-[220px] mx-auto rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: `radial-gradient(ellipse at center, ${cardAccentColor}20 0%, rgba(30,41,59,0.5) 50%, transparent 80%)`,
                    boxShadow: `0 0 40px ${cardAccentColor}40, inset 0 0 30px ${cardAccentColor}15`,
                    border: `2px solid ${cardAccentColor}40`,
                  }}
                >
                  {/* Animated glow pulse */}
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: `radial-gradient(circle at center, ${cardAccentColor}30 0%, transparent 60%)`,
                    }}
                  />
                  {product.imageUrl ? (
                    <ProductImage
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 relative z-10"
                      style={{
                        filter: `drop-shadow(0 0 25px ${cardAccentColor}60) drop-shadow(0 10px 20px rgba(0,0,0,0.5))`,
                      }}
                    />
                  ) : (
                    <Package className="w-20 h-20 text-slate-600" />
                  )}
                </div>

                {/* Product Info */}
                <div className="text-center mt-3">
                  <h3 className="font-bold text-white text-lg line-clamp-2 mb-1">{product.name}</h3>
                  <p className="font-black text-2xl" style={{ color: cardAccentColor }}>
                    ${price.toFixed(2)}
                    <span className="text-sm font-medium opacity-70">/case</span>
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{unitsPerCase} units per case</p>
                </div>
              </div>

              {/* Bottom Controls - Clean & Spacious */}
              <div
                className="bg-slate-900/95 border-t px-6 py-5 pb-safe"
                style={{ borderColor: `${cardAccentColor}30` }}
              >
                {/* Main +/- Controls with Qty Display */}
                <div className="flex items-center justify-center gap-6 mb-5">
                  <button
                    onClick={() => {
                      const newQty = Math.max(1, modalQuantity - 1)
                      handleBulkSelect(newQty)
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-3xl transition-all active:scale-90"
                    style={{
                      background: 'white',
                      color: cardAccentColor,
                      boxShadow: `0 0 20px ${cardAccentColor}40, 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)`,
                      border: `2px solid ${cardAccentColor}30`,
                    }}
                  >
                    −
                  </button>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white"
                    style={{
                      background: `linear-gradient(135deg, ${cardAccentColor} 0%, ${cardAccentColor}cc 100%)`,
                      boxShadow: `0 0 40px ${cardAccentColor}60, 0 0 80px ${cardAccentColor}30, inset 0 2px 4px rgba(255,255,255,0.2)`,
                      border: `2px solid ${cardAccentColor}`,
                    }}
                  >
                    {modalQuantity}
                  </div>

                  <button
                    onClick={() => handleBulkSelect(modalQuantity + 1)}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-3xl transition-all active:scale-90"
                    style={{
                      background: 'white',
                      color: cardAccentColor,
                      boxShadow: `0 0 20px ${cardAccentColor}40, 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)`,
                      border: `2px solid ${cardAccentColor}30`,
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Quick Bulk Buttons - 4 columns, cleaner */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[5, 10, 20, 50].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => handleBulkSelect(qty)}
                      className="py-2.5 rounded-xl font-bold text-base transition-all active:scale-95"
                      style={{
                        background: modalQuantity === qty
                          ? `linear-gradient(135deg, ${cardAccentColor} 0%, ${cardAccentColor}dd 100%)`
                          : 'rgba(255,255,255,0.08)',
                        color: 'white',
                        boxShadow: modalQuantity === qty
                          ? `0 0 15px ${cardAccentColor}50, 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`
                          : `0 0 8px ${cardAccentColor}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
                        border: `1px solid ${modalQuantity === qty ? cardAccentColor : `${cardAccentColor}20`}`,
                      }}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                {/* Cart Status - Always visible when qty selected */}
                <div
                  className="text-center py-3 rounded-xl mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${cardAccentColor}20 0%, ${cardAccentColor}10 100%)`,
                    border: `1px solid ${cardAccentColor}40`,
                    boxShadow: `0 0 20px ${cardAccentColor}15, inset 0 0 30px ${cardAccentColor}10`,
                  }}
                >
                  <p className="text-white font-semibold">
                    {modalQuantity} case{modalQuantity > 1 ? 's' : ''} = <span style={{ color: cardAccentColor, textShadow: `0 0 10px ${cardAccentColor}60` }}>${(price * modalQuantity).toFixed(2)}</span>
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">Auto-closing in 3 seconds...</p>
                </div>

                {/* Done Button */}
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white active:scale-98 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${cardAccentColor} 0%, ${cardAccentColor}cc 100%)`,
                    boxShadow: `0 0 25px ${cardAccentColor}50, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    border: `1px solid ${cardAccentColor}`,
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
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
function ProductGridBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
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
function PromoSectionBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Rack Bundle Block - DSD Feature
function RackBundleBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Case Deal Block - DSD Feature
function CaseDealBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
        ))}
      </div>
    </section>
  )
}

// Vendor Spotlight Block - DSD Feature
function VendorSpotlightBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Bulk Builder Block - DSD Feature
function BulkBuilderBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
        ))}
      </div>
    </section>
  )
}

// Brand Showcase Block - DSD Feature
function BrandShowcaseBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
      <div className="p-3 sm:p-4 md:p-6 bg-slate-900">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
          ))}
        </div>
      </div>
    </section>
  )
}

// New Arrivals Block - DSD Feature
function NewArrivalsBlock({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-bold">
              NEW
            </div>
            <ProductCard product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Block Renderer - Hide blocks with no products (except BANNER and HERO which may not need products)
function BlockRenderer({ block, onAddToCart, getQuantity, onSetQuantity }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void; getQuantity: (productId: string) => number; onSetQuantity: (productId: string, qty: number) => void }) {
  // Skip rendering product blocks that have no products
  const productsRequired = !['BANNER'].includes(block.type)
  if (productsRequired && (!block.products || block.products.length === 0)) {
    return null
  }

  switch (block.type) {
    case 'HERO': return <HeroBlock block={block} onAddToCart={onAddToCart} />
    case 'PRODUCT_GRID': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'PRODUCT_CARDS': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'BANNER': return <BannerBlock block={block} />
    case 'PROMO_SECTION': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'CATEGORY_ROW': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    // DSD Block Types
    case 'RACK_BUNDLE': return <RackBundleBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'VENDOR_SPOTLIGHT': return <VendorSpotlightBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'CASE_DEAL': return <CaseDealBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'NEW_ARRIVALS': return <NewArrivalsBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'QUICK_REORDER': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'BULK_BUILDER': return <BulkBuilderBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'SEASONAL_THEME': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
    case 'BRAND_SHOWCASE': return <BrandShowcaseBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} />
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
                        <ProductImage src={getPublicImageUrl(item.imageUrl)} alt={item.name} className="max-h-full max-w-full object-contain p-2" />
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
  const { add, items, updateQty, remove, totals, getCartCount, getQuantity, setQuantity } = useCart()

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

  // Fetch business settings (business name for header) - uses public endpoint
  // Same auto-refresh pattern as catalog blocks (every 3 seconds)
  const { data: businessData } = useQuery<BusinessSettings>({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/public')
      if (!res.ok) return { name: 'Azteka DSD', phone: '', email: '', website: '' }
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time updates (same as blocks)
    refetchIntervalInBackground: true, // Keep refreshing even when tab is in background
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
    // Convert price to number safely (handles Prisma Decimal, strings, etc.)
    let priceNum = 0
    if (product.price !== null && product.price !== undefined) {
      if (typeof product.price === 'number') {
        priceNum = product.price
      } else if (typeof product.price === 'string') {
        priceNum = parseFloat(product.price) || 0
      } else if (typeof product.price === 'object' && 'toNumber' in (product.price as object)) {
        priceNum = (product.price as { toNumber(): number }).toNumber()
      } else {
        priceNum = Number(product.price) || 0
      }
    }
    // Round to 2 decimal places to avoid floating point issues
    priceNum = Math.round(priceNum * 100) / 100

    add({
      id: product.id,
      name: product.name,
      price: priceNum,
      imageUrl: getPublicImageUrl(product.imageUrl) || '/placeholder-product.png',
      quantity: Math.abs(quantity), // Ensure positive quantity
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

      {/* Header - Optimized for mobile */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-white truncate">{businessData?.name || 'Azteka Foods, LLC'}</h1>
              <p className="text-slate-400 text-[11px] md:text-sm">Wholesale Catalog</p>
            </div>
            {/* Cart button - hidden on mobile since we have FAB */}
            <button onClick={() => setIsCartOpen(true)} className="hidden md:flex relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
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

      {/* Main Content - Render Blocks - Tighter mobile spacing */}
      <main className="relative max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
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
            <BlockRenderer key={block.id} block={block} onAddToCart={handleAddToCart} getQuantity={getQuantity} onSetQuantity={setQuantity} />
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
