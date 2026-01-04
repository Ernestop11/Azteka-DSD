'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Sparkles, Clock, Package, TrendingUp, Gift, Zap, Plus, ArrowRight, ShoppingCart, Minus, Trash2 } from 'lucide-react'
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
  products?: { id: string; productId: string; displayOrder: number; product: CatalogProduct }[]
}

// Simulated cart items for preview
const PREVIEW_CART_ITEMS = [
  { id: '1', name: 'Azteka Hot Sauce', sku: 'AHS-001', price: 24.99, quantity: 2, imageUrl: null },
  { id: '2', name: 'Salsa Verde Case', sku: 'SVG-012', price: 18.50, quantity: 1, imageUrl: null },
  { id: '3', name: 'Corn Tortillas 30pk', sku: 'CT-030', price: 12.99, quantity: 3, imageUrl: null },
]

// Style presets
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
  'CART_ITEMS': <ShoppingCart className="w-4 h-4" />,
  'COMPLETE_ORDER': <Sparkles className="w-4 h-4" />,
  'TRENDING_NOW': <TrendingUp className="w-4 h-4" />,
  'PREVIOUSLY_ORDERED': <Clock className="w-4 h-4" />,
  'BUNDLE_PROGRESS': <Package className="w-4 h-4" />,
  'REWARDS_STATUS': <Gift className="w-4 h-4" />,
  'UPSELL_PRODUCTS': <TrendingUp className="w-4 h-4" />,
  'IMPULSE_ITEMS': <Zap className="w-4 h-4" />,
  'SAVINGS_SUMMARY': <Sparkles className="w-4 h-4" />,
  'PROMO_CODE': <Gift className="w-4 h-4" />,
  'SUGGESTED_ADDONS': <Plus className="w-4 h-4" />,
}

// Color mapping
const BLOCK_COLORS: Record<string, string> = {
  'CART_ITEMS': 'from-emerald-500 to-green-500',
  'COMPLETE_ORDER': 'from-amber-500 to-orange-500',
  'TRENDING_NOW': 'from-orange-500 to-amber-500',
  'PREVIOUSLY_ORDERED': 'from-blue-500 to-cyan-500',
  'BUNDLE_PROGRESS': 'from-purple-500 to-pink-500',
  'REWARDS_STATUS': 'from-pink-500 to-rose-500',
  'UPSELL_PRODUCTS': 'from-orange-500 to-amber-500',
  'IMPULSE_ITEMS': 'from-yellow-500 to-orange-500',
  'SAVINGS_SUMMARY': 'from-green-500 to-emerald-500',
  'PROMO_CODE': 'from-red-500 to-rose-500',
  'SUGGESTED_ADDONS': 'from-teal-500 to-cyan-500',
}

export default function CartPreviewPage() {
  // Fetch cart blocks from API with auto-refresh for live preview
  const { data: blocksData } = useQuery<{ data: CartBlock[] }>({
    queryKey: ['cart-blocks-preview'],
    queryFn: async () => {
      const res = await fetch('/api/builder/cart/blocks')
      if (!res.ok) return { data: [] }
      return res.json()
    },
    refetchInterval: 2000, // Faster refresh for preview
    refetchIntervalInBackground: true,
  })

  // Fetch products for upsells
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-cart-preview'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=20')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  const blocks = blocksData?.data || []
  const allProducts = productsData?.data || []
  const subtotal = PREVIEW_CART_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Filter enabled blocks and sort by position
  const enabledBlocks = blocks
    .filter(b => b.enabled)
    .sort((a, b) => a.position - b.position)

  const renderBlockContent = (block: CartBlock) => {
    const style = BLOCK_STYLE_PRESETS[(block.config?.style as string) || 'minimal']
    const maxItems = (block.config?.maxItems as number) || 4

    switch (block.type) {
      case 'CART_ITEMS':
        return (
          <div className="space-y-2">
            {PREVIEW_CART_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white/80 rounded-lg p-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-bold text-right w-16">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )

      case 'TRENDING_NOW':
      case 'COMPLETE_ORDER':
      case 'UPSELL_PRODUCTS':
      case 'SUGGESTED_ADDONS': {
        const productsToShow = block.products?.length
          ? block.products.slice(0, maxItems).map(bp => bp.product)
          : allProducts.slice(0, maxItems)

        if (productsToShow.length === 0) return <p className="text-xs text-gray-500">No products configured</p>

        return (
          <div className="grid grid-cols-2 gap-2">
            {productsToShow.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 rounded-lg p-2 flex items-center gap-2 text-left hover:bg-white transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">${Number(product.price).toFixed(2)}</p>
                </div>
                <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )
      }

      case 'PREVIOUSLY_ORDERED':
        return (
          <div className="grid grid-cols-2 gap-2">
            {allProducts.slice(0, maxItems).map((product) => (
              <div key={product.id} className="bg-white/80 rounded-lg p-2 flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-50 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-blue-600">Reorder</p>
                </div>
              </div>
            ))}
          </div>
        )

      case 'BUNDLE_PROGRESS': {
        const caseCount = PREVIEW_CART_ITEMS.reduce((sum, item) => sum + item.quantity, 0)
        const targetCases = 10
        const progress = Math.min((caseCount / targetCases) * 100, 100)

        return (
          <div className="bg-white/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Add {targetCases - caseCount} more cases for 15% off!</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-bold">DEAL</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{caseCount}/{targetCases} cases</p>
          </div>
        )
      }

      case 'REWARDS_STATUS':
        return (
          <div className="bg-white/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-pink-600">1,250</p>
                <p className="text-xs text-gray-500">Reward Points</p>
              </div>
              <Gift className="w-10 h-10 text-pink-400" />
            </div>
            <div className="mt-2 p-2 bg-pink-50 rounded-lg">
              <p className="text-xs text-pink-800 font-medium">250 points away from a free case!</p>
            </div>
          </div>
        )

      case 'SAVINGS_SUMMARY':
        return (
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">${(subtotal * 0.08).toFixed(2)}</p>
            <p className="text-xs text-gray-600">You're saving on this order!</p>
          </div>
        )

      case 'PROMO_CODE':
        return (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              Apply
            </button>
          </div>
        )

      case 'IMPULSE_ITEMS':
        return (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {allProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="flex-shrink-0 w-20 bg-white/80 rounded-lg p-2 text-center">
                <div className="w-14 h-14 mx-auto bg-gray-100 rounded overflow-hidden mb-1 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-[10px] font-medium truncate">{product.name}</p>
                <p className="text-xs font-bold text-green-600">${Number(product.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )

      default:
        return <p className="text-xs text-gray-500">Block type: {block.type}</p>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md mx-auto p-4">
        {/* Cart Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-t-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <h1 className="text-xl font-bold">Your Cart</h1>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">{PREVIEW_CART_ITEMS.reduce((sum, i) => sum + i.quantity, 0)} cases</p>
              <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        <div className="bg-slate-800/50 p-4 space-y-4 rounded-b-2xl">
          {enabledBlocks.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No cart blocks configured</p>
              <p className="text-slate-500 text-xs mt-1">Add blocks in the builder to see them here</p>
            </div>
          ) : (
            enabledBlocks.map((block) => {
              const style = BLOCK_STYLE_PRESETS[(block.config?.style as string) || 'minimal']
              const icon = BLOCK_ICONS[block.type]
              const color = BLOCK_COLORS[block.type] || 'from-gray-500 to-gray-600'

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
                  {renderBlockContent(block)}
                </motion.div>
              )
            })
          )}

          {/* Checkout Button */}
          <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl mt-4">
            Checkout - ${subtotal.toFixed(2)}
          </button>
        </div>

        {/* Preview Badge */}
        <div className="fixed bottom-4 right-4 bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          PREVIEW MODE
        </div>
      </div>
    </div>
  )
}
