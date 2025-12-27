'use client'

/**
 * INVENTORY IMAGE SEEDING PAGE - REBUILT FOR STABILITY
 * 
 * Features:
 * - Two tabs: "All Products" and "New Products from PO"
 * - Uses ProductCard component (no black squares)
 * - Drag & drop saves directly to VPS database
 * - Real-time sync across all pages
 * - Barcode scanning support
 * - Proper image previews from VPS
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, CheckCircle2, XCircle, Loader2, Search, Filter, Package, Plus, X, Image, Camera, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import ProductCard from '@/components/catalog/ProductCard'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Product {
  id: string
  name: string
  sku: string
  imageUrl?: string | null
  splashImageUrl?: string | null  // Secondary image (case image, angle shot, etc.)
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  price: number
  unitsPerCase?: number
  inStock: boolean
  needsReview?: boolean
  isNewProduct?: boolean
}

type TabType = 'all' | 'new'

export default function InventorySeedPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [draggedOverProduct, setDraggedOverProduct] = useState<string | null>(null)
  const [uploadingProducts, setUploadingProducts] = useState<Set<string>>(new Set())
  const [uploadedProducts, setUploadedProducts] = useState<Set<string>>(new Set())
  const [removingBgProducts, setRemovingBgProducts] = useState<Set<string>>(new Set())
  const [imageVersions, setImageVersions] = useState<Map<string, number>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [showMissingOnly, setShowMissingOnly] = useState(false)

  // New product modal state
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductSku, setNewProductSku] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductCategoryId, setNewProductCategoryId] = useState('')
  const [newProductBrandId, setNewProductBrandId] = useState('')
  const [creatingProduct, setCreatingProduct] = useState(false)

  // Image gallery modal state
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null)
  const [uploadingSecondary, setUploadingSecondary] = useState(false)
  const [dragOverSecondary, setDragOverSecondary] = useState(false)
  const secondaryInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [brands, setBrands] = useState<{id: string, name: string}[]>([])

  // Load categories and brands for new product form
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/admin/categories', { credentials: 'include' }),
          fetch('/api/admin/brands', { credentials: 'include' })
        ])
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.data || [])
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json()
          setBrands(brandData.data || [])
        }
      } catch (err) {
        console.error('Failed to load categories/brands:', err)
      }
    }
    loadData()
  }, [])

  // Create new product
  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      toast('Product name is required', 'error')
      return
    }

    setCreatingProduct(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newProductName.trim(),
          sku: newProductSku.trim() || `PROD-${Date.now()}`,
          price: parseFloat(newProductPrice) || 0,
          unitsPerCase: 1,
          categoryId: newProductCategoryId || null,
          brandId: newProductBrandId || null,
          inStock: true,
          stock: 0,
          needsReview: true
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create product')
      }

      toast('Product created successfully!', 'success')
      setShowNewProductModal(false)
      setNewProductName('')
      setNewProductSku('')
      setNewProductPrice('')
      setNewProductCategoryId('')
      setNewProductBrandId('')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create product', 'error')
    } finally {
      setCreatingProduct(false)
    }
  }

  // Fetch all products
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Add timestamp to force fresh fetch
      const res = await fetch(`/api/admin/products?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errorData.error || errorData.details || `Failed to fetch: ${res.status}`)
      }
      const response = await res.json()
      return (response.data || []) as Product[]
    },
    staleTime: 0,
    gcTime: 0, // Don't cache at all
    retry: 1,
  })

  const allProducts = productsData || []

  // Filter products based on active tab
  const products = useMemo(() => {
    let filtered = allProducts

    if (!Array.isArray(filtered)) {
      console.warn('[Inventory Seed] allProducts is not an array:', filtered)
      filtered = []
    }

    // Tab filtering
    if (activeTab === 'new') {
      // Show products that need review (from PO imports)
      filtered = filtered.filter(p => p.needsReview === true || p.isNewProduct === true)
    }

    // Filter by missing images
    if (showMissingOnly) {
      filtered = filtered.filter(p => {
        const url = p.imageUrl
        return !url || url === '' || url === null || url.includes('placeholder') || url.includes('coming-soon')
      })
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.category?.name?.toLowerCase().includes(searchLower) ||
        p.brand?.name?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [allProducts, activeTab, showMissingOnly, searchTerm])

  // Check if product has image
  const hasImage = useCallback((url: string | null | undefined): boolean => {
    if (!url) return false
    const normalized = url.trim().toLowerCase()
    return !normalized.includes('placeholder') && 
           !normalized.includes('coming-soon') && 
           !normalized.includes('no-image')
  }, [])

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedOverProduct(productId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedOverProduct(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedOverProduct(null)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))

    if (!imageFile) {
      toast('Please drop a PNG or image file', 'error')
      return
    }

    await uploadImage(productId, imageFile)
  }, [])

  // Upload image
  const uploadImage = useCallback(async (productId: string, file: File) => {
    setUploadingProducts(prev => new Set(prev).add(productId))

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('productId', productId)

      const res = await fetch('/api/admin/products/uploadImage', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || error.details || 'Upload failed')
      }

      const data = await res.json()

      // CRITICAL: Update image version to force browser reload
      const newVersion = Date.now()
      setImageVersions(prev => {
        const next = new Map(prev)
        next.set(productId, newVersion)
        return next
      })

      // CRITICAL: Immediately update the product in the cache with new imageUrl
      // This makes the preview update instantly without waiting for refetch
      if (data.imageUrl) {
        queryClient.setQueryData(['admin-products'], (oldData: Product[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(p =>
            p.id === productId
              ? { ...p, imageUrl: data.imageUrl }
              : p
          )
        })
      }

      // Also refetch in background to ensure full sync
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })

      setUploadedProducts(prev => new Set(prev).add(productId))
      toast(`Image uploaded successfully for ${products.find(p => p.id === productId)?.name || 'product'}`, 'success')

      // Clear uploaded state after 3 seconds
      setTimeout(() => {
        setUploadedProducts(prev => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }, 3000)
    } catch (error) {
      console.error('Upload error:', error)
      toast(error instanceof Error ? error.message : 'Failed to upload image', 'error')
    } finally {
      setUploadingProducts(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }, [products, queryClient, toast])

  // File input handler
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  const handleFileInputChange = useCallback((productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      uploadImage(productId, file)
    }
  }, [uploadImage])

  // Open image gallery modal for a product
  const openImageGallery = useCallback((product: Product) => {
    setGalleryProduct(product)
    setShowImageGallery(true)
  }, [])

  // Upload secondary image (case image, angle, etc.)
  const uploadSecondaryImage = useCallback(async (productId: string, file: File) => {
    setUploadingSecondary(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('productId', productId)
      formData.append('imageType', 'splash') // Use splashImageUrl field

      const res = await fetch('/api/admin/products/uploadImage', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || error.details || 'Upload failed')
      }

      const data = await res.json()
      console.log('[Gallery] Upload response:', data)

      // Update gallery product state immediately for instant preview
      if (galleryProduct && data.splashImageUrl) {
        console.log('[Gallery] Updating preview with:', data.splashImageUrl)
        setGalleryProduct({ ...galleryProduct, splashImageUrl: data.splashImageUrl })
      }

      // Force refetch to sync list
      queryClient.setQueryData(['admin-products'], undefined)
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      await refetch()

      toast('Secondary image uploaded!', 'success')
    } catch (error) {
      console.error('Secondary upload error:', error)
      toast(error instanceof Error ? error.message : 'Failed to upload image', 'error')
    } finally {
      setUploadingSecondary(false)
    }
  }, [galleryProduct, queryClient, toast, refetch])

  // Handle secondary image drop
  const handleSecondaryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSecondary(false)

    if (!galleryProduct) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))

    if (!imageFile) {
      toast('Please drop a PNG or image file', 'error')
      return
    }

    uploadSecondaryImage(galleryProduct.id, imageFile)
  }, [galleryProduct, uploadSecondaryImage, toast])

  // Handle secondary file input
  const handleSecondaryFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/') && galleryProduct) {
      uploadSecondaryImage(galleryProduct.id, file)
    }
  }, [galleryProduct, uploadSecondaryImage])

  // Remove background from product image
  const removeBackground = useCallback(async (productId: string, imageUrl: string) => {
    setRemovingBgProducts(prev => new Set(prev).add(productId))

    try {
      const res = await fetch('/api/products/background-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, imageUrl }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Background removal failed' }))
        throw new Error(error.error || error.details || 'Background removal failed')
      }

      // Update image version to force browser reload
      setImageVersions(prev => {
        const next = new Map(prev)
        next.set(productId, Date.now())
        return next
      })

      // Force refetch
      queryClient.setQueryData(['admin-products'], undefined)
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      await refetch()

      toast('Background removed successfully!', 'success')
    } catch (error) {
      console.error('BG removal error:', error)
      toast(error instanceof Error ? error.message : 'Failed to remove background', 'error')
    } finally {
      setRemovingBgProducts(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }, [queryClient, toast, refetch])

  // Counts for tabs
  const allProductsCount = allProducts.length
  const newProductsCount = allProducts.filter(p => p.needsReview === true || p.isNewProduct === true).length
  const missingImagesCount = allProducts.filter(p => !hasImage(p.imageUrl)).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Image Seeding</h1>
                <p className="text-sm text-gray-600">
                  Drag and drop PNG images to update product pictures
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewProductModal(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Product
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{products.length}</span> products
                {showMissingOnly && ` (${missingImagesCount} missing images)`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                All Products
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {allProductsCount}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'new'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Products from PO
                {newProductsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-semibold">
                    {newProductsCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowMissingOnly(!showMissingOnly)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showMissingOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              {showMissingOnly ? 'Show All' : 'Missing Images Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error loading products</p>
            <p className="text-sm text-gray-500 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No products found</p>
            {allProducts.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {allProducts.length} products total, but none match current filters
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => {
              const isDraggedOver = draggedOverProduct === product.id
              const isUploading = uploadingProducts.has(product.id)
              const isUploaded = uploadedProducts.has(product.id)
              const isRemovingBg = removingBgProducts.has(product.id)
              const productHasImage = hasImage(product.imageUrl)

              return (
                <div
                  key={product.id}
                  onDragOver={(e) => handleDragOver(e, product.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, product.id)}
                  className={`relative group ${
                    isDraggedOver ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  {/* Upload Overlay */}
                  {isDraggedOver && (
                    <div className="absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 rounded-xl z-20 flex items-center justify-center pointer-events-none">
                      <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                        <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-blue-600">Drop image here</p>
                      </div>
                    </div>
                  )}

                  {/* Upload Status Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl z-20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}

                  {/* Background Removal Overlay */}
                  {isRemovingBg && (
                    <div className="absolute inset-0 bg-purple-900/70 rounded-xl z-20 flex flex-col items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-300 animate-pulse mb-2" />
                      <span className="text-white text-xs font-medium">Removing BG...</span>
                    </div>
                  )}

                  {isUploaded && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-xl z-20 flex items-center justify-center pointer-events-none">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  )}

                  {/* Product Card - Using the actual ProductCard component */}
                  <div className="relative">
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
                        unitsPerCase: product.unitsPerCase || 1,
                        // Add cache busting timestamp - strip any existing ?v= first to avoid double params
                        imageUrl: product.imageUrl ? (() => {
                          const baseUrl = product.imageUrl!.split('?')[0]
                          const version = imageVersions.get(product.id) || Date.now()
                          return `${baseUrl}?v=${version}`
                        })() : null,
                        inStock: product.inStock ?? true,
                        allowPresell: false,
                        category: product.category ? { id: product.category.id, name: product.category.name } : null,
                        brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
                      }}
                      index={0}
                      mode="preview"
                    />

                    {/* Upload Button Overlay */}
                    {!isUploading && !isRemovingBg && (
                      <div className="absolute bottom-2 right-2 z-30 flex gap-1">
                        {/* Remove BG button - only show if product has an image */}
                        {productHasImage && (
                          <button
                            onClick={() => removeBackground(product.id, product.imageUrl!)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Remove background (AI)"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        )}
                        {/* Gallery button - only show if product has an image */}
                        {productHasImage && (
                          <button
                            onClick={() => openImageGallery(product)}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Manage product images"
                          >
                            <Image className="w-3 h-3" />
                          </button>
                        )}
                        <label
                          htmlFor={`file-input-${product.id}`}
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        >
                          <Upload className="w-3 h-3" />
                          {productHasImage ? 'Replace' : 'Upload'}
                        </label>
                        <input
                          id={`file-input-${product.id}`}
                          ref={(el) => {
                            fileInputRefs.current[product.id] = el
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(product.id, e)}
                        />
                      </div>
                    )}

                    {/* New Product Badge */}
                    {(product.needsReview || product.isNewProduct) && (
                      <div className="absolute top-2 left-2 z-30">
                        <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded shadow-lg">
                          NEW
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Product Modal */}
      {showNewProductModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowNewProductModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU / Barcode
                </label>
                <input
                  type="text"
                  value={newProductSku}
                  onChange={(e) => setNewProductSku(e.target.value)}
                  placeholder="Leave blank for auto-generated"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newProductCategoryId}
                  onChange={(e) => setNewProductCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={newProductBrandId}
                  onChange={(e) => setNewProductBrandId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewProductModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={creatingProduct || !newProductName.trim()}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creatingProduct ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {creatingProduct ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && galleryProduct && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowImageGallery(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
                <p className="text-sm text-gray-600">{galleryProduct.name}</p>
              </div>
              <button
                onClick={() => setShowImageGallery(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Main Product Image */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Main Product Image</h3>
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                  {galleryProduct.imageUrl ? (
                    <img
                      src={getPublicImageUrl(`${galleryProduct.imageUrl}?v=${Date.now()}`)}
                      alt={galleryProduct.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drag & drop on product card to replace main image
                </p>
              </div>

              {/* Secondary Image (Case/Angle) */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Secondary Image (Case/Angle)</h3>
                <div
                  className={`aspect-square bg-gray-100 rounded-xl overflow-hidden relative border-2 border-dashed transition-colors ${
                    dragOverSecondary ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDragOverSecondary(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDragOverSecondary(false)
                  }}
                  onDrop={handleSecondaryDrop}
                >
                  {uploadingSecondary ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                  ) : galleryProduct.splashImageUrl ? (
                    <img
                      src={getPublicImageUrl(`${galleryProduct.splashImageUrl}?v=${Date.now()}`)}
                      alt={`${galleryProduct.name} - Secondary`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                      <Upload className="w-12 h-12 mb-2" />
                      <p className="text-sm text-center">Drag & drop or click to add</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => secondaryInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {galleryProduct.splashImageUrl ? 'Replace' : 'Upload'}
                  </button>
                  <input
                    ref={secondaryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSecondaryFileInput}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add case photo, angle shot, or detail view
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Tip:</strong> Use secondary images for case packaging, different angles, or detail shots.
                These can be showcased in the Menu Block Builder for premium products.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
