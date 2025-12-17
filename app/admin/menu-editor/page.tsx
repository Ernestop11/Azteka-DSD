'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Tag, Grid3x3, ShoppingBag, Plus, Search, Edit2, Trash2, Upload, Eye, Palette } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import Drawer from '@/components/ui/drawer'
import { getPublicImageUrl } from '@/lib/imageUrl'

// Tab configuration
const TABS = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'bundles', label: 'Bundles', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: Grid3x3 },
  { id: 'brands', label: 'Brands', icon: Tag },
] as const

type TabId = typeof TABS[number]['id']

// ========== PRODUCTS TAB ==========
function ProductsTab() {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [filterFlag, setFilterFlag] = useState<'all' | 'featured' | 'trending' | 'seasonal'>('all')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      const json = await res.json()
      return json.data || []
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      return json.data || []
    },
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      const json = await res.json()
      return json.data || []
    },
  })

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    
    const matchesFlag = filterFlag === 'all' ||
      (filterFlag === 'featured' && p.featured) ||
      (filterFlag === 'trending' && p.trending) ||
      (filterFlag === 'seasonal' && p.seasonal)
    
    return matchesSearch && matchesFlag
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast('Product updated!', 'success')
      setIsEditorOpen(false)
    },
    onError: () => toast('Failed to update', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast('Product deleted!', 'success')
      setIsEditorOpen(false)
    },
  })

  return (
    <div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setSelectedProduct(null); setIsEditorOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilterFlag('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterFlag === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterFlag('featured')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterFlag === 'featured'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ Featured
          </button>
          <button
            onClick={() => setFilterFlag('trending')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterFlag === 'trending'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setFilterFlag('seasonal')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterFlag === 'seasonal'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ❄️ Seasonal
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              onClick={async () => {
                const updates = Array.from(selectedProducts).map(id => ({
                  id,
                  featured: true,
                }))
                for (const update of updates) {
                  await updateMutation.mutateAsync(update)
                }
                setSelectedProducts(new Set())
                toast(`Marked ${updates.length} products as featured`, 'success')
              }}
            >
              Mark Featured
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const updates = Array.from(selectedProducts).map(id => ({
                  id,
                  trending: true,
                }))
                for (const update of updates) {
                  await updateMutation.mutateAsync(update)
                }
                setSelectedProducts(new Set())
                toast(`Marked ${updates.length} products as trending`, 'success')
              }}
            >
              Mark Trending
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedProducts(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.slice(0, 50).map((product: any) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                selectedProducts.has(product.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              }`}
              onClick={(e) => {
                if (e.shiftKey || e.metaKey) {
                  // Multi-select with Shift or Cmd/Ctrl
                  const newSelection = new Set(selectedProducts)
                  if (newSelection.has(product.id)) {
                    newSelection.delete(product.id)
                  } else {
                    newSelection.add(product.id)
                  }
                  setSelectedProducts(newSelection)
                } else {
                  setSelectedProduct(product)
                  setIsEditorOpen(true)
                }
              }}
            >
              <div className="aspect-square bg-gray-100 relative">
                {product.imageUrl ? (
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {/* Visual indicators for flags */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ Featured
                    </span>
                  )}
                  {product.trending && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      🔥 Trending
                    </span>
                  )}
                  {product.seasonal && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ❄️ Seasonal
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.sku}</p>
                <p className="text-sm font-bold text-green-600 mt-1">${Number(product.price || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Editor Drawer */}
      <Drawer isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title={selectedProduct ? 'Edit Product' : 'New Product'}>
        <ProductEditorForm
          product={selectedProduct}
          categories={categories}
          brands={brands}
          onSave={(data) => updateMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          isPending={updateMutation.isPending}
        />
      </Drawer>
    </div>
  )
}

function ProductEditorForm({ product, categories, brands, onSave, onDelete, isPending }: any) {
  const [form, setForm] = useState({
    id: product?.id || '',
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || 0,
    unitsPerCase: product?.unitsPerCase || 1,
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    featured: product?.featured || false,
    seasonal: product?.seasonal || false,
    trending: product?.trending || false,
    backgroundColor: product?.backgroundColor || '',
    backgroundGradient: product?.backgroundGradient || '',
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Units/Case</label>
          <Input type="number" value={form.unitsPerCase} onChange={(e) => setForm({ ...form, unitsPerCase: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Brand</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.backgroundColor || '#f3f4f6'}
              onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
              className="w-12 h-10 rounded border"
            />
            <Input value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} placeholder="#f3f4f6" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background Gradient</label>
          <Input
            value={form.backgroundGradient}
            onChange={(e) => setForm({ ...form, backgroundGradient: e.target.value })}
            placeholder="linear-gradient(...)"
          />
        </div>
        <div className="col-span-2 flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.seasonal} onChange={(e) => setForm({ ...form, seasonal: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">Seasonal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">Trending</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        {product?.id && (
          <Button type="button" variant="destructive" onClick={() => onDelete(product.id)}>
            Delete
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ========== BUNDLES TAB ==========
function BundlesTab() {
  const [search, setSearch] = useState('')
  const [selectedBundle, setSelectedBundle] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ['admin-bundles'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bundles')
      const json = await res.json()
      return json.data || []
    },
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      const json = await res.json()
      return json.data || []
    },
  })

  const filteredBundles = bundles.filter((b: any) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/bundles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] })
      toast('Bundle saved!', 'success')
      setIsEditorOpen(false)
    },
    onError: () => toast('Failed to save bundle', 'error'),
  })

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search bundles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setSelectedBundle(null); setIsEditorOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Create Bundle
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading bundles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBundles.map((bundle: any) => (
            <div
              key={bundle.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => { setSelectedBundle(bundle); setIsEditorOpen(true) }}
            >
              <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {bundle.imageUrl ? (
                  <img src={getPublicImageUrl(bundle.imageUrl)} alt={bundle.name} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-white/80" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{bundle.name}</h3>
                    <p className="text-sm text-gray-500">{bundle.description?.slice(0, 50)}...</p>
                  </div>
                  {bundle.active ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Inactive</span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600">${Number(bundle.price || 0).toFixed(2)}</span>
                  {bundle.badgeText && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: bundle.badgeColor || '#10b981', color: 'white' }}>
                      {bundle.badgeText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title={selectedBundle ? 'Edit Bundle' : 'New Bundle'}>
        <BundleEditorForm bundle={selectedBundle} brands={brands} onSave={(data) => saveMutation.mutate(data)} isPending={saveMutation.isPending} />
      </Drawer>
    </div>
  )
}

function BundleEditorForm({ bundle, brands, onSave, isPending }: any) {
  const [form, setForm] = useState({
    id: bundle?.id || '',
    name: bundle?.name || '',
    slug: bundle?.slug || '',
    description: bundle?.description || '',
    price: bundle?.price || 0,
    brandId: bundle?.brandId || '',
    badgeText: bundle?.badgeText || '',
    badgeColor: bundle?.badgeColor || '#10b981',
    active: bundle?.active ?? true,
    featured: bundle?.featured || false,
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Bundle Name</label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="la-molienda-bundle" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Select Brand</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Badge Text</label>
          <Input value={form.badgeText} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} placeholder="BEST VALUE" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Badge Color</label>
          <div className="flex gap-2">
            <input type="color" value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} className="w-12 h-10 rounded border" />
            <Input value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Featured</span>
        </label>
      </div>
      <div className="pt-4 border-t">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Saving...' : 'Save Bundle'}
        </Button>
      </div>
    </form>
  )
}

// ========== CATEGORIES TAB ==========
function CategoriesTab() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      return json.data || []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast('Category saved!', 'success')
      setIsEditorOpen(false)
    },
    onError: () => toast('Failed to save category', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast('Category deleted!', 'success')
      setIsEditorOpen(false)
    },
  })

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setSelectedCategory(null); setIsEditorOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-400 cursor-pointer transition-colors"
              onClick={() => { setSelectedCategory(cat); setIsEditorOpen(true) }}
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {cat.imageUrl ? (
                  <img src={getPublicImageUrl(cat.imageUrl)} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Grid3x3 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-center text-sm truncate">{cat.name}</h3>
              <p className="text-xs text-gray-500 text-center">{cat.slug}</p>
            </div>
          ))}
        </div>
      )}

      <Drawer isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title={selectedCategory ? 'Edit Category' : 'New Category'}>
        <CategoryEditorForm
          category={selectedCategory}
          onSave={(data) => saveMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          isPending={saveMutation.isPending}
        />
      </Drawer>
    </div>
  )
}

function CategoryEditorForm({ category, onSave, onDelete, isPending }: any) {
  const [form, setForm] = useState({
    id: category?.id || '',
    name: category?.name || '',
    slug: category?.slug || '',
    imageUrl: category?.imageUrl || '',
  })

  // Auto-generate slug
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm({ ...form, name, slug: category?.id ? form.slug : slug })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/categories/..." />
      </div>
      <div className="flex justify-between pt-4 border-t">
        {category?.id && (
          <Button type="button" variant="destructive" onClick={() => onDelete(category.id)}>Delete</Button>
        )}
        <Button type="submit" disabled={isPending} className="ml-auto">
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ========== BRANDS TAB ==========
function BrandsTab() {
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      const json = await res.json()
      return json.data || []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = data.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/brands', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] })
      toast('Brand saved!', 'success')
      setIsEditorOpen(false)
    },
    onError: () => toast('Failed to save brand', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] })
      toast('Brand deleted!', 'success')
      setIsEditorOpen(false)
    },
  })

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setSelectedBrand(null); setIsEditorOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add Brand
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading brands...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {brands.map((brand: any) => (
            <div
              key={brand.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-400 cursor-pointer transition-colors"
              onClick={() => { setSelectedBrand(brand); setIsEditorOpen(true) }}
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {brand.imageUrl ? (
                  <img src={getPublicImageUrl(brand.imageUrl)} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <Tag className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-center text-sm truncate">{brand.name}</h3>
            </div>
          ))}
        </div>
      )}

      <Drawer isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title={selectedBrand ? 'Edit Brand' : 'New Brand'}>
        <BrandEditorForm
          brand={selectedBrand}
          onSave={(data) => saveMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          isPending={saveMutation.isPending}
        />
      </Drawer>
    </div>
  )
}

function BrandEditorForm({ brand, onSave, onDelete, isPending }: any) {
  const [form, setForm] = useState({
    id: brand?.id || '',
    name: brand?.name || '',
    slug: brand?.slug || '',
    imageUrl: brand?.imageUrl || '',
  })

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm({ ...form, name, slug: brand?.id ? form.slug : slug })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL</label>
        <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/brands/..." />
      </div>
      <div className="flex justify-between pt-4 border-t">
        {brand?.id && (
          <Button type="button" variant="destructive" onClick={() => onDelete(brand.id)}>Delete</Button>
        )}
        <Button type="submit" disabled={isPending} className="ml-auto">
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ========== MAIN PAGE ==========
export default function MenuEditorPage() {
  const [activeTab, setActiveTab] = useState<TabId>('products')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Editor</h1>
              <p className="text-sm text-gray-500">Manage your catalog content</p>
            </div>
            <a
              href="/catalog"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Catalog
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors rounded-t-lg ${
                    isActive
                      ? 'bg-gray-50 text-blue-600 border-t-2 border-x border-blue-600 -mb-px'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'bundles' && <BundlesTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'brands' && <BrandsTab />}
      </div>
    </div>
  )
}
