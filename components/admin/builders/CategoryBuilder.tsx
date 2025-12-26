'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Subcategory {
  id: string
  name: string
  displayOrder: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
  productCount: number
  subcategories: Subcategory[]
  layout: CategoryLayout | null
}

interface CategoryLayout {
  id: string
  categoryId: string
  config: Record<string, unknown>
  heroImage: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  showSubcategories: boolean
  showBundles: boolean
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

export default function CategoryBuilder({ products }: { products: Product[] }) {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [editingLayout, setEditingLayout] = useState<Partial<CategoryLayout>>({})

  // Fetch categories with layouts
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['builder-categories'],
    queryFn: async () => {
      const res = await fetch('/api/builder/categories')
      const json = await res.json()
      return json.data || []
    },
  })

  // Update layout mutation
  const updateLayoutMutation = useMutation({
    mutationFn: async ({ categoryId, ...data }: Partial<CategoryLayout> & { categoryId: string }) => {
      const res = await fetch(`/api/builder/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-categories'] })
    },
  })

  // Delete layout mutation (reset to defaults)
  const deleteLayoutMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/builder/categories/${categoryId}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-categories'] })
    },
  })

  const handleSaveLayout = () => {
    if (!selectedCategory) return
    updateLayoutMutation.mutate({
      categoryId: selectedCategory.id,
      ...editingLayout,
    })
  }

  // When category is selected, initialize editing state
  const selectCategory = (category: Category) => {
    setSelectedCategory(category)
    setEditingLayout({
      heroImage: category.layout?.heroImage || '',
      heroTitle: category.layout?.heroTitle || category.name,
      heroSubtitle: category.layout?.heroSubtitle || '',
      showSubcategories: category.layout?.showSubcategories ?? true,
      showBundles: category.layout?.showBundles ?? true,
      gridColumns: category.layout?.gridColumns || 4,
    })
  }

  const categoryProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory.id)
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      {/* Category List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Categories</h2>
        <p className="text-xs text-slate-400 mb-4">Select a category to customize its layout</p>

        <div className="space-y-2">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => selectCategory(category)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedCategory?.id === category.id
                  ? 'bg-blue-600 ring-2 ring-blue-400'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📂</span>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                {category.layout && (
                  <span className="text-xs bg-green-600/30 text-green-400 px-2 py-0.5 rounded">Custom</span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {category.productCount} products
                {category.subcategories.length > 0 && ` - ${category.subcategories.length} subcategories`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedCategory ? (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                <p className="text-slate-400 text-sm">Slug: /{selectedCategory.slug}</p>
              </div>
              {selectedCategory.layout && (
                <button
                  onClick={() => {
                    if (confirm('Reset this category layout to defaults?')) {
                      deleteLayoutMutation.mutate(selectedCategory.id)
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
                >
                  Reset Layout
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Hero Section</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={editingLayout.heroTitle || ''}
                      onChange={(e) => setEditingLayout({ ...editingLayout, heroTitle: e.target.value })}
                      className="w-full bg-slate-700 rounded-lg p-3 text-sm"
                      placeholder={selectedCategory.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                    <input
                      type="text"
                      value={editingLayout.heroSubtitle || ''}
                      onChange={(e) => setEditingLayout({ ...editingLayout, heroSubtitle: e.target.value })}
                      className="w-full bg-slate-700 rounded-lg p-3 text-sm"
                      placeholder="Optional subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                    <input
                      type="text"
                      value={editingLayout.heroImage || ''}
                      onChange={(e) => setEditingLayout({ ...editingLayout, heroImage: e.target.value })}
                      className="w-full bg-slate-700 rounded-lg p-3 text-sm"
                      placeholder="https://..."
                    />
                  </div>
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
                      checked={editingLayout.showSubcategories ?? true}
                      onChange={(e) => setEditingLayout({ ...editingLayout, showSubcategories: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Show Subcategories</span>
                      <p className="text-xs text-slate-400">Display subcategory navigation</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLayout.showBundles ?? true}
                      onChange={(e) => setEditingLayout({ ...editingLayout, showBundles: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Show Bundles</span>
                      <p className="text-xs text-slate-400">Display bundle deals in this category</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Subcategories */}
              {selectedCategory.subcategories.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Subcategories ({selectedCategory.subcategories.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subcategories.map(sub => (
                      <span key={sub.id} className="px-3 py-1 bg-slate-700 rounded-lg text-sm">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Preview */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Products ({categoryProducts.length})</h4>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {categoryProducts.slice(0, 16).map(product => (
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
              <div className="text-6xl mb-4">📂</div>
              <p className="text-xl mb-2">Select a category to edit</p>
              <p className="text-sm">Customize hero images, grid layout, and more</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="w-80 bg-slate-950 border-l border-slate-800 p-4">
        <h3 className="font-semibold text-sm text-slate-300 mb-3">Category Page Preview</h3>
        {selectedCategory ? (
          <div className="bg-white rounded-xl overflow-hidden text-slate-900 text-sm">
            {/* Hero */}
            <div
              className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 flex items-end"
              style={editingLayout.heroImage ? { backgroundImage: `url(${editingLayout.heroImage})`, backgroundSize: 'cover' } : {}}
            >
              <div>
                <p className="font-bold text-white text-lg">{editingLayout.heroTitle || selectedCategory.name}</p>
                {editingLayout.heroSubtitle && (
                  <p className="text-white/80 text-xs">{editingLayout.heroSubtitle}</p>
                )}
              </div>
            </div>

            {/* Subcategories */}
            {editingLayout.showSubcategories && selectedCategory.subcategories.length > 0 && (
              <div className="p-2 border-b bg-slate-50">
                <div className="flex gap-1 overflow-x-auto">
                  {selectedCategory.subcategories.slice(0, 4).map(sub => (
                    <span key={sub.id} className="px-2 py-1 bg-white rounded text-xs whitespace-nowrap shadow-sm">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="p-2">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${editingLayout.gridColumns || 4}, 1fr)` }}
              >
                {Array.from({ length: Math.min(categoryProducts.length, 8) }).map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-sm">
            Select a category
          </div>
        )}
      </div>
    </div>
  )
}
