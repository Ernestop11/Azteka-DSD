'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Clock,
  Package,
  TrendingUp,
  Gift,
  Zap,
  ArrowLeft,
  Settings,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Types
interface CartBlock {
  id: string
  type: CartBlockType
  title: string
  subtitle?: string
  enabled: boolean
  position: number
  config: Record<string, unknown>
}

type CartBlockType =
  | 'UPSELL_PRODUCTS'
  | 'PREVIOUSLY_ORDERED'
  | 'BUNDLE_DEALS'
  | 'IMPULSE_ITEMS'
  | 'SAVINGS_SUMMARY'
  | 'DELIVERY_ESTIMATE'
  | 'PROMO_CODE'
  | 'SUGGESTED_ADDONS'
  | 'LOYALTY_POINTS'
  | 'QUICK_REORDER'

// Block type definitions
const CART_BLOCK_TYPES: { type: CartBlockType; name: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    type: 'UPSELL_PRODUCTS',
    name: 'Upsell Products',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Smart product recommendations based on cart items',
    color: 'from-orange-500 to-amber-500'
  },
  {
    type: 'PREVIOUSLY_ORDERED',
    name: 'Previously Ordered',
    icon: <Clock className="w-5 h-5" />,
    description: '"Last time you bought" - products they ordered before',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'BUNDLE_DEALS',
    name: 'Bundle Deals',
    icon: <Package className="w-5 h-5" />,
    description: 'Bundle offers based on cart contents',
    color: 'from-purple-500 to-pink-500'
  },
  {
    type: 'IMPULSE_ITEMS',
    name: 'Impulse Items',
    icon: <Zap className="w-5 h-5" />,
    description: 'Low-cost add-ons like DoorDash/UberEats style',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    type: 'SAVINGS_SUMMARY',
    name: 'Savings Summary',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Show how much customer is saving',
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'DELIVERY_ESTIMATE',
    name: 'Delivery Estimate',
    icon: <Clock className="w-5 h-5" />,
    description: 'Estimated delivery time/date',
    color: 'from-slate-500 to-gray-600'
  },
  {
    type: 'PROMO_CODE',
    name: 'Promo Code',
    icon: <Gift className="w-5 h-5" />,
    description: 'Promo code input field',
    color: 'from-red-500 to-rose-500'
  },
  {
    type: 'SUGGESTED_ADDONS',
    name: 'Suggested Add-ons',
    icon: <Plus className="w-5 h-5" />,
    description: 'Complementary products for items in cart',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    type: 'LOYALTY_POINTS',
    name: 'Loyalty Points',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Points earned/redeemable for this order',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    type: 'QUICK_REORDER',
    name: 'Quick Reorder',
    icon: <Clock className="w-5 h-5" />,
    description: 'One-click add previous order items',
    color: 'from-indigo-500 to-purple-500'
  },
]

// Style presets for blocks
const BLOCK_STYLE_PRESETS = [
  { id: 'minimal', name: 'Minimal', bg: 'bg-white', border: 'border border-gray-200', text: 'text-gray-900' },
  { id: 'accent-orange', name: 'Orange Accent', bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-2 border-orange-200', text: 'text-orange-900' },
  { id: 'accent-blue', name: 'Blue Accent', bg: 'bg-gradient-to-r from-blue-50 to-cyan-50', border: 'border-2 border-blue-200', text: 'text-blue-900' },
  { id: 'accent-green', name: 'Green Accent', bg: 'bg-gradient-to-r from-green-50 to-emerald-50', border: 'border-2 border-green-200', text: 'text-green-900' },
  { id: 'accent-purple', name: 'Purple Accent', bg: 'bg-gradient-to-r from-purple-50 to-pink-50', border: 'border-2 border-purple-200', text: 'text-purple-900' },
  { id: 'dark', name: 'Dark Mode', bg: 'bg-gray-900', border: 'border border-gray-700', text: 'text-white' },
]

// Default blocks for new setup
const DEFAULT_CART_BLOCKS: CartBlock[] = [
  { id: '1', type: 'UPSELL_PRODUCTS', title: 'Complete Your Order', subtitle: 'Add these items to save more!', enabled: true, position: 0, config: { maxItems: 4, style: 'accent-orange' } },
  { id: '2', type: 'PREVIOUSLY_ORDERED', title: 'Order Again', subtitle: 'Items you bought before', enabled: true, position: 1, config: { maxItems: 3, style: 'accent-blue' } },
  { id: '3', type: 'IMPULSE_ITEMS', title: 'Quick Add', subtitle: 'Popular add-ons', enabled: true, position: 2, config: { maxItems: 6, style: 'minimal' } },
  { id: '4', type: 'PROMO_CODE', title: 'Have a promo code?', enabled: true, position: 3, config: { style: 'minimal' } },
]

export default function CartBuilderPage() {
  const queryClient = useQueryClient()
  const [blocks, setBlocks] = useState<CartBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<CartBlock | null>(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch cart blocks from API
  const { data: blocksData, isLoading } = useQuery({
    queryKey: ['cart-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cart-blocks')
      if (!res.ok) throw new Error('Failed to fetch cart blocks')
      return res.json()
    }
  })

  // Load blocks from API response
  useEffect(() => {
    if (blocksData?.data) {
      if (Array.isArray(blocksData.data) && blocksData.data.length > 0) {
        setBlocks(blocksData.data)
      } else {
        // Use defaults if no saved config
        setBlocks(DEFAULT_CART_BLOCKS)
      }
    }
  }, [blocksData])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (blocksToSave: CartBlock[]) => {
      const res = await fetch('/api/admin/cart-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: blocksToSave })
      })
      if (!res.ok) throw new Error('Failed to save cart blocks')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Cart blocks saved successfully!')
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
      // Also update localStorage for immediate client-side use
      localStorage.setItem('azteka-cart-blocks', JSON.stringify(blocks))
    },
    onError: (error) => {
      toast.error('Failed to save cart blocks')
      console.error('Save error:', error)
    }
  })

  // Save blocks
  const saveBlocks = () => {
    saveMutation.mutate(blocks)
  }

  // Add new block
  const addBlock = (type: CartBlockType) => {
    const blockDef = CART_BLOCK_TYPES.find(b => b.type === type)
    if (!blockDef) return

    const newBlock: CartBlock = {
      id: `block-${Date.now()}`,
      type,
      title: blockDef.name,
      subtitle: blockDef.description,
      enabled: true,
      position: blocks.length,
      config: { maxItems: 4, style: 'minimal' }
    }

    setBlocks([...blocks, newBlock])
    setHasChanges(true)
    setShowAddBlock(false)
  }

  // Update block
  const updateBlock = (id: string, updates: Partial<CartBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
    setHasChanges(true)
    if (selectedBlock?.id === id) {
      setSelectedBlock({ ...selectedBlock, ...updates })
    }
  }

  // Delete block
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
    setHasChanges(true)
    if (selectedBlock?.id === id) {
      setSelectedBlock(null)
    }
  }

  // Toggle block enabled
  const toggleBlock = (id: string) => {
    updateBlock(id, { enabled: !blocks.find(b => b.id === id)?.enabled })
  }

  // Reorder blocks
  const handleReorder = (newOrder: CartBlock[]) => {
    const reordered = newOrder.map((block, index) => ({ ...block, position: index }))
    setBlocks(reordered)
    setHasChanges(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-7 h-7" />
                  Cart Checkout Builder
                </h1>
                <p className="text-emerald-100 text-sm mt-1">
                  Design your checkout flow with upsells, bundles & more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showPreview ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={saveBlocks}
                disabled={!hasChanges || saveMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges && !saveMutation.isPending
                    ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                }`}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Block List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Cart Blocks</h2>
              <button
                onClick={() => setShowAddBlock(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Block
              </button>
            </div>

            {/* Draggable Block List */}
            <Reorder.Group
              axis="y"
              values={blocks}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {blocks.map((block) => {
                const blockDef = CART_BLOCK_TYPES.find(b => b.type === block.type)
                return (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      layout
                      className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                        selectedBlock?.id === block.id
                          ? 'border-emerald-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!block.enabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${blockDef?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white flex-shrink-0`}>
                          {blockDef?.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{block.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{block.subtitle || blockDef?.description}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleBlock(block.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              block.enabled
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setSelectedBlock(block)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>

            {isLoading && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                <Loader2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 animate-spin" />
                <p className="text-gray-600 font-medium">Loading cart blocks...</p>
              </div>
            )}

            {!isLoading && blocks.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No cart blocks configured</p>
                <p className="text-gray-400 text-sm mt-1">Add blocks to enhance your checkout experience</p>
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add Your First Block
                </button>
              </div>
            )}
          </div>

          {/* Right: Preview or Block Editor */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedBlock ? (
              // Block Editor
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-900">Edit Block</h3>
                  <button
                    onClick={() => setSelectedBlock(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={selectedBlock.title}
                      onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={selectedBlock.subtitle || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Max Items (for product blocks) */}
                  {['UPSELL_PRODUCTS', 'PREVIOUSLY_ORDERED', 'IMPULSE_ITEMS', 'SUGGESTED_ADDONS', 'BUNDLE_DEALS'].includes(selectedBlock.type) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Items to Show</label>
                      <select
                        value={(selectedBlock.config.maxItems as number) || 4}
                        onChange={(e) => updateBlock(selectedBlock.id, {
                          config: { ...selectedBlock.config, maxItems: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value={2}>2 items</option>
                        <option value={3}>3 items</option>
                        <option value={4}>4 items</option>
                        <option value={6}>6 items</option>
                        <option value={8}>8 items</option>
                      </select>
                    </div>
                  )}

                  {/* Style Preset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BLOCK_STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => updateBlock(selectedBlock.id, {
                            config: { ...selectedBlock.config, style: preset.id }
                          })}
                          className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                            (selectedBlock.config.style || 'minimal') === preset.id
                              ? 'border-emerald-500 ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${preset.bg} ${preset.text}`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : showPreview ? (
              // Cart Preview
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold text-gray-900">Cart Preview</h3>
                  <p className="text-xs text-gray-500 mt-1">How your cart modal will look</p>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {/* Mock Cart Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                        <p className="text-sm text-gray-500">3 items</p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700">Clear All</button>
                    </div>
                  </div>

                  {/* Mock Cart Items */}
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Sample Product {i}</p>
                          <p className="text-xs text-gray-500">$12.99 per case</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <button className="w-6 h-6 bg-gray-200 rounded">−</button>
                          <span className="w-6 text-center">{i}</span>
                          <button className="w-6 h-6 bg-gray-200 rounded">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Render Enabled Blocks */}
                  <div className="p-4 space-y-4 border-t">
                    {blocks
                      .filter(b => b.enabled)
                      .sort((a, b) => a.position - b.position)
                      .map((block) => {
                        const blockDef = CART_BLOCK_TYPES.find(b => b.type === block.type)
                        const stylePreset = BLOCK_STYLE_PRESETS.find(s => s.id === (block.config.style || 'minimal'))

                        return (
                          <div
                            key={block.id}
                            className={`p-4 rounded-xl ${stylePreset?.bg} ${stylePreset?.border}`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${blockDef?.color} flex items-center justify-center text-white text-xs`}>
                                {blockDef?.icon}
                              </div>
                              <h3 className={`font-bold ${stylePreset?.text}`}>{block.title}</h3>
                            </div>
                            {block.subtitle && (
                              <p className={`text-sm mb-3 opacity-80 ${stylePreset?.text}`}>{block.subtitle}</p>
                            )}

                            {/* Mock content based on block type */}
                            {['UPSELL_PRODUCTS', 'PREVIOUSLY_ORDERED', 'IMPULSE_ITEMS', 'SUGGESTED_ADDONS'].includes(block.type) && (
                              <div className="grid grid-cols-2 gap-2">
                                {Array.from({ length: Math.min(Number(block.config.maxItems) || 4, 4) }).map((_, i) => (
                                  <div key={i} className="bg-white/80 rounded-lg p-2 flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium truncate">Product {i + 1}</p>
                                      <p className="text-xs text-gray-500">$9.99</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {block.type === 'PROMO_CODE' && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter code"
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                />
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                                  Apply
                                </button>
                              </div>
                            )}

                            {block.type === 'SAVINGS_SUMMARY' && (
                              <div className="bg-white/80 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">$12.50</p>
                                <p className="text-xs text-gray-600">You're saving on this order!</p>
                              </div>
                            )}

                            {block.type === 'BUNDLE_DEALS' && (
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">Buy 3 Cases, Save 15%</span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">DEAL</span>
                                </div>
                                <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                                  Add Bundle
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>

                  {/* Mock Footer */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-900">Subtotal</span>
                      <span className="text-xl font-bold">$38.97</span>
                    </div>
                    <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg">
                      Checkout
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      <AnimatePresence>
        {showAddBlock && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBlock(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900">Add Cart Block</h3>
                <button
                  onClick={() => setShowAddBlock(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 gap-3">
                  {CART_BLOCK_TYPES.map((blockType) => (
                    <button
                      key={blockType.type}
                      onClick={() => addBlock(blockType.type)}
                      className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${blockType.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {blockType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{blockType.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{blockType.description}</p>
                      </div>
                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
