'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Brand {
  id: string
  name: string
  slug: string | null
  description: string | null
  logoUrl: string | null
  imageUrl: string | null
  isFeatured: boolean
  displayOrder: number
  productCount: number
  layout: BrandLayout | null
}

interface BrandLayout {
  id: string
  brandId: string
  config: Record<string, unknown>
  heroImage: string | null
  heroGradient: string | null
  showLogo: boolean
  featured: boolean
  gridColumns: number
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
}

const GRADIENT_PRESETS = [
  { id: 'emerald', name: 'Emerald', value: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  { id: 'blue', name: 'Ocean Blue', value: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)' },
  { id: 'purple', name: 'Purple', value: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)' },
  { id: 'red', name: 'Fire Red', value: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' },
  { id: 'orange', name: 'Sunset', value: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)' },
  { id: 'gold', name: 'Gold', value: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)' },
  { id: 'dark', name: 'Dark', value: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
]

export default function BrandBuilder({ products }: { products: Product[] }) {
  const queryClient = useQueryClient()
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [editingLayout, setEditingLayout] = useState<Partial<BrandLayout>>({})

  // Fetch brands with layouts
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['builder-brands'],
    queryFn: async () => {
      const res = await fetch('/api/builder/brands')
      const json = await res.json()
      return json.data || []
    },
  })

  // Update layout mutation
  const updateLayoutMutation = useMutation({
    mutationFn: async ({ brandId, ...data }: Partial<BrandLayout> & { brandId: string }) => {
      const res = await fetch(`/api/builder/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-brands'] })
    },
  })

  // Delete layout mutation
  const deleteLayoutMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const res = await fetch(`/api/builder/brands/${brandId}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-brands'] })
    },
  })

  const handleSaveLayout = () => {
    if (!selectedBrand) return
    updateLayoutMutation.mutate({
      brandId: selectedBrand.id,
      ...editingLayout,
    })
  }

  // When brand is selected, initialize editing state
  const selectBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setEditingLayout({
      heroImage: brand.layout?.heroImage || brand.imageUrl || '',
      heroGradient: brand.layout?.heroGradient || GRADIENT_PRESETS[0].value,
      showLogo: brand.layout?.showLogo ?? true,
      featured: brand.layout?.featured ?? brand.isFeatured,
      gridColumns: brand.layout?.gridColumns || 4,
    })
  }

  const brandProducts = selectedBrand
    ? products.filter(p => p.brand?.id === selectedBrand.id)
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading brands...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      {/* Brand List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Brands</h2>
        <p className="text-xs text-slate-400 mb-4">Customize brand showcase pages</p>

        <div className="space-y-2">
          {brands.map(brand => (
            <div
              key={brand.id}
              onClick={() => selectBrand(brand)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedBrand?.id === brand.id
                  ? 'bg-blue-600 ring-2 ring-blue-400'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="font-medium text-sm">{brand.name}</span>
                </div>
                <div className="flex gap-1">
                  {brand.isFeatured && (
                    <span className="text-xs bg-amber-600/30 text-amber-400 px-1.5 py-0.5 rounded">★</span>
                  )}
                  {brand.layout && (
                    <span className="text-xs bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded">Custom</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {brand.productCount} products
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedBrand ? (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedBrand.name}</h3>
                <p className="text-slate-400 text-sm">{selectedBrand.productCount} products</p>
              </div>
              {selectedBrand.layout && (
                <button
                  onClick={() => {
                    if (confirm('Reset this brand layout to defaults?')) {
                      deleteLayoutMutation.mutate(selectedBrand.id)
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
                >
                  Reset Layout
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Hero Settings */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Hero Section</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Gradient</label>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setEditingLayout({ ...editingLayout, heroGradient: preset.value })}
                          className={`h-12 rounded-lg transition-all ${
                            editingLayout.heroGradient === preset.value
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                              : ''
                          }`}
                          style={{ background: preset.value }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Image URL (optional)</label>
                    <input
                      type="text"
                      value={editingLayout.heroImage || ''}
                      onChange={(e) => setEditingLayout({ ...editingLayout, heroImage: e.target.value })}
                      className="w-full bg-slate-700 rounded-lg p-3 text-sm"
                      placeholder="https://... (overrides gradient)"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLayout.showLogo ?? true}
                      onChange={(e) => setEditingLayout({ ...editingLayout, showLogo: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Show Brand Logo</span>
                      <p className="text-xs text-slate-400">Display logo in hero section</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Display Options */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Display Options</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Grid Columns</label>
                    <select
                      value={editingLayout.gridColumns || 4}
                      onChange={(e) => setEditingLayout({ ...editingLayout, gridColumns: parseInt(e.target.value) })}
                      className="w-full bg-slate-700 rounded-lg p-3 text-sm"
                    >
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                      <option value={4}>4 Columns</option>
                      <option value={5}>5 Columns</option>
                      <option value={6}>6 Columns</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLayout.featured ?? selectedBrand.isFeatured}
                      onChange={(e) => setEditingLayout({ ...editingLayout, featured: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Featured Brand</span>
                      <p className="text-xs text-slate-400">Show in featured brands section on homepage</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Products Preview */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Products ({brandProducts.length})</h4>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {brandProducts.slice(0, 16).map(product => (
                    <div key={product.id} className="p-2 bg-slate-700 rounded text-xs text-center">
                      <div className="w-full h-12 bg-slate-600 rounded mb-1 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-slate-400">📦</span>
                        )}
                      </div>
                      <p className="truncate">{product.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveLayout}
                  disabled={updateLayoutMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium disabled:opacity-50"
                >
                  {updateLayoutMutation.isPending ? 'Saving...' : 'Save Layout'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-xl mb-2">Select a brand to edit</p>
              <p className="text-sm">Customize hero banners, colors, and layouts</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="w-80 bg-slate-950 border-l border-slate-800 p-4">
        <h3 className="font-semibold text-sm text-slate-300 mb-3">Brand Page Preview</h3>
        {selectedBrand ? (
          <div className="bg-white rounded-xl overflow-hidden text-slate-900 text-sm">
            {/* Hero */}
            <div
              className="h-28 p-4 flex items-end"
              style={{
                background: editingLayout.heroImage
                  ? `url(${editingLayout.heroImage})`
                  : editingLayout.heroGradient || GRADIENT_PRESETS[0].value,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="flex items-center gap-3">
                {editingLayout.showLogo && selectedBrand.logoUrl && (
                  <img src={selectedBrand.logoUrl} alt="" className="h-10 w-10 bg-white rounded-lg p-1" />
                )}
                <div>
                  <p className="font-bold text-white text-lg drop-shadow">{selectedBrand.name}</p>
                  <p className="text-white/80 text-xs drop-shadow">{brandProducts.length} products</p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="p-2">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${editingLayout.gridColumns || 4}, 1fr)` }}
              >
                {Array.from({ length: Math.min(brandProducts.length, 8) }).map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-sm">
            Select a brand
          </div>
        )}
      </div>
    </div>
  )
}
