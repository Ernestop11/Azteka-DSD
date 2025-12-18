'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Package,
  Search,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  Save,
  MapPin,
  Check,
  X,
  ScanBarcode,
  Camera,
  Upload,
  Calendar,
  Hash,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  minStock: number
  unitsPerCase: number
  warehouseLocation: string | null
  expirationDate: string | null
  lotNumber: string | null
  inStock: boolean
  brand: { id: string; name: string } | null
  category: { id: string; name: string } | null
}

// Preset location options
const AISLE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SHELF_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const BIN_OPTIONS = ['1', '2', '3', '4', '5', '6']

// Quick stock adjustment amounts
const STOCK_QUICK_ADD = [1, 5, 10, 24, 50]

// Expiration date presets (days from now)
const EXPIRATION_PRESETS = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
]

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [filterNoSku, setFilterNoSku] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMode, setScanMode] = useState<'lookup' | 'seed'>('lookup')
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)

  // Edit states
  const [editStock, setEditStock] = useState(0)
  const [editExtraPieces, setEditExtraPieces] = useState(0) // Extra loose pieces
  const [editUnitsPerCase, setEditUnitsPerCase] = useState(1)
  const [editAisle, setEditAisle] = useState('')
  const [editShelf, setEditShelf] = useState('')
  const [editBin, setEditBin] = useState('')
  const [editExpiration, setEditExpiration] = useState<Date | null>(null)
  const [editLotNumber, setEditLotNumber] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [editBrandId, setEditBrandId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stock' | 'location' | 'classify' | 'image' | 'details'>('stock')

  // Categories and Brands for reclassification
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')

  // Image upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load products, categories, and brands
  useEffect(() => {
    loadProducts()
    loadCategories()
    loadBrands()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (data.data) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.data) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands')
      const data = await res.json()
      if (data.data) {
        setBrands(data.data)
      }
    } catch (err) {
      console.error('Failed to load brands:', err)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.warehouseLocation && p.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLowStock = !filterLowStock || p.stock <= p.minStock
    const matchesNoSku = !filterNoSku || !p.sku || p.sku === '' || p.sku.startsWith('AUTO-') || p.sku.startsWith('PROD-')
    const matchesCategory = categoryFilter === 'all' || p.category?.id === categoryFilter
    const matchesBrand = brandFilter === 'all' || p.brand?.id === brandFilter

    return matchesSearch && matchesLowStock && matchesNoSku && matchesCategory && matchesBrand
  })

  // Parse warehouse location
  const parseLocation = (location: string | null) => {
    if (!location) return { aisle: '', shelf: '', bin: '' }
    const parts = location.split('-')
    return {
      aisle: parts[0] || '',
      shelf: parts[1] || '',
      bin: parts[2] || ''
    }
  }

  // Open product modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    // Parse as numbers to avoid NaN issues with string values from API
    const totalPieces = Number(product.stock) || 0
    const unitsPerCase = Number(product.unitsPerCase) || 1
    // Calculate full cases and extra pieces
    const fullCases = Math.floor(totalPieces / unitsPerCase)
    const extraPieces = totalPieces % unitsPerCase

    setEditStock(fullCases)
    setEditExtraPieces(extraPieces)
    setEditUnitsPerCase(unitsPerCase)
    setEditSku(product.sku || '')
    setEditLotNumber(product.lotNumber || '')
    setEditCategoryId(product.category?.id || null)
    setEditBrandId(product.brand?.id || null)

    const loc = parseLocation(product.warehouseLocation)
    setEditAisle(loc.aisle)
    setEditShelf(loc.shelf)
    setEditBin(loc.bin)

    setEditExpiration(product.expirationDate ? new Date(product.expirationDate) : null)

    setError('')
    setSuccess('')
    setActiveTab('stock')
  }

  // Handle barcode scan
  const handleScan = (barcode: string) => {
    setScannerOpen(false)

    if (scanMode === 'lookup') {
      // Find product by SKU
      const found = products.find(p => p.sku === barcode)
      if (found) {
        openProductModal(found)
        setSuccess(`Found: ${found.name}`)
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(`No product found with SKU: ${barcode}`)
        setTimeout(() => setError(''), 3000)
      }
    } else if (scanMode === 'seed' && selectedProduct) {
      // Seed SKU to selected product
      setEditSku(barcode)
      setSuccess(`Scanned: ${barcode}`)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  // Save all changes
  const saveChanges = async () => {
    if (!selectedProduct) return

    setSaving(true)
    setError('')

    try {
      const warehouseLocation = editAisle && editShelf
        ? `${editAisle}-${editShelf}${editBin ? `-${editBin}` : ''}`
        : null

      // Calculate total stock as full cases * units + extra pieces
      const totalStock = (editStock * editUnitsPerCase) + editExtraPieces

      const res = await fetch(`/api/employee/inventory/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: totalStock,
          unitsPerCase: editUnitsPerCase,
          warehouseLocation,
          expirationDate: editExpiration?.toISOString() || null,
          lotNumber: editLotNumber || null,
          sku: editSku || selectedProduct.sku,
          categoryId: editCategoryId,
          brandId: editBrandId,
          inStock: totalStock > 0
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      // Find updated category/brand info
      const newCategory = categories.find(c => c.id === editCategoryId) || null
      const newBrand = brands.find(b => b.id === editBrandId) || null

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              stock: totalStock,
              unitsPerCase: editUnitsPerCase,
              warehouseLocation,
              expirationDate: editExpiration?.toISOString() || null,
              lotNumber: editLotNumber || null,
              sku: editSku || p.sku,
              category: newCategory,
              brand: newBrand,
              inStock: totalStock > 0
            }
          : p
      ))

      setSuccess('Saved successfully!')
      setTimeout(() => {
        setSuccess('')
        setSelectedProduct(null)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProduct) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('id', selectedProduct.id)
      formData.append('removeBackground', 'true')

      const res = await fetch('/api/employee/products/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, imageUrl: data.imageUrl }
          : p
      ))
      setSelectedProduct(prev => prev ? { ...prev, imageUrl: data.imageUrl } : null)

      setSuccess('Image uploaded!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Set expiration from preset
  const setExpirationPreset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setEditExpiration(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length
  const noSkuCount = products.filter(p => !p.sku || p.sku.startsWith('AUTO-') || p.sku.startsWith('PROD-')).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600">Manage stock, locations & product details</p>
          </div>
          <button
            onClick={() => {
              setScanMode('lookup')
              setScannerOpen(true)
            }}
            className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <ScanBarcode className="w-5 h-5" />
            Scan to Find
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`p-4 rounded-xl transition-all ${
            filterLowStock
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white text-gray-900 shadow-sm'
          }`}
        >
          <div className="text-2xl font-bold">{lowStockCount}</div>
          <div className={`text-sm ${filterLowStock ? 'text-red-100' : 'text-gray-500'}`}>Low Stock</div>
        </button>
        <button
          onClick={() => setFilterNoSku(!filterNoSku)}
          className={`p-4 rounded-xl transition-all ${
            filterNoSku
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-900 shadow-sm'
          }`}
        >
          <div className="text-2xl font-bold">{noSkuCount}</div>
          <div className={`text-sm ${filterNoSku ? 'text-orange-100' : 'text-gray-500'}`}>Need SKU</div>
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, SKU, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Category & Brand Filters */}
      <div className="flex gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Brands</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredProducts.map((product) => {
          const totalPieces = Number(product.stock) || 0
          const unitsPerCase = Number(product.unitsPerCase) || 1
          const fullCases = Math.floor(totalPieces / unitsPerCase)
          const extraPieces = totalPieces % unitsPerCase
          const isLowStock = product.stock <= product.minStock
          const needsSku = !product.sku || product.sku.startsWith('AUTO-') || product.sku.startsWith('PROD-')

          // Format stock display
          const stockDisplay = extraPieces > 0
            ? `${fullCases} cases + ${extraPieces} pz`
            : `${fullCases} cases`

          return (
            <button
              key={product.id}
              onClick={() => openProductModal(product)}
              className={`bg-white rounded-xl shadow-sm p-3 text-left hover:shadow-md transition-all ${
                isLowStock ? 'ring-2 ring-red-300' : needsSku ? 'ring-2 ring-orange-300' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-7 h-7 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {stockDisplay}
                    </span>
                    {product.warehouseLocation && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {product.warehouseLocation}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {needsSku ? (
                      <span className="text-xs text-orange-600 font-medium">Needs SKU</span>
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
                    )}
                    {product.brand && (
                      <span className="text-xs text-gray-400">• {product.brand.name}</span>
                    )}
                  </div>
                </div>
                <Edit3 className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No products found</p>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                {selectedProduct.imageUrl ? (
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{selectedProduct.name}</h2>
                <p className="text-xs text-gray-500">{selectedProduct.brand?.name || 'No brand'}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {(['stock', 'location', 'classify', 'image', 'details'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'stock' && 'Stock'}
                  {tab === 'location' && 'Location'}
                  {tab === 'classify' && 'Classify'}
                  {tab === 'image' && 'Image'}
                  {tab === 'details' && 'Details'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Messages inside modal */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Stock Tab */}
              {activeTab === 'stock' && (
                <div className="space-y-4">
                  {/* Cases Counter */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Full Cases</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditStock(Math.max(0, editStock - 1))}
                        className="w-14 h-14 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editStock}</div>
                        <div className="text-sm text-gray-500">cases</div>
                      </div>
                      <button
                        onClick={() => setEditStock(editStock + 1)}
                        className="w-14 h-14 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    {/* Quick add buttons */}
                    <div className="flex justify-center gap-2 mt-3">
                      {STOCK_QUICK_ADD.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setEditStock(editStock + amount)}
                          className="px-3 py-2 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra Pieces Counter */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <label className="text-sm font-medium text-amber-800 mb-3 block">+ Extra Pieces (open case)</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditExtraPieces(Math.max(0, editExtraPieces - 1))}
                        className="w-12 h-12 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-amber-800">{editExtraPieces}</div>
                        <div className="text-sm text-amber-600">pieces</div>
                      </div>
                      <button
                        onClick={() => setEditExtraPieces(editExtraPieces + 1)}
                        className="w-12 h-12 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Quick add for pieces */}
                    <div className="flex justify-center gap-2 mt-3">
                      {[1, 5, 10].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setEditExtraPieces(editExtraPieces + amount)}
                          className="px-3 py-1.5 bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          +{amount}
                        </button>
                      ))}
                      <button
                        onClick={() => setEditExtraPieces(0)}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-500 text-gray-600 text-sm font-medium rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Units per Case */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Units per Case</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[6, 12, 20, 24, 26, 30, 33, 48, 50].map((units) => (
                        <button
                          key={units}
                          onClick={() => setEditUnitsPerCase(units)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            editUnitsPerCase === units
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {units}
                        </button>
                      ))}
                    </div>
                    {/* Custom units input */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Custom:</span>
                      <input
                        type="number"
                        value={editUnitsPerCase}
                        onChange={(e) => setEditUnitsPerCase(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-center font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min={1}
                      />
                      <span className="text-sm text-gray-500">units</span>
                    </div>
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-center">
                        <span className="text-sm text-emerald-700">Total Inventory: </span>
                        <span className="text-xl font-bold text-emerald-800">
                          {(editStock * editUnitsPerCase) + editExtraPieces}
                        </span>
                        <span className="text-sm text-emerald-700"> pieces</span>
                      </div>
                      <div className="text-center text-xs text-emerald-600 mt-1">
                        ({editStock} × {editUnitsPerCase}) + {editExtraPieces} extra
                      </div>
                    </div>
                  </div>

                  {/* Expiration Date */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Expiration Date
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXPIRATION_PRESETS.map((preset) => (
                        <button
                          key={preset.days}
                          onClick={() => setExpirationPreset(preset.days)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                            editExpiration && Math.abs(
                              (editExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24) - preset.days
                            ) < 5
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setEditExpiration(null)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                          !editExpiration
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        None
                      </button>
                    </div>
                    {/* Custom date picker */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Custom:</span>
                      <input
                        type="date"
                        value={editExpiration ? editExpiration.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditExpiration(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {editExpiration && (
                      <div className="mt-2 text-center text-sm text-gray-600">
                        Expires: {editExpiration.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-4">
                  {/* Aisle */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Aisle</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AISLE_OPTIONS.map((aisle) => (
                        <button
                          key={aisle}
                          onClick={() => setEditAisle(editAisle === aisle ? '' : aisle)}
                          className={`py-3 rounded-lg text-lg font-bold transition-colors ${
                            editAisle === aisle
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {aisle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shelf */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Shelf</label>
                    <div className="grid grid-cols-6 gap-2">
                      {SHELF_OPTIONS.map((shelf) => (
                        <button
                          key={shelf}
                          onClick={() => setEditShelf(editShelf === shelf ? '' : shelf)}
                          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                            editShelf === shelf
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {shelf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bin */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Bin (optional)</label>
                    <div className="grid grid-cols-6 gap-2">
                      {BIN_OPTIONS.map((bin) => (
                        <button
                          key={bin}
                          onClick={() => setEditBin(editBin === bin ? '' : bin)}
                          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                            editBin === bin
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {bin}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Preview */}
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-700">
                      {editAisle && editShelf
                        ? `${editAisle}-${editShelf}${editBin ? `-${editBin}` : ''}`
                        : 'No location set'
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Classify Tab */}
              {activeTab === 'classify' && (
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Category</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => setEditCategoryId(null)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                          !editCategoryId
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        No Category
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setEditCategoryId(cat.id)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors text-left truncate ${
                            editCategoryId === cat.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Selection */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Brand</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => setEditBrandId(null)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                          !editBrandId
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        No Brand
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => setEditBrandId(brand.id)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors text-left truncate ${
                            editBrandId === brand.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Classification */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-800 mb-2 block">Current Classification</label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Category:</span>
                        <span className="text-blue-900 font-medium">
                          {categories.find(c => c.id === editCategoryId)?.name || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Brand:</span>
                        <span className="text-blue-900 font-medium">
                          {brands.find(b => b.id === editBrandId)?.name || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Tab */}
              {activeTab === 'image' && (
                <div className="space-y-4">
                  {/* Current Image Preview */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Current Image</label>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                        {selectedProduct.imageUrl ? (
                          <Image
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            width={192}
                            height={192}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                            <span className="text-sm text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Upload New Image</label>

                    {/* Camera/Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-6 border-2 border-dashed border-emerald-400 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                          <span className="text-emerald-700 font-medium">Processing...</span>
                          <span className="text-xs text-emerald-600">Removing background...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Take Photo or Upload</span>
                          <span className="text-xs text-emerald-600">Background auto-removed</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Tips for best results</h4>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• Use a white or light background</li>
                          <li>• Good lighting helps with background removal</li>
                          <li>• Product should fill most of the frame</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* SKU */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      SKU / Barcode
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder="Scan or enter SKU..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => {
                          setScanMode('seed')
                          setScannerOpen(true)
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ScanBarcode className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lot Number */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Lot Number</label>
                    <input
                      type="text"
                      value={editLotNumber}
                      onChange={(e) => setEditLotNumber(e.target.value.toUpperCase())}
                      placeholder="Enter lot number..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Product Image</label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                          <span className="text-gray-500">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-500">Tap to upload image</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Background will be auto-removed
                    </p>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Product Info</label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span className="text-gray-900">{selectedProduct.category?.name || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand</span>
                        <span className="text-gray-900">{selectedProduct.brand?.name || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price</span>
                        <span className="text-gray-900 font-semibold">${Number(selectedProduct.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
          mode={scanMode}
        />
      )}
    </div>
  )
}

// Barcode Scanner Component
function BarcodeScanner({
  onScan,
  onClose,
  mode
}: {
  onScan: (barcode: string) => void
  onClose: () => void
  mode: 'lookup' | 'seed'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setScanning(true)
        }
      } catch (err) {
        setError('Could not access camera')
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!scanning || !videoRef.current) return

    let animationFrame: number

    if ('BarcodeDetector' in window) {
      // @ts-ignore
      const detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
      })

      const scan = async () => {
        if (!videoRef.current?.videoWidth) {
          animationFrame = requestAnimationFrame(scan)
          return
        }

        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue
            if (barcode) {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
              }
              onScan(barcode)
              return
            }
          }
        } catch (err) {}

        animationFrame = requestAnimationFrame(scan)
      }

      scan()
    } else {
      setError('Barcode scanning not supported')
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [scanning, onScan])

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <div className="bg-black/80 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">
            {mode === 'lookup' ? 'Scan to Find Product' : 'Scan to Set SKU'}
          </h2>
          <p className="text-white/60 text-sm">
            {mode === 'lookup' ? 'Point camera at barcode' : 'Scan product barcode'}
          </p>
        </div>
        <button
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop())
            }
            onClose()
          }}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-48 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 animate-[scanline_2s_ease-in-out_infinite]" />
          </div>
        </div>
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(11rem); }
        }
      `}</style>
    </div>
  )
}
