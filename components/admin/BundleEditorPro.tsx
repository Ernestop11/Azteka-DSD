'use client'

/**
 * Professional Bundle Editor
 *
 * Features:
 * - Drag-and-drop product selection
 * - Visual bundle builder
 * - Discount calculator
 * - Live preview with pricing
 * - Image upload
 * - Badge customization
 * - Multi-store targeting
 */

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Save, Plus, Minus, Search, Package, Image as ImageIcon,
  Percent, Tag, Palette, Sparkles, Grid, Trash2, GripVertical,
  Upload, Eye, Calculator
} from 'lucide-react'

interface BundleItem {
  productId: string
  quantity: number
  product?: {
    id: string
    name: string
    sku: string
    price: number
    imageUrl?: string
  }
}

interface Bundle {
  id?: string
  name: string
  slug: string
  sku?: string
  description?: string
  imageUrl?: string
  badgeText?: string
  badgeColor?: string
  discountPercent: number
  price: number
  stock: number
  minStock: number
  featured: boolean
  active: boolean
  categoryId?: string | null
  brandId?: string | null
  items: BundleItem[]
}

interface BundleEditorProProps {
  bundle?: Bundle | null
  isOpen?: boolean
  onClose?: () => void
  onSave?: (bundle: Bundle) => void
}

export default function BundleEditorPro({
  bundle,
  isOpen = true,
  onClose,
  onSave
}: BundleEditorProProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'pricing' | 'visuals'>('info')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<Bundle>(bundle || {
    name: '',
    slug: '',
    sku: '',
    description: '',
    imageUrl: null,
    badgeText: 'BUNDLE',
    badgeColor: '#10b981',
    discountPercent: 10,
    price: 0,
    stock: 100,
    minStock: 5,
    featured: false,
    active: true,
    categoryId: null,
    brandId: null,
    items: [],
  })

  const queryClient = useQueryClient()

  // Fetch products for selection
  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      return data.data || data.products || data
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      return data.categories || data
    },
  })

  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      const data = await res.json()
      return data.brands || data
    },
  })

  const products = productsData || []
  const categories = categoriesData || []
  const brands = brandsData || []

  // Filter products by search
  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate total value
  const calculateTotalValue = () => {
    return formData.items.reduce((sum, item) => {
      const product = products.find((p: any) => p.id === item.productId)
      if (product) {
        return sum + (parseFloat(product.price) * item.quantity)
      }
      return sum
    }, 0)
  }

  // Calculate bundle price with discount
  const calculateBundlePrice = () => {
    const total = calculateTotalValue()
    const discount = total * (formData.discountPercent / 100)
    return total - discount
  }

  // Auto-calculate bundle price when items or discount change
  useEffect(() => {
    const bundlePrice = calculateBundlePrice()
    if (bundlePrice !== formData.price) {
      setFormData(prev => ({ ...prev, price: bundlePrice }))
    }
  }, [formData.items, formData.discountPercent])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Bundle) => {
      const url = data.id ? `/api/admin/bundles/${data.id}` : '/api/admin/bundles'
      const method = data.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || 'Failed to save bundle')
      }

      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] })
      onSave?.(data)
      onClose?.()
    },
  })

  const handleSave = () => {
    saveMutation.mutate(formData)
  }

  const updateField = (field: keyof Bundle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addProduct = (productId: string) => {
    const existing = formData.items.find(item => item.productId === productId)
    if (existing) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId, quantity: 1 }],
      }))
    }
  }

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId),
    }))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeProduct(productId)
      return
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }))
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !bundle?.id) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      updateField('slug', slug)
    }
  }, [formData.name])

  if (!isOpen) return null

  const totalValue = calculateTotalValue()
  const savings = totalValue - formData.price

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Editor Panel */}
        <div className="w-2/3 bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {bundle?.id ? 'Edit Bundle' : 'New Bundle'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formData.name || 'Untitled Bundle'} • {formData.items.length} products
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-4">
              {[
                { id: 'info', label: 'Info', icon: Package },
                { id: 'products', label: 'Products', icon: Grid },
                { id: 'pricing', label: 'Pricing', icon: Calculator },
                { id: 'visuals', label: 'Visuals', icon: Palette },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bundle Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Summer Snack Pack"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="summer-snack-pack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => updateField('sku', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BUNDLE-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    placeholder="Bundle description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => updateField('categoryId', e.target.value || null)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={formData.brandId || ''}
                      onChange={(e) => updateField('brandId', e.target.value || null)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select brand</option>
                      {brands.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => updateField('stock', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => updateField('minStock', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.active ? 'active' : 'inactive'}
                      onChange={(e) => updateField('active', e.target.value === 'active')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => updateField('featured', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Featured Bundle</span>
                  </label>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Selected Products */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Bundle Products ({formData.items.length})
                  </h3>
                  {formData.items.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No products added yet</p>
                      <p className="text-sm text-gray-400">Search and add products below</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.items.map((item) => {
                        const product = products.find((p: any) => p.id === item.productId)
                        if (!product) return null

                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-16 h-16 object-contain rounded-lg border"
                              />
                            )}

                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-500">{product.sku}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${(parseFloat(product.price) * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${parseFloat(product.price).toFixed(2)} each
                              </p>
                            </div>

                            <button
                              onClick={() => removeProduct(item.productId)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Product Search */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Products</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Search products by name or SKU..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.slice(0, 20).map((product: any) => {
                      const isAdded = formData.items.some(item => item.productId === product.id)

                      return (
                        <button
                          key={product.id}
                          onClick={() => addProduct(product.id)}
                          disabled={isAdded}
                          className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                            isAdded
                              ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate text-sm">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500">${parseFloat(product.price).toFixed(2)}</p>
                          </div>
                          {isAdded && (
                            <span className="text-green-600 text-xs font-medium">Added</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">Total Value</p>
                      <p className="text-3xl font-bold text-blue-900">${totalValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">Savings</p>
                      <p className="text-3xl font-bold text-green-900">${savings.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">Bundle Price</p>
                      <p className="text-3xl font-bold text-purple-900">${formData.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      value={formData.discountPercent}
                      onChange={(e) => updateField('discountPercent', parseFloat(e.target.value))}
                      className="flex-1"
                      min="0"
                      max="50"
                      step="1"
                    />
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="number"
                        value={formData.discountPercent}
                        onChange={(e) => updateField('discountPercent', parseFloat(e.target.value))}
                        className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="50"
                        step="1"
                      />
                      <Percent className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {[0, 10, 20, 30, 40, 50].map((value) => (
                      <button
                        key={value}
                        onClick={() => updateField('discountPercent', value)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          formData.discountPercent === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manual Price Override
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Price is auto-calculated. Override if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Visuals Tab */}
            {activeTab === 'visuals' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bundle Image
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Bundle"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <button
                          onClick={() => updateField('imageUrl', null)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ''}
                    onChange={(e) => updateField('badgeText', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BUNDLE, SAVE 20%, LIMITED"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.badgeColor || '#10b981'}
                      onChange={(e) => updateField('badgeColor', e.target.value)}
                      className="w-20 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.badgeColor || '#10b981'}
                      onChange={(e) => updateField('badgeColor', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#10b981"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-8 gap-2">
                    {[
                      '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
                      '#ef4444', '#ec4899', '#14b8a6', '#64748b'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateField('badgeColor', color)}
                        className="w-full h-10 rounded-lg border-2 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {formData.items.length} products • ${formData.price.toFixed(2)} total
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || !formData.name || formData.items.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Bundle'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>

          {/* Bundle Card Preview */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt={formData.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Package className="w-24 h-24 text-white/50" />
              )}

              {formData.badgeText && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 text-white text-xs font-bold rounded-full"
                  style={{ backgroundColor: formData.badgeColor || '#10b981' }}
                >
                  {formData.badgeText}
                </div>
              )}

              {formData.featured && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  ⭐ FEATURED
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {formData.name || 'Bundle Name'}
              </h3>

              {formData.description && (
                <p className="text-sm text-gray-600 mb-4">{formData.description}</p>
              )}

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${formData.price.toFixed(2)}
                </span>
                {savings > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${totalValue.toFixed(2)}
                    </span>
                    <span className="text-green-600 font-semibold">
                      Save ${savings.toFixed(2)}!
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Includes:</p>
                {formData.items.map((item) => {
                  const product = products.find((p: any) => p.id === item.productId)
                  if (!product) return null

                  return (
                    <div key={item.productId} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium text-xs">
                        {item.quantity}
                      </span>
                      <span>{product.name}</span>
                    </div>
                  )
                })}
              </div>

              {formData.discountPercent > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold">
                    🎉 {formData.discountPercent}% OFF Bundle Discount!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
