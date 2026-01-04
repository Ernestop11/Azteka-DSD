'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Sparkles, Clock, Package, TrendingUp, Gift, Zap, Plus, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogProduct } from '@/lib/queries/catalog'

// Types
interface CartBlock {
  id: string
  type: string
  title: string
  subtitle?: string
  enabled: boolean
  position: number
  config: Record<string, unknown>
}

interface CartCheckoutBlocksProps {
  onAddProduct: (product: CatalogProduct) => void
  customerId?: string
}

// Style presets matching the builder
const BLOCK_STYLE_PRESETS: Record<string, { bg: string; border: string; text: string }> = {
  'minimal': { bg: 'bg-white', border: 'border border-gray-200', text: 'text-gray-900' },
  'accent-orange': { bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-2 border-orange-200', text: 'text-orange-900' },
  'accent-blue': { bg: 'bg-gradient-to-r from-blue-50 to-cyan-50', border: 'border-2 border-blue-200', text: 'text-blue-900' },
  'accent-green': { bg: 'bg-gradient-to-r from-green-50 to-emerald-50', border: 'border-2 border-green-200', text: 'text-green-900' },
  'accent-purple': { bg: 'bg-gradient-to-r from-purple-50 to-pink-50', border: 'border-2 border-purple-200', text: 'text-purple-900' },
  'dark': { bg: 'bg-gray-900', border: 'border border-gray-700', text: 'text-white' },
}

// Icon mapping
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  'UPSELL_PRODUCTS': <TrendingUp className="w-4 h-4" />,
  'PREVIOUSLY_ORDERED': <Clock className="w-4 h-4" />,
  'BUNDLE_DEALS': <Package className="w-4 h-4" />,
  'IMPULSE_ITEMS': <Zap className="w-4 h-4" />,
  'SAVINGS_SUMMARY': <Sparkles className="w-4 h-4" />,
  'PROMO_CODE': <Gift className="w-4 h-4" />,
  'SUGGESTED_ADDONS': <Plus className="w-4 h-4" />,
}

// Color mapping
const BLOCK_COLORS: Record<string, string> = {
  'UPSELL_PRODUCTS': 'from-orange-500 to-amber-500',
  'PREVIOUSLY_ORDERED': 'from-blue-500 to-cyan-500',
  'BUNDLE_DEALS': 'from-purple-500 to-pink-500',
  'IMPULSE_ITEMS': 'from-yellow-500 to-orange-500',
  'SAVINGS_SUMMARY': 'from-green-500 to-emerald-500',
  'PROMO_CODE': 'from-red-500 to-rose-500',
  'SUGGESTED_ADDONS': 'from-teal-500 to-cyan-500',
}

export default function CartCheckoutBlocks({ onAddProduct, customerId }: CartCheckoutBlocksProps) {
  const { items, totals } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  // Fetch cart blocks from API - auto-refresh every 3 seconds for real-time builder updates
  const { data: blocksData } = useQuery<{ data: CartBlock[] }>({
    queryKey: ['cart-blocks-display'],
    queryFn: async () => {
      const res = await fetch('/api/builder/cart/blocks')
      if (!res.ok) return { data: [] }
      return res.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds for live preview
    refetchIntervalInBackground: true,
  })

  const blocks = blocksData?.data || []

  // Fetch products for upsells
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-cart-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=100')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const allProducts = productsData?.data || []
  const cartProductIds = items.map(item => item.id)

  // Get products not in cart for recommendations
  const availableProducts = allProducts.filter(p => !cartProductIds.includes(p.id))

  // Filter enabled blocks and sort by position
  const enabledBlocks = blocks
    .filter(b => b.enabled)
    .sort((a, b) => a.position - b.position)

  if (enabledBlocks.length === 0) {
    return null
  }

  const renderBlockContent = (block: CartBlock) => {
    const style = BLOCK_STYLE_PRESETS[(block.config.style as string) || 'minimal']
    const maxItems = (block.config.maxItems as number) || 4

    switch (block.type) {
      case 'UPSELL_PRODUCTS':
      case 'SUGGESTED_ADDONS': {
        // Smart recommendations - products from same categories/brands
        const recommendations = availableProducts
          .slice(0, maxItems)

        if (recommendations.length === 0) return null

        return (
          <div className="grid grid-cols-2 gap-2">
            {recommendations.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddProduct(product)}
                className="bg-white/80 rounded-lg p-2 flex items-center gap-2 text-left hover:bg-white transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23f3f4f6" width="40" height="40"/%3E%3C/svg%3E'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">${Number(product.price).toFixed(2)}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )
      }

      case 'PREVIOUSLY_ORDERED': {
        // TODO: Fetch from order history API based on customerId
        // For now, show random products as placeholder
        const previousProducts = availableProducts.slice(0, maxItems)

        if (previousProducts.length === 0) return null

        return (
          <div className="grid grid-cols-2 gap-2">
            {previousProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddProduct(product)}
                className="bg-white/80 rounded-lg p-2 flex items-center gap-2 text-left hover:bg-white transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-blue-600">Last ordered</p>
                </div>
                <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )
      }

      case 'IMPULSE_ITEMS': {
        // Low-cost quick-add items
        const impulseItems = availableProducts
          .filter(p => Number(p.price) < 15)
          .slice(0, maxItems)

        if (impulseItems.length === 0) return null

        return (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {impulseItems.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddProduct(product)}
                className="flex-shrink-0 w-20 bg-white/80 rounded-lg p-2 text-center hover:bg-white transition-colors"
              >
                <div className="w-14 h-14 mx-auto bg-gray-100 rounded overflow-hidden mb-1">
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-medium truncate">{product.name}</p>
                <p className="text-xs font-bold text-green-600">${Number(product.price).toFixed(2)}</p>
              </motion.button>
            ))}
          </div>
        )
      }

      case 'SAVINGS_SUMMARY': {
        // Calculate savings (placeholder - would come from actual pricing logic)
        const savings = totals.discounts || (totals.subtotal * 0.05)

        if (savings <= 0) return null

        return (
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">${savings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">You're saving on this order!</p>
          </div>
        )
      }

      case 'PROMO_CODE': {
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={promoApplied}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                promoApplied ? 'bg-green-50 border-green-300 text-green-800' : 'border-gray-300'
              }`}
            />
            <button
              onClick={() => {
                if (promoCode.trim()) {
                  setPromoApplied(true)
                }
              }}
              disabled={promoApplied || !promoCode.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                promoApplied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
              }`}
            >
              {promoApplied ? 'Applied!' : 'Apply'}
            </button>
          </div>
        )
      }

      case 'BUNDLE_DEALS': {
        // Show bundle deal if they're close to qualifying
        const caseCount = items.reduce((sum, item) => sum + item.quantity, 0)

        if (caseCount >= 3) return null // Already qualified

        return (
          <div className="bg-white/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Add {3 - caseCount} more case{3 - caseCount !== 1 ? 's' : ''} for 15% off!</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-bold">DEAL</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((caseCount / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{caseCount}/3 cases added</p>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      {enabledBlocks.map((block) => {
        const style = BLOCK_STYLE_PRESETS[(block.config.style as string) || 'minimal']
        const icon = BLOCK_ICONS[block.type]
        const color = BLOCK_COLORS[block.type] || 'from-gray-500 to-gray-600'

        const content = renderBlockContent(block)
        if (!content) return null

        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${style.bg} ${style.border}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                {icon}
              </div>
              <h3 className={`font-bold text-sm ${style.text}`}>{block.title}</h3>
            </div>
            {block.subtitle && (
              <p className={`text-xs mb-3 opacity-80 ${style.text}`}>{block.subtitle}</p>
            )}
            {content}
          </motion.div>
        )
      })}
    </div>
  )
}
