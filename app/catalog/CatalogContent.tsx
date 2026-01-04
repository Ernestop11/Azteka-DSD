'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, Package, ChevronLeft, ChevronRight, Box } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getPublicImageUrl } from '@/lib/imageUrl'
import EnhancedCartDrawer from '@/components/cart/EnhancedCartDrawer'
import CatalogHamburgerMenu, { CatalogTab, UserMode } from '@/components/catalog/CatalogHamburgerMenu'
import FavoritesTabContent from '@/components/catalog/FavoritesTabContent'
import CreditsTabContent from '@/components/catalog/CreditsTabContent'
import OrderHistoryTabContent from '@/components/catalog/OrderHistoryTabContent'
import StoreSelectionMenu from '@/components/catalog/StoreSelectionMenu'

// Multi-store types
interface MultiStore {
  id: string
  businessName: string
}

// Shared props for block components that render ProductCards
interface BlockProductCardProps {
  onAddToCart: (p: CatalogProduct, q: number) => void
  getQuantity: (productId: string) => number
  onSetQuantity: (productId: string, qty: number) => void
  onMultiStoreLongPress?: (product: CatalogProduct, position: { x: number; y: number }) => void
  isMultiStoreOwner?: boolean
  // For delegated orders - attach store info to cart items
  storeId?: string
  storeName?: string
}

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
  sellByHalfCase?: boolean
  brand?: { id: string; name: string }
  category?: { id: string; name: string }
}

interface CatalogBlock {
  id: string
  type: 'HERO' | 'PRODUCT_GRID' | 'PRODUCT_CARDS' | 'BANNER' | 'CATEGORY_ROW' | 'PROMO_SECTION' | 'RACK_BUNDLE' | 'VENDOR_SPOTLIGHT' | 'CASE_DEAL' | 'NEW_ARRIVALS' | 'QUICK_REORDER' | 'BULK_BUILDER' | 'SEASONAL_THEME' | 'BRAND_SHOWCASE' | 'WEEKEND_SPECIAL'
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
// Hero Products Modal - Shows all products with matching background
function HeroProductsModal({
  isOpen,
  onClose,
  products,
  gradient,
  badgeText,
  onAddToCart,
  oneTapOrder
}: {
  isOpen: boolean
  onClose: () => void
  products: CatalogProduct[]
  gradient: string
  badgeText: string
  onAddToCart: (p: CatalogProduct, q: number) => void
  oneTapOrder: boolean
}) {
  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop with matching gradient */}
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl"
          style={{ background: gradient }}
        >
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-white/10" />
          <div className="absolute inset-0 bg-black/20" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-black text-white">{badgeText || 'HOT DEALS'}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="relative p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => {
                const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
                const pricePerUnit = product.unitsPerCase > 0 ? price / product.unitsPerCase : price

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onAddToCart(product, 1)
                      if (oneTapOrder) {
                        // Haptic feedback
                        if (navigator.vibrate) navigator.vibrate(50)
                      }
                    }}
                    className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square mb-3 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/10 rounded-xl" />
                      <ProductImage
                        src={getPublicImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 relative z-10"
                      />
                      {/* One-tap indicator */}
                      {oneTapOrder && (
                        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-white/60 text-xs mb-2">
                      {product.unitsPerCase} units/case
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-amber-300 font-black text-lg">
                        ${price.toFixed(2)}
                      </p>
                      <span className="text-white/50 text-xs">
                        ${pricePerUnit.toFixed(2)}/ea
                      </span>
                    </div>

                    {/* Quick add button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart(product, 1)
                        if (navigator.vibrate) navigator.vibrate(50)
                      }}
                      className="mt-3 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {oneTapOrder ? 'Tap to Add' : 'Add Case'}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

function HeroBlock({ block, onAddToCart }: { block: CatalogBlock; onAddToCart: (p: CatalogProduct, q: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const products = block.products.map(p => p.product) || []

  // Get config options
  const config = block.config as {
    gradient?: string
    discountPercent?: number
    salePriceOverride?: number
    originalPriceLabel?: string
    savingsText?: string
    simpleAddToCart?: boolean
    showProductsModal?: boolean
    oneTapOrder?: boolean
  }

  const gradient = config.gradient || DEFAULT_HERO_GRADIENT
  const discountPercent = config.discountPercent || 5
  const simpleAddToCart = config.simpleAddToCart || false
  const showProductsModal = config.showProductsModal || false
  const oneTapOrder = config.oneTapOrder || false
  const savingsText = config.savingsText || 'Save Now'

  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => setCurrentIndex((i) => (i + 1) % products.length), 5000)
    return () => clearInterval(timer)
  }, [products.length])

  if (products.length === 0) return null
  const product = products[currentIndex]
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const price = config.salePriceOverride || basePrice
  const pricePerUnit = product.unitsPerCase > 0 ? price / product.unitsPerCase : price
  const casePrice = price
  const originalPricePerUnit = product.unitsPerCase > 0 ? basePrice / product.unitsPerCase : basePrice

  const handleHeroClick = () => {
    if (showProductsModal && products.length > 0) {
      setShowModal(true)
    }
  }

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-8 shadow-2xl ${showProductsModal ? 'cursor-pointer' : ''}`}
        style={{ background: gradient }}
        onClick={handleHeroClick}
      >
        {/* Decorative overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Radial glow behind product - smaller on mobile */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-white/15 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />

        <div className="relative flex flex-col md:flex-row items-center min-h-[320px] sm:min-h-[380px] md:min-h-[420px] px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10">
          {/* Navigation arrows */}
          {products.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + products.length) % products.length) }}
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
              {showProductsModal && products.length > 1 && (
                <span className="ml-1 px-2 py-0.5 bg-slate-900/30 rounded-full text-white text-xs">
                  +{products.length - 1} more
                </span>
              )}
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

            {/* Pricing - Show based on simpleAddToCart setting */}
            {!simpleAddToCart && (
              <div className="flex flex-wrap items-end gap-2 sm:gap-4 mb-3 sm:mb-6 justify-center md:justify-start">
                <div>
                  {discountPercent > 0 && (
                    <p className="text-white/50 text-xs sm:text-sm line-through mb-0.5 sm:mb-1">
                      {config.originalPriceLabel || `$${(originalPricePerUnit * (1 + discountPercent/100)).toFixed(2)} / each`}
                    </p>
                  )}
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black">
                    ${pricePerUnit.toFixed(2)}
                    <span className="text-sm sm:text-lg md:text-xl font-medium ml-1">/ each</span>
                  </p>
                  <p className="text-amber-300 text-xs sm:text-sm mt-0.5 sm:mt-1">${casePrice.toFixed(2)} per case of {product.unitsPerCase}</p>
                </div>
                {discountPercent > 0 && (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg border border-red-400/30">
                    <p className="text-white font-black text-base sm:text-xl">-{discountPercent}%</p>
                    <p className="text-red-100 text-[10px] sm:text-xs uppercase tracking-wide">{savingsText}</p>
                  </div>
                )}
              </div>
            )}

            {/* Simple pricing for simpleAddToCart mode */}
            {simpleAddToCart && (
              <div className="mb-3 sm:mb-6">
                <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black">
                  ${casePrice.toFixed(2)}
                  <span className="text-sm sm:text-lg md:text-xl font-medium ml-1">/ case</span>
                </p>
                <p className="text-white/60 text-xs sm:text-sm mt-1">{product.unitsPerCase} units per case</p>
              </div>
            )}

            {/* CTA Button - Premium Hero Style */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1) }}
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
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % products.length) }}
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
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx) }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-white w-8 shadow-lg'
                    : 'bg-white/40 w-2.5 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Tap hint for modal */}
        {showProductsModal && products.length > 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium">
            Tap to see all {products.length} products
          </div>
        )}
      </div>

      {/* Products Modal */}
      <HeroProductsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        products={products}
        gradient={gradient}
        badgeText={block.badgeText || 'HOT DEALS'}
        onAddToCart={onAddToCart}
        oneTapOrder={oneTapOrder}
      />
    </>
  )
}

// Weekend Special Products Modal - Shows all products with matching background and one-tap ordering
function WeekendSpecialModal({
  isOpen,
  onClose,
  products,
  gradient,
  badgeText,
  onAddToCart,
  config
}: {
  isOpen: boolean
  onClose: () => void
  products: CatalogProduct[]
  gradient: string
  badgeText: string
  onAddToCart: (p: CatalogProduct, q: number) => void
  config: Record<string, unknown>
}) {
  if (!isOpen) return null

  const enableDiscount = config.enableDiscount as boolean
  const discountPercent = (config.discountPercent as number) || 10

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop with matching gradient */}
        <div className="absolute inset-0" style={{ background: gradient }} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl"
          style={{ background: gradient }}
        >
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-white/10" />
          <div className="absolute inset-0 bg-black/20" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-black text-white">{badgeText || 'WEEKEND SPECIAL'}</h2>
              {enableDiscount && (
                <span className="px-3 py-1 bg-red-500 rounded-full text-white text-sm font-bold">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="relative p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => {
                const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price
                const price = enableDiscount ? basePrice * (1 - discountPercent / 100) : basePrice
                const pricePerUnit = product.unitsPerCase > 0 ? price / product.unitsPerCase : price

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onAddToCart(product, 1)
                      if (navigator.vibrate) navigator.vibrate(50)
                    }}
                    className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all group"
                  >
                    {/* Discount badge */}
                    {enableDiscount && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded-lg text-white text-xs font-bold z-10">
                        -{discountPercent}%
                      </div>
                    )}

                    {/* One-tap indicator */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Plus className="w-5 h-5 text-white" />
                    </div>

                    {/* Product Image */}
                    <div className="relative aspect-square mb-3 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/10 rounded-xl" />
                      <ProductImage
                        src={getPublicImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 relative z-10"
                      />
                    </div>

                    {/* Product Info */}
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-white/60 text-xs mb-2">
                      {product.unitsPerCase} units/case
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {enableDiscount && (
                          <span className="text-white/50 text-xs line-through mr-2">
                            ${basePrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-amber-300 font-black text-lg">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-white/50 text-xs">
                        ${pricePerUnit.toFixed(2)}/ea
                      </span>
                    </div>

                    {/* Quick add button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart(product, 1)
                        if (navigator.vibrate) navigator.vibrate(50)
                      }}
                      className="mt-3 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Tap to Add
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// Weekend Special Block - Carousel with modal, optional discounts & gamified trade-offs
function WeekendSpecialBlock({
  block,
  onAddToCart,
  cartTotal = 0
}: {
  block: CatalogBlock
  onAddToCart: (p: CatalogProduct, q: number) => void
  cartTotal?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const products = block.products.map(p => p.product) || []

  // Get config options
  const config = block.config as {
    gradient?: string
    enableDiscount?: boolean
    discountPercent?: number
    discountBadge?: string
    salePriceOverride?: number
    enableTradeoff?: boolean
    tradeoffGoal?: number
    tradeoffDiscount?: number
    tradeoffTitle?: string
    tradeoffMessage?: string
  }

  const gradient = config.gradient || 'linear-gradient(135deg, #dc2626 0%, #f97316 50%, #fbbf24 100%)'
  const enableDiscount = config.enableDiscount || false
  const discountPercent = config.discountPercent || 10
  const discountBadge = config.discountBadge || 'SAVE NOW'
  const enableTradeoff = config.enableTradeoff || false
  const tradeoffGoal = config.tradeoffGoal || 2000
  const tradeoffDiscount = config.tradeoffDiscount || 15
  const tradeoffTitle = config.tradeoffTitle || '🎯 Unlock Special Pricing!'

  // Calculate trade-off progress
  const tradeoffProgress = Math.min((cartTotal / tradeoffGoal) * 100, 100)
  const tradeoffUnlocked = cartTotal >= tradeoffGoal
  const remaining = Math.max(tradeoffGoal - cartTotal, 0)

  // Auto-rotate carousel
  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => setCurrentIndex((i) => (i + 1) % products.length), 5000)
    return () => clearInterval(timer)
  }, [products.length])

  if (products.length === 0) return null
  const product = products[currentIndex]
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price

  // Calculate effective discount (trade-off overrides regular discount when unlocked)
  const effectiveDiscount = tradeoffUnlocked && enableTradeoff ? tradeoffDiscount : (enableDiscount ? discountPercent : 0)
  const price = config.salePriceOverride || (effectiveDiscount > 0 ? basePrice * (1 - effectiveDiscount / 100) : basePrice)
  const pricePerUnit = product.unitsPerCase > 0 ? price / product.unitsPerCase : price
  const casePrice = price

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-8 shadow-2xl cursor-pointer"
        style={{ background: gradient }}
        onClick={() => setShowModal(true)}
      >
        {/* Decorative overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Radial glow */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-white/15 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />

        {/* Trade-off Progress Bar (if enabled and not unlocked) */}
        {enableTradeoff && !tradeoffUnlocked && (
          <div className="relative mx-4 mt-4 p-3 bg-black/30 backdrop-blur-sm rounded-xl border border-amber-500/30">
            <p className="text-white text-sm font-bold mb-2">{tradeoffTitle}</p>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tradeoffProgress}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              />
            </div>
            <p className="text-amber-300 text-xs">
              Spend ${remaining.toFixed(0)} more to unlock {tradeoffDiscount}% off!
            </p>
          </div>
        )}

        {/* Trade-off Unlocked Badge */}
        {enableTradeoff && tradeoffUnlocked && (
          <div className="relative mx-4 mt-4 p-3 bg-emerald-500/30 backdrop-blur-sm rounded-xl border border-emerald-400/50">
            <p className="text-emerald-300 text-sm font-bold flex items-center gap-2">
              <span>🎉</span> Special Pricing Unlocked! {tradeoffDiscount}% OFF
            </p>
          </div>
        )}

        <div className="relative flex flex-col md:flex-row items-center min-h-[320px] sm:min-h-[380px] md:min-h-[400px] px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10">
          {/* Navigation arrows */}
          {products.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + products.length) % products.length) }}
              className="absolute left-2 sm:left-3 md:left-6 z-10 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </button>
          )}

          {/* Product Image */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 flex-shrink-0 flex items-center justify-center">
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

          {/* Product Info */}
          <div className="flex-1 text-center md:text-left max-w-xl mt-3 sm:mt-6 md:mt-0 md:ml-10 lg:ml-14">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500 text-slate-900 font-bold text-xs sm:text-sm mb-2 sm:mb-4 shadow-lg"
            >
              <span className="text-sm sm:text-base">🔥</span>
              <span className="uppercase tracking-wide">{block.badgeText || 'WEEKEND SPECIAL'}</span>
              {products.length > 1 && (
                <span className="ml-1 px-2 py-0.5 bg-slate-900/30 rounded-full text-white text-xs">
                  +{products.length - 1} more
                </span>
              )}
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

            {/* Description */}
            <motion.p
              key={`desc-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden sm:block text-white/80 text-sm md:text-lg mb-4 md:mb-6 max-w-md"
            >
              {product.description || `${product.unitsPerCase} units per case`}
            </motion.p>

            {/* Pricing */}
            <div className="flex flex-wrap items-end gap-2 sm:gap-4 mb-3 sm:mb-6 justify-center md:justify-start">
              <div>
                <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black">
                  ${casePrice.toFixed(2)}
                  <span className="text-sm sm:text-lg md:text-xl font-medium ml-1">/ case</span>
                </p>
                <p className="text-amber-300 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  ${pricePerUnit.toFixed(2)} per unit • {product.unitsPerCase} units
                </p>
              </div>
              {effectiveDiscount > 0 && (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg border border-red-400/30">
                  <p className="text-white font-black text-base sm:text-xl">-{effectiveDiscount}%</p>
                  <p className="text-red-100 text-[10px] sm:text-xs uppercase tracking-wide">{discountBadge}</p>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-900 inline-flex items-center gap-3 text-lg sm:text-xl shadow-2xl transition-all overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), 0 10px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              <span className="relative z-10 uppercase tracking-wide">Add to Cart</span>
            </motion.button>
          </div>

          {/* Navigation arrow right */}
          {products.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % products.length) }}
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
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx) }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-white w-8 shadow-lg'
                    : 'bg-white/40 w-2.5 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* View All hint */}
        <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium flex items-center gap-2">
          <Box className="w-4 h-4" />
          Tap to see all {products.length}
        </div>
      </div>

      {/* Products Modal */}
      <WeekendSpecialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        products={products}
        gradient={gradient}
        badgeText={block.badgeText || 'WEEKEND SPECIAL'}
        onAddToCart={onAddToCart}
        config={block.config}
      />
    </>
  )
}

// Bulk Order Quick Picks
const BULK_QUANTITIES = [5, 10, 15, 20, 25, 50]

// 🔥 DSD Showcase Product Card - Tap to Select, Glowing Borders, Long-Press for Bulk or Multi-Store
function ProductCard({ product, style, onAddToCart, cardStyle, cartQuantity = 0, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { product: CatalogProduct; style?: string; onAddToCart: (p: CatalogProduct, q: number) => void; cardStyle?: Record<string, unknown>; cartQuantity?: number; onSetQuantity?: (productId: string, qty: number, productData?: { name: string; price: number; imageUrl?: string | null }) => void; onMultiStoreLongPress?: (product: CatalogProduct, position: { x: number; y: number }) => void; isMultiStoreOwner?: boolean }) {
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

  // Long press handlers for bulk order modal OR multi-store selection
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false

    // Capture position for multi-store menu
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    longPressTimerRef.current = setTimeout(() => {
      isLongPress.current = true

      // If multi-store owner and handler provided, show store selection instead of bulk modal
      if (isMultiStoreOwner && onMultiStoreLongPress) {
        if (navigator.vibrate) navigator.vibrate(50)
        onMultiStoreLongPress(product, { x: clientX, y: clientY })
        return
      }

      // Otherwise show standard bulk order modal
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

    // Save to cart - pass product data so item can be added if not in cart
    if (onSetQuantity) {
      onSetQuantity(product.id, qty, {
        name: product.name,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
        imageUrl: product.imageUrl,
      })
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
            ? 'transparent'
            : (cardBackdropUrl ? `url(${cardBackdropUrl}) center/cover` : cardImageBg)
        }}
      >
        {/* NO square overlay glow - all glow comes from drop-shadow on PNG */}

        {product.imageUrl ? (
          <ProductImage
            src={getPublicImageUrl(product.imageUrl)}
            alt={product.name}
            className={`max-h-full max-w-full object-contain transition-all duration-300 relative z-10 ${
              showControls ? 'scale-105' : 'hover:scale-102'
            }`}
            style={{
              // Use cardImageEffect if set, otherwise use accent-colored drop-shadow
              // The drop-shadow follows the PNG alpha channel - NOT a square!
              filter: cardImageEffect
                ? cardImageEffect
                : (showControls
                    ? `drop-shadow(0 4px 12px ${cardGlowColor}80) drop-shadow(0 0 20px ${cardGlowColor}50)`
                    : `drop-shadow(0 6px 12px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px ${cardGlowColor}30)`),
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

          {/* 3D Box Icon Toggle - only shows for products with sellByHalfCase enabled */}
          {product.sellByHalfCase && (
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
          )}
        </div>

        {/* Units per case - smaller text below */}
        <span className={`text-[9px] sm:text-[10px] mt-0.5 ${cardTextLight ? 'text-white/40' : 'text-slate-400'}`}>
          {unitsPerCase} units/case
        </span>
      </div>

      {/* Quantity Controls - SYMMETRIC ROUND BUTTONS WITH GLOW */}
      {/* Tapping here does NOT deselect - only image area does */}
      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="border-t-2 relative"
          style={{
            borderColor: cardAccentColor,
          }}
        >
          {/* Ambient glow behind qty controls - like product image glow */}
          <div
            className="absolute inset-0 -top-2"
            style={{
              background: `radial-gradient(ellipse at center, ${cardAccentColor}50 0%, ${cardAccentColor}20 40%, transparent 70%)`,
              filter: 'blur(8px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="relative flex items-center justify-center gap-4 py-3 px-4"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.35))`,
            }}
          >
            {/* Minus Button - ROUND WITH GLOW */}
            <button
              onClick={(e) => handleQuantityChange(-1, e)}
              className="relative flex-shrink-0 flex items-center justify-center font-bold text-xl active:scale-90 transition-all"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: `2px solid ${cardAccentColor}`,
                color: cardAccentColor,
                background: 'white',
                boxShadow: `0 0 20px ${cardAccentColor}60, 0 0 40px ${cardAccentColor}30, 0 4px 8px rgba(0,0,0,0.3)`,
              }}
            >
              −
            </button>

            {/* Quantity Display - Tap to edit - ROUND WITH INTENSE GLOW */}
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
                className="flex-shrink-0 text-center font-black text-xl"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: `3px solid ${cardAccentColor}`,
                  background: 'white',
                  color: cardAccentColor,
                  boxShadow: `0 0 30px ${cardAccentColor}, 0 0 60px ${cardAccentColor}70, 0 0 80px ${cardAccentColor}40`,
                  outline: 'none',
                }}
              />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleQuantityEdit() }}
                className="relative flex-shrink-0 flex items-center justify-center font-black text-xl text-white active:scale-95 transition-all"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${cardAccentColor}, ${cardAccentColor}dd)`,
                  boxShadow: `0 0 25px ${cardAccentColor}90, 0 0 50px ${cardAccentColor}50, 0 0 70px ${cardAccentColor}30, inset 0 1px 0 rgba(255,255,255,0.4)`,
                }}
              >
                {displayQuantity}
              </button>
            )}

            {/* Plus Button - ROUND WITH GLOW */}
            <button
              onClick={(e) => handleQuantityChange(1, e)}
              className="relative flex-shrink-0 flex items-center justify-center font-bold text-xl active:scale-90 transition-all"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: `2px solid ${cardAccentColor}`,
                color: cardAccentColor,
                background: 'white',
                boxShadow: `0 0 20px ${cardAccentColor}60, 0 0 40px ${cardAccentColor}30, 0 4px 8px rgba(0,0,0,0.3)`,
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
function ProductGridBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
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
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
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

// Promo Section Block - Visual wrapper with consistent card sizing
function PromoSectionBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
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
    <section className="mb-8 relative">
      {/* Visual wrapper - tighter on tablet (sm:p-2), normal on desktop (md:p-4) */}
      <div
        className={`sm:p-2 md:p-4 sm:rounded-2xl relative overflow-hidden ${!hasCustomBackground ? 'sm:bg-gradient-to-r sm:from-amber-900/40 sm:to-orange-900/40 sm:border sm:border-amber-700/30' : ''}`}
        style={sectionStyle}
      >
        {/* Overlay for readability if background exists */}
        {hasCustomBackground && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative z-10">
          {/* Header - always visible */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-amber-400">{block.title || 'Special Offers'}</h2>
              {block.subtitle && <p className="text-amber-200/70 text-xs sm:text-base">{block.subtitle}</p>}
            </div>
            {block.badgeText && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500 text-slate-900 font-bold text-xs sm:text-sm">
                {block.badgeText}
              </span>
            )}
          </div>
          {/* Grid - NO padding on mobile for full-width cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Rack Bundle Block - DSD Feature - Consistent card sizing
function RackBundleBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const products = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    rackImageUrl?: string
    bundleDiscount?: number
    showOneClickOrder?: boolean
    backgroundColor?: string
  }

  // Enhanced card style with emerald accent for rack bundles
  const accentColor = '#10b981' // emerald
  const cardStyle = {
    ...baseCardStyle,
    cardAccentColor: baseCardStyle.cardAccentColor || accentColor,
    cardGlowColor: baseCardStyle.cardGlowColor || accentColor,
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || '#334155',
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor - no custom effect needed
  }

  const handleOrderAll = () => {
    products.forEach(product => onAddToCart(product, 1))
  }

  const totalPrice = products.reduce((sum, p) => sum + (typeof p.price === 'string' ? parseFloat(p.price) : p.price), 0)
  const discountedPrice = totalPrice * (1 - (config.bundleDiscount || 0) / 100)

  return (
    <section className="mb-8">
      <div className="sm:p-2 md:p-4 sm:rounded-2xl" style={{ backgroundColor: config.backgroundColor || '#1a1a2e' }}>
        {/* Header with Order All button */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">{block.title || 'Rack Display Bundle'}</h2>
            {block.subtitle && <p className="text-slate-400 text-xs sm:text-base">{block.subtitle}</p>}
          </div>
          {config.showOneClickOrder && products.length > 0 && (
            <button
              onClick={handleOrderAll}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-base hover:from-emerald-600 hover:to-teal-600 shadow-lg flex items-center gap-1 sm:gap-2"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Order All</span>
              <span>${discountedPrice.toFixed(0)}</span>
            </button>
          )}
        </div>

        {/* Products Grid - tighter gaps on tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Case Deal Block - DSD Feature - Consistent card sizing
function CaseDealBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const products = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    minCases?: number
    discountPercent?: number
    dealBadge?: string
  }

  // Enhanced card style with orange/red accent for case deals
  const accentColor = '#f97316' // orange
  const cardStyle = {
    ...baseCardStyle,
    cardAccentColor: baseCardStyle.cardAccentColor || accentColor,
    cardGlowColor: baseCardStyle.cardGlowColor || accentColor,
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #7c2d12 0%, #431407 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || '#c2410c',
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor
  }

  return (
    <section className="mb-8">
      <div className="sm:p-2 md:p-4 sm:rounded-2xl sm:bg-gradient-to-r sm:from-orange-900/50 sm:to-red-900/50 sm:border sm:border-orange-700/30">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs sm:text-sm">
                {config.dealBadge || 'VOLUME DEAL'}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">{block.title || 'Case Deal'}</h2>
            <p className="text-orange-300 text-xs sm:text-base">
              Buy {config.minCases || 3}+ cases, save {config.discountPercent || 10}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl sm:text-4xl font-black text-orange-400">-{config.discountPercent || 10}%</p>
            <p className="text-orange-200 text-[10px] sm:text-sm">on {config.minCases || 3}+ cases</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Vendor Spotlight Block - DSD Feature - Consistent card sizing
function VendorSpotlightBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const products = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    vendorName?: string
    vendorLogoUrl?: string
    showTopSellers?: boolean
  }

  // Enhanced card style with amber accent for vendor spotlight
  const accentColor = '#f59e0b' // amber
  const cardStyle = {
    ...baseCardStyle,
    cardAccentColor: baseCardStyle.cardAccentColor || accentColor,
    cardGlowColor: baseCardStyle.cardGlowColor || accentColor,
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || '#475569',
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor
  }

  return (
    <section className="mb-8">
      <div className="sm:rounded-2xl overflow-hidden sm:bg-gradient-to-br sm:from-slate-800 sm:to-slate-900 sm:border sm:border-slate-700">
        {/* Vendor Header - Compact on mobile */}
        <div className="py-2 sm:p-2 md:p-4 sm:border-b sm:border-slate-700 flex items-center gap-3 sm:gap-4">
          {config.vendorLogoUrl && (
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white p-1.5 sm:p-2 flex items-center justify-center flex-shrink-0">
              <img src={config.vendorLogoUrl} alt={config.vendorName || 'Vendor'} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{config.vendorName || block.title || 'Featured Vendor'}</h2>
            {block.subtitle && <p className="text-slate-400 text-xs sm:text-sm truncate">{block.subtitle}</p>}
          </div>
          {config.showTopSellers && (
            <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 flex-shrink-0">
              ⭐ Top
            </span>
          )}
        </div>

        {/* Products - tighter padding on tablet */}
        <div className="sm:p-2 md:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Bulk Builder Block - DSD Feature - Consistent card sizing
function BulkBuilderBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const products = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    minItems?: number
    mixMatchDiscount?: number
  }

  // Enhanced card style with blue/indigo accent for bulk builder
  const accentColor = '#3b82f6' // blue
  const cardStyle = {
    ...baseCardStyle,
    cardAccentColor: baseCardStyle.cardAccentColor || accentColor,
    cardGlowColor: baseCardStyle.cardGlowColor || accentColor,
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #1e3a8a 0%, #1e1b4b 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || '#3b82f6',
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor
  }

  return (
    <section className="mb-8">
      <div className="sm:p-2 md:p-4 sm:rounded-2xl sm:bg-gradient-to-r sm:from-blue-900/40 sm:to-indigo-900/40 sm:border sm:border-blue-700/30">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl">🏗️</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">{block.title || 'Bulk Builder'}</h2>
            </div>
            <p className="text-blue-300 text-xs sm:text-sm">
              Mix & Match {config.minItems || 6}+ for {config.mixMatchDiscount || 5}% off
            </p>
          </div>
          <div className="px-2 sm:px-3 py-2 rounded-xl bg-blue-600/30 border border-blue-500/30">
            <p className="text-blue-200 text-[10px] sm:text-xs">Mix & Match</p>
            <p className="text-xl sm:text-2xl font-black text-blue-400">-{config.mixMatchDiscount || 5}%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Brand Showcase Block - DSD Feature - Hero-style with See All modal
function BrandShowcaseBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const allProducts = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)
  const config = block.config as {
    brandLogoUrl?: string
    brandColor?: string
    brandName?: string
    previewCount?: number
  }

  // Show first N products in showcase, rest in modal
  const previewCount = config.previewCount || 4
  const previewProducts = allProducts.slice(0, previewCount)
  const hasMoreProducts = allProducts.length > previewCount

  // State for modal
  const [showAllModal, setShowAllModal] = useState(false)

  // Brand color with fallback
  const brandColor = config.brandColor || '#1e293b'
  const brandColorLight = `${brandColor}40`
  const brandColorDark = `${brandColor}cc`

  // Enhanced card style - use brand color for glow effects if not set in block config
  // This gives BrandShowcase the same visual punch as PromoSection
  const cardStyle = {
    ...baseCardStyle,
    // Use brand color as accent if not set
    cardAccentColor: baseCardStyle.cardAccentColor || brandColor,
    cardGlowColor: baseCardStyle.cardGlowColor || brandColor,
    // Dark card backgrounds for brand showcase
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || `${brandColor}80`,
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor - follows PNG shape
  }

  return (
    <>
      <section className="mb-8 relative">
        {/* Main Container with gradient background - ALWAYS visible on all breakpoints */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, ${brandColorDark} 0%, ${brandColor} 50%, ${brandColorLight} 100%)`,
          }}
        >
          {/* Ambient glow effects */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${brandColor}80 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${brandColor}60 0%, transparent 50%)`,
            }}
          />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

          {/* Content container */}
          <div className="relative z-10 p-4 sm:p-5 md:p-6">
            {/* Brand Header - Logo prominently displayed */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-3 sm:gap-4">
                {config.brandLogoUrl ? (
                  <div className="bg-white/95 rounded-xl p-2 sm:p-3 shadow-lg" style={{ boxShadow: `0 0 30px ${brandColor}50, 0 4px 20px rgba(0,0,0,0.3)` }}>
                    <img
                      src={config.brandLogoUrl}
                      alt={config.brandName || block.title || 'Brand'}
                      className="h-12 sm:h-14 md:h-16 object-contain max-w-[140px] sm:max-w-[180px] md:max-w-[200px]"
                    />
                  </div>
                ) : (
                  <h2
                    className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg"
                    style={{ textShadow: `0 0 20px ${brandColor}, 0 2px 10px rgba(0,0,0,0.5)` }}
                  >
                    {config.brandName || block.title}
                  </h2>
                )}

                {/* Product count badge */}
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-white/90 text-xs font-bold backdrop-blur-sm border border-white/20">
                  {allProducts.length} products
                </span>
              </div>

              {/* Subtle "See All" button - Sales rep trick style */}
              {hasMoreProducts && (
                <button
                  onClick={() => setShowAllModal(true)}
                  className="group relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
                  title="See all products from this brand"
                >
                  <Package className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  {/* Subtle indicator dot */}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white/60 animate-pulse" />
                </button>
              )}
            </div>

            {/* Products Grid - with card background effects */}
            <div
              className="rounded-xl p-2 sm:p-3 md:p-4"
              style={{
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
                {previewProducts.map((product) => (
                  <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
                ))}
              </div>

              {/* See More indicator at bottom */}
              {hasMoreProducts && (
                <button
                  onClick={() => setShowAllModal(true)}
                  className="w-full mt-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>See all {allProducts.length} products</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* All Products Modal - Similar to bulk order modal style */}
      {createPortal(
        <AnimatePresence>
          {showAllModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
              onClick={() => setShowAllModal(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

              {/* Modal Content */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${brandColorDark} 0%, ${brandColor} 100%)`,
                }}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 p-4 sm:p-5 border-b border-white/10" style={{ background: `linear-gradient(to bottom, ${brandColor}, ${brandColor}ee)` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {config.brandLogoUrl ? (
                        <div className="bg-white/95 rounded-lg p-2 shadow-lg">
                          <img src={config.brandLogoUrl} alt="Brand" className="h-8 sm:h-10 object-contain" />
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold text-white">{config.brandName || block.title}</h3>
                      )}
                      <span className="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                        {allProducts.length} products
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAllModal(false)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Products Grid - Scrollable */}
                <div className="p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {allProducts.map((product) => (
                      <ProductCard key={product.id} product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
                    ))}
                  </div>
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

// New Arrivals Block - DSD Feature
function NewArrivalsBlock({ block, onAddToCart, getQuantity, onSetQuantity, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock } & BlockProductCardProps) {
  const products = block.products.map(p => p.product) || []
  const baseCardStyle = getCardStyleFromBlock(block)

  // Enhanced card style with emerald accent for new arrivals
  const accentColor = '#10b981' // emerald
  const cardStyle = {
    ...baseCardStyle,
    cardAccentColor: baseCardStyle.cardAccentColor || accentColor,
    cardGlowColor: baseCardStyle.cardGlowColor || accentColor,
    cardBg: baseCardStyle.cardBg || 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    cardImageBg: baseCardStyle.cardImageBg || 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
    cardBorderColor: baseCardStyle.cardBorderColor || '#10b981',
    cardTextLight: baseCardStyle.cardTextLight !== undefined ? baseCardStyle.cardTextLight : true,
    // Let ProductCard handle the glow via cardGlowColor
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🆕</span>
        <h2 className="text-2xl font-bold text-white">{block.title || 'New Arrivals'}</h2>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm font-bold animate-pulse">
          JUST IN
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2 md:gap-3">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-bold">
              NEW
            </div>
            <ProductCard product={product} cardStyle={cardStyle} onAddToCart={onAddToCart} cartQuantity={getQuantity(product.id)} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Block Renderer - Hide blocks with no products (except BANNER and HERO which may not need products)
function BlockRenderer({ block, onAddToCart, getQuantity, onSetQuantity, cartTotal = 0, onMultiStoreLongPress, isMultiStoreOwner }: { block: CatalogBlock; cartTotal?: number } & BlockProductCardProps) {
  // Skip rendering product blocks that have no products
  const productsRequired = !['BANNER'].includes(block.type)
  if (productsRequired && (!block.products || block.products.length === 0)) {
    return null
  }

  switch (block.type) {
    case 'HERO': return <HeroBlock block={block} onAddToCart={onAddToCart} />
    case 'WEEKEND_SPECIAL': return <WeekendSpecialBlock block={block} onAddToCart={onAddToCart} cartTotal={cartTotal} />
    case 'PRODUCT_GRID': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'PRODUCT_CARDS': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'BANNER': return <BannerBlock block={block} />
    case 'PROMO_SECTION': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'CATEGORY_ROW': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    // DSD Block Types
    case 'RACK_BUNDLE': return <RackBundleBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'VENDOR_SPOTLIGHT': return <VendorSpotlightBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'CASE_DEAL': return <CaseDealBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'NEW_ARRIVALS': return <NewArrivalsBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'QUICK_REORDER': return <ProductGridBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'BULK_BUILDER': return <BulkBuilderBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'SEASONAL_THEME': return <PromoSectionBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    case 'BRAND_SHOWCASE': return <BrandShowcaseBlock block={block} onAddToCart={onAddToCart} getQuantity={getQuantity} onSetQuantity={onSetQuantity} onMultiStoreLongPress={onMultiStoreLongPress} isMultiStoreOwner={isMultiStoreOwner} />
    default: return null
  }
}

// Cart Drawer - Now using EnhancedCartDrawer component imported above

// Main Catalog Component
export default function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = searchParams.get('customer')
  const mode = searchParams.get('mode') as UserMode | null // 'rep', 'customer', 'carlos', or null (guest)
  const delegated = searchParams.get('delegated') === 'true'
  const parentCustomerId = searchParams.get('parent')
  const storeNameParam = searchParams.get('storeName') // Store name for delegated orders

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<CatalogTab>('catalog')
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isHandoffMode, setIsHandoffMode] = useState(false)
  const [repPin, setRepPin] = useState<string | null>(null) // Sales rep PIN for handoff mode
  const { add, items, updateQty, remove, totals, getCartCount, getQuantity, setQuantity, switchCustomer } = useCart()

  // For delegated orders, calculate cart count for only this store
  const storeCartCount = delegated && customerId
    ? items.filter(item => item.storeId === customerId).reduce((sum, item) => sum + item.quantity, 0)
    : getCartCount()

  // Multi-store state for OWNER customers
  const [multiStores, setMultiStores] = useState<MultiStore[]>([])
  const [isMultiStoreOwner, setIsMultiStoreOwner] = useState(false)
  const [storeSelectionProduct, setStoreSelectionProduct] = useState<CatalogProduct | null>(null)
  const [storeSelectionPosition, setStoreSelectionPosition] = useState<{ x: number; y: number } | null>(null)

  // Determine user mode - default to 'guest' if no mode specified
  const userMode: UserMode = mode || (customerId ? 'customer' : 'guest')

  // If customer param is passed (from sales rep flow), sync cart to that customer
  // IMPORTANT: For delegated orders (multi-store owner), DON'T clear cart - we want to keep items from all stores
  useEffect(() => {
    if (customerId) {
      // Only switch customer (which clears cart) for non-delegated orders
      // For delegated orders, each store's items are tracked by storeId so we keep them all
      if (!delegated) {
        switchCustomer(customerId)
      }
      // Fetch customer name for display
      fetch(`/api/rep/customer/${customerId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.customer?.businessName) {
            setCustomerName(data.customer.businessName)
          }
        })
        .catch(() => {})

      // Fetch favorites count
      fetch(`/api/rep/customer/${customerId}/favorites`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.favorites) {
            setFavoritesCount(data.favorites.length)
          }
        })
        .catch(() => {})
    }
  }, [customerId, switchCustomer])

  // Check if customer is a multi-store owner and fetch their stores
  useEffect(() => {
    if (customerId) {
      fetch(`/api/customer/multi-store?ownerId=${customerId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.stores && data.stores.length > 0) {
            setIsMultiStoreOwner(true)
            setMultiStores(data.stores.map((s: { id: string; businessName: string }) => ({
              id: s.id,
              businessName: s.businessName
            })))
          } else {
            setIsMultiStoreOwner(false)
            setMultiStores([])
          }
        })
        .catch(() => {
          setIsMultiStoreOwner(false)
          setMultiStores([])
        })
    }
  }, [customerId])

  // Handle adding product to a specific store's cart
  const handleAddToStore = (storeId: string, storeName: string, quantity: number) => {
    if (!storeSelectionProduct) return
    // Add to cart with store info for multi-store display
    add({
      id: storeSelectionProduct.id,
      name: storeSelectionProduct.name,
      price: typeof storeSelectionProduct.price === 'string' ? parseFloat(storeSelectionProduct.price) : storeSelectionProduct.price,
      quantity,
      imageUrl: storeSelectionProduct.imageUrl,
      storeId,
      storeName,
    })
  }

  // Handle product long-press for multi-store selection
  const handleProductLongPress = (product: CatalogProduct, position: { x: number; y: number }) => {
    if (!isMultiStoreOwner || multiStores.length === 0) return
    setStoreSelectionProduct(product)
    setStoreSelectionPosition(position)
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push('/rep/dashboard')
  }

  // Handle entering handoff mode (tablet given to customer)
  const handleEnterHandoff = () => {
    // Get the rep's PIN from localStorage (last 4 of their phone)
    try {
      const stored = localStorage.getItem('repSession')
      if (stored) {
        const session = JSON.parse(stored)
        const pin = session.pin || '0000'
        setRepPin(pin)
      } else {
        setRepPin('0000') // Fallback
      }
    } catch {
      setRepPin('0000') // Fallback
    }
    setIsHandoffMode(true)
    setActiveTab('catalog') // Reset to catalog view when entering handoff mode
  }

  // Handle exiting handoff mode (PIN verification)
  const handleExitHandoff = (enteredPin: string): boolean => {
    if (enteredPin === repPin) {
      setIsHandoffMode(false)
      setRepPin(null)
      return true
    }
    return false
  }

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
  // Pass customerId for customer-specific pricing
  const { data: blocksData, isLoading, error } = useQuery<{ data: CatalogBlock[] }>({
    queryKey: ['catalog-blocks', customerId],
    queryFn: async () => {
      const url = customerId
        ? `/api/catalog/blocks?customer=${customerId}`
        : '/api/catalog/blocks'
      const res = await fetch(url)
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

    // Build cart item - include storeId/storeName for delegated orders (Carlos multi-store)
    const cartItem: Parameters<typeof add>[0] = {
      id: product.id,
      name: product.name,
      price: priceNum,
      imageUrl: getPublicImageUrl(product.imageUrl) || '/placeholder-product.png',
      quantity: Math.abs(quantity), // Ensure positive quantity
    }

    // If this is a delegated order (Carlos ordering for a specific store), attach store info
    if (delegated && customerId) {
      cartItem.storeId = customerId
      cartItem.storeName = storeNameParam || undefined
    }

    add(cartItem)
  }

  // Wrapper for getQuantity that handles composite key for delegated orders
  const wrappedGetQuantity = (productId: string) => {
    // For delegated orders, use composite key (productId-storeId)
    const key = delegated && customerId ? `${productId}-${customerId}` : productId
    return getQuantity(key)
  }

  // Wrapper for setQuantity that handles composite key for delegated orders
  const wrappedSetQuantity = (productId: string, qty: number, productData?: { name: string; price: number; imageUrl?: string | null }) => {
    // For delegated orders, use composite key (productId-storeId)
    const key = delegated && customerId ? `${productId}-${customerId}` : productId
    // Pass product data with store info for delegated orders
    const enrichedProductData = productData ? {
      ...productData,
      storeId: delegated ? customerId : undefined,
      storeName: delegated ? customerName : undefined,
    } : undefined
    setQuantity(key, qty, enrichedProductData)
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

      {/* Header - Optimized for mobile + iPhone safe area */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Hamburger Menu - visible when in rep/customer/carlos mode */}
            {userMode !== 'guest' && (
              <CatalogHamburgerMenu
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userMode={userMode}
                customerId={customerId}
                customerName={customerName}
                favoritesCount={favoritesCount}
                onBackToDashboard={userMode === 'rep' ? handleBackToDashboard : undefined}
                isHandoffMode={isHandoffMode}
                onEnterHandoff={userMode === 'rep' ? handleEnterHandoff : undefined}
                onExitHandoff={userMode === 'rep' ? handleExitHandoff : undefined}
                isDelegatedOrder={delegated}
                parentCustomerId={parentCustomerId}
                storeName={storeNameParam}
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-white truncate">
                {delegated && storeNameParam ? storeNameParam : (businessData?.name || 'Azteka Foods, LLC')}
              </h1>
              <p className="text-slate-400 text-[11px] md:text-sm">
                {delegated && storeNameParam ? 'Ordering for store' :
                 activeTab === 'catalog' ? 'Wholesale Catalog' :
                 activeTab === 'favorites' ? 'Favoritos' :
                 activeTab === 'bundles' ? 'Bundle Orders' :
                 activeTab === 'categories' ? 'Categorias' :
                 activeTab === 'orders' ? 'Order History' :
                 activeTab === 'credits' ? 'Credits & Returns' : 'Wholesale Catalog'}
              </p>
            </div>
            {/* Cart button - hidden on mobile since we have FAB */}
            <button onClick={() => setIsCartOpen(true)} className="hidden md:flex relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <ShoppingCart className="w-6 h-6 text-white" />
              {storeCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-amber-500 text-slate-900">
                  {storeCartCount > 9 ? '9+' : storeCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Tab-based rendering */}
      <main className="relative max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
        {/* Catalog Tab - Render Blocks */}
        {activeTab === 'catalog' && (
          <>
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
                <BlockRenderer key={block.id} block={block} onAddToCart={handleAddToCart} getQuantity={wrappedGetQuantity} onSetQuantity={wrappedSetQuantity} cartTotal={totals.subtotal} onMultiStoreLongPress={handleProductLongPress} isMultiStoreOwner={isMultiStoreOwner} />
              ))
            )}
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && customerId && (
          <FavoritesTabContent customerId={customerId} />
        )}

        {/* Categories Tab - Placeholder for future implementation */}
        {activeTab === 'categories' && (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Categories</h2>
            <p className="text-slate-400">Browse products by category - coming soon</p>
          </div>
        )}

        {/* Orders Tab - Order History */}
        {activeTab === 'orders' && customerId && (
          <OrderHistoryTabContent customerId={customerId} />
        )}

        {/* Bundles Tab - For Carlos multi-store mode */}
        {activeTab === 'bundles' && (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Bundle Orders</h2>
            <p className="text-slate-400">Multi-store bundle ordering - coming soon</p>
          </div>
        )}

        {/* Credits Tab - For sales reps to apply returns/credits */}
        {activeTab === 'credits' && customerId && (
          <CreditsTabContent customerId={customerId} />
        )}
      </main>

      {/* Mobile Cart FAB */}
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl bg-amber-500 md:hidden">
        <ShoppingCart className="w-6 h-6 text-slate-900" />
        {storeCartCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-slate-900 text-amber-500">
            {storeCartCount > 9 ? '9+' : storeCartCount}
          </span>
        )}
      </button>

      {/* Cart drawer - filters by storeId for delegated orders */}
      <EnhancedCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        customerId={customerId || undefined}
        storeId={delegated ? customerId || undefined : undefined}
        isCustomerSelfOrder={userMode === 'customer'}
        returnUrl={delegated ? '/customer/multi-store' : '/customer/dashboard'}
      />

      {/* Multi-store selection menu for OWNER customers */}
      {isMultiStoreOwner && storeSelectionProduct && (
        <StoreSelectionMenu
          isOpen={!!storeSelectionProduct}
          onClose={() => {
            setStoreSelectionProduct(null)
            setStoreSelectionPosition(null)
          }}
          stores={multiStores}
          product={{
            id: storeSelectionProduct.id,
            name: storeSelectionProduct.name,
            price: typeof storeSelectionProduct.price === 'string' ? parseFloat(storeSelectionProduct.price) : storeSelectionProduct.price,
            imageUrl: storeSelectionProduct.imageUrl
          }}
          onAddToStore={handleAddToStore}
          position={storeSelectionPosition || undefined}
        />
      )}
    </div>
  )
}
