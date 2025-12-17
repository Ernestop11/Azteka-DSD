'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Upload, X, Save, Package, Plus, Search } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Select from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface BundleItem {
  productId: string
  product: {
    id: string
    name: string
    sku?: string
    price: number
  }
  quantity: number
}

interface Product {
  id: string
  name: string
  sku?: string
  price: number | string
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

export default function BundleEditorPage() {
  const router = useRouter()
  const params = useParams()
  const bundleId = params.id as string
  const isEdit = Boolean(bundleId && bundleId !== 'new')
  
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [bundle, setBundle] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    brandId: '',
    price: '',
    discountPercent: '0',
    stock: '0',
    minStock: '5',
    inStock: true,
    featured: false,
    active: true,
    badgeText: '',
    badgeColor: '#10b981',
    businessModes: [] as string[],
  })
  
  const [items, setItems] = useState<BundleItem[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [removeImage, setRemoveImage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const businessModeOptions = [
    { value: 'MEXICAN_STORE', label: 'Mexican Store' },
    { value: 'CONVENIENCE_STORE', label: 'Convenience Store' },
    { value: 'GAS_STATION', label: 'Gas Station' },
  ]

  // Fetch bundle if editing
  const { data: bundleData, isLoading: isLoadingBundle } = useQuery({
    queryKey: ['admin-bundle', bundleId],
    queryFn: async () => {
      if (!isEdit) return null
      const res = await fetch(`/api/admin/bundles/${bundleId}`)
      if (!res.ok) throw new Error('Failed to load bundle')
      const json = await res.json()
      return json.data
    },
    enabled: isEdit,
  })

  // Fetch categories and brands
  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  const { data: brandsData } = useQuery<{ data: Brand[] }>({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  // Fetch products
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products-for-bundles'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []
  const allProducts = productsData?.data || []

  // Load bundle data when editing
  useEffect(() => {
    if (bundleData) {
      setBundle({
        name: bundleData.name || '',
        sku: bundleData.sku || '',
        description: bundleData.description || '',
        categoryId: bundleData.categoryId || '',
        brandId: bundleData.brandId || '',
        price: bundleData.price?.toString() || '',
        discountPercent: bundleData.discountPercent?.toString() || '0',
        stock: bundleData.stock?.toString() || '0',
        minStock: bundleData.minStock?.toString() || '5',
        inStock: bundleData.inStock ?? true,
        featured: bundleData.featured || false,
        active: bundleData.active ?? true,
        badgeText: bundleData.badgeText || '',
        badgeColor: bundleData.badgeColor || '#10b981',
        businessModes: bundleData.businessModes || [],
      })

      if (bundleData.items) {
        setItems(
          bundleData.items.map((item: any) => ({
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
          }))
        )
      }

      if (bundleData.imageUrl) {
        setImagePreview(getPublicImageUrl(bundleData.imageUrl))
      }
    }
  }, [bundleData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setRemoveImage(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setRemoveImage(true)
  }

  const addItem = (product: Product) => {
    if (items.find((item) => item.productId === product.id)) {
      toast('Product already added to bundle', 'info')
      return
    }

    setItems([
      ...items,
      {
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
        },
        quantity: 1,
      },
    ])
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId))
  }

  const updateItemQuantity = (productId: string, quantity: string) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: parseInt(quantity, 10) || 1 }
          : item
      )
    )
  }

  const calculateTotalPrice = () => {
    return items.reduce((total, item) => {
      const productPrice = item.product.price || 0
      return total + productPrice * item.quantity
    }, 0)
  }

  const calculateDiscountedPrice = () => {
    const total = calculateTotalPrice()
    const discount = parseFloat(bundle.discountPercent) || 0
    return total * (1 - discount / 100)
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      !items.find((item) => item.productId === p.id) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()

      // Add bundle fields
      Object.keys(bundle).forEach((key) => {
        const value = bundle[key as keyof typeof bundle]
        if (key === 'businessModes') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      })

      // Add items
      formData.append('items', JSON.stringify(items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))))

      // Add image
      if (imageFile) {
        formData.append('image', imageFile)
      }
      if (removeImage) {
        formData.append('removeImage', 'true')
      }

      const url = isEdit ? `/api/admin/bundles/${bundleId}` : '/api/admin/bundles'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save bundle')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] })
      toast('Bundle saved successfully!', 'success')
      router.push('/admin/bundles')
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to save bundle')
      toast(error.message || 'Failed to save bundle', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!bundle.name.trim()) {
      setError('Bundle name is required')
      return
    }

    if (items.length === 0) {
      setError('Please add at least one product to the bundle')
      return
    }

    saveMutation.mutate()
  }

  if (isLoadingBundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bundle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/bundles')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Bundles
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Bundle' : 'Create New Bundle'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit
              ? 'Update bundle details and products'
              : 'Create multi-product bundles for Mexican food distribution'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bundle Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={bundle.name}
                      onChange={(e) => setBundle({ ...bundle, name: e.target.value })}
                      placeholder="e.g., La Molienda Mexican Snack Pack"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <Input
                        type="text"
                        value={bundle.sku}
                        onChange={(e) => setBundle({ ...bundle, sku: e.target.value })}
                        placeholder="BUNDLE-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bundle Price *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bundle.price}
                        onChange={(e) => setBundle({ ...bundle, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      rows={3}
                      value={bundle.description}
                      onChange={(e) => setBundle({ ...bundle, description: e.target.value })}
                      placeholder="Describe the bundle and its benefits..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={bundle.categoryId}
                        onChange={(e) => setBundle({ ...bundle, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <select
                        value={bundle.brandId}
                        onChange={(e) => setBundle({ ...bundle, brandId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount %
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bundle.discountPercent}
                        onChange={(e) => setBundle({ ...bundle, discountPercent: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <Input
                        type="number"
                        value={bundle.stock}
                        onChange={(e) => setBundle({ ...bundle, stock: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Stock
                      </label>
                      <Input
                        type="number"
                        value={bundle.minStock}
                        onChange={(e) => setBundle({ ...bundle, minStock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Text
                      </label>
                      <Input
                        type="text"
                        value={bundle.badgeText}
                        onChange={(e) => setBundle({ ...bundle, badgeText: e.target.value })}
                        placeholder="BEST VALUE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Color
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={bundle.badgeColor}
                          onChange={(e) => setBundle({ ...bundle, badgeColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={bundle.badgeColor}
                          onChange={(e) => setBundle({ ...bundle, badgeColor: e.target.value })}
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Modes
                    </label>
                    <div className="space-y-2">
                      {businessModeOptions.map((mode) => (
                        <label key={mode.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={bundle.businessModes.includes(mode.value)}
                            onChange={(e) => {
                              const modes = e.target.checked
                                ? [...bundle.businessModes, mode.value]
                                : bundle.businessModes.filter((m) => m !== mode.value)
                              setBundle({ ...bundle, businessModes: modes })
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{mode.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bundle Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bundle Products</h2>

                {/* Product Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or SKU..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Selected Items */}
                {items.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Selected Products ({items.length})
                    </h3>
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            ${Number(item.product.price || 0).toFixed(2)} × {item.quantity} = $
                            {(Number(item.product.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.productId, e.target.value)}
                          className="w-20"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Original Total:</span>
                        <span className="font-medium">${Number(calculateTotalPrice() || 0).toFixed(2)}</span>
                      </div>
                      {parseFloat(bundle.discountPercent) > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({bundle.discountPercent}%):</span>
                            <span>
                              -${(Number(calculateTotalPrice() || 0) - Number(calculateDiscountedPrice() || 0)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
                            <span>Bundle Price:</span>
                            <span>${Number(calculateDiscountedPrice() || 0).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Product List */}
                {searchTerm && (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredProducts.length === 0 ? (
                      <p className="p-4 text-center text-gray-500">No products found</p>
                    ) : (
                      filteredProducts.slice(0, 20).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addItem(product)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.sku} • $
                            {Number(
                              typeof product.price === 'number'
                                ? product.price
                                : parseFloat(String(product.price)) || 0
                            ).toFixed(2)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Image & Settings */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bundle Image</h2>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Bundle preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bundle.featured}
                      onChange={(e) => setBundle({ ...bundle, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Bundle</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bundle.active}
                      onChange={(e) => setBundle({ ...bundle, active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bundle.inStock}
                      onChange={(e) => setBundle({ ...bundle, inStock: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/admin/bundles')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Bundle' : 'Create Bundle'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

