'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, Layers, Settings, BarChart3, Users, Tag, Grid3x3,
  ShoppingBag, Plus, Search, Filter, Camera, X, Upload, Trash2,
  DollarSign, Percent, Link2, Save, Edit3, ChevronDown, ChevronRight,
  ScanLine, ImagePlus, AlertCircle, Check, Loader2, ArrowLeft
} from 'lucide-react'

// Types
interface Product {
  id: string
  name: string
  sku: string
  barcode?: string | null
  description?: string | null
  price: number | string
  cost?: number | null
  unitsPerCase: number
  imageUrl?: string | null
  images?: string[]
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  categoryId?: string | null
  brandId?: string | null
  inStock?: boolean | null
  featured?: boolean
  seasonal?: boolean
  trending?: boolean
  relatedProducts?: string[]
  bundleWith?: string[]
  margins?: {
    standard: number
    tier1: number
    tier2: number
    tier3: number
  }
  customerPricing?: Record<string, number>
}

interface Category {
  id: string
  name: string
  slug?: string
}

interface Brand {
  id: string
  name: string
  slug?: string
}

// Tab definitions
const TABS = [
  { id: 'products', label: 'Products', icon: Package, description: 'Manage product catalog' },
  { id: 'block-builder', label: 'Block Builder', icon: Layers, description: 'Visual catalog editor' },
  { id: 'categories', label: 'Categories', icon: Grid3x3, description: 'Product categories' },
  { id: 'brands', label: 'Brands', icon: Tag, description: 'Brand management' },
  { id: 'bundles', label: 'Bundles', icon: ShoppingBag, description: 'Product bundles' },
  { id: 'customers', label: 'Customers', icon: Users, description: 'Customer pricing' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Sales insights' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-xl">
              A
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">Azteka DSD</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{tab.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'block-builder' && <BlockBuilderEmbed />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'brands' && <BrandsTab />}
        {activeTab === 'bundles' && <BundlesTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  )
}

// ============================================
// PRODUCTS TAB - Full featured product editor
// ============================================
function ProductsTab() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterBrand, setFilterBrand] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)

  // Fetch products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products', filterCategory, filterBrand, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.append('categoryId', filterCategory)
      if (filterBrand !== 'all') params.append('brandId', filterBrand)
      if (searchTerm) params.append('search', searchTerm)
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  const products = productsData?.data || []
  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []

  // Handle barcode scan result
  useEffect(() => {
    if (scanResult) {
      // Search for product by barcode or SKU
      const found = products.find((p: Product) =>
        p.barcode === scanResult || p.sku === scanResult
      )
      if (found) {
        setSelectedProduct(found)
        setScanResult(null)
        setIsScannerOpen(false)
      } else {
        // Create new product with scanned barcode
        setSelectedProduct({
          id: '',
          name: '',
          sku: scanResult,
          barcode: scanResult,
          price: 0,
          unitsPerCase: 1
        } as Product)
        setIsCreating(true)
        setScanResult(null)
        setIsScannerOpen(false)
      }
    }
  }, [scanResult, products])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-600">{products.length} products in catalog</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ScanLine className="w-4 h-4" />
              Scan Barcode
            </button>
            <button
              onClick={() => {
                setSelectedProduct(null)
                setIsCreating(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Brands</option>
            {brands.map((brand: Brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product List */}
        <div className="w-full overflow-auto p-6">
          {loadingProducts ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProduct?.id === product.id}
                  onClick={() => {
                    setSelectedProduct(product)
                    setIsCreating(false)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Editor Modal */}
        {(selectedProduct || isCreating) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <ProductEditorPanel
                product={selectedProduct}
                categories={categories}
                brands={brands}
                allProducts={products}
                onClose={() => {
                  setSelectedProduct(null)
                  setIsCreating(false)
                }}
                onSave={() => {
                  queryClient.invalidateQueries({ queryKey: ['admin-products'] })
                  setSelectedProduct(null)
                  setIsCreating(false)
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          onScan={(code) => setScanResult(code)}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}

// Product Card Component
function ProductCard({ product, isSelected, onClick }: {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
}) {
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0

  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
        isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'
      }`}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-12 h-12" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.featured && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">Featured</span>
          )}
          {product.inStock === false && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">Out of Stock</span>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-emerald-600 font-bold">${price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">{product.unitsPerCase} units/case</span>
        </div>
        {product.brand && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {product.brand.name}
          </span>
        )}
      </div>
    </button>
  )
}

// Full Product Editor Panel
function ProductEditorPanel({
  product,
  categories,
  brands,
  allProducts,
  onClose,
  onSave
}: {
  product: Product | null
  categories: Category[]
  brands: Brand[]
  allProducts: Product[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    price: 0,
    cost: 0,
    unitsPerCase: 1,
    categoryId: '',
    brandId: '',
    imageUrl: '',
    images: [],
    inStock: true,
    featured: false,
    seasonal: false,
    trending: false,
    relatedProducts: [],
    bundleWith: [],
    margins: { standard: 25, tier1: 20, tier2: 15, tier3: 10 },
    customerPricing: {},
  })
  const [activeSection, setActiveSection] = useState('basic')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load product data
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
        categoryId: product.categoryId || product.category?.id || '',
        brandId: product.brandId || product.brand?.id || '',
        images: product.images || [],
        margins: product.margins || { standard: 25, tier1: 20, tier2: 15, tier3: 10 },
        customerPricing: product.customerPricing || {},
        relatedProducts: product.relatedProducts || [],
        bundleWith: product.bundleWith || [],
      })
    }
  }, [product])

  // Handle image upload
  const handleImageUpload = async (file: File, isMain = false) => {
    setUploadingImage(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('image', file)
      formDataObj.append('type', 'product')

      const res = await fetch('/api/admin/products/uploadImage', {
        method: 'POST',
        body: formDataObj,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      const imageUrl = data.url || data.imageUrl

      if (isMain) {
        setFormData(prev => ({ ...prev, imageUrl }))
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      const formDataObj = new FormData()

      if (product?.id) {
        formDataObj.append('id', product.id)
      }

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object' && !(value instanceof File)) {
            formDataObj.append(key, JSON.stringify(value))
          } else if (typeof value === 'boolean') {
            formDataObj.append(key, value.toString())
          } else {
            formDataObj.append(key, String(value))
          }
        }
      })

      const res = await fetch('/api/admin/products', {
        method: product?.id ? 'PUT' : 'POST',
        body: formDataObj,
      })

      if (!res.ok) throw new Error('Save failed')

      onSave()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  // Calculate margins
  const price = typeof formData.price === 'number' ? formData.price : parseFloat(String(formData.price)) || 0
  const cost = formData.cost || 0
  const margin = cost > 0 ? ((price - cost) / price * 100) : 0

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'pricing', label: 'Pricing & Margins', icon: DollarSign },
    { id: 'images', label: 'Images', icon: ImagePlus },
    { id: 'relationships', label: 'Relationships', icon: Link2 },
    { id: 'customer-pricing', label: 'Customer Pricing', icon: Users },
  ]

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">
          {product?.id ? 'Edit Product' : 'New Product'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex-shrink-0 flex gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Form Content */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, true)
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Image
                  </button>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Name & SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (UPC/EAN)</label>
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Scan or enter barcode"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={formData.brandId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units per Case */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units per Case</label>
              <input
                type="number"
                value={formData.unitsPerCase || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, unitsPerCase: parseInt(e.target.value) || 1 }))}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Flags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Flags</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.seasonal || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, seasonal: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm">Seasonal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trending || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, trending: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm">Trending</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Pricing & Margins Section */}
        {activeSection === 'pricing' && (
          <div className="space-y-6">
            {/* Base Pricing */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Base Pricing
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Case) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Case)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
                  <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    margin >= 20 ? 'bg-green-100 text-green-700' :
                    margin >= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {margin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Margins */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                Tier Margins (Discount from base price)
              </h4>
              <div className="grid grid-cols-4 gap-4">
                {['standard', 'tier1', 'tier2', 'tier3'].map((tier, idx) => {
                  const tierLabels = ['Standard', 'Tier 1 (10+ cases)', 'Tier 2 (25+ cases)', 'Tier 3 (50+ cases)']
                  return (
                    <div key={tier}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{tierLabels[idx]}</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.margins?.[tier as keyof typeof formData.margins] || 0}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            margins: {
                              ...prev.margins!,
                              [tier]: parseFloat(e.target.value) || 0
                            }
                          }))}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ${(price * (1 - (formData.margins?.[tier as keyof typeof formData.margins] || 0) / 100)).toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Images Section */}
        {activeSection === 'images' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product Gallery</h4>
              <div className="grid grid-cols-4 gap-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-emerald-500 relative">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                    Main
                  </span>
                </div>

                {/* Additional Images */}
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative group">
                    <img src={img} alt="" className="w-full h-full object-contain" />
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: prev.images?.filter((_, i) => i !== idx)
                      }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Image Button */}
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleImageUpload(file, false)
                    }
                    input.click()
                  }}
                  disabled={uploadingImage}
                  className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-emerald-500 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mb-2" />
                      <span className="text-xs">Add Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Relationships Section */}
        {activeSection === 'relationships' && (
          <div className="space-y-6">
            {/* Related Products */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Related Products</h4>
              <p className="text-sm text-gray-500 mb-4">Products that customers might also be interested in</p>
              <ProductSelector
                selectedIds={formData.relatedProducts || []}
                allProducts={allProducts.filter(p => p.id !== product?.id)}
                onChange={(ids) => setFormData(prev => ({ ...prev, relatedProducts: ids }))}
              />
            </div>

            {/* Bundle With */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bundle Suggestions</h4>
              <p className="text-sm text-gray-500 mb-4">Products often sold together for bundle deals</p>
              <ProductSelector
                selectedIds={formData.bundleWith || []}
                allProducts={allProducts.filter(p => p.id !== product?.id)}
                onChange={(ids) => setFormData(prev => ({ ...prev, bundleWith: ids }))}
              />
            </div>
          </div>
        )}

        {/* Customer Pricing Section */}
        {activeSection === 'customer-pricing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Customer-Specific Pricing
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Set custom prices for specific customers. Leave blank to use tier pricing.
              </p>
              <div className="space-y-4">
                {/* This would be populated with actual customers */}
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Customer pricing setup coming soon</p>
                  <p className="text-xs">Individual customer prices can be set in the Customers tab</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Product
        </button>
      </div>
    </div>
  )
}

// Product Selector Component
function ProductSelector({
  selectedIds,
  allProducts,
  onChange
}: {
  selectedIds: string[]
  allProducts: Product[]
  onChange: (ids: string[]) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
          {selectedIds.map(id => {
            const product = allProducts.find(p => p.id === id)
            if (!product) return null
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                {product.name}
                <button onClick={() => onChange(selectedIds.filter(i => i !== id))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* List */}
      <div className="max-h-48 overflow-auto">
        {filtered.slice(0, 20).map(product => (
          <button
            key={product.id}
            onClick={() => {
              if (selectedIds.includes(product.id)) {
                onChange(selectedIds.filter(i => i !== product.id))
              } else {
                onChange([...selectedIds, product.id])
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${
              selectedIds.includes(product.id) ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0">
              {product.imageUrl && (
                <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.sku}</p>
            </div>
            {selectedIds.includes(product.id) && (
              <Check className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Barcode Scanner Component
function BarcodeScanner({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Camera error:', error)
        setCameraError(true)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">Scan Barcode</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="aspect-video bg-gray-900 relative">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Camera className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">Camera not available</p>
              <p className="text-xs text-gray-400 mt-1">Enter barcode manually below</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-emerald-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 rounded-br" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Manual Entry */}
        <form onSubmit={handleManualSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter barcode manually
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter UPC or SKU"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// BLOCK BUILDER EMBED - iframe to existing page
// ============================================
function BlockBuilderEmbed() {
  return (
    <div className="h-full">
      <iframe
        src="/admin/block-builder"
        className="w-full h-full border-0"
        title="Catalog Block Builder"
      />
    </div>
  )
}

// ============================================
// PLACEHOLDER TABS
// ============================================
function CategoriesTab() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Grid3x3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Categories Management</h3>
        <p className="text-gray-500 mt-2">Category editor coming soon</p>
        <a
          href="/admin/categories"
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Open Legacy Editor
        </a>
      </div>
    </div>
  )
}

function BrandsTab() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Brands Management</h3>
        <p className="text-gray-500 mt-2">Brand editor coming soon</p>
        <a
          href="/admin/brands"
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Open Legacy Editor
        </a>
      </div>
    </div>
  )
}

function BundlesTab() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Bundles Management</h3>
        <p className="text-gray-500 mt-2">Bundle editor coming soon</p>
        <a
          href="/admin/bundles"
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Open Legacy Editor
        </a>
      </div>
    </div>
  )
}

function CustomersTab() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Customer Pricing</h3>
        <p className="text-gray-500 mt-2">Customer-specific pricing editor coming soon</p>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Analytics Dashboard</h3>
        <p className="text-gray-500 mt-2">Sales insights and reports coming soon</p>
      </div>
    </div>
  )
}
