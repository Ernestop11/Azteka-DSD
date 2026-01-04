'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Package,
  Search,
  Plus,
  Minus,
  Check,
  X,
  ScanBarcode,
  Calendar,
  Tag,
  MapPin,
  Flag,
  Loader2,
  User,
  Clock,
  LogOut
} from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { getPublicImageUrl } from '@/lib/imageUrl'

type AppState = 'idle' | 'entering-pin' | 'counting'

interface Employee {
  id: string
  firstName: string
  lastName: string
  role?: string
  isClockedIn?: boolean
}

interface InventoryCount {
  id: string
  name: string
  status: string
  _count?: { items: number }
}

interface Product {
  id: string
  name: string
  sku: string
  caseSku?: string | null
  imageUrl?: string | null
  stock: number
  warehouseLocation?: string | null
  unitsPerCase: number
  expirationDate?: string | null
}

interface CountItem {
  id: string
  productId: string
  countedCases: number
  countedPieces: number
  countedTotal: number
  expectedQuantity: number
  variance: number
  warehouseLocation?: string
  needsDateCheck: boolean
  expirationDate?: string
  sku?: string
  caseSku?: string
  unitsPerCase?: number
}

// Expiration presets
const EXPIRATION_PRESETS = [
  { label: '30d', days: 30 },
  { label: '60d', days: 60 },
  { label: '90d', days: 90 },
  { label: '6mo', days: 180 },
  { label: '1yr', days: 365 },
]

export default function InventoryCountPage() {
  // Auth state
  const [appState, setAppState] = useState<AppState>('idle')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const pinRef = useRef(pin)

  // Main state
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [recentItems, setRecentItems] = useState<CountItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Scanner
  const [scannerOpen, setScannerOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Edit Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [existingItem, setExistingItem] = useState<CountItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [countedCases, setCountedCases] = useState(0)
  const [countedPieces, setCountedPieces] = useState(0)
  const [unitsPerCase, setUnitsPerCase] = useState(1)
  const [warehouseLocation, setWarehouseLocation] = useState('')
  const [needsDateCheck, setNeedsDateCheck] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editCaseSku, setEditCaseSku] = useState('')

  // SKU Scanner state
  const [skuScanMode, setSkuScanMode] = useState<'sku' | 'caseSku' | null>(null)
  const skuVideoRef = useRef<HTMLVideoElement>(null)
  const skuCodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Duplicate warning
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync pin ref
  useEffect(() => { pinRef.current = pin }, [pin])

  // Check existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  // Keyboard support for PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState === 'entering-pin' || appState === 'idle') {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault()
          if (appState === 'idle') {
            setAppState('entering-pin')
            setPin(e.key)
          } else if (pinRef.current.length < 4) {
            const newPin = pinRef.current + e.key
            setPin(newPin)
            if (newPin.length === 4) {
              lookupEmployee(newPin)
            }
          }
        } else if (e.key === 'Backspace') {
          e.preventDefault()
          setPin(prev => prev.slice(0, -1))
        } else if (e.key === 'Escape') {
          resetToIdle()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appState])

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/employee/me')
      if (res.ok) {
        const data = await res.json()
        if (data.employee) {
          setEmployee(data.employee)
          setAppState('counting')
          loadData()
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  const resetToIdle = () => {
    setAppState('idle')
    setPin('')
    setError('')
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        lookupEmployee(newPin)
      }
    }
  }

  const lookupEmployee = async (pinCode: string) => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/kiosk/lookup?pin=${pinCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Employee not found')
        return
      }

      const emp = {
        ...data.employee,
        role: data.employee.role || 'WAREHOUSE'
      }
      setEmployee(emp)

      // Clock in if not already clocked in
      if (!data.employee.isClockedIn) {
        await fetch('/api/kiosk/clock-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: data.employee.id })
        })
        emp.isClockedIn = true
      }

      // Create session
      await fetch('/api/staff/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinCode })
      })

      setAppState('counting')
      loadData()
    } catch {
      setError('Connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!employee) return

    setIsLoading(true)
    try {
      await fetch('/api/kiosk/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id })
      })

      await fetch('/api/employee/logout', { method: 'POST' })

      setEmployee(null)
      setActiveCount(null)
      setProducts([])
      setRecentItems([])
      resetToIdle()
    } catch (error) {
      console.error('Clock out failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // Load data after login
  const loadData = async () => {
    setLoading(true)
    try {
      // Get all products
      const prodRes = await fetch('/api/admin/products', { credentials: 'include' })
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.data || [])
      }

      // Get inventory counts
      const countRes = await fetch('/api/employee/inventory-count')
      if (countRes.ok) {
        const countData = await countRes.json()
        const openCount = countData.counts?.find((c: InventoryCount) => c.status === 'OPEN')
        setActiveCount(openCount || null)

        if (openCount) {
          await loadRecentItems(openCount.id)
        }
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentItems = async (countId: string) => {
    try {
      const res = await fetch(`/api/employee/inventory-count/${countId}/items`)
      if (res.ok) {
        const data = await res.json()
        setRecentItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    }
  }

  // Create count session
  const createCountSession = async () => {
    const today = new Date()
    const name = `Count ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    try {
      const res = await fetch('/api/employee/inventory-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveCount(data.count)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.caseSku?.toLowerCase().includes(term) ||
      p.warehouseLocation?.toLowerCase().includes(term)
    )
  })

  // Check if product already counted
  const getCountedItem = (productId: string) => {
    return recentItems.find(item => item.productId === productId)
  }

  // Open product modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    const existing = getCountedItem(product.id)
    setExistingItem(existing || null)
    setShowDuplicateWarning(!!existing) // Show warning if already counted

    if (existing) {
      setCountedCases(existing.countedCases)
      setCountedPieces(existing.countedPieces)
      setUnitsPerCase(existing.unitsPerCase || product.unitsPerCase || 1)
      setWarehouseLocation(existing.warehouseLocation || product.warehouseLocation || '')
      setNeedsDateCheck(existing.needsDateCheck)
      setExpirationDate(existing.expirationDate?.split('T')[0] || '')
      setEditSku(existing.sku || product.sku || '')
      setEditCaseSku(existing.caseSku || product.caseSku || '')
    } else {
      setCountedCases(0)
      setCountedPieces(0)
      setUnitsPerCase(product.unitsPerCase || 1)
      setWarehouseLocation(product.warehouseLocation || '')
      setNeedsDateCheck(false)
      setExpirationDate(product.expirationDate?.split('T')[0] || '')
      setEditSku(product.sku || '')
      setEditCaseSku(product.caseSku || '')
    }
  }

  // SKU Scanner for modal
  const startSkuScanner = async (mode: 'sku' | 'caseSku') => {
    setSkuScanMode(mode)
    try {
      skuCodeReaderRef.current = new BrowserMultiFormatReader()
      const devices = await skuCodeReaderRef.current.listVideoInputDevices()

      if (devices.length === 0) {
        alert('No camera found')
        setSkuScanMode(null)
        return
      }

      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
      ) || devices[0]

      // Wait for video element to be available
      setTimeout(async () => {
        if (skuVideoRef.current && skuCodeReaderRef.current) {
          await skuCodeReaderRef.current.decodeFromVideoDevice(
            backCamera.deviceId,
            skuVideoRef.current,
            (result) => {
              if (result) {
                const code = result.getText()
                handleSkuScan(code, mode)
              }
            }
          )
        }
      }, 100)
    } catch (error) {
      console.error('SKU Scanner error:', error)
      setSkuScanMode(null)
    }
  }

  const stopSkuScanner = () => {
    if (skuCodeReaderRef.current) {
      skuCodeReaderRef.current.reset()
      skuCodeReaderRef.current = null
    }
    setSkuScanMode(null)
  }

  const handleSkuScan = (code: string, mode: 'sku' | 'caseSku') => {
    stopSkuScanner()
    if (mode === 'sku') {
      setEditSku(code)
    } else {
      setEditCaseSku(code)
    }
  }

  // Save count
  const saveCount = async () => {
    if (!activeCount || !selectedProduct || !employee) return

    setSaving(true)
    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          counterId: employee.id,
          countedCases,
          countedPieces,
          unitsPerCase,
          warehouseLocation,
          needsDateCheck,
          expirationDate: expirationDate || null,
          sku: editSku,
          caseSku: editCaseSku
        })
      })

      if (res.ok) {
        await loadRecentItems(activeCount.id)
        setActiveCount(prev => prev ? {
          ...prev,
          _count: { items: (prev._count?.items || 0) + (existingItem ? 0 : 1) }
        } : null)
        setSelectedProduct(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save count')
    } finally {
      setSaving(false)
    }
  }

  // Scanner
  const startScanner = async () => {
    setScannerOpen(true)
    try {
      codeReaderRef.current = new BrowserMultiFormatReader()
      const devices = await codeReaderRef.current.listVideoInputDevices()

      if (devices.length === 0) {
        alert('No camera found')
        setScannerOpen(false)
        return
      }

      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
      ) || devices[0]

      await codeReaderRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current!,
        (result) => {
          if (result) {
            const code = result.getText()
            handleBarcodeScan(code)
          }
        }
      )
    } catch (error) {
      console.error('Scanner error:', error)
      setScannerOpen(false)
    }
  }

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setScannerOpen(false)
  }

  const handleBarcodeScan = (code: string) => {
    stopScanner()
    const product = products.find(p =>
      p.sku === code || p.caseSku === code
    )
    if (product) {
      openProductModal(product)
    } else {
      alert(`No product found for: ${code}`)
    }
  }

  // Expiration preset
  const setExpirationPreset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setExpirationDate(date.toISOString().split('T')[0])
    setNeedsDateCheck(false)
  }

  const totalUnits = countedCases * unitsPerCase + countedPieces

  // =====================
  // IDLE STATE - Tap to start
  // =====================
  if (appState === 'idle') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col items-center justify-center p-4"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={() => setAppState('entering-pin')}
      >
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums whitespace-nowrap">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="text-3xl ml-1">{currentTime.toLocaleTimeString([], { second: '2-digit' }).slice(-2)}</span>
          </div>
          <div className="text-xl text-emerald-200 mb-8">
            {formatDate(currentTime)}
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-10 h-10 text-white" />
          </div>
          <p className="text-emerald-100 text-lg">Tap to Start Counting</p>
        </div>
      </div>
    )
  }

  // =====================
  // PIN ENTRY STATE
  // =====================
  if (appState === 'entering-pin') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col items-center justify-center p-4"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Enter Your PIN</h2>
          <p className="text-emerald-200 text-center mb-8">Last 4 digits of phone</p>

          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                  pin.length > i ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'
                }`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center mb-8">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="w-full aspect-square bg-white/10 hover:bg-white/20 active:bg-emerald-600 rounded-2xl text-white text-2xl font-bold transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={resetToIdle}
              className="w-full aspect-square bg-red-500/20 hover:bg-red-500/30 rounded-2xl text-red-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePinInput('0')}
              className="w-full aspect-square bg-white/10 hover:bg-white/20 active:bg-emerald-600 rounded-2xl text-white text-2xl font-bold transition-colors"
            >
              0
            </button>
            <button
              onClick={() => setPin(pin.slice(0, -1))}
              className="w-full aspect-square bg-white/10 hover:bg-white/20 rounded-2xl text-white text-lg font-medium transition-colors"
            >
              ←
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =====================
  // COUNTING STATE
  // =====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    )
  }

  // No active session - start one
  if (!activeCount) {
    return (
      <div
        className="bg-slate-900 min-h-screen"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header with clock out */}
        <div className="bg-emerald-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{employee?.firstName} {employee?.lastName}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-emerald-200 text-xs">Clocked In</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Clock Out
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
          <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Ready to Count</h2>
            <p className="text-slate-400 text-sm">Start today's inventory count</p>
          </div>
          <button
            onClick={createCountSession}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl"
          >
            Start Counting
          </button>
        </div>
      </div>
    )
  }

  // Main counting interface
  return (
    <div
      className="bg-slate-900 min-h-screen"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">{activeCount.name}</h1>
              <p className="text-emerald-400 text-xs">{activeCount._count?.items || 0} items • {employee?.firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-mono">{formatTime(currentTime)}</span>
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs font-medium"
            >
              <Clock className="w-3 h-3" />
              Out
            </button>
          </div>
        </div>
      </div>

      {/* Scan Button */}
      <div className="p-3">
        <button
          onClick={startScanner}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3"
        >
          <ScanBarcode className="w-6 h-6" />
          Scan Product
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
          <input
            type="text"
            placeholder="Search name, SKU, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border-2 border-emerald-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="px-3 pb-20 space-y-2" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const counted = getCountedItem(product.id)
            const needsSku = !product.sku || product.sku.startsWith('AUTO-') || product.sku.startsWith('PROD-')

            return (
              <button
                key={product.id}
                onClick={() => openProductModal(product)}
                className={`w-full bg-slate-800 rounded-xl p-3 text-left border-2 ${
                  counted ? 'border-emerald-600' : needsSku ? 'border-orange-500/50' : 'border-slate-700'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={getPublicImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{product.name}</p>
                    <p className="text-slate-400 text-sm font-mono">
                      {needsSku ? <span className="text-orange-400">No SKU</span> : product.sku}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 text-xs">Stock: {product.stock}</span>
                      {product.warehouseLocation && (
                        <span className="text-slate-500 text-xs">• {product.warehouseLocation}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    {counted ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-bold">{counted.countedTotal}</span>
                      </>
                    ) : (
                      <Plus className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900">
            <h2 className="text-white font-bold">Scan Barcode</h2>
            <button onClick={stopScanner} className="p-2 text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 relative">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-emerald-500 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Full page height, optimized for touch */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-slate-900 w-full rounded-t-2xl max-h-[95vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Compact */}
            <div className="sticky top-0 bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center gap-3 z-10">
              <div className="w-14 h-14 rounded-lg bg-white overflow-hidden flex-shrink-0">
                {selectedProduct.imageUrl ? (
                  <img
                    src={getPublicImageUrl(selectedProduct.imageUrl)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold truncate text-lg">{selectedProduct.name}</h2>
                <p className="text-slate-400 text-sm">Stock: {selectedProduct.stock} • {editSku || 'No SKU'}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Duplicate Warning */}
            {showDuplicateWarning && (
              <div className="mx-4 mt-4 p-3 bg-amber-500/20 border border-amber-500 rounded-xl flex items-start gap-3">
                <Flag className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-amber-400 font-bold text-sm">Already Counted!</p>
                  <p className="text-amber-300/80 text-xs">Previous count: {existingItem?.countedTotal} units. Saving will update the existing count.</p>
                </div>
                <button onClick={() => setShowDuplicateWarning(false)} className="text-amber-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <div className="p-4 space-y-5">
              {/* CASES - Large touch targets */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-emerald-400 text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4" /> Cases
                  </label>
                  <span className="text-emerald-400 font-bold text-lg">Total: {totalUnits}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCountedCases(Math.max(0, countedCases - 1))}
                    className="w-16 h-16 bg-red-600 active:bg-red-700 rounded-xl flex items-center justify-center"
                  >
                    <Minus className="w-8 h-8 text-white" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={countedCases}
                    onChange={(e) => setCountedCases(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 text-center text-4xl font-bold bg-slate-700 border-2 border-slate-600 rounded-xl py-4 text-white"
                  />
                  <button
                    onClick={() => setCountedCases(countedCases + 1)}
                    className="w-16 h-16 bg-emerald-600 active:bg-emerald-700 rounded-xl flex items-center justify-center"
                  >
                    <Plus className="w-8 h-8 text-white" />
                  </button>
                </div>
                {/* Quick add - Bigger buttons */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {[1, 5, 10, 24, 50].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCountedCases(countedCases + n)}
                      className="py-3 bg-slate-700 active:bg-emerald-600 rounded-xl text-white font-bold text-base"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pieces + Units per case - Inline */}
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-800 rounded-xl p-3">
                  <label className="text-slate-400 text-xs font-medium mb-2 block">Pieces</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCountedPieces(Math.max(0, countedPieces - 1))}
                      className="w-10 h-10 bg-slate-700 active:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      <Minus className="w-5 h-5 text-white" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={countedPieces}
                      onChange={(e) => setCountedPieces(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center text-2xl font-bold bg-slate-700 rounded-lg py-2 text-white min-w-0"
                    />
                    <button
                      onClick={() => setCountedPieces(countedPieces + 1)}
                      className="w-10 h-10 bg-slate-700 active:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <label className="text-slate-400 text-xs font-medium mb-2 block">per case:</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={unitsPerCase}
                    onChange={(e) => setUnitsPerCase(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center text-2xl font-bold bg-slate-700 rounded-lg py-2 text-white"
                  />
                </div>
              </div>

              {/* Expiration + Location - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Expiration */}
                <div className="bg-slate-800 rounded-xl p-3">
                  <label className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> EXPIRATION
                  </label>
                  <button
                    onClick={() => setNeedsDateCheck(!needsDateCheck)}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 mb-2 ${
                      needsDateCheck
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    Flag Check
                  </button>
                  {!needsDateCheck && (
                    <div className="grid grid-cols-3 gap-1">
                      {EXPIRATION_PRESETS.slice(0, 3).map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setExpirationPreset(preset.days)}
                          className={`py-2 rounded-lg text-xs font-bold ${
                            expirationDate === new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!needsDateCheck && (
                    <div className="mt-2">
                      <select
                        value={expirationDate ? 'Pick' : ''}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            const date = prompt('Enter date (YYYY-MM-DD):')
                            if (date) setExpirationDate(date)
                          }
                        }}
                        className="w-full py-2 bg-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value="">📅 Pick</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-slate-800 rounded-xl p-3">
                  <label className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> LOCATION
                  </label>
                  <input
                    type="text"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value.toUpperCase())}
                    placeholder="A-12-3"
                    className="w-full px-3 py-2.5 bg-slate-700 rounded-lg text-white placeholder-slate-500 text-center font-mono text-lg mb-2"
                  />
                  <button
                    onClick={() => {
                      // Could open warehouse map
                      alert('Open Map coming soon')
                    }}
                    className="w-full py-2 bg-slate-700 rounded-lg text-cyan-400 text-xs font-medium"
                  >
                    Open Map
                  </button>
                </div>
              </div>

              {/* Barcodes Section - Compact with scan buttons */}
              <div className="bg-slate-800 rounded-xl p-3">
                <label className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> BARCODES
                </label>

                {/* SKU Row */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    placeholder="SKU"
                    className="flex-1 px-3 py-2.5 bg-slate-700 rounded-lg text-white placeholder-slate-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => startSkuScanner('sku')}
                    className="w-12 h-11 bg-cyan-600 active:bg-cyan-700 rounded-lg flex items-center justify-center"
                  >
                    <ScanBarcode className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Case SKU Row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editCaseSku}
                    onChange={(e) => setEditCaseSku(e.target.value)}
                    placeholder="Case SKU"
                    className="flex-1 px-3 py-2.5 bg-amber-900/50 border border-amber-600/50 rounded-lg text-white placeholder-slate-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => startSkuScanner('caseSku')}
                    className="w-12 h-11 bg-amber-600 active:bg-amber-700 rounded-lg flex items-center justify-center"
                  >
                    <ScanBarcode className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Save Button - Large and prominent */}
              <button
                onClick={saveCount}
                disabled={saving}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-700 text-white font-bold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/30"
              >
                {saving ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    <Check className="w-7 h-7" />
                    {existingItem ? 'UPDATE COUNT' : 'SAVE COUNT'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKU Scanner Modal */}
      {skuScanMode && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900">
            <h2 className="text-white font-bold">
              Scan {skuScanMode === 'sku' ? 'Product' : 'Case'} Barcode
            </h2>
            <button onClick={stopSkuScanner} className="p-2 bg-slate-800 rounded-lg">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 relative">
            <video ref={skuVideoRef} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-64 h-32 border-4 rounded-lg ${
                skuScanMode === 'sku' ? 'border-cyan-500' : 'border-amber-500'
              }`} />
            </div>
          </div>
          <div className="p-4 bg-slate-900">
            <p className="text-slate-400 text-center text-sm">
              Point camera at {skuScanMode === 'sku' ? 'product' : 'case'} barcode
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
