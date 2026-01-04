'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Package, ShoppingCart, Plus, Minus } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCart } from '@/hooks/useCart'
import { useQuery } from '@tanstack/react-query'

// Favorites UI Settings interface (matches API)
interface FavoritesUISettings {
  cardStylePreset?: string
  cardBackground?: string
  imageBg?: string
  imageEffect?: string
  backgroundGradient?: string
  backgroundPattern?: string | null
  patternOpacity?: number
  primaryColor?: string
  accentColor?: string
}

// Card Style Presets - matches FavoritesUIBuilder
const CARD_STYLE_PRESETS: Record<string, { cardBg: string; imageBg: string; accentColor: string; textLight: boolean }> = {
  'dark-red': { cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)', accentColor: '#ef4444', textLight: true },
  'dark-emerald': { cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', accentColor: '#10b981', textLight: true },
  'dark-gold': { cardBg: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)', imageBg: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)', accentColor: '#f59e0b', textLight: true },
  'dark-purple': { cardBg: 'linear-gradient(180deg, #1e1b4b 0%, #0f0d22 100%)', imageBg: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)', accentColor: '#8b5cf6', textLight: true },
  'clean-white': { cardBg: '#ffffff', imageBg: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', accentColor: '#ef4444', textLight: false },
  'aztec-jade': { cardBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', imageBg: 'linear-gradient(180deg, #022c22 0%, #064e3b 100%)', accentColor: '#fbbf24', textLight: true },
  'fiesta-red': { cardBg: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)', imageBg: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 100%)', accentColor: '#fbbf24', textLight: true },
  'ocean-blue': { cardBg: 'linear-gradient(180deg, #0c4a6e 0%, #075985 100%)', imageBg: 'linear-gradient(180deg, #082f49 0%, #0c4a6e 100%)', accentColor: '#0ea5e9', textLight: true },
}

// Image Effects - matches FavoritesUIBuilder
const CARD_IMAGE_EFFECTS: Record<string, string> = {
  'none': '',
  'soft-shadow': 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
  'strong-shadow': 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
  'glow-white': 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
  'glow-gold': 'drop-shadow(0 0 20px rgba(255,215,0,0.4))',
  'glow-emerald': 'drop-shadow(0 0 20px rgba(16,185,129,0.4))',
  'float-3d': 'drop-shadow(0 25px 25px rgba(0,0,0,0.25)) drop-shadow(0 5px 10px rgba(0,0,0,0.1))',
  'neon-red': 'drop-shadow(0 0 10px rgba(239,68,68,0.8)) drop-shadow(0 0 30px rgba(239,68,68,0.5)) drop-shadow(0 0 50px rgba(239,68,68,0.3))',
  'neon-blue': 'drop-shadow(0 0 10px rgba(59,130,246,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 0 50px rgba(59,130,246,0.3))',
  'neon-purple': 'drop-shadow(0 0 10px rgba(139,92,246,0.8)) drop-shadow(0 0 30px rgba(139,92,246,0.5)) drop-shadow(0 0 50px rgba(139,92,246,0.3))',
  'fire': 'drop-shadow(0 0 15px rgba(251,146,60,0.9)) drop-shadow(0 0 30px rgba(239,68,68,0.6)) drop-shadow(0 5px 20px rgba(234,179,8,0.4))',
  'ice': 'drop-shadow(0 0 15px rgba(147,197,253,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 5px 20px rgba(255,255,255,0.4))',
  'electric': 'drop-shadow(0 0 8px rgba(250,204,21,1)) drop-shadow(0 0 20px rgba(234,179,8,0.8)) drop-shadow(0 0 40px rgba(251,191,36,0.5))',
  'premium': 'drop-shadow(0 0 15px rgba(251,191,36,0.9)) drop-shadow(0 10px 30px rgba(180,83,9,0.6)) drop-shadow(0 5px 15px rgba(255,215,0,0.4))',
  'hologram': 'drop-shadow(-5px 0 15px rgba(239,68,68,0.5)) drop-shadow(5px 0 15px rgba(59,130,246,0.5)) drop-shadow(0 0 20px rgba(16,185,129,0.4))',
  'mega-3d': 'drop-shadow(0 35px 35px rgba(0,0,0,0.4)) drop-shadow(0 15px 15px rgba(0,0,0,0.2)) drop-shadow(0 5px 5px rgba(0,0,0,0.1))',
  'spotlight': 'drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
}

interface FavoriteProduct {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number
  customerPrice: number
  imageUrl: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
  inStock: boolean
  allowPresell?: boolean
  unitsPerCase: number
  featured?: boolean
  seasonal?: boolean
  newArrival?: boolean
  trending?: boolean
  backgroundColor?: string | null
  backgroundGradient?: string | null
  badgeText?: string | null
  badgeColor?: string | null
  totalQuantityOrdered: number
  orderCount: number
  lastOrderDate: string
  suggestedQuantity: number
}

interface FavoritesTabContentProps {
  customerId: string
  onAddToCart?: (product: FavoriteProduct, quantity: number) => void
}

// Product Image with fallback
function ProductImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 ${className || ''}`}>
        <Package className="w-12 h-12 text-slate-600" />
      </div>
    )
  }
  return (
    <img
      src={getPublicImageUrl(src)}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

// Favorite Product Card - matches frontend catalog ProductCard exactly
// Tap on card adds item directly (no "Tap to add" button)
function FavoriteProductCard({
  product,
  index,
  quantity,
  onIncrement,
  onDecrement,
  onSetQuantity,
  onAddToCart,
  uiSettings,
}: {
  product: FavoriteProduct
  index: number
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  onSetQuantity: (qty: number) => void
  onAddToCart: () => void
  uiSettings?: FavoritesUISettings
}) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Tap on card adds to cart (like frontend catalog)
  const handleCardTap = (e: React.MouseEvent) => {
    // Don't add if clicking on quantity controls
    if ((e.target as HTMLElement).closest('.qty-controls')) return
    // Don't add if out of stock
    if (product.inStock === false && !product.allowPresell) return
    // Add to cart on tap
    onAddToCart()
  }

  // Get style preset from UI settings
  const stylePreset = uiSettings?.cardStylePreset ? CARD_STYLE_PRESETS[uiSettings.cardStylePreset] : null
  const imageEffect = uiSettings?.imageEffect ? CARD_IMAGE_EFFECTS[uiSettings.imageEffect] : ''

  // Card background: use preset if available, otherwise fall back to product color or default
  const cardBackground = stylePreset?.cardBg
    || uiSettings?.cardBackground
    || (product.backgroundGradient || product.backgroundColor
      ? `linear-gradient(135deg, ${product.backgroundColor || '#ffffff'}dd 0%, ${product.backgroundColor || '#f9fafb'}22 100%)`
      : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)')

  // Image area background from preset or settings
  const imageBgStyle = stylePreset?.imageBg || uiSettings?.imageBg || ''

  // Text color based on theme
  const textLight = stylePreset?.textLight ?? false

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.5) }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardTap}
      className={`group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:shadow-2xl cursor-pointer ${textLight ? 'border-slate-700' : 'border-gray-200'}`}
      style={{ background: cardBackground }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]" />

      {/* Content Container */}
      <div className="relative p-6 z-[3]">
        {/* Badges Row - matches catalog */}
        {(product.featured || product.seasonal || product.newArrival || product.trending || product.badgeText || product.orderCount > 0) && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {/* Order count badge - unique to favorites */}
            {product.orderCount > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-black text-white bg-blue-500">
                {product.orderCount}x ordered
              </span>
            )}
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
                style={{ backgroundColor: product.badgeColor || '#EF4444' }}
              >
                {product.badgeText}
              </span>
            )}
          </div>
        )}

        {/* Product Image - matches catalog exactly */}
        <div
          className="aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl shadow-inner relative"
          style={{ background: imageBgStyle || (textLight ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.95)') }}
        >
          {/* Radial gradient tint (only if no preset) */}
          {!stylePreset && product.backgroundColor && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${product.backgroundColor}88 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Product Image with effect filter */}
          {!imageError && product.imageUrl ? (
            <img
              src={getPublicImageUrl(product.imageUrl)}
              alt={product.name}
              className="relative w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 select-none pointer-events-none"
              style={{ filter: imageEffect || 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))' }}
              loading="lazy"
              decoding="async"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.naturalWidth === 0 && target.naturalHeight === 0) {
                  setImageError(true)
                }
              }}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${textLight ? 'text-slate-600' : 'bg-gray-100 text-gray-500'}`}>
              <Package className="w-12 h-12" />
            </div>
          )}

          {/* Out of Stock Banner */}
          {product.inStock === false && !product.allowPresell && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="absolute inset-0 bg-black/15"></div>
              <div className="relative bg-red-600/95 text-white font-bold text-sm px-8 py-2 -rotate-12 shadow-xl uppercase tracking-wide border-2 border-white/30 rounded">
                Out of Stock
              </div>
            </div>
          )}

          {/* Pre-order Banner */}
          {product.inStock === false && product.allowPresell && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500/95 text-white font-bold text-sm px-8 py-2 -rotate-12 shadow-lg">
                PRE-ORDER
              </div>
            </div>
          )}
        </div>

        {/* Product Info - matches catalog exactly */}
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className={`text-xl font-bold line-clamp-2 ${textLight ? 'text-white' : 'text-gray-900'}`}>
            {product.name}
          </h3>

          {/* SKU */}
          {product.sku && (
            <p className={`text-xs font-mono ${textLight ? 'text-slate-400' : 'text-gray-600'}`}>
              SKU: {product.sku}
            </p>
          )}

          {/* Description */}
          {product.description && (
            <p className={`text-sm line-clamp-2 ${textLight ? 'text-slate-300' : 'text-gray-700'}`}>
              {product.description}
            </p>
          )}

          {/* Units Info */}
          <p className={`text-xs ${textLight ? 'text-slate-400' : 'text-gray-600'}`}>
            {product.unitsPerCase} units per case
          </p>

          {/* Category/Brand */}
          {(product.category || product.brand) && (
            <div className={`text-xs space-y-1 ${textLight ? 'text-slate-500' : 'text-gray-500'}`}>
              {product.category && <div>Category: {product.category.name}</div>}
              {product.brand && <div>Brand: {product.brand.name}</div>}
            </div>
          )}

          {/* Price Section */}
          <div className={`pt-3 border-t ${textLight ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  ${product.customerPrice.toFixed(2)}
                </p>
                {product.customerPrice < product.price && (
                  <p className="text-xs text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </div>
              {/* Avg order badge */}
              {product.suggestedQuantity > 0 && (
                <div className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Avg: {product.suggestedQuantity}
                </div>
              )}
            </div>

            {/* Quantity Controls - ONLY show when item is in cart */}
            {quantity > 0 && (
              <div className="flex items-center gap-2 qty-controls mt-3">
                <div className="flex items-center gap-1 border border-gray-300/50 rounded-xl bg-white/50 backdrop-blur-sm flex-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onDecrement(); }}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-l-xl"
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
                        onSetQuantity(newQty)
                        setIsEditing(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newQty = parseInt(inputValue) || 0
                          onSetQuantity(newQty)
                          setIsEditing(false)
                        }
                        if (e.key === 'Escape') setIsEditing(false)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-12 px-1 py-1 text-sm font-bold text-center bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setInputValue(String(quantity))
                        setIsEditing(true)
                      }}
                      className="px-3 py-2 text-sm font-bold min-w-[3ch] text-center hover:bg-gray-100 transition-colors cursor-text"
                      title="Click to edit quantity"
                    >
                      {quantity}
                    </button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onIncrement(); }}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    +
                  </motion.button>
                </div>
              </div>
            )}

            {/* Out of stock indicator - no button, just text */}
            {quantity === 0 && product.inStock === false && !product.allowPresell && (
              <div className="mt-2 text-center text-xs text-red-500 font-medium">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* In-cart indicator badge */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
            {quantity}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function FavoritesTabContent({ customerId }: FavoritesTabContentProps) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState<string>('')

  const { add, getQuantity, setQuantity, increment, decrement } = useCart()

  // Fetch UI settings with React Query - auto-refresh every 3 seconds for live preview
  const { data: settingsData } = useQuery<{ data: FavoritesUISettings }>({
    queryKey: ['favorites-ui-settings'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/favorites-settings')
      if (!res.ok) return { data: {} }
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  })

  const uiSettings = settingsData?.data

  // Fetch favorites when customerId changes
  useEffect(() => {
    if (!customerId) return

    const loadFavorites = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/rep/customer/${customerId}/favorites`)
        if (res.ok) {
          const data = await res.json()
          setFavorites(data.favorites || [])
          setCustomerName(data.customer?.businessName || '')
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [customerId])

  // Add to cart handler - adds 1 item on tap
  const handleAddToCart = useCallback((product: FavoriteProduct) => {
    const currentQty = getQuantity(product.id)
    if (currentQty === 0) {
      // Add new item to cart
      add({
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        imageUrl: getPublicImageUrl(product.imageUrl) || undefined,
        quantity: 1,
      })
    } else {
      // Increment existing item
      increment(product.id)
    }
  }, [add, getQuantity, increment])

  const handleSetQuantity = useCallback((product: FavoriteProduct, qty: number) => {
    if (qty === 0) {
      setQuantity(product.id, 0)
    } else if (getQuantity(product.id) === 0) {
      // Add new item to cart
      add({
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        imageUrl: getPublicImageUrl(product.imageUrl) || undefined,
        quantity: qty,
      })
    } else {
      setQuantity(product.id, qty)
    }
  }, [add, getQuantity, setQuantity])

  const handleIncrement = useCallback((productId: string) => {
    increment(productId)
  }, [increment])

  const handleDecrement = useCallback((productId: string) => {
    decrement(productId)
  }, [decrement])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading favorites...</p>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Star className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Favorites Yet</h2>
        <p className="text-slate-400 text-center mb-6">
          {customerName ? `${customerName} hasn't ordered before.` : 'No order history for this customer.'}
        </p>
        <p className="text-slate-500 text-sm text-center">
          Browse the catalog to start adding products.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Info banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Star className="w-4 h-4" />
          <span className="text-sm">
            {favorites.length} products {customerName ? `${customerName} orders regularly` : 'ordered regularly'}
          </span>
        </div>
      </div>

      {/* Favorites Grid - 2 columns on mobile, more on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-3">
        {favorites.map((product, index) => (
          <FavoriteProductCard
            key={product.id}
            product={product}
            index={index}
            quantity={getQuantity(product.id)}
            onIncrement={() => handleIncrement(product.id)}
            onDecrement={() => handleDecrement(product.id)}
            onSetQuantity={(qty) => handleSetQuantity(product, qty)}
            onAddToCart={() => handleAddToCart(product)}
            uiSettings={uiSettings}
          />
        ))}
      </div>
    </div>
  )
}
