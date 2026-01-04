'use client'

import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
}

interface CartBlock {
  id: string
  type: string
  title: string | null
  config: Record<string, unknown>
  position: number
  enabled: boolean
  products: { id: string; productId: string; displayOrder: number; product: Product }[]
}

const CART_BLOCK_TYPES = [
  { id: 'CART_ITEMS', name: 'Cart Items', icon: '🛒', description: 'Current cart contents (always shown)' },
  { id: 'COMPLETE_ORDER', name: 'Complete Your Order', icon: '✨', description: 'Upsell suggestions based on cart' },
  { id: 'TRENDING_NOW', name: 'Trending Now', icon: '🔥', description: 'Popular products to add' },
  { id: 'PREVIOUSLY_ORDERED', name: 'Previously Ordered', icon: '🕐', description: "Customer's past purchases" },
  { id: 'BUNDLE_PROGRESS', name: 'Bundle Progress', icon: '📦', description: 'Progress toward bundle deals' },
  { id: 'REWARDS_STATUS', name: 'Rewards Status', icon: '🎁', description: 'Points balance and rewards' },
]

export default function CartBlocksBuilder({ products }: { products: Product[] }) {
  const queryClient = useQueryClient()
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [selectedBlock, setSelectedBlock] = useState<CartBlock | null>(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [newBlockType, setNewBlockType] = useState<string>('TRENDING_NOW')
  const [previewKey, setPreviewKey] = useState(0)

  // Refresh live preview - force iframe reload
  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1)
  }, [])

  // Fetch cart blocks
  const { data: blocks = [], isLoading } = useQuery<CartBlock[]>({
    queryKey: ['cart-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/builder/cart/blocks')
      const json = await res.json()
      return json.data || []
    },
  })

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: async (data: { type: string; title: string }) => {
      const res = await fetch('/api/builder/cart/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
      setShowAddBlock(false)
    },
  })

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; config?: Record<string, unknown>; enabled?: boolean }) => {
      const res = await fetch(`/api/builder/cart/blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
    },
  })

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/builder/cart/blocks/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
      setSelectedBlock(null)
    },
  })

  // Reorder blocks mutation
  const reorderMutation = useMutation({
    mutationFn: async (blockOrder: { id: string; position: number }[]) => {
      const res = await fetch('/api/builder/cart/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: blockOrder }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
    },
  })

  // Add product to block mutation
  const addProductMutation = useMutation({
    mutationFn: async ({ blockId, productId }: { blockId: string; productId: string }) => {
      const res = await fetch(`/api/builder/cart/blocks/${blockId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
    },
  })

  // Remove product from block mutation
  const removeProductMutation = useMutation({
    mutationFn: async ({ blockId, productId }: { blockId: string; productId: string }) => {
      const res = await fetch(`/api/builder/cart/blocks/${blockId}/products/${productId}`, {
        method: 'DELETE',
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-blocks'] })
    },
  })

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sortedBlocks.length) return

    const newOrder = [...sortedBlocks]
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(newIndex, 0, moved)

    reorderMutation.mutate(newOrder.map((b, i) => ({ id: b.id, position: i })))
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position)
  const blockInfo = (type: string) => CART_BLOCK_TYPES.find(t => t.id === type)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading cart blocks...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      {/* Cart Block List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Cart Blocks</h2>
        <p className="text-xs text-slate-400 mb-4">Reorder, enable/disable blocks</p>

        <div className="space-y-2">
          {sortedBlocks.map((block, index) => {
            const info = blockInfo(block.type)
            return (
              <div
                key={block.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedBlock?.id === block.id
                    ? 'bg-blue-600 ring-2 ring-blue-400'
                    : block.enabled
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-slate-800/50 opacity-50'
                }`}
                onClick={() => setSelectedBlock(block)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{info?.icon}</span>
                    <span className="font-medium text-sm">{block.title || info?.name}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateBlockMutation.mutate({ id: block.id, enabled: !block.enabled })
                      }}
                      className={`p-1 rounded text-xs ${block.enabled ? 'text-green-400' : 'text-slate-500'}`}
                    >
                      {block.enabled ? '✓' : '○'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}
                      disabled={index === sortedBlocks.length - 1}
                      className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setShowAddBlock(true)}
          className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
        >
          + Add Block
        </button>
      </div>

      {/* Cart Block Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedBlock ? (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{blockInfo(selectedBlock.type)?.icon}</span>
                <div>
                  <h3 className="text-xl font-bold">{selectedBlock.title || blockInfo(selectedBlock.type)?.name}</h3>
                  <p className="text-slate-400 text-sm">{blockInfo(selectedBlock.type)?.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this block?')) {
                    deleteBlockMutation.mutate(selectedBlock.id)
                  }
                }}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
              >
                Delete
              </button>
            </div>

            {/* Block Title Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Block Title</label>
              <input
                type="text"
                value={selectedBlock.title || ''}
                onChange={(e) => {
                  setSelectedBlock({ ...selectedBlock, title: e.target.value })
                }}
                onBlur={() => {
                  updateBlockMutation.mutate({ id: selectedBlock.id, title: selectedBlock.title || undefined })
                }}
                className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                placeholder={blockInfo(selectedBlock.type)?.name}
              />
            </div>

            {/* Product Selection for TRENDING_NOW block */}
            {selectedBlock.type === 'TRENDING_NOW' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Trending Products</h4>
                <p className="text-sm text-slate-400">Select products to show in the Trending Now section</p>

                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2 text-slate-300">Selected Products ({selectedBlock.products.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlock.products.map(bp => (
                      <div key={bp.id} className="flex items-center gap-1 bg-blue-600/30 rounded-lg px-2 py-1">
                        <span className="text-sm">{bp.product.name}</span>
                        <button
                          onClick={() => removeProductMutation.mutate({ blockId: selectedBlock.id, productId: bp.productId })}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {products.slice(0, 30).map(product => {
                    const isSelected = selectedBlock.products.some(bp => bp.productId === product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          if (isSelected) {
                            removeProductMutation.mutate({ blockId: selectedBlock.id, productId: product.id })
                          } else {
                            addProductMutation.mutate({ blockId: selectedBlock.id, productId: product.id })
                          }
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600/30 ring-1 ring-blue-500'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <span className="text-sm truncate">{product.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedBlock.type === 'PREVIOUSLY_ORDERED' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Previously Ordered Settings</h4>
                <p className="text-sm text-slate-400">
                  This block shows products the customer has ordered before.
                  It's automatically personalized per customer - no manual editing needed.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-300">Customer-specific block</p>
                  <p className="text-xs text-slate-500 mt-1">Position can be changed, content is automatic</p>
                </div>
              </div>
            )}

            {selectedBlock.type === 'CART_ITEMS' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Cart Items Block</h4>
                <p className="text-sm text-slate-400">
                  Shows the customer's current cart with quantity controls.
                  This block is always visible when there are items in the cart.
                </p>
              </div>
            )}

            {selectedBlock.type === 'COMPLETE_ORDER' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Complete Your Order</h4>
                <p className="text-sm text-slate-400">
                  Smart upsell suggestions based on what's in the cart.
                  Uses AI to suggest complementary products.
                </p>
              </div>
            )}

            {selectedBlock.type === 'BUNDLE_PROGRESS' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Bundle Progress</h4>
                <p className="text-sm text-slate-400">
                  Shows progress toward bundle deals (e.g., "Add 2 more for 15% off!").
                </p>
              </div>
            )}

            {selectedBlock.type === 'REWARDS_STATUS' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-200">Rewards Status</h4>
                <p className="text-sm text-slate-400">
                  Shows customer's points balance and available rewards.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl mb-2">Select a cart block to edit</p>
              <p className="text-sm">Or add a new block to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Cart Preview */}
      <div className="w-96 bg-slate-950 border-l border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-300">Live Preview</h3>
          <button
            onClick={refreshPreview}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-slate-900 h-[calc(100vh-200px)] ring-1 ring-slate-800">
          <iframe
            key={previewKey}
            ref={previewRef}
            src="/cart/preview"
            className="w-full h-full border-0"
            title="Cart Preview"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Changes update automatically every 2 seconds
        </p>
      </div>

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddBlock(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl ring-1 ring-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add Cart Block</h2>
                <button onClick={() => setShowAddBlock(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {CART_BLOCK_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setNewBlockType(type.id)}
                  className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
                    newBlockType === type.id
                      ? 'bg-blue-600/20 ring-2 ring-blue-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-semibold">{type.name}</p>
                    <p className="text-xs text-slate-400">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-slate-800 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddBlock(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const info = blockInfo(newBlockType)
                  createBlockMutation.mutate({
                    type: newBlockType,
                    title: info?.name || newBlockType,
                  })
                }}
                disabled={createBlockMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {createBlockMutation.isPending ? 'Adding...' : 'Add Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
