'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCartStore } from '@/store/cart'
import { useQuery } from '@tanstack/react-query'

interface Customer {
  id: string
  businessName: string
  priceTier: string
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
  // Order stats
  totalQuantityOrdered: number
  orderCount: number
  lastOrderDate: string
  suggestedQuantity: number
}

interface FavoritesUISettings {
  backgroundGradient: string
  backgroundPattern: string | null
  patternOpacity: number
  patternSize: string | null
  cardBackground: string
  cardBorderRadius: string
  cardShadow: string
  cardHoverScale: number
  // New fields matching Catalog builder
  cardStylePreset: string | null
  imageBg: string | null
  imageEffect: string | null
  primaryColor: string
  accentColor: string
  animation: string | null
  glowEffect: boolean
  headerBackground: string
  bottomBarStyle: string
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

const DEFAULT_UI_SETTINGS: FavoritesUISettings = {
  backgroundGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  backgroundPattern: null,
  patternOpacity: 0.1,
  patternSize: '40px 40px',
  cardBackground: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
  cardBorderRadius: '16px',
  cardShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  cardHoverScale: 1.02,
  // New fields matching Catalog builder
  cardStylePreset: 'dark-red',
  imageBg: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
  imageEffect: 'none',
  primaryColor: '#10b981',
  accentColor: '#3b82f6',
  animation: null,
  glowEffect: false,
  headerBackground: 'rgba(15,23,42,0.8)',
  bottomBarStyle: 'gradient',
}

// Catalog-style ProductCard for Favorites (matches frontend exactly)
function FavoriteProductCard({
  product,
  index,
  isExpanded,
  onTap,
  onAddToCart,
  quantity,
  onIncrement,
  onDecrement,
  onSetQuantity,
  uiSettings,
}: {
  product: FavoriteProduct
  index: number
  isExpanded: boolean
  onTap: () => void
  onAddToCart: (qty: number) => void
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  onSetQuantity: (qty: number) => void
  uiSettings: FavoritesUISettings
}) {
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCardTap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.qty-controls')) return
    onTap()
  }

  // Get style preset from UI settings
  const stylePreset = uiSettings.cardStylePreset ? CARD_STYLE_PRESETS[uiSettings.cardStylePreset] : null
  const imageEffectValue = uiSettings.imageEffect ? CARD_IMAGE_EFFECTS[uiSettings.imageEffect] : ''

  // Card background: use preset if available, otherwise fall back to product color or default
  const cardBackground = stylePreset?.cardBg
    || (product.backgroundGradient || product.backgroundColor
      ? `linear-gradient(135deg, ${product.backgroundColor || '#ffffff'}dd 0%, ${product.backgroundColor || '#f9fafb'}22 100%)`
      : uiSettings.cardBackground)

  // Image area background from preset or settings
  const imageBgStyle = stylePreset?.imageBg || uiSettings.imageBg || ''

  // Text color based on theme
  const textLight = stylePreset?.textLight ?? false

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.5) }}
      viewport={{ once: true }}
      whileHover={{ scale: uiSettings.cardHoverScale }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardTap}
      className={`
        group relative overflow-hidden shadow-sm
        transition-all duration-500 hover:shadow-2xl cursor-pointer
        ${isExpanded ? 'ring-2 ring-offset-2' : ''}
        ${uiSettings.glowEffect ? 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' : ''}
        ${textLight ? 'border border-slate-700' : 'border border-gray-200'}
      `}
      style={{
        background: cardBackground,
        borderRadius: uiSettings.cardBorderRadius,
        boxShadow: isExpanded ? `0 0 0 2px ${uiSettings.primaryColor}` : uiSettings.cardShadow,
      }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[2]" />

      {/* Content Container */}
      <div className="relative p-6 z-[3]">
        {/* Badges Row - matches catalog exactly */}
        {(product.featured || product.seasonal || product.newArrival || product.trending || product.badgeText || product.orderCount > 0) && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {/* Order count badge - unique to favorites */}
            {product.orderCount > 0 && (
              <span
                className="px-2 py-1 rounded-full text-xs font-black text-white"
                style={{ backgroundColor: uiSettings.accentColor }}
              >
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
              style={{ filter: imageEffectValue || 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))' }}
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
            <div className={`flex h-full w-full items-center justify-center text-sm font-semibold ${textLight ? 'text-slate-500' : 'bg-gray-100 text-gray-500'}`}>
              No Image
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

          {/* Tap to add indicator */}
          {!isExpanded && quantity === 0 && product.inStock !== false && (
            <div className="absolute inset-0 flex items-center justify-center transition-colors">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-gray-600 bg-white/90 px-3 py-1.5 rounded-full shadow-lg">
                Tap to add
              </span>
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

          {/* Price Section - matches catalog */}
          <div className={`pt-3 border-t ${textLight ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold" style={{ color: uiSettings.primaryColor }}>
                  ${product.customerPrice.toFixed(2)}
                </p>
                {product.customerPrice < product.price && (
                  <p className="text-sm text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </p>
                )}
                <p className="text-xs opacity-70">per case</p>
              </div>
              {/* Avg order badge */}
              {product.suggestedQuantity > 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Avg: {product.suggestedQuantity}
                </div>
              )}
            </div>

            {/* Quantity Controls */}
            <AnimatePresence>
              {(isExpanded || quantity > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="qty-controls"
                >
                  {quantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border border-gray-300/50 rounded-xl bg-white/20 backdrop-blur-sm flex-1">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); onDecrement(); }}
                          className="px-3 py-2 hover:bg-white/20 transition-colors rounded-l-xl"
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
                            className="w-12 px-1 py-1 text-sm font-medium text-center bg-white/80 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setInputValue(String(quantity))
                              setIsEditing(true)
                            }}
                            className="px-3 py-2 text-sm font-medium min-w-[3ch] text-center hover:bg-white/30 transition-colors cursor-text"
                          >
                            {quantity}
                          </button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); onIncrement(); }}
                          className="px-3 py-2 hover:bg-white/20 transition-colors rounded-r-xl"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                  ) : product.inStock === false && product.allowPresell ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onAddToCart(1); }}
                      className="relative w-full py-3 px-4 overflow-hidden rounded-xl font-medium text-white transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                    >
                      Pre-order
                    </motion.button>
                  ) : product.inStock === false ? (
                    <div className="w-full py-3 px-4 rounded-xl font-medium text-center bg-gray-300 text-gray-500 cursor-not-allowed">
                      Out of Stock
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); onAddToCart(1); }}
                          className="flex-1 py-3 rounded-xl font-medium text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${uiSettings.primaryColor} 0%, ${uiSettings.primaryColor}dd 100%)` }}
                        >
                          Add 1
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); onAddToCart(product.suggestedQuantity || 1); }}
                          className="flex-1 py-3 rounded-xl font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${uiSettings.accentColor} 0%, ${uiSettings.accentColor}dd 100%)` }}
                        >
                          +{product.suggestedQuantity || 1} avg
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default Add to Cart button when not expanded */}
            {!isExpanded && quantity === 0 && product.inStock !== false && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onTap(); }}
                className="relative w-full py-3 px-4 overflow-hidden rounded-xl font-medium text-white transition-all duration-300 focus:outline-none focus:ring-4"
                style={{
                  background: `linear-gradient(135deg, ${uiSettings.primaryColor} 0%, ${uiSettings.primaryColor}cc 100%)`,
                }}
              >
                <span className="relative">Add to Cart</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* In-cart indicator badge */}
        {quantity > 0 && !isExpanded && (
          <div
            className="absolute top-3 right-3 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10"
            style={{ backgroundColor: uiSettings.primaryColor }}
          >
            {quantity}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FavoritesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = searchParams.get('customer')

  const { addItem, increment, decrement, getQuantity, setQuantity, items, clearCart, switchCustomer, removeItem, customerId: cartCustomerId, _hasHydrated } = useCartStore()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Customer-specific prices map
  const [customerPrices, setCustomerPrices] = useState<Map<string, number>>(new Map())

  // Load UI settings with React Query - auto-refresh every 3 seconds for live preview
  const { data: settingsData } = useQuery<{ data: FavoritesUISettings }>({
    queryKey: ['favorites-ui-settings'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/favorites-settings')
      if (!res.ok) return { data: DEFAULT_UI_SETTINGS }
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  })

  const uiSettings = settingsData?.data || DEFAULT_UI_SETTINGS

  useEffect(() => {
    // Wait for hydration before switching customers to avoid race conditions
    if (customerId && _hasHydrated) {
      // Clear cart if switching to a different customer
      switchCustomer(customerId)
      loadFavorites()
    }
  }, [customerId, _hasHydrated])

  const loadFavorites = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/favorites`)
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
        setCustomer(data.customer)

        // Build customer price map
        const priceMap = new Map<string, number>()
        data.favorites?.forEach((p: FavoriteProduct) => {
          priceMap.set(p.id, p.customerPrice)
        })
        setCustomerPrices(priceMap)
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = useCallback((product: FavoriteProduct, qty: number) => {
    const currentQty = getQuantity(product.id)
    if (currentQty === 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        quantity: qty,
        imageUrl: product.imageUrl || undefined,
      })
    } else {
      setQuantity(product.id, currentQty + qty)
    }
    // Collapse card after adding
    setExpandedCard(null)
  }, [addItem, getQuantity, setQuantity])

  const handleCardTap = useCallback((productId: string) => {
    setExpandedCard(prev => prev === productId ? null : productId)
  }, [])

  const submitOrder = async () => {
    if (!customer || items.length === 0) return

    setSubmitting(true)
    try {
      const orderData = {
        customerId: customer.id,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const data = await res.json()
        // Update last visit date
        await fetch(`/api/rep/customer/${customerId}/visit`, { method: 'POST' })

        alert(`Order submitted! ${data.data?.workflow?.printed ? 'Picking list printed.' : ''}`)
        clearCart()
        router.push('/rep/dashboard')
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate cart total with customer prices
  const cartTotal = items.reduce((sum, item) => {
    const price = customerPrices.get(item.id) || item.price
    return sum + price * item.quantity
  }, 0)

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!customerId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No customer selected</p>
          <Link href="/rep" className="text-blue-400 hover:text-blue-300">
            Go back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading favorites...</div>
      </div>
    )
  }

  // Build background style from settings
  const pageBackgroundStyle = {
    background: uiSettings.backgroundGradient,
    ...(uiSettings.backgroundPattern && {
      backgroundImage: `${uiSettings.backgroundPattern}, ${uiSettings.backgroundGradient}`,
      backgroundSize: uiSettings.patternSize || '40px 40px',
    }),
  }

  return (
    <div className="min-h-screen text-white" style={pageBackgroundStyle}>
      {/* Header */}
      <div className="backdrop-blur-lg border-b border-slate-700 px-4 py-3 sticky top-0 z-40" style={{ background: uiSettings.headerBackground }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/rep"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold">{customer?.businessName}</h1>
              <p className="text-slate-400 text-xs">
                Tier {customer?.priceTier} • {favorites.length} favorites
              </p>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Favorites Info Banner */}
      {favorites.length > 0 && (
        <div className="bg-blue-900/30 border-b border-blue-800/50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-blue-200">
                Products this customer orders regularly
              </span>
            </div>
            <Link
              href={`/catalog?customer=${customerId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Full Catalog →
            </Link>
          </div>
        </div>
      )}

      {/* No Favorites State */}
      {favorites.length === 0 && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No Order History</h2>
          <p className="text-slate-400 mb-6">
            This customer hasn't ordered before. Start by browsing the catalog.
          </p>
          <Link
            href={`/catalog?customer=${customerId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors"
          >
            Browse Catalog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Favorites Grid */}
      {favorites.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {favorites.map((product, index) => (
              <FavoriteProductCard
                key={product.id}
                product={product}
                index={index}
                isExpanded={expandedCard === product.id}
                onTap={() => handleCardTap(product.id)}
                onAddToCart={(qty) => handleAddToCart(product, qty)}
                quantity={getQuantity(product.id)}
                onIncrement={() => increment(product.id)}
                onDecrement={() => decrement(product.id)}
                onSetQuantity={(qty) => setQuantity(product.id, qty)}
                uiSettings={uiSettings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar - Always visible when items in cart */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/98 to-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-4 z-50 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            {/* Cart summary row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 rounded-full p-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{cartItemCount} items in cart</p>
                  <p className="text-xl font-bold text-white">${cartTotal.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="text-sm text-slate-400 hover:text-white transition-colors underline"
              >
                View Cart
              </button>
            </div>

            {/* Action buttons row */}
            <div className="flex gap-3">
              <Link
                href={`/catalog?customer=${customerId}`}
                className="flex-1 py-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors text-center flex items-center justify-center gap-2"
              >
                <span>Continue to Catalog</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state bottom bar - when no items, show "Continue to Catalog" */}
      {items.length === 0 && favorites.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/98 to-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-4 z-50">
          <div className="max-w-7xl mx-auto">
            <Link
              href={`/catalog?customer=${customerId}`}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse Full Catalog</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold">Cart ({cartItemCount})</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {items.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const customerPrice = customerPrices.get(item.id) || item.price
                      return (
                        <div key={item.id} className="bg-slate-800 rounded-xl p-3 relative group">
                          {/* Delete button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Remove item"
                          >
                            ✕
                          </button>
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(item.imageUrl)}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm truncate flex-1">{item.name}</h4>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 md:hidden"
                                >
                                  Remove
                                </button>
                              </div>
                              <p className="text-emerald-400 text-sm">${customerPrice.toFixed(2)}/case</p>
                              <div className="flex items-center gap-1 mt-2">
                                <button
                                  onClick={() => decrement(item.id)}
                                  className="w-9 h-9 bg-slate-700 hover:bg-red-600 active:bg-red-500 rounded-lg text-lg font-bold transition-colors"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1
                                    setQuantity(item.id, Math.max(1, val))
                                  }}
                                  className="w-14 h-9 bg-slate-700 rounded-lg text-center text-sm font-bold text-white border-0 focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                  onClick={() => increment(item.id)}
                                  className="w-9 h-9 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-lg text-lg font-bold transition-colors"
                                >
                                  +
                                </button>
                                <span className="ml-auto font-bold text-sm">
                                  ${(customerPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t border-slate-700 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/catalog?customer=${customerId}`}
                    onClick={() => setShowCart(false)}
                    className="block w-full py-3 text-center bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                  >
                    Browse Catalog for More
                  </Link>
                  <button
                    onClick={() => {
                      setShowCart(false)
                      submitOrder()
                    }}
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 rounded-xl font-bold transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Place Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom padding for sticky bar */}
      {items.length > 0 && <div className="h-24" />}
    </div>
  )
}

export default function RepOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <FavoritesContent />
    </Suspense>
  )
}
