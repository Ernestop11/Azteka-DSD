'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import { useCartStore } from '@/store/cart'
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
  inStock?: boolean
  allowPresell?: boolean
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
  onLongPress?: (product: Product, position: { x: number; y: number }) => void
  multiStoreMode?: boolean
  // For delegated orders - attach store info to cart items
  storeId?: string
  storeName?: string
}


export default function ProductCard({ product, index = 0, mode = 'default', onCardClick, onLongPress, multiStoreMode = false, storeId, storeName }: ProductCardProps) {
  const { addItem, increment, decrement, setQuantity, getQuantity } = useCartStore()
  const [imageError, setImageError] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const isPreview = mode === 'preview'
  // Use composite key for delegated orders (productId-storeId)
  const itemKey = storeId ? `${product.id}-${storeId}` : product.id
  const quantity = isPreview ? 0 : getQuantity(itemKey)

  // Long press handlers for multi-store mode
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!onLongPress) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    touchStartPos.current = { x: clientX, y: clientY }

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      onLongPress(product, { x: clientX, y: clientY })
    }, 500) // 500ms long press threshold
  }, [onLongPress, product])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsLongPressing(false)
    touchStartPos.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    // Cancel long press if moved more than 10px
    const deltaX = Math.abs(clientX - touchStartPos.current.x)
    const deltaY = Math.abs(clientY - touchStartPos.current.y)
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }, [])

  // Simple, clean styling - no visual preset system
  const appliedTheme = {
    background: product.backgroundGradient || product.backgroundColor 
      ? `linear-gradient(135deg, ${product.backgroundColor || '#ffffff'}dd 0%, ${product.backgroundColor || '#f9fafb'}22 100%)`
      : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    background_classes: 'bg-white',
    border_classes: 'border border-gray-200',
    shadow_classes: 'shadow-sm',
    text_color: '#111827',
    badges: {
      featured: product.featured || false,
      seasonal: product.seasonal || false,
      new: product.newArrival || false,
      trending: product.trending || false,
    },
  }
  const backgroundStyle = { background: appliedTheme.background }

  const priceValue = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: priceValue,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
      // Attach store info for delegated orders (Carlos multi-store)
      storeId,
      storeName,
    })
  }

  const handleIncrement = () => {
    increment(itemKey)
  }

  const handleDecrement = () => {
    decrement(itemKey)
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
      whileTap={{ scale: isLongPressing ? 1.02 : 0.98 }}
      animate={{ scale: isLongPressing ? 0.95 : 1 }}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-500 hover:shadow-2xl ${isLongPressing ? 'ring-4 ring-emerald-500/50' : ''}`}
      style={backgroundStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Simple hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]" />

      {/* Layer 0: Content Container */}
      <div className="relative p-6 z-[3]">
        {/* Simple badges */}
        {(product.featured || product.seasonal || product.newArrival || product.trending || product.badgeText) && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {product.featured && (
              <span className="px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-black">
                FEATURED
              </span>
            )}
            {product.seasonal && (
              <span className="px-2 py-1 bg-rose-300 text-rose-900 rounded-full text-xs font-black">
                SEASONAL
              </span>
            )}
            {product.newArrival && (
              <span className="px-2 py-1 bg-emerald-400 text-emerald-900 rounded-full text-xs font-black">
                NEW
              </span>
            )}
            {product.trending && (
              <span className="px-2 py-1 bg-purple-400 text-purple-900 rounded-full text-xs font-black">
                TRENDING
              </span>
            )}
            {product.badgeText && (
              <span
                className="px-3 py-1 rounded-full text-xs font-black text-white"
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
              className="relative w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 drop-shadow-2xl select-none"
              loading="lazy"
              decoding="async"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                // Only set error if image truly failed (no dimensions)
                if (target.naturalWidth === 0 && target.naturalHeight === 0) {
                  setImageError(true)
                }
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500">
              No Image
            </div>
          )}

          {/* Out of Stock Banner - diagonal red banner over image (doesn't hide image) */}
          {product.inStock === false && !product.allowPresell && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              {/* Light overlay that preserves image visibility */}
              <div className="absolute inset-0 bg-black/15"></div>
              {/* Out of stock badge */}
              <div className="relative bg-red-600/95 text-white font-bold text-sm px-8 py-2 -rotate-12 shadow-xl uppercase tracking-wide border-2 border-white/30 rounded">
                Out of Stock
              </div>
            </div>
          )}

          {/* Pre-order Banner - for out of stock items that allow presell */}
          {product.inStock === false && product.allowPresell && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500/95 text-white font-bold text-sm px-8 py-2 -rotate-12 shadow-lg">
                PRE-ORDER
              </div>
            </div>
          )}
        </div>

        {/* Layer 5: Product Info */}
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className="text-xl font-bold line-clamp-2 text-gray-900">
            {product.name}
          </h3>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs font-mono text-gray-600">
              SKU: {product.sku}
            </p>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm line-clamp-2 text-gray-700">
              {product.description}
            </p>
          )}

          {/* Units Info */}
          <p className="text-xs text-gray-600">
            {product.unitsPerCase} units per case
          </p>

          {/* Category/Brand (if available) */}
          {(product.category || product.brand) && (
            <div className="text-xs text-gray-500 space-y-1">
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
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => {
                        const newQty = parseInt(inputValue) || 0
                        setQuantity(product.id, newQty)
                        setIsEditing(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newQty = parseInt(inputValue) || 0
                          setQuantity(product.id, newQty)
                          setIsEditing(false)
                        }
                        if (e.key === 'Escape') {
                          setIsEditing(false)
                        }
                      }}
                      autoFocus
                      className="w-12 px-1 py-1 text-sm font-medium text-center bg-white/80 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setInputValue(String(quantity))
                        setIsEditing(true)
                      }}
                      className="px-3 py-2 text-sm font-medium min-w-[3ch] text-center hover:bg-white/30 transition-colors cursor-text"
                      title="Click to edit quantity"
                    >
                      {quantity}
                    </button>
                  )}
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
            ) : product.inStock === false && product.allowPresell ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="relative w-full py-3 px-4 overflow-hidden rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                }}
              >
                <span className="relative">Pre-order</span>
              </motion.button>
            ) : product.inStock === false ? (
              <div className="w-full py-3 px-4 rounded-xl font-medium text-center bg-gray-300 text-gray-500 cursor-not-allowed">
                Out of Stock
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

