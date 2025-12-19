'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Package,
  Search,
  Camera,
  X,
  Check,
  AlertCircle,
  Loader2,
  ScanBarcode,
  Edit2,
  Save
} from 'lucide-react'
import Image from 'next/image'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  imageUrl: string | null
  inStock: boolean
  stock: number
  unitsPerCase: number
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
}

export default function EmployeeProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannedSku, setScannedSku] = useState('')
  const [manualSku, setManualSku] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  const [filterNoSku, setFilterNoSku] = useState(false)

  // Load products
  useEffect(() => {
    async function loadProducts() {
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
    loadProducts()
  }, [])

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = !filterNoSku || !p.sku || p.sku === '' || p.sku.startsWith('AUTO-')

    return matchesSearch && matchesFilter
  })

  // Open product modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setScannedSku('')
    setManualSku(product.sku || '')
    setSaveSuccess(false)
    setError('')
  }

  // Save SKU to product
  const saveSku = async (sku: string) => {
    if (!selectedProduct || !sku.trim()) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/employee/products/${selectedProduct.id}/sku`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: sku.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save SKU')
      }

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, sku: sku.trim() } : p
      ))
      setSelectedProduct(prev => prev ? { ...prev, sku: sku.trim() } : null)
      setSaveSuccess(true)
      setScannedSku('')

      // Auto-close success after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save SKU')
    } finally {
      setSaving(false)
    }
  }

  // Handle barcode scan result
  const handleScanResult = (barcode: string) => {
    setScannedSku(barcode)
    setScannerOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Scan barcodes to seed SKUs to products</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
            <input
              type="checkbox"
              checked={filterNoSku}
              onChange={(e) => setFilterNoSku(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Show only missing SKUs</span>
          </label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const needsSku = !product.sku || product.sku === '' || product.sku.startsWith('AUTO-')
          return (
            <button
              key={product.id}
              onClick={() => openProductModal(product)}
              className={`bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow ${
                needsSku ? 'ring-2 ring-orange-300' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      key={product.imageUrl}
                      unoptimized
                      onError={(e) => {
                        console.error('[Products] Image failed to load:', product.imageUrl)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {product.brand?.name || 'No brand'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {needsSku ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        <AlertCircle className="w-3 h-3" />
                        Needs SKU
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
                    )}
                  </div>
                </div>
                <ScanBarcode className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {selectedProduct.imageUrl ? (
                    <Image
                      src={getPublicImageUrl(selectedProduct.imageUrl)}
                      alt={selectedProduct.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      key={selectedProduct.imageUrl}
                      unoptimized
                      onError={(e) => {
                        console.error('[Products] Modal image failed to load:', selectedProduct.imageUrl)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.brand?.name || 'No brand'}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.category?.name || 'No category'}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    ${Number(selectedProduct.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Current SKU */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Current SKU</p>
                <p className="font-mono text-lg text-gray-900">
                  {selectedProduct.sku || <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>

              {/* Success Message */}
              {saveSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">SKU saved successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Scanned SKU Preview */}
              {scannedSku && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-2">Scanned Barcode</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-blue-900 flex-1">{scannedSku}</span>
                    <button
                      onClick={() => saveSku(scannedSku)}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Scan Button */}
              <button
                onClick={() => setScannerOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Scan Barcode
              </button>

              {/* Manual Entry */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Or enter manually</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    placeholder="Enter SKU..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={() => saveSku(manualSku)}
                    disabled={saving || !manualSku.trim()}
                    className="px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScanResult}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}

// Barcode Scanner Component
function BarcodeScanner({
  onScan,
  onClose
}: {
  onScan: (barcode: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
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
        console.error('Camera error:', err)
        setError('Could not access camera. Please grant permission.')
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

  // Scan for barcodes using BarcodeDetector API (if available)
  useEffect(() => {
    if (!scanning || !videoRef.current) return

    let animationFrame: number
    const video = videoRef.current

    // Check if BarcodeDetector is available
    if ('BarcodeDetector' in window) {
      // @ts-ignore - BarcodeDetector is not in TypeScript types yet
      const detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
      })

      const scan = async () => {
        if (!video.videoWidth) {
          animationFrame = requestAnimationFrame(scan)
          return
        }

        try {
          const barcodes = await detector.detect(video)
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue
            if (barcode) {
              // Stop scanning
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
              }
              onScan(barcode)
              return
            }
          }
        } catch (err) {
          // Ignore detection errors
        }

        animationFrame = requestAnimationFrame(scan)
      }

      scan()
    } else {
      setError('Barcode scanning not supported on this device. Please enter manually.')
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [scanning, onScan])

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      {/* Header */}
      <div className="bg-black/80 p-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Scan Barcode</h2>
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

      {/* Video Feed */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-48 border-2 border-white/50 rounded-lg relative">
            <div className="absolute inset-0 border-4 border-transparent animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400" />
            </div>
            {/* Scan line animation */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 animate-[scanline_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-black/80 p-4 text-center">
        <p className="text-white/80">Position the barcode within the frame</p>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(11.5rem); }
        }
      `}</style>
    </div>
  )
}
