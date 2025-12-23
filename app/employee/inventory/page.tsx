'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

  // Auth state - wait for session before loading data
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMode, setScanMode] = useState<'lookup' | 'seed' | 'sku' | 'caseSku'>('lookup')
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
  const [editCaseSku, setEditCaseSku] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [editBrandId, setEditBrandId] = useState<string | null>(null)
  const [editAllowPresell, setEditAllowPresell] = useState(false)
  const [activeTab, setActiveTab] = useState<'stock' | 'location' | 'classify' | 'image' | 'details'>('stock')

  // Categories and Brands for reclassification
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')

  // Image upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New item creation
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')

  // SKU follow-up modal after product creation
  const [showSkuFollowUp, setShowSkuFollowUp] = useState(false)
  const [newlyCreatedProduct, setNewlyCreatedProduct] = useState<Product | null>(null)

  // New category/brand creation
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [showNewBrandInput, setShowNewBrandInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [creatingBrand, setCreatingBrand] = useState(false)

  // iPhone Camera Persistence Hack - Keep camera open during session
  const persistentStreamRef = useRef<MediaStream | null>(null)
  const [cameraPersistent, setCameraPersistent] = useState(false)
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  // Initialize persistent camera on mount (iPhone only) - prevents re-auth on each scan
  useEffect(() => {
    if (!isIOS) return

    async function initPersistentCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        })
        persistentStreamRef.current = stream
        setCameraPersistent(true)
        console.log('[iPhone] Persistent camera initialized - will reuse stream to avoid re-auth')
      } catch (err) {
        console.warn('[iPhone] Could not initialize persistent camera:', err)
      }
    }

    initPersistentCamera()

    return () => {
      // Don't stop on unmount - keep it alive during session
      // Only stop when user explicitly closes or navigates away
    }
  }, [isIOS])

  // First, check authentication before loading any data
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[Inventory] Checking authentication...')
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          console.log('[Inventory] Auth successful:', data.email)
          setIsAuthenticated(true)
        } else {
          console.log('[Inventory] Auth failed:', res.status)
          setError('Please log in to access inventory management')
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('[Inventory] Auth check error:', err)
        setError('Failed to verify authentication')
        setIsAuthenticated(false)
      } finally {
        setAuthChecking(false)
      }
    }

    checkAuth()
  }, [])

  // Only load data after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !authChecking) {
      console.log('[Inventory] Auth confirmed, loading data...')
      loadProducts()
      loadCategories()
      loadBrands()
    }
  }, [isAuthenticated, authChecking])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('[Inventory] Loading products...')
      
      const res = await fetch('/api/admin/products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      console.log('[Inventory] Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log('[Inventory] Products loaded:', data.data?.length || 0)
      
      if (data.data && Array.isArray(data.data)) {
        setProducts(data.data)
        setSuccess(`Loaded ${data.data.length} products`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        console.warn('[Inventory] Unexpected data format:', data)
        setProducts([])
      }
    } catch (err: any) {
      console.error('[Inventory] Failed to load products:', err)
      setError(err.message || 'Failed to load products. Please refresh the page.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
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
      const res = await fetch('/api/admin/brands', { credentials: 'include' })
      const data = await res.json()
      if (data.data) {
        setBrands(data.data)
      }
    } catch (err) {
      console.error('Failed to load brands:', err)
    }
  }

  // Create new category
  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return

    setCreatingCategory(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newCategoryName.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create category')
      }

      const data = await res.json()
      const newCat = data.data || data
      setCategories(prev => [...prev, { id: newCat.id, name: newCat.name }])
      setEditCategoryId(newCat.id)
      setNewCategoryName('')
      setShowNewCategoryInput(false)
      setSuccess('Category created!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create category')
    } finally {
      setCreatingCategory(false)
    }
  }

  // Create new brand
  const createNewBrand = async () => {
    if (!newBrandName.trim()) return

    setCreatingBrand(true)
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newBrandName.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create brand')
      }

      const data = await res.json()
      const newBr = data.data || data
      setBrands(prev => [...prev, { id: newBr.id, name: newBr.name }])
      setEditBrandId(newBr.id)
      setNewBrandName('')
      setShowNewBrandInput(false)
      setSuccess('Brand created!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create brand')
    } finally {
      setCreatingBrand(false)
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
    setEditCaseSku(product.caseSku || '')
    setEditLotNumber(product.lotNumber || '')
    setEditCategoryId(product.category?.id || null)
    setEditBrandId(product.brand?.id || null)
    setEditAllowPresell(product.allowPresell || false)

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
      // Find product by SKU or Case SKU
      const found = products.find(p => p.sku === barcode || p.caseSku === barcode)
      if (found) {
        openProductModal(found)
        setSuccess(`Found: ${found.name}`)
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(`No product found with SKU: ${barcode}`)
        setTimeout(() => setError(''), 3000)
      }
    } else if (scanMode === 'sku' && newlyCreatedProduct) {
      // Save SKU to newly created product (from follow-up modal)
      saveSkuToNewProduct(barcode, false)
    } else if (scanMode === 'caseSku' && newlyCreatedProduct) {
      // Save Case SKU to newly created product (from follow-up modal)
      saveSkuToNewProduct(barcode, true)
    } else if (scanMode === 'seed' && selectedProduct) {
      // Seed SKU to selected product (edit modal)
      setEditSku(barcode)
      setSuccess(`Scanned SKU: ${barcode}`)
      setTimeout(() => setSuccess(''), 2000)
    } else if (scanMode === 'caseSku' && selectedProduct) {
      // Seed Case SKU to selected product (edit modal)
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

      // Calculate total stock as full cases * units + extra pieces
      const totalStock = (editStock * editUnitsPerCase) + editExtraPieces

      const res = await fetch(`/api/employee/inventory/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
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
              caseSku: editCaseSku || null,
              category: newCategory,
              brand: newBrand,
              inStock: totalStock > 0,
              allowPresell: editAllowPresell
            }
          : p
      ))

      // Close modal immediately after save for faster workflow
      setSelectedProduct(null)
      setSuccess('Saved successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProduct) {
      console.error('[Upload] Missing file or product:', { file: !!file, product: !!selectedProduct })
      return
    }

    console.log('[Upload] Starting upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      productId: selectedProduct.id,
      productName: selectedProduct.name
    })

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('id', selectedProduct.id)
      // FIXED: Don't force background removal - let user choose
      // Background removal should be optional, not automatic
      // formData.append('removeBackground', 'true') // REMOVED

      console.log('[Upload] Sending request to /api/employee/products/upload-image')

      const res = await fetch('/api/employee/products/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      console.log('[Upload] Response status:', res.status, res.statusText)

      if (!res.ok) {
        const errorData = await res.json()
        console.error('[Upload] Error response:', errorData)
        throw new Error(errorData.error || errorData.details || `Upload failed: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      console.log('[Upload] Success response:', data)

      if (!data.imageUrl) {
        console.error('[Upload] No imageUrl in response:', data)
        throw new Error('Upload succeeded but no image URL returned')
      }

      const newImageUrl = data.imageUrl
      console.log('[Upload] Updating state with imageUrl:', newImageUrl)

      // Add cache-busting query parameter to force image reload
      const imageUrlWithCache = `${newImageUrl}?t=${Date.now()}`

      // Update local state - use functional update to ensure we have latest state
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, imageUrl: newImageUrl }
          : p
      ))
      
      // Update selected product state with new image URL - force re-render
      setSelectedProduct(prev => {
        if (!prev) return null
        console.log('[Upload] Updating selectedProduct imageUrl:', prev.imageUrl, '→', newImageUrl)
        // Create new object to force React re-render
        return { ...prev, imageUrl: newImageUrl, _imageUpdate: Date.now() }
      })

      // Force a small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100))

      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
      console.log('[Upload] Upload complete, state updated')
    } catch (err: any) {
      console.error('[Upload] Upload failed:', err)
      const errorMessage = err.message || 'Upload failed. Please try again.'
      setError(errorMessage)
      // Keep error visible longer
      setTimeout(() => setError(''), 5000)
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

  // Create new product
  const createNewProduct = async () => {
    if (!newItemName.trim()) {
      setError('Product name is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Generate a temporary SKU
      const tempSku = `NEW-${Date.now()}`

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newItemName.trim(),
          sku: tempSku,
          price: parseFloat(newItemPrice) || 0,
          description: newItemDescription.trim() || null,
          stock: editStock,
          unitsPerCase: editUnitsPerCase,
          categoryId: editCategoryId,
          brandId: editBrandId,
          warehouseLocation: [editAisle, editShelf, editBin].filter(Boolean).join('-') || null,
          expirationDate: editExpiration?.toISOString() || null,
          lotNumber: editLotNumber || null,
          inStock: editStock > 0
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create product')
      }

      const responseData = await res.json()
      console.log('[createNewProduct] API response:', responseData)

      const createdProduct = responseData.data
      if (!createdProduct) {
        throw new Error('Product created but no data returned')
      }

      // Add new product to list
      setProducts(prev => [createdProduct, ...prev])

      // Store the newly created product for SKU follow-up
      setNewlyCreatedProduct(createdProduct)

      // Reset creation form and close it
      setIsCreatingNew(false)
      setNewItemName('')
      setNewItemPrice('')
      setNewItemDescription('')

      console.log('[createNewProduct] Showing SKU follow-up modal for:', createdProduct.name)
      // Show SKU follow-up modal
      setShowSkuFollowUp(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  // Save SKU to newly created product
  const saveSkuToNewProduct = async (sku: string, isCaseSku: boolean = false) => {
    if (!newlyCreatedProduct) return

    try {
      const updateData = isCaseSku ? { caseSku: sku } : { sku }
      const res = await fetch(`/api/employee/inventory/${newlyCreatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save SKU')
      }

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === newlyCreatedProduct.id
          ? { ...p, ...(isCaseSku ? { caseSku: sku } : { sku }) }
          : p
      ))

      // Update the newly created product state too
      setNewlyCreatedProduct(prev => prev ? { ...prev, ...(isCaseSku ? { caseSku: sku } : { sku }) } : null)

      setSuccess(`${isCaseSku ? 'Case SKU' : 'Product SKU'} saved: ${sku}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save SKU')
    }
  }

  // Open new item modal with reset state
  const openNewItemModal = () => {
    setIsCreatingNew(true)
    setSelectedProduct(null)
    setNewItemName('')
    setNewItemPrice('')
    setNewItemDescription('')
    setEditStock(0)
    setEditExtraPieces(0)
    setEditUnitsPerCase(1)
    setEditAisle('')
    setEditShelf('')
    setEditBin('')
    setEditExpiration(null)
    setEditLotNumber('')
    setEditSku('')
    setEditCaseSku('')
    setEditCategoryId(null)
    setEditBrandId(null)
    setActiveTab('stock')
    // Reset new category/brand inputs
    setShowNewCategoryInput(false)
    setShowNewBrandInput(false)
    setNewCategoryName('')
    setNewBrandName('')
    setError('')
  }

  // Show loading while checking auth or loading data
  if (authChecking || (loading && isAuthenticated)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        <p className="text-sm text-gray-500">
          {authChecking ? 'Verifying session...' : 'Loading inventory...'}
        </p>
      </div>
    )
  }

  // Show error if not authenticated
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-700 font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">{error || 'Please log in to access inventory management'}</p>
        <a
          href="/login"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    )
  }

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length
  const noSkuCount = products.filter(p => !p.sku || p.sku.startsWith('AUTO-') || p.sku.startsWith('PROD-')).length

  return (
    <div className="bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Row - Title + Add Button */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600">Manage stock & products</p>
          </div>
          <button
            onClick={openNewItemModal}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg z-10 relative"
            title="Add New Product"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Full Width Scan Button */}
          <button
            onClick={() => {
              setScanMode('lookup')
              setScannerOpen(true)
            }}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md z-10 relative"
          >
            <ScanBarcode className="w-6 h-6" />
            Scan to Find Product
          </button>

          {/* Full Width Search - Very Prominent */}
          <div className="relative z-10">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow z-20">
              <Search className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-4 py-5 bg-white border-2 border-emerald-400 rounded-xl text-gray-900 text-lg font-semibold placeholder:text-emerald-600/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm z-10 relative"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Low Stock Button */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`py-4 px-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1 shadow-sm border-2 z-10 relative ${
              filterLowStock
                ? 'bg-red-500 text-white border-red-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
            }`}
          >
            <span className="text-2xl font-bold">{lowStockCount}</span>
            <span className="text-xs font-medium">Low Stock</span>
          </button>
          {/* Need SKU Button */}
          <button
            onClick={() => setFilterNoSku(!filterNoSku)}
            className={`py-4 px-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1 shadow-sm border-2 z-10 relative ${
              filterNoSku
                ? 'bg-orange-500 text-white border-orange-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
            }`}
          >
            <span className="text-2xl font-bold">{noSkuCount}</span>
            <span className="text-xs font-medium">Need SKU</span>
          </button>
        </div>

        {/* Filters Row - Separate row for dropdowns */}
        <div className="grid grid-cols-2 gap-3">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`w-full px-3 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer ${
              categoryFilter !== 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className={`w-4 h-4 ${categoryFilter !== 'all' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Brand Filter */}
        <div className="relative">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className={`w-full px-3 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer ${
              brandFilter !== 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className={`w-4 h-4 ${brandFilter !== 'all' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

        {/* Messages */}
        {success && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 shadow-sm z-10 relative">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 shadow-sm z-10 relative">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Products Grid */}
        <div
          className="
            inventory-grid
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-4
            auto-rows-max
            items-start
          "
        >
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
              className={`block rounded-xl border bg-white shadow-sm border-2 p-4 text-left hover:shadow-lg transition-all z-10 relative ${
                isLowStock 
                  ? 'border-red-300 bg-red-50/30' 
                  : needsSku 
                    ? 'border-orange-300 bg-orange-50/30' 
                    : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden relative bg-gray-100 border-2 border-gray-200">
                  {product.imageUrl ? (
                    <Image
                      src={`${getPublicImageUrl(product.imageUrl)}${product.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover relative z-10"
                      key={`list-${product.id}-${product.imageUrl}`}
                      unoptimized
                      onError={(e) => {
                        console.error('[Inventory] Image failed to load:', product.imageUrl)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative z-10">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-base mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {stockDisplay}
                    </span>
                    {product.warehouseLocation && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3 h-3" />
                        {product.warehouseLocation}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {needsSku ? (
                      <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded">Needs SKU</span>
                    ) : (
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">{product.sku}</span>
                    )}
                    {product.brand && (
                      <span className="text-xs text-gray-500">• {product.brand.name}</span>
                    )}
                  </div>
                </div>
                <Edit3 className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          )
        })}
      </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-12 text-center col-span-full">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-1">No products found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-xl max-h-[90vh] overflow-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                {selectedProduct.imageUrl ? (
                  <Image
                    src={`${getPublicImageUrl(selectedProduct.imageUrl)}${selectedProduct.imageUrl.includes('?') ? '&' : '?'}t=${(selectedProduct as any)._imageUpdate || Date.now()}`}
                    alt={selectedProduct.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover relative z-10"
                    key={`${selectedProduct.id}-${selectedProduct.imageUrl}-${(selectedProduct as any)._imageUpdate || 0}`} // Force re-render on any change
                    unoptimized // Disable Next.js optimization to show image immediately
                    onError={(e) => {
                      console.error('[Inventory] Modal image failed to load:', selectedProduct.imageUrl)
                    }}
                    onLoad={() => {
                      console.log('[Inventory] Modal image loaded successfully:', selectedProduct.imageUrl)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center absolute inset-0 z-0">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,image/heic,image/heif,.heic,.heif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  disabled={uploading}
                  className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                  title="Click to upload image"
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

            {/* Tab Navigation - Mobile optimized with scroll snap */}
            <div className="relative">
              <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {(['stock', 'location', 'classify', 'image', 'details'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap snap-start ${
                      activeTab === tab
                        ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
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
              {/* Scroll indicator fade on right */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
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
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
                    <label className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Full Cases
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditStock(Math.max(0, editStock - 1))}
                        className="w-14 h-14 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editStock}</div>
                        <div className="text-xs text-gray-500 mt-1">cases</div>
                      </div>
                      <button
                        onClick={() => setEditStock(editStock + 1)}
                        className="w-14 h-14 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
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
                          className="px-4 py-2 bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg transition-colors"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra Pieces Counter */}
                  <div className="bg-white rounded-xl p-4 border-2 border-amber-200">
                    <label className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Extra Pieces <span className="text-xs font-normal text-amber-500">(open case)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditExtraPieces(Math.max(0, editExtraPieces - 1))}
                        className="w-14 h-14 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editExtraPieces}</div>
                        <div className="text-xs text-gray-500 mt-1">pieces</div>
                      </div>
                      <button
                        onClick={() => setEditExtraPieces(editExtraPieces + 1)}
                        className="w-14 h-14 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    {/* Quick add for pieces */}
                    <div className="flex justify-center gap-2 mt-3">
                      {[1, 5, 10].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setEditExtraPieces(editExtraPieces + amount)}
                          className="px-4 py-2 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-amber-700 text-sm font-bold rounded-lg transition-colors"
                        >
                          +{amount}
                        </button>
                      ))}
                      <button
                        onClick={() => setEditExtraPieces(0)}
                        className="px-4 py-2 bg-gray-100 border-2 border-gray-300 hover:border-gray-400 text-gray-600 text-sm font-bold rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Units per Case - Large Counter */}
                  <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                    <label className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Units per Case
                    </label>
                    {/* Main Counter with +/- buttons */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setEditUnitsPerCase(Math.max(1, editUnitsPerCase - 1))}
                        className="w-14 h-14 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-gray-900">{editUnitsPerCase}</div>
                        <div className="text-xs text-gray-500 mt-1">units/case</div>
                      </div>
                      <button
                        onClick={() => setEditUnitsPerCase(editUnitsPerCase + 1)}
                        className="w-14 h-14 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {[6, 12, 20, 24, 30, 48].map((units) => (
                        <button
                          key={units}
                          onClick={() => setEditUnitsPerCase(units)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            editUnitsPerCase === units
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-purple-50 border-2 border-purple-200 text-purple-700 hover:border-purple-400'
                          }`}
                        >
                          {units}
                        </button>
                      ))}
                    </div>
                    {/* Total Inventory Summary */}
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-center">
                        <span className="text-sm text-emerald-700">Total Inventory: </span>
                        <span className="text-2xl font-bold text-emerald-800">
                          {(editStock * editUnitsPerCase) + editExtraPieces}
                        </span>
                        <span className="text-sm text-emerald-700"> pieces</span>
                      </div>
                      <div className="text-center text-xs text-emerald-600 mt-1">
                        ({editStock} × {editUnitsPerCase}) + {editExtraPieces} extra
                      </div>
                    </div>
                  </div>

                  {/* Expiration Date - Improved Visibility */}
                  <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                    <label className="text-sm font-medium text-orange-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Expiration Date
                    </label>
                    {/* Quick Presets - Larger buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {EXPIRATION_PRESETS.map((preset) => (
                        <button
                          key={preset.days}
                          onClick={() => setExpirationPreset(preset.days)}
                          className={`py-3 px-3 rounded-lg text-sm font-bold transition-colors ${
                            editExpiration && Math.abs(
                              (editExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24) - preset.days
                            ) < 5
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-orange-50 border-2 border-orange-200 text-orange-700 hover:border-orange-400'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setEditExpiration(null)}
                        className={`py-3 px-3 rounded-lg text-sm font-bold transition-colors col-span-2 ${
                          !editExpiration
                            ? 'bg-gray-500 text-white shadow-md'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        No Expiration
                      </button>
                    </div>
                    {/* Custom date picker - Larger and brighter */}
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <label className="text-xs font-medium text-orange-600 mb-2 block">Pick Custom Date:</label>
                      <input
                        type="date"
                        value={editExpiration ? editExpiration.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditExpiration(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-gray-900 text-lg font-semibold bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {/* Current Selection Display */}
                    {editExpiration && (
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-300 text-center">
                        <span className="text-sm text-orange-700">Selected: </span>
                        <span className="text-lg font-bold text-orange-800">
                          {editExpiration.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SKU Scanner - Quick access from Stock tab */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <ScanBarcode className="w-4 h-4" />
                      Quick SKU Scan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder={selectedProduct.sku || 'No SKU set'}
                        className="flex-1 px-3 py-2.5 border border-blue-300 rounded-lg text-gray-900 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          setScanMode('seed')
                          setScannerOpen(true)
                        }}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <ScanBarcode className="w-5 h-5" />
                        <span className="hidden sm:inline">Scan</span>
                      </button>
                    </div>
                    {(!selectedProduct.sku || selectedProduct.sku.startsWith('AUTO-') || selectedProduct.sku.startsWith('PROD-')) && (
                      <p className="text-xs text-blue-600 mt-2">
                        This product needs a real SKU/barcode
                      </p>
                    )}
                  </div>

                  {/* Allow Pre-sell Toggle - Only shows when stock is 0 */}
                  {(editStock === 0 && editExtraPieces === 0) && (
                    <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Allow Pre-sell
                          </div>
                          <p className="text-xs text-amber-600 mt-1">
                            Show on catalog as "Pre-order" when out of stock
                          </p>
                        </div>
                        <div className="ml-4">
                          <button
                            type="button"
                            onClick={() => setEditAllowPresell(!editAllowPresell)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                              editAllowPresell ? 'bg-amber-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                editAllowPresell ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </label>
                      {editAllowPresell && (
                        <div className="mt-3 p-2 bg-amber-100 rounded-lg border border-amber-300 text-xs text-amber-700">
                          <strong>Pre-sell enabled:</strong> This item will appear on the catalog with a "PRE-ORDER" banner even though it's out of stock.
                        </div>
                      )}
                    </div>
                  )}
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
                      <div className="w-48 h-48 bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center relative">
                        {selectedProduct.imageUrl ? (
                          <Image
                            src={getPublicImageUrl(selectedProduct.imageUrl)}
                            alt={selectedProduct.name}
                            width={192}
                            height={192}
                            className="w-full h-full object-contain relative z-10"
                            key={selectedProduct.imageUrl} // Force re-render when imageUrl changes
                            unoptimized // Disable Next.js optimization to show image immediately
                            onError={(e) => {
                              console.error('[Inventory] Preview image failed to load:', selectedProduct.imageUrl)
                            }}
                          />
                        ) : (
                          <div className="text-center p-4 absolute inset-0 flex flex-col items-center justify-center">
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
                          <span className="text-emerald-700 font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Take Photo or Upload</span>
                          <span className="text-xs text-emerald-600">PNG, JPG, or JPEG</span>
                        </>
                      )}
                    </button>
                    
                    {/* FIXED: Background removal is now optional - removed from automatic upload */}
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Images are optimized automatically. Background removal available after upload.
                    </p>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Image Tips</h4>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• PNG with transparent background works perfectly</li>
                          <li>• Images are automatically optimized and resized</li>
                          <li>• Vector graphics and transparent PNGs are preserved</li>
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

                  {/* Case SKU */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-sm font-medium text-purple-800 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Case SKU / Barcode
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editCaseSku}
                        onChange={(e) => setEditCaseSku(e.target.value)}
                        placeholder="Scan or enter case barcode..."
                        className="flex-1 px-4 py-3 border border-purple-300 rounded-lg text-gray-900 font-mono bg-white focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => {
                          setScanMode('caseSku')
                          setScannerOpen(true)
                        }}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <ScanBarcode className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      Some cases have a different barcode than individual units
                    </p>
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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10">
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

      {/* New Item Modal */}
      {isCreatingNew && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center"
          onClick={() => setIsCreatingNew(false)}
        >
          <div 
            className="bg-white rounded-xl max-h-[90vh] overflow-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white text-lg">New Product</h2>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tab Navigation - Only Product Info and Location */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('stock')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'stock'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500'
                }`}
              >
                Product Info
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'location'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500'
                }`}
              >
                Location
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Messages */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Product Info Tab */}
              {activeTab === 'stock' && (
                <div className="space-y-3">
                  {/* Product Name - with done button to dismiss keyboard */}
                  <div className="bg-white rounded-xl p-3 border-2 border-blue-300">
                    <label className="text-xs font-bold text-blue-700 mb-1 block uppercase">
                      Product Name *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur()
                          }
                        }}
                        placeholder="Enter name..."
                        className="flex-1 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.activeElement as HTMLInputElement
                          input?.blur()
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  {/* Category - with plus button */}
                  <div className="bg-white rounded-xl p-3 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-purple-700 uppercase">Category</label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="w-6 h-6 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {showNewCategoryInput ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="New category..."
                          className="flex-1 px-2 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm"
                          autoFocus
                        />
                        <button
                          onClick={createNewCategory}
                          disabled={creatingCategory || !newCategoryName.trim()}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {creatingCategory ? '...' : 'Add'}
                        </button>
                        <button
                          onClick={() => { setShowNewCategoryInput(false); setNewCategoryName('') }}
                          className="px-2 py-2 bg-gray-200 text-gray-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={editCategoryId || ''}
                        onChange={(e) => setEditCategoryId(e.target.value || null)}
                        className="w-full px-2 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-800"
                      >
                        <option value="">None</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Brand - with plus button */}
                  <div className="bg-white rounded-xl p-3 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-blue-700 uppercase">Brand</label>
                      <button
                        type="button"
                        onClick={() => setShowNewBrandInput(!showNewBrandInput)}
                        className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {showNewBrandInput ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          placeholder="New brand..."
                          className="flex-1 px-2 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                          autoFocus
                        />
                        <button
                          onClick={createNewBrand}
                          disabled={creatingBrand || !newBrandName.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {creatingBrand ? '...' : 'Add'}
                        </button>
                        <button
                          onClick={() => { setShowNewBrandInput(false); setNewBrandName('') }}
                          className="px-2 py-2 bg-gray-200 text-gray-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={editBrandId || ''}
                        onChange={(e) => setEditBrandId(e.target.value || null)}
                        className="w-full px-2 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-800"
                      >
                        <option value="">None</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Initial Stock - Cases Counter */}
                  <div className="bg-white rounded-xl p-3 border-2 border-emerald-300">
                    <label className="text-xs font-bold text-emerald-700 mb-2 block uppercase">Cases in Stock</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditStock(Math.max(0, editStock - 1))}
                        className="w-12 h-12 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center justify-center"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">{editStock}</div>
                      </div>
                      <button
                        onClick={() => setEditStock(editStock + 1)}
                        className="w-12 h-12 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {[1, 5, 10, 24].map((n) => (
                        <button
                          key={n}
                          onClick={() => setEditStock(editStock + n)}
                          className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-lg"
                        >
                          +{n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Units per Case - Counter style */}
                  <div className="bg-white rounded-xl p-3 border-2 border-purple-300">
                    <label className="text-xs font-bold text-purple-700 mb-2 block uppercase">Units per Case</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditUnitsPerCase(Math.max(1, editUnitsPerCase - 1))}
                        className="w-12 h-12 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">{editUnitsPerCase}</div>
                      </div>
                      <button
                        onClick={() => setEditUnitsPerCase(editUnitsPerCase + 1)}
                        className="w-12 h-12 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {[6, 12, 24, 48].map((n) => (
                        <button
                          key={n}
                          onClick={() => setEditUnitsPerCase(n)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            editUnitsPerCase === n
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 border border-purple-300 text-purple-700'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-3">
                  {/* Aisle */}
                  <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase">Aisle</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {AISLE_OPTIONS.map((aisle) => (
                        <button
                          key={aisle}
                          onClick={() => setEditAisle(editAisle === aisle ? '' : aisle)}
                          className={`py-2.5 rounded-lg text-base font-bold transition-colors ${
                            editAisle === aisle
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {aisle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shelf */}
                  <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase">Shelf</label>
                    <div className="grid grid-cols-6 gap-1">
                      {SHELF_OPTIONS.map((shelf) => (
                        <button
                          key={shelf}
                          onClick={() => setEditShelf(editShelf === shelf ? '' : shelf)}
                          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                            editShelf === shelf
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {shelf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bin */}
                  <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase">Bin (optional)</label>
                    <div className="grid grid-cols-6 gap-1">
                      {BIN_OPTIONS.map((bin) => (
                        <button
                          key={bin}
                          onClick={() => setEditBin(editBin === bin ? '' : bin)}
                          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                            editBin === bin
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {bin}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Preview */}
                  <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                    <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-700">
                      {editAisle && editShelf
                        ? `${editAisle}-${editShelf}${editBin ? `-${editBin}` : ''}`
                        : 'No location set'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 safe-area-inset-bottom">
              <button
                onClick={createNewProduct}
                disabled={saving || !newItemName.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {saving ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SKU Follow-up Modal - Shown after product creation */}
      {showSkuFollowUp && newlyCreatedProduct && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSkuFollowUp(false)
              setNewlyCreatedProduct(null)
            }
          }}
        >
          <div 
            className="bg-white rounded-xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Product Created!</h2>
              <p className="text-white/80 text-sm mt-1">{newlyCreatedProduct.name}</p>
            </div>

            {/* SKU Status */}
            <div className="p-4 space-y-3">
              {/* Product SKU Status */}
              <div className={`p-3 rounded-xl border-2 ${
                newlyCreatedProduct.sku && !newlyCreatedProduct.sku.startsWith('NEW-')
                  ? 'bg-green-50 border-green-300'
                  : 'bg-orange-50 border-orange-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-600">Product SKU</p>
                    <p className={`font-mono font-bold ${
                      newlyCreatedProduct.sku && !newlyCreatedProduct.sku.startsWith('NEW-')
                        ? 'text-green-700'
                        : 'text-orange-600'
                    }`}>
                      {newlyCreatedProduct.sku && !newlyCreatedProduct.sku.startsWith('NEW-')
                        ? newlyCreatedProduct.sku
                        : 'Not scanned yet'}
                    </p>
                  </div>
                  {newlyCreatedProduct.sku && !newlyCreatedProduct.sku.startsWith('NEW-') ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowSkuFollowUp(false)
                        setScanMode('sku')
                        setScannerOpen(true)
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm z-[202] relative"
                    >
                      <ScanBarcode className="w-4 h-4" />
                      Scan
                    </button>
                  )}
                </div>
              </div>

              {/* Case SKU Status */}
              <div className={`p-3 rounded-xl border-2 ${
                newlyCreatedProduct.caseSku
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-600">Case SKU (optional)</p>
                    <p className={`font-mono font-bold ${
                      newlyCreatedProduct.caseSku
                        ? 'text-green-700'
                        : 'text-gray-400'
                    }`}>
                      {newlyCreatedProduct.caseSku || 'Not scanned'}
                    </p>
                  </div>
                  {newlyCreatedProduct.caseSku ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowSkuFollowUp(false)
                        setScanMode('caseSku')
                        setScannerOpen(true)
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm z-[202] relative"
                    >
                      <ScanBarcode className="w-4 h-4" />
                      Scan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0 space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSkuFollowUp(false)
                  setNewlyCreatedProduct(null)
                  openNewItemModal() // Create another product
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 z-[202] relative"
              >
                <Plus className="w-5 h-5" />
                Add Another Product
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSkuFollowUp(false)
                  setNewlyCreatedProduct(null)
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold z-[202] relative"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Barcode Scanner - Uses persistent stream for iPhone */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
          mode={scanMode}
          persistentStream={isIOS ? persistentStreamRef.current : null}
        />
      )}
    </div>
  )
}

// Barcode Scanner Component - Optimized for iOS Safari + Android
// iPhone Hack: Accepts persistent stream to avoid re-authentication
function BarcodeScanner({
  onScan,
  onClose,
  mode,
  persistentStream
}: {
  onScan: (barcode: string) => void
  onClose: () => void
  mode: 'lookup' | 'seed' | 'sku' | 'caseSku'
  persistentStream?: MediaStream | null
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
        // iPhone Hack: Use persistent stream if available (no re-auth needed!)
        if (persistentStream && isIOS) {
          console.log('[iPhone] Using persistent camera stream - no re-auth needed!')
          streamRef.current = persistentStream
          
          if (videoRef.current) {
            videoRef.current.srcObject = persistentStream
            await videoRef.current.play()
          }
          
          setScanning(true)
          scanningRef.current = true
          
          // Initialize code reader
          const { BrowserMultiFormatReader } = await import('@zxing/browser')
          const codeReader = new BrowserMultiFormatReader()
          codeReaderRef.current = codeReader
          
          // Start decoding loop
          const decodeLoop = async () => {
            if (!mounted || !scanningRef.current || !videoRef.current) return

            try {
              const result = await codeReader.decodeOnceFromVideoElement(videoRef.current)
              if (result && mounted && scanningRef.current) {
                const barcode = result.getText()
                if (barcode) {
                  if (navigator.vibrate) navigator.vibrate(100)
                  scanningRef.current = false
                  onScan(barcode)
                  return
                }
              }
            } catch (e) {
              // No barcode found - continue
            }

            if (mounted && scanningRef.current) {
              requestAnimationFrame(decodeLoop)
            }
          }
          
          setTimeout(decodeLoop, 500)
          return
        }

        // Original scanner logic for Android/non-iOS or if persistent stream not available
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
      // iPhone Hack: Don't stop persistent stream on close (keep it alive)
      if (persistentStream && isIOS) {
        console.log('[iPhone] Keeping persistent stream alive for next scan')
        if (codeReaderRef.current) {
          try {
            codeReaderRef.current.reset()
          } catch (e) {}
        }
        return
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
        } catch (e) {}
      }
    }
  }, [onScan, persistentStream, isIOS])

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      await track.applyConstraints({
        // @ts-ignore
        torch: !torchOn
      })
      setTorchOn(!torchOn)
    } catch (e) {
      console.error('Torch toggle failed:', e)
    }
  }

  // Tap to focus (iOS)
  const handleTapToFocus = async (e: React.TouchEvent | React.MouseEvent) => {
    if (!streamRef.current || !videoRef.current) return

    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    // Get tap coordinates relative to video
    const rect = videoRef.current.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    // Calculate point of interest (0-1 range)
    const pointX = x / rect.width
    const pointY = y / rect.height

    try {
      // @ts-ignore - These are valid WebRTC constraints
      await track.applyConstraints({
        focusMode: 'manual',
        pointsOfInterest: [{ x: pointX, y: pointY }]
      })
      // Switch back to continuous after a moment
      setTimeout(async () => {
        try {
          // @ts-ignore
          await track.applyConstraints({ focusMode: 'continuous' })
        } catch (e) {}
      }, 2000)
    } catch (e) {
      // Not supported on this device
    }
  }

  const handleClose = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black z-[110] flex flex-col">
      <div className="bg-black/80 p-4 flex items-center justify-between safe-area-inset-top">
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
              className={`p-2 rounded-lg transition-colors ${
                torchOn ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative"
        onClick={handleTapToFocus}
        onTouchStart={handleTapToFocus}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'translateZ(0)' }} // GPU acceleration for iOS
        />
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-52 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-400" />
            {scanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 animate-[scanline_2s_ease-in-out_infinite]" />
            )}
          </div>
        </div>
        {/* iOS hint */}
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
              <p className="text-white/60 text-sm mt-1">Please allow camera access</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center font-medium">{error}</p>
            <button
              onClick={handleClose}
              className="mt-3 w-full py-2 bg-white text-red-600 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Bottom safe area for iOS */}
      <div className="bg-black/80 p-4 safe-area-inset-bottom">
        <p className="text-white/40 text-xs text-center">
          Position barcode within the frame
        </p>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12rem); }
        }
        .safe-area-inset-top {
          padding-top: max(1rem, env(safe-area-inset-top));
        }
        .safe-area-inset-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  )
}
