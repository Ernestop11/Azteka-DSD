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
  Calendar,
  Hash,
  Edit3,
} from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Product {
  id: string
  name: string
  sku: string
  caseSku: string | null
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
  allowPresell: boolean
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

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMode, setScanMode] = useState<'lookup' | 'seed' | 'sku' | 'caseSku'>('lookup')

  // Edit states
  const [editStock, setEditStock] = useState(0)
  const [editExtraPieces, setEditExtraPieces] = useState(0)
  const [editUnitsPerCase, setEditUnitsPerCase] = useState(1)
  const [editAisle, setEditAisle] = useState('')
  const [editShelf, setEditShelf] = useState('')
  const [editBin, setEditBin] = useState('')
  const [editExpiration, setEditExpiration] = useState<Date | null>(null)
  const [editLotNumber, setEditLotNumber] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editCaseSku, setEditCaseSku] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [editBrandId, setEditBrandId] = useState<string | null>(null)
  const [editAllowPresell, setEditAllowPresell] = useState(false)
  const [editName, setEditName] = useState('')
  const [activeTab, setActiveTab] = useState<'stock' | 'location' | 'details'>('stock')

  // Categories and Brands
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])

  // Image upload
  const [uploading, setUploading] = useState(false)
  const [imageKey, setImageKey] = useState(Date.now()) // Cache buster for image preview
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New product modal state
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductSku, setNewProductSku] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductCategoryId, setNewProductCategoryId] = useState('')
  const [newProductBrandId, setNewProductBrandId] = useState('')
  const [creatingProduct, setCreatingProduct] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setError('Please log in to access inventory management')
        }
      } catch (err) {
        setError('Failed to verify authentication')
      } finally {
        setAuthChecking(false)
      }
    }
    checkAuth()
  }, [])

  // Load data after authentication
  useEffect(() => {
    if (isAuthenticated && !authChecking) {
      loadProducts()
      loadCategories()
      loadBrands()
    }
  }, [isAuthenticated, authChecking])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await res.json()
      setCategories(data.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands', { credentials: 'include' })
      const data = await res.json()
      setBrands(data.data || [])
    } catch (err) {
      console.error('Failed to load brands:', err)
    }
  }

  // Create new product
  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      setError('Product name is required')
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

      setSuccess('Product created successfully!')
      setShowNewProductModal(false)
      setNewProductName('')
      setNewProductSku('')
      setNewProductPrice('')
      setNewProductCategoryId('')
      setNewProductBrandId('')
      loadProducts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setCreatingProduct(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLowStock = !filterLowStock || p.stock <= p.minStock
    const matchesNoSku = !filterNoSku || !p.sku || p.sku.startsWith('AUTO-') || p.sku.startsWith('PROD-')

    return matchesSearch && matchesLowStock && matchesNoSku
  })

  // Parse warehouse location
  const parseLocation = (location: string | null) => {
    if (!location) return { aisle: '', shelf: '', bin: '' }
    const parts = location.split('-')
    return { aisle: parts[0] || '', shelf: parts[1] || '', bin: parts[2] || '' }
  }

  // Open product modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    const totalPieces = Number(product.stock) || 0
    const unitsPerCase = Number(product.unitsPerCase) || 1
    const fullCases = Math.floor(totalPieces / unitsPerCase)
    const extraPieces = totalPieces % unitsPerCase

    setEditStock(fullCases)
    setEditExtraPieces(extraPieces)
    setEditUnitsPerCase(unitsPerCase)
    setEditSku(product.sku || '')
    setEditCaseSku(product.caseSku || '')
    setEditLotNumber(product.lotNumber || '')
    setEditCategoryId(product.category?.id || null)
    setEditBrandId(product.brand?.id || null)
    setEditAllowPresell(product.allowPresell || false)
    setEditName(product.name || '')

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
      const found = products.find(p => p.sku === barcode || p.caseSku === barcode)
      if (found) {
        openProductModal(found)
        setSuccess(`Found: ${found.name}`)
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(`No product found with SKU: ${barcode}`)
        setTimeout(() => setError(''), 3000)
      }
    } else if (scanMode === 'seed' && selectedProduct) {
      setEditSku(barcode)
      setSuccess(`Scanned SKU: ${barcode}`)
      setTimeout(() => setSuccess(''), 2000)
    } else if (scanMode === 'caseSku' && selectedProduct) {
      setEditCaseSku(barcode)
      setSuccess(`Scanned Case SKU: ${barcode}`)
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

      const totalStock = (editStock * editUnitsPerCase) + editExtraPieces

      const res = await fetch(`/api/employee/inventory/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName || selectedProduct.name,
          stock: totalStock,
          unitsPerCase: editUnitsPerCase,
          warehouseLocation,
          expirationDate: editExpiration?.toISOString() || null,
          lotNumber: editLotNumber || null,
          sku: editSku || selectedProduct.sku,
          caseSku: editCaseSku || null,
          categoryId: editCategoryId,
          brandId: editBrandId,
          inStock: totalStock > 0,
          allowPresell: editAllowPresell
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      const newCategory = categories.find(c => c.id === editCategoryId) || null
      const newBrand = brands.find(b => b.id === editBrandId) || null

      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: editName || p.name,
              stock: totalStock,
              unitsPerCase: editUnitsPerCase,
              warehouseLocation,
              expirationDate: editExpiration?.toISOString() || null,
              lotNumber: editLotNumber || null,
              sku: editSku || p.sku,
              caseSku: editCaseSku || null,
              category: newCategory,
              brand: newBrand,
              inStock: totalStock > 0,
              allowPresell: editAllowPresell
            }
          : p
      ))

      setSelectedProduct(null)
      setSuccess('Saved successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload - Direct to VPS
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProduct) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('id', selectedProduct.id)

      const res = await fetch('/api/employee/products/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await res.json()
      const newImageUrl = data.imageUrl

      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, imageUrl: newImageUrl } : p
      ))
      setSelectedProduct(prev => prev ? { ...prev, imageUrl: newImageUrl } : null)
      setImageKey(Date.now()) // Force image refresh

      setSuccess(`Image uploaded to ${data.uploadedTo || 'server'}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Set expiration from preset
  const setExpirationPreset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setEditExpiration(date)
  }

  // Loading state
  if (authChecking || (loading && isAuthenticated)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500">
          {authChecking ? 'Verifying session...' : 'Loading inventory...'}
        </p>
      </div>
    )
  }

  // Auth error state
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-700 font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">{error || 'Please log in'}</p>
        <a href="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
          Go to Login
        </a>
      </div>
    )
  }

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length
  const noSkuCount = products.filter(p => !p.sku || p.sku.startsWith('AUTO-') || p.sku.startsWith('PROD-')).length

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
              <p className="text-sm text-gray-600">Manage stock, SKUs & products</p>
            </div>
            <button
              onClick={() => setShowNewProductModal(true)}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              title="Add New Product"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={() => { setScanMode('lookup'); setScannerOpen(true) }}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3"
        >
          <ScanBarcode className="w-6 h-6" />
          Scan to Find Product
        </button>

        {/* Search - Highlighted */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
          <input
            type="text"
            placeholder="Search by name, SKU, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-emerald-500 rounded-xl text-gray-900 text-lg shadow-md shadow-emerald-100 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 transition-all"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`py-4 px-4 rounded-xl flex flex-col items-center ${
              filterLowStock ? 'bg-red-500 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <span className="text-2xl font-bold">{lowStockCount}</span>
            <span className="text-xs">Low Stock</span>
          </button>
          <button
            onClick={() => setFilterNoSku(!filterNoSku)}
            className={`py-4 px-4 rounded-xl flex flex-col items-center ${
              filterNoSku ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <span className="text-2xl font-bold">{noSkuCount}</span>
            <span className="text-xs">Need SKU</span>
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const totalPieces = Number(product.stock) || 0
            const unitsPerCase = Number(product.unitsPerCase) || 1
            const fullCases = Math.floor(totalPieces / unitsPerCase)
            const extraPieces = totalPieces % unitsPerCase
            const isLowStock = product.stock <= product.minStock
            const needsSku = !product.sku || product.sku.startsWith('AUTO-') || product.sku.startsWith('PROD-')

            const stockDisplay = extraPieces > 0
              ? `${fullCases} cases + ${extraPieces} pz`
              : `${fullCases} cases`

            return (
              <button
                key={product.id}
                onClick={() => openProductModal(product)}
                className={`bg-white rounded-xl border-2 p-4 text-left hover:shadow-lg transition-all ${
                  isLowStock ? 'border-red-300' : needsSku ? 'border-orange-300' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                    {product.imageUrl ? (
                      <img
                        src={`${getPublicImageUrl(product.imageUrl)}?t=${Date.now()}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                    {/* SKU Display */}
                    <p className="text-xs text-gray-500 font-mono truncate mt-0.5">
                      {needsSku ? (
                        <span className="text-orange-500">No SKU</span>
                      ) : (
                        product.sku
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {stockDisplay}
                      </span>
                    </div>
                  </div>
                  <Edit3 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No products found</p>
          </div>
        )}
      </div>

      {/* Edit Modal - iOS Safari scroll fix */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center"
          style={{ zIndex: 50 }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed at top */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3 rounded-t-2xl sm:rounded-t-xl">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
                {selectedProduct.imageUrl ? (
                  <img
                    key={imageKey}
                    src={`${getPublicImageUrl(selectedProduct.imageUrl)}?t=${imageKey}`}
                    alt={selectedProduct.name}
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
                  accept="image/*,image/heic,image/heif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100"
                >
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{selectedProduct.name}</h2>
                <p className="text-xs text-gray-500">{selectedProduct.brand?.name || 'No brand'}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tab Navigation - Fixed */}
            <div className="flex-shrink-0 flex border-b border-gray-200 bg-white">
              {(['stock', 'location', 'details'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Messages */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Stock Tab */}
              {activeTab === 'stock' && (
                <>
                  {/* Cases Counter */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <label className="text-sm font-medium text-emerald-700 mb-3 block">Full Cases</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditStock(Math.max(0, editStock - 1))}
                        className="w-14 h-14 bg-red-100 text-red-700 rounded-xl flex items-center justify-center"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editStock}</div>
                        <div className="text-xs text-gray-500">cases</div>
                      </div>
                      <button
                        onClick={() => setEditStock(editStock + 1)}
                        className="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-2 mt-3">
                      {STOCK_QUICK_ADD.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setEditStock(editStock + amount)}
                          className="px-3 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra Pieces */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <label className="text-sm font-medium text-amber-700 mb-3 block">Extra Pieces (open case)</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditExtraPieces(Math.max(0, editExtraPieces - 1))}
                        className="w-14 h-14 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editExtraPieces}</div>
                        <div className="text-xs text-gray-500">pieces</div>
                      </div>
                      <button
                        onClick={() => setEditExtraPieces(editExtraPieces + 1)}
                        className="w-14 h-14 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Units per Case */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-sm font-medium text-purple-700 mb-3 block">Units per Case</label>

                    {/* +/- Controls */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => setEditUnitsPerCase(Math.max(1, editUnitsPerCase - 1))}
                        className="w-12 h-12 bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          min="1"
                          value={editUnitsPerCase}
                          onChange={(e) => setEditUnitsPerCase(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center text-2xl font-bold text-gray-900 bg-white border border-purple-300 rounded-lg py-2"
                        />
                        <div className="text-xs text-purple-600 mt-1">units/case</div>
                      </div>
                      <button
                        onClick={() => setEditUnitsPerCase(editUnitsPerCase + 1)}
                        className="w-12 h-12 bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {[6, 12, 20, 24, 30, 48].map((units) => (
                        <button
                          key={units}
                          onClick={() => setEditUnitsPerCase(units)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold ${
                            editUnitsPerCase === units
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {units}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-center">
                      <span className="text-sm text-emerald-700">Total: </span>
                      <span className="text-2xl font-bold text-emerald-800">
                        {(editStock * editUnitsPerCase) + editExtraPieces}
                      </span>
                      <span className="text-sm text-emerald-700"> pieces</span>
                    </div>
                  </div>

                  {/* Quick SKU Scan */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-800 mb-2 block">Quick SKU Scan</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder={selectedProduct.sku || 'No SKU set'}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => { setScanMode('seed'); setScannerOpen(true) }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <ScanBarcode className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Aisle</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AISLE_OPTIONS.map((aisle) => (
                        <button
                          key={aisle}
                          onClick={() => setEditAisle(editAisle === aisle ? '' : aisle)}
                          className={`py-3 rounded-lg text-lg font-bold ${
                            editAisle === aisle ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200'
                          }`}
                        >
                          {aisle}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Shelf</label>
                    <div className="grid grid-cols-6 gap-2">
                      {SHELF_OPTIONS.map((shelf) => (
                        <button
                          key={shelf}
                          onClick={() => setEditShelf(editShelf === shelf ? '' : shelf)}
                          className={`py-2 rounded-lg text-sm font-bold ${
                            editShelf === shelf ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200'
                          }`}
                        >
                          {shelf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Bin (optional)</label>
                    <div className="grid grid-cols-6 gap-2">
                      {BIN_OPTIONS.map((bin) => (
                        <button
                          key={bin}
                          onClick={() => setEditBin(editBin === bin ? '' : bin)}
                          className={`py-2 rounded-lg text-sm font-bold ${
                            editBin === bin ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200'
                          }`}
                        >
                          {bin}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-700">
                      {editAisle && editShelf
                        ? `${editAisle}-${editShelf}${editBin ? `-${editBin}` : ''}`
                        : 'No location set'}
                    </div>
                  </div>
                </>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <>
                  {/* Product Name */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <label className="text-sm font-medium text-emerald-700 mb-3 block">Product Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter product name..."
                      className="w-full px-4 py-3 border border-emerald-300 rounded-lg text-gray-900 font-medium bg-white"
                    />
                  </div>

                  {/* SKU */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">SKU / Barcode</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder="Scan or enter SKU..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
                      />
                      <button
                        onClick={() => { setScanMode('seed'); setScannerOpen(true) }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg"
                      >
                        <ScanBarcode className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Case SKU */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-sm font-medium text-purple-800 mb-3 block">Case SKU / Barcode</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editCaseSku}
                        onChange={(e) => setEditCaseSku(e.target.value)}
                        placeholder="Scan or enter case barcode..."
                        className="flex-1 px-4 py-3 border border-purple-300 rounded-lg font-mono bg-white"
                      />
                      <button
                        onClick={() => { setScanMode('caseSku'); setScannerOpen(true) }}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
                    />
                  </div>

                  {/* Expiration Date */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <label className="text-sm font-medium text-orange-700 mb-3 block">Expiration Date</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {EXPIRATION_PRESETS.slice(0, 3).map((preset) => (
                        <button
                          key={preset.days}
                          onClick={() => setExpirationPreset(preset.days)}
                          className="py-2 px-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="date"
                      value={editExpiration ? editExpiration.toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditExpiration(e.target.value ? new Date(e.target.value) : null)}
                      className="w-full px-4 py-3 border border-orange-300 rounded-lg"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-700 mb-3 block">Category</label>
                    <select
                      value={editCategoryId || ''}
                      onChange={(e) => setEditCategoryId(e.target.value || null)}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg text-gray-900 bg-white font-medium"
                    >
                      <option value="">No Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Dropdown */}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <label className="text-sm font-medium text-indigo-700 mb-3 block">Brand</label>
                    <select
                      value={editBrandId || ''}
                      onChange={(e) => setEditBrandId(e.target.value || null)}
                      className="w-full px-4 py-3 border border-indigo-300 rounded-lg text-gray-900 bg-white font-medium"
                    >
                      <option value="">No Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Product Info</label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price</span>
                        <span className="text-gray-900 font-semibold">${Number(selectedProduct.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-safe">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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

      {/* New Product Modal */}
      {showNewProductModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center"
          style={{ zIndex: 60 }}
          onClick={() => setShowNewProductModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] flex flex-col"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
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

            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-safe flex gap-3">
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
                {creatingProduct ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Barcode Scanner Component - Optimized for iOS Safari + Android
function BarcodeScanner({
  onScan,
  onClose,
  mode
}: {
  onScan: (barcode: string) => void
  onClose: () => void
  mode: 'lookup' | 'seed' | 'sku' | 'caseSku'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const codeReaderRef = useRef<any>(null)
  const scanningRef = useRef(false)

  // Detect iOS
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      try {
        // Dynamically import ZXing - BrowserMultiFormatReader from browser, hints from library
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const ZXingLibrary = await import('@zxing/library')

        if (!mounted) return

        // Configure hints for better barcode detection
        // Use library exports for DecodeHintType and BarcodeFormat
        const hints = new Map()
        if (ZXingLibrary.DecodeHintType && ZXingLibrary.BarcodeFormat) {
          hints.set(ZXingLibrary.DecodeHintType.POSSIBLE_FORMATS, [
            ZXingLibrary.BarcodeFormat.EAN_13,
            ZXingLibrary.BarcodeFormat.EAN_8,
            ZXingLibrary.BarcodeFormat.UPC_A,
            ZXingLibrary.BarcodeFormat.UPC_E,
            ZXingLibrary.BarcodeFormat.CODE_128,
            ZXingLibrary.BarcodeFormat.CODE_39,
            ZXingLibrary.BarcodeFormat.ITF,
            ZXingLibrary.BarcodeFormat.QR_CODE
          ])
          hints.set(ZXingLibrary.DecodeHintType.TRY_HARDER, true)
        }

        // Create reader - pass hints only if we have them
        const codeReader = hints.size > 0
          ? new BrowserMultiFormatReader(hints)
          : new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader

        // iOS-optimized camera constraints
        // Key: Use facingMode instead of deviceId for iOS
        // Higher resolution + continuous autofocus
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        }

        // Get camera stream directly for more control
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (constraintErr) {
          // Fallback to simpler constraints for older iOS
          console.log('Falling back to simple constraints')
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          })
        }
        streamRef.current = stream

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        // Check torch support
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          try {
            const capabilities = videoTrack.getCapabilities?.() as any
            if (capabilities?.torch) {
              setTorchSupported(true)
            }
          } catch (e) {
            // getCapabilities not supported
          }

          // Apply advanced constraints for iOS (non-blocking)
          try {
            await videoTrack.applyConstraints({
              // @ts-ignore
              focusMode: 'continuous'
            })
          } catch (e) {
            // Ignore - not all devices support these
          }
        }

        // Attach stream to video
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setScanning(true)
        scanningRef.current = true

        // Start decoding loop with requestAnimationFrame for smoother scanning
        const decodeLoop = async () => {
          if (!mounted || !scanningRef.current || !videoRef.current) return

          try {
            const result = await codeReader.decodeOnceFromVideoElement(videoRef.current)
            if (result && mounted && scanningRef.current) {
              const barcode = result.getText()
              if (barcode) {
                // Vibrate on success (if supported)
                try {
                  if (navigator.vibrate) {
                    navigator.vibrate(100)
                  }
                } catch (e) {}
                scanningRef.current = false
                onScan(barcode)
                return
              }
            }
          } catch (e) {
            // No barcode found in this frame - continue
          }

          // Continue scanning
          if (mounted && scanningRef.current) {
            requestAnimationFrame(decodeLoop)
          }
        }

        // Small delay before starting decode loop (let camera stabilize)
        setTimeout(decodeLoop, 500)

      } catch (err: any) {
        console.error('Scanner error:', err)
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in Settings.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another app.')
        } else {
          setError('Could not start camera: ' + (err.message || 'Please try again'))
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      scanningRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
        } catch (e) {}
      }
    }
  }, [onScan])

  const toggleTorch = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ torch: !torchOn } as any)
      setTorchOn(!torchOn)
    } catch (e) {}
  }

  const handleTapToFocus = async (e: React.TouchEvent | React.MouseEvent) => {
    if (!streamRef.current || !videoRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return
    const rect = videoRef.current.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
    const pointX = x / rect.width
    const pointY = y / rect.height
    try {
      await track.applyConstraints({
        focusMode: 'manual',
        pointsOfInterest: [{ x: pointX, y: pointY }]
      } as any)
      setTimeout(async () => {
        try { await track.applyConstraints({ focusMode: 'continuous' } as any) } catch (e) {}
      }, 2000)
    } catch (e) {}
  }

  const handleClose = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (codeReaderRef.current) {
      try { codeReaderRef.current.reset() } catch (e) {}
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 100 }}>
      <div className="bg-black/80 p-4 flex items-center justify-between" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div>
          <h2 className="text-white font-semibold">
            {mode === 'lookup' && 'Scan to Find Product'}
            {mode === 'seed' && 'Scan to Set Unit SKU'}
            {mode === 'caseSku' && 'Scan to Set Case SKU'}
          </h2>
          <p className="text-white/60 text-sm">
            {isIOS ? 'Tap screen to focus' : 'Point camera at barcode'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-lg ${torchOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}
          <button onClick={handleClose} className="p-2 bg-white/10 rounded-lg">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative" onClick={handleTapToFocus} onTouchStart={handleTapToFocus}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'translateZ(0)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-52 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-400" />
            {scanning && (
              <div
                className="absolute inset-x-0 top-0 h-1 bg-emerald-400"
                style={{ animation: 'scanline 2s ease-in-out infinite' }}
              />
            )}
          </div>
        </div>
        {isIOS && scanning && (
          <div className="absolute bottom-24 left-0 right-0 text-center">
            <p className="text-white/80 text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
              Hold steady & tap to focus
            </p>
          </div>
        )}
        {!scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
              <p className="text-lg">Starting camera...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center font-medium">{error}</p>
            <button onClick={handleClose} className="mt-3 w-full py-2 bg-white text-red-600 rounded-lg font-semibold">
              Close
            </button>
          </div>
        )}
      </div>

      <div className="bg-black/80 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <p className="text-white/40 text-xs text-center">Position barcode within the frame</p>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12rem); }
        }
      `}</style>
    </div>
  )
}
