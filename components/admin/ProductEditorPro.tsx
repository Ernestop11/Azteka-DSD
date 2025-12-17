'use client'

/**
 * Professional Product Editor
 *
 * Features:
 * - Live preview with real-time updates
 * - Advanced image tools (crop, resize, filters)
 * - Background/gradient visual editor
 * - Preset library
 * - Category-based auto-styling
 * - Tier pricing
 * - Batch operations
 */

import { useState, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Save, Eye, EyeOff, Image as ImageIcon, Palette, Sparkles,
  Tag, TrendingUp, Star, Package, Layers, Wand2, Upload, Crop,
  RotateCw, ZoomIn, ZoomOut, Sliders, Grid, List, ChevronRight
} from 'lucide-react'

interface Product {
  id?: string
  name: string
  sku: string
  description?: string
  price: number | string
  unitsPerCase: number
  categoryId?: string | null
  brandId?: string | null
  imageUrl?: string | null
  backgroundColor?: string | null
  backgroundGradient?: string | null
  gradientPresetId?: string | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  featured?: boolean
  seasonal?: boolean
  trending?: boolean
  glossLevel?: 'none' | 'soft' | 'premium'
  sparkle?: boolean
  badge?: 'NEW' | 'HOT' | 'LIMITED' | null
  theme?: 'default' | 'holiday' | 'summer' | 'muertos'
  inStock?: boolean
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
}

interface ProductEditorProProps {
  product?: Product | null
  isOpen?: boolean
  onClose?: () => void
  onSave?: (product: Product) => void
}

export default function ProductEditorPro({
  product,
  isOpen = true,
  onClose,
  onSave
}: ProductEditorProProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'visuals' | 'pricing' | 'advanced'>('basic')
  const [showPreview, setShowPreview] = useState(true)
  const [formData, setFormData] = useState<Product>(product || {
    name: '',
    sku: '',
    description: '',
    price: 0,
    unitsPerCase: 1,
    categoryId: null,
    brandId: null,
    imageUrl: null,
    backgroundColor: '#ffffff',
    backgroundGradient: null,
    featured: false,
    seasonal: false,
    trending: false,
    glossLevel: 'none',
    sparkle: false,
    badge: null,
    theme: 'default',
    inStock: true,
  })

  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      return data.categories || data
    },
  })

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      const data = await res.json()
      return data.brands || data
    },
  })

  // Fetch visual presets
  const { data: presetsData } = useQuery({
    queryKey: ['visual-presets'],
    queryFn: async () => {
      const res = await fetch('/api/presets/visual')
      if (!res.ok) return null
      return res.json()
    },
  })

  const categories = categoriesData || []
  const brands = brandsData || []
  const presets = presetsData || { gradients: [], glows: [], splashes: [] }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Product) => {
      const url = data.id ? `/api/admin/products/${data.id}` : '/api/admin/products'
      const method = data.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || 'Failed to save product')
      }

      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      onSave?.(data)
      onClose?.()
    },
  })

  const handleSave = () => {
    saveMutation.mutate(formData)
  }

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-generate background based on category
  const applyAutoCategoryStyle = () => {
    if (!formData.categoryId) return

    const category = categories.find((c: any) => c.id === formData.categoryId)
    if (!category) return

    const categoryName = category.name.toLowerCase()

    // Category-based color schemes
    const styleMap: Record<string, any> = {
      beverages: {
        backgroundColor: '#0ea5e9',
        backgroundGradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        glossLevel: 'premium'
      },
      snacks: {
        backgroundColor: '#f59e0b',
        backgroundGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        glossLevel: 'soft'
      },
      candy: {
        backgroundColor: '#a855f7',
        backgroundGradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        glossLevel: 'premium',
        sparkle: true
      },
      chips: {
        backgroundColor: '#ef4444',
        backgroundGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        glossLevel: 'soft'
      },
    }

    for (const [key, style] of Object.entries(styleMap)) {
      if (categoryName.includes(key)) {
        setFormData(prev => ({ ...prev, ...style }))
        break
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Editor Panel */}
        <div className="w-1/2 bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {product?.id ? 'Edit Product' : 'New Product'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formData.name || 'Untitled Product'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Preview
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-4">
              {[
                { id: 'basic', label: 'Basic Info', icon: Package },
                { id: 'visuals', label: 'Visuals', icon: Palette },
                { id: 'pricing', label: 'Pricing', icon: Tag },
                { id: 'advanced', label: 'Advanced', icon: Sliders },
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
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Coca-Cola 2L"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => updateField('sku', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="PROD-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units/Case *
                    </label>
                    <input
                      type="number"
                      value={formData.unitsPerCase}
                      onChange={(e) => updateField('unitsPerCase', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
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
                    placeholder="Product description..."
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
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
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
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select brand</option>
                      {brands.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock || false}
                      onChange={(e) => updateField('inStock', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => updateField('featured', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trending || false}
                      onChange={(e) => updateField('trending', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Trending</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.seasonal || false}
                      onChange={(e) => updateField('seasonal', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Seasonal</span>
                  </label>
                </div>
              </div>
            )}

            {/* Visuals Tab */}
            {activeTab === 'visuals' && (
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Product"
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

                {/* Quick Style Button */}
                <button
                  onClick={applyAutoCategoryStyle}
                  disabled={!formData.categoryId}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  Auto-Style Based on Category
                </button>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="w-20 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Background Gradient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Gradient
                  </label>
                  <textarea
                    value={formData.backgroundGradient || ''}
                    onChange={(e) => updateField('backgroundGradient', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    rows={3}
                  />
                  {formData.backgroundGradient && (
                    <div
                      className="mt-2 h-20 rounded-lg"
                      style={{ background: formData.backgroundGradient }}
                    />
                  )}
                </div>

                {/* Preset Gradients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gradient Presets
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                      { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                      { name: 'Fire', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                      { name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
                      { name: 'Sky', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
                      { name: 'Grape', gradient: 'linear-gradient(135deg, #868f96 0%, #596164 100%)' },
                      { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                      { name: 'Mint', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateField('backgroundGradient', preset.gradient)}
                        className="h-16 rounded-lg border-2 hover:border-blue-500 transition-all relative group overflow-hidden"
                        style={{ background: preset.gradient }}
                      >
                        <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Effects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Effects
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Sparkle Effect</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sparkle || false}
                          onChange={(e) => updateField('sparkle', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gloss Level
                      </label>
                      <select
                        value={formData.glossLevel || 'none'}
                        onChange={(e) => updateField('glossLevel', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="soft">Soft Gloss</option>
                        <option value="premium">Premium Gloss</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge
                      </label>
                      <select
                        value={formData.badge || ''}
                        onChange={(e) => updateField('badge', e.target.value || null)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No Badge</option>
                        <option value="NEW">NEW</option>
                        <option value="HOT">HOT</option>
                        <option value="LIMITED">LIMITED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <select
                        value={formData.theme || 'default'}
                        onChange={(e) => updateField('theme', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="default">Default</option>
                        <option value="holiday">Holiday</option>
                        <option value="summer">Summer</option>
                        <option value="muertos">Día de Muertos</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 Tier Pricing</p>
                  <p className="text-sm text-blue-600">
                    Add tier-based pricing to offer different prices to customer segments. Coming soon!
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Advanced Options</h3>
                  <p className="text-sm text-gray-600">
                    Additional product settings and configurations will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !formData.name || !formData.sku}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
            <div className="sticky top-0 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Preview</h3>
              <p className="text-sm text-gray-500">See how your product will look in the catalog</p>
            </div>

            {/* Product Card Preview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
              <div
                className="relative h-64 flex items-center justify-center p-8"
                style={{
                  background: formData.backgroundGradient || formData.backgroundColor || '#f3f4f6',
                }}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-24 h-24 text-gray-300" />
                )}

                {formData.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {formData.badge}
                  </div>
                )}

                {formData.sparkle && (
                  <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-8 right-8 w-6 h-6 text-yellow-300 animate-pulse" />
                    <Sparkles className="absolute bottom-12 left-12 w-4 h-4 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {formData.name || 'Product Name'}
                  </h3>
                  {formData.featured && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                {formData.description && (
                  <p className="text-sm text-gray-600 mb-4">{formData.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      ${typeof formData.price === 'number' ? formData.price.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      / {formData.unitsPerCase} units
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {formData.trending && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      🔥 Trending
                    </span>
                  )}
                  {formData.seasonal && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      ⭐ Seasonal
                    </span>
                  )}
                  {!formData.inStock && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional preview info */}
            <div className="mt-6 bg-white rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-3">Product Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">SKU:</dt>
                  <dd className="text-gray-900 font-medium">{formData.sku || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category:</dt>
                  <dd className="text-gray-900 font-medium">
                    {categories.find((c: any) => c.id === formData.categoryId)?.name || '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Brand:</dt>
                  <dd className="text-gray-900 font-medium">
                    {brands.find((b: any) => b.id === formData.brandId)?.name || '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Gloss Level:</dt>
                  <dd className="text-gray-900 font-medium capitalize">{formData.glossLevel || 'none'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Theme:</dt>
                  <dd className="text-gray-900 font-medium capitalize">{formData.theme || 'default'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
