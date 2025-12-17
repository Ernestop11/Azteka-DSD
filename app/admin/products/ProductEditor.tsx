'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Drawer from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import ProductImageUpload from './ProductImageUpload'
import VisualDesignPanel from '@/components/admin/VisualDesignPanel'
import { useToast } from '@/components/ui/toast'
import { ProductCreateSchema, ProductUpdateSchema } from '@/lib/validation/productSchema'

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
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  // Visual preset fields
  gradientPresetId?: string | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  // Enhancement flags
  featured?: boolean
  seasonal?: boolean
  trending?: boolean
  // Background customization
  backgroundColor?: string | null
  backgroundGradient?: string | null
  // Visual preset fields
  glossLevel?: 'none' | 'soft' | 'premium'
  sparkle?: boolean
  badge?: 'NEW' | 'HOT' | 'LIMITED' | null
  theme?: 'default' | 'holiday' | 'summer' | 'muertos'
  inStock?: boolean
}

interface ProductEditorProps {
  isOpen?: boolean
  onClose?: () => void
  onSave?: () => void
  onCancel?: () => void
  product?: Product | null
}

export default function ProductEditor({
  isOpen = true,
  onClose,
  onSave,
  onCancel,
  product,
}: ProductEditorProps) {
  // Use onCancel if provided, otherwise onClose
  const handleCancel = onCancel || onClose || (() => {})
  const handleComplete = onSave || onClose || (() => {})
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    unitsPerCase: 1,
    categoryId: '',
    brandId: '',
    imageUrl: '',
    gradientPresetId: null,
    glowPresetId: null,
    splashPresetId: null,
    featured: false,
    seasonal: false,
    trending: false,
    backgroundColor: null,
    backgroundGradient: null,
    glossLevel: 'none',
    sparkle: false,
    badge: null,
    theme: 'default',
    inStock: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch categories and brands
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []

  // Fetch visual presets
  const presetsQuery = useQuery({
    queryKey: ['visual-presets'],
    queryFn: async () => {
      const res = await fetch('/api/presets/visual')
      if (!res.ok) {
        const errorText = await res.text()
        console.error('[ProductEditor] Presets API error:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText,
        })
        throw new Error(`Failed to fetch presets: ${res.status} ${res.statusText}`)
      }
      const json = await res.json()
      console.log('[ProductEditor] Presets data loaded:', {
        gradients: json.gradients?.length || 0,
        glows: json.glows?.length || 0,
        splashes: json.splashes?.length || 0,
        hasData: !!json.gradients && !!json.glows && !!json.splashes,
      })
      return json
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2, // Retry twice on failure
  })

  const presetsData = presetsQuery.data
  const isLoadingPresets = presetsQuery.isLoading
  
  const presets = presetsData || {
    gradients: [],
    splashes: [],
    glows: [],
  }

  // Show error if presets fail to load
  useEffect(() => {
    if (presetsQuery.isError) {
      console.error('[ProductEditor] Failed to load visual presets:', presetsQuery.error)
      toast('Failed to load visual presets. Some features may be limited.', 'error')
    }
  }, [presetsQuery.isError, presetsQuery.error, toast])

  // Debug: Log preset counts
  useEffect(() => {
    if (presetsData) {
      console.log('Presets available:', {
        gradients: presetsData.gradients?.length || 0,
        glows: presetsData.glows?.length || 0,
        splashes: presetsData.splashes?.length || 0,
        sampleGradient: presetsData.gradients?.[0],
        sampleGlow: presetsData.glows?.[0],
        sampleSplash: presetsData.splashes?.[0],
      })
    }
  }, [presetsData])

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
        categoryId: product.categoryId || product.category?.id || '',
        brandId: product.brandId || product.brand?.id || '',
        gradientPresetId: product.gradientPresetId || null,
        glowPresetId: product.glowPresetId || null,
        splashPresetId: product.splashPresetId || null,
        featured: product.featured || false,
        seasonal: product.seasonal || false,
        trending: product.trending || false,
        backgroundColor: product.backgroundColor || null,
        backgroundGradient: product.backgroundGradient || null,
        glossLevel: (product as any).glossLevel || 'none',
        sparkle: (product as any).sparkle ?? false,
        badge: (product as any).badge || null,
        theme: (product as any).theme || 'default',
        inStock: product.inStock ?? true,
      })
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: 0,
        unitsPerCase: 1,
        categoryId: '',
        brandId: '',
        imageUrl: '',
        gradientPresetId: null,
        glowPresetId: null,
        splashPresetId: null,
        featured: false,
        seasonal: false,
        trending: false,
        backgroundColor: null,
        backgroundGradient: null,
        glossLevel: 'none',
        sparkle: false,
        badge: null,
        theme: 'default',
        inStock: true,
      })
    }
  }, [product])

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const url = '/api/admin/products'
      const method = product?.id ? 'PUT' : 'POST'
      
      // Always use FormData for consistency
      const formData = new FormData()
      
      // Append ID if updating
      if (product?.id) {
        formData.append('id', product.id)
      }
      
      // Append image file if present
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      // Append all other fields
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof Product]
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else if (typeof value === 'object' && !(value instanceof File)) {
            // Skip objects (category, brand) - we only send IDs
            if (key === 'category' || key === 'brand') {
              return
            }
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, String(value))
          }
        }
      })
      
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to save product')
      }
      
      return res.json()
    },
    onSuccess: (data) => {
      // Update cache with new data
      if (product?.id) {
        queryClient.setQueryData(['admin-products'], (old: any) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.map((p: Product) => 
              p.id === product.id ? { ...p, ...data } : p
            ),
          }
        })
      }
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-layout'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      toast('Product saved successfully!', 'success')
      setImageFile(null)
      handleComplete()
    },
    onError: (err: any) => {
      console.error('Save mutation error:', err)
      toast(err?.message || 'Failed to save product', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete product')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast('Product deleted successfully', 'success')
      handleComplete()
    },
    onError: () => {
      toast('Failed to delete product', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate with Zod schema
    const validationSchema = product?.id ? ProductUpdateSchema : ProductCreateSchema
    const validationResult = validationSchema.safeParse({
      ...formData,
      id: product?.id,
    })

    if (!validationResult.success) {
      toast('Validation failed: ' + validationResult.error.errors.map(e => e.message).join(', '), 'error')
      return
    }

    saveMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (product?.id && confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(product.id)
    }
  }

  // Render inline if no onClose handler provided (used in page, not as modal)
  const isInlineMode = !onClose

  if (!isOpen && !isInlineMode) {
    return null
  }

  const formContent = (
      <form onSubmit={handleSubmit} className={isInlineMode ? "space-y-6" : "h-full flex flex-col min-h-0"}>
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto -mx-4 md:-mx-6 px-4 md:px-6 min-h-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0 py-4">
            {/* Left Column - Form Fields */}
            <div className="lg:space-y-6 space-y-6 min-w-0">
        {/* Image Upload */}
        <ProductImageUpload
          productId={product?.id}
          currentImageUrl={formData.imageUrl || undefined}
          onUploadComplete={(imageUrl) => {
            setFormData((prev) => ({ ...prev, imageUrl }))
          }}
          onFileSelect={(file) => {
            setImageFile(file)
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
              setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
            }
            reader.readAsDataURL(file)
          }}
        />

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <Input
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Case) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units per Case *
            </label>
            <Input
              type="number"
              value={formData.unitsPerCase || 1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unitsPerCase: parseInt(e.target.value) || 1,
                }))
              }
              required
            />
          </div>
        </div>

        {/* Category and Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <Select
              value={formData.categoryId || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value || null }))
              }
            >
              <option value="">No category</option>
              {categories.map((cat: { id: string; name: string }) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <Select
              value={formData.brandId || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brandId: e.target.value || null }))
              }
            >
              <option value="">No brand</option>
              {brands.map((brand: { id: string; name: string }) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.inStock !== false}
              onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {formData.inStock === false ? 'Currently hidden in catalog' : 'Available for sales teams'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Toggle this off to temporarily remove the product from catalogs, sales flows, and warehouse pick lists.
          </p>
        </div>

        {/* Enhancement Flags and Visual Presets */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enhancement Flags</label>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.seasonal || false}
                  onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Seasonal</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trending || false}
                  onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Trending</span>
              </label>
            </div>
          </div>

          {/* Visual Preset Fields */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Visual Presets</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gloss Level</label>
                <select
                  value={formData.glossLevel || 'none'}
                  onChange={(e) => setFormData({ ...formData, glossLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="none">None</option>
                  <option value="soft">Soft</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Theme</label>
                <select
                  value={formData.theme || 'default'}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="holiday">Holiday</option>
                  <option value="summer">Summer</option>
                  <option value="muertos">Día de Muertos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Badge</label>
                <select
                  value={formData.badge || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ 
                      ...formData, 
                      badge: value === '' ? null : (value as 'NEW' | 'HOT' | 'LIMITED' | null)
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">None</option>
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT</option>
                  <option value="LIMITED">LIMITED</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={formData.sparkle || false}
                    onChange={(e) => setFormData({ ...formData, sparkle: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Enable Sparkle Effect</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Right Column - Visual Design Panel */}
        <div className="lg:border-l lg:pl-8 lg:pt-0 pt-6 border-t lg:border-t-0 border-gray-200 min-w-0">
              {isLoadingPresets ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Loading presets...</p>
                </div>
              ) : (
                <VisualDesignPanel
                  formData={formData}
                  presets={presets}
                  onUpdate={(updates) => {
                    setFormData((prev) => {
                      const normalized = Object.fromEntries(
                        Object.entries(updates).map(([key, value]) => [
                          key,
                          value === null ? undefined : value,
                        ])
                      )
                      return { ...prev, ...normalized }
                    })
                  }}
                />
              )}
        </div>
      </div>
    </div>

        {/* Fixed Actions Bar */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white -mx-4 md:-mx-6 px-4 md:px-6 py-4 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              {product?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </form>
  )

  // If inline mode, return form directly. Otherwise wrap in Drawer
  if (isInlineMode) {
    return formContent
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose!} title={product ? 'Edit Product' : 'New Product'}>
      {formContent}
    </Drawer>
  )
}
