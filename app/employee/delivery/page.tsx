'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Camera,
  X,
  MapPin,
  Phone,
  User,
  Check,
  ScanBarcode,
  Navigation
} from 'lucide-react'

interface DeliveryOrder {
  id: string
  status: string
  customerName: string
  total: number
  notes: string | null
  address?: string
  phone?: string
  createdAt: string
  itemCount: number
}

interface DeliveryQRData {
  orderId: string
  orderNumber?: string
  customerName: string
  confirmationUrl: string
  qrCodeDataUrl: string
  items: Array<{
    id: string
    productName: string
    productImage?: string
    quantity: number
  }>
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState<'packed' | 'shipped' | 'all'>('packed')
  const [activeDelivery, setActiveDelivery] = useState<DeliveryQRData | null>(null)

  // Load delivery orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/employee/delivery')
        const data = await res.json()
        if (data.data) {
          setOrders(data.data)
        }
      } catch (err) {
        console.error('Failed to load delivery orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true
    return o.status.toLowerCase() === statusFilter
  })

  // Handle QR code scan - supports both box QR codes and order QR codes
  const handleScan = async (scannedData: string) => {
    setScannerOpen(false)
    setError('')
    setSuccess('')

    try {
      // Check if it's a box QR code (format: BOX-XXXXXX or URL with /box/)
      if (scannedData.startsWith('BOX-') || scannedData.includes('/box/')) {
        // Extract box code
        const boxCode = scannedData.startsWith('BOX-')
          ? scannedData
          : scannedData.split('/box/')[1]?.split('?')[0]

        if (!boxCode) throw new Error('Invalid box QR code')

        // Look up box to get order ID
        const boxRes = await fetch(`/api/boxes?qrCode=${boxCode}`)
        const boxData = await boxRes.json()

        if (!boxRes.ok || !boxData.data) {
          throw new Error('Box not found')
        }

        // Find the order for this box
        const order = orders.find(o => o.id === boxData.data.orderId)
        if (!order) {
          throw new Error('Order not found in your delivery list')
        }

        setSelectedOrder(order)
        setSuccess(`Box ${boxCode} scanned - Order #${order.id.slice(-8)}`)
        return
      }

      // Try to parse as base64 encoded JSON (legacy format)
      const decoded = atob(scannedData)
      const orderData = JSON.parse(decoded)

      if (!orderData.orderId) {
        throw new Error('Invalid QR code')
      }

      // Find the order
      const order = orders.find(o => o.id === orderData.orderId)
      if (!order) {
        throw new Error('Order not found in your delivery list')
      }

      setSelectedOrder(order)
    } catch (err: any) {
      // If base64 parsing fails, show generic error
      if (err.message?.includes('atob')) {
        setError('Invalid QR code format')
      } else {
        setError(err.message || 'Failed to read QR code')
      }
    }
  }

  // Mark order as shipped (out for delivery) - generates customer QR code
  const markAsShipped = async (order: DeliveryOrder) => {
    setSaving(true)
    setError('')

    try {
      // Call start delivery API to generate customer confirmation QR
      const res = await fetch('/api/employee/delivery/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })

      if (!res.ok) {
        throw new Error('Failed to start delivery')
      }

      const data = await res.json()

      // Update local order status
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'shipped' } : o
      ))

      // Show the QR code modal for customer to scan
      setActiveDelivery({
        orderId: data.data.orderId,
        orderNumber: data.data.orderNumber,
        customerName: data.data.customerName,
        confirmationUrl: data.data.confirmationUrl,
        qrCodeDataUrl: data.data.qrCodeDataUrl,
        items: data.data.items
      })

      setSuccess('Delivery started! Show QR code to customer.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to start delivery')
    } finally {
      setSaving(false)
    }
  }

  // Mark order as delivered
  const markAsDelivered = async (order: DeliveryOrder) => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/employee/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' })
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }

      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'delivered' } : o
      ))

      setSelectedOrder(null)
      setSuccess('Order delivered successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
            <p className="text-gray-600">Scan QR codes to confirm deliveries</p>
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <ScanBarcode className="w-5 h-5" />
            Scan QR
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          {(['packed', 'shipped', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'packed' ? 'Ready for Delivery' : status === 'shipped' ? 'Out for Delivery' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  order.status === 'shipped' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {order.status === 'shipped' ? (
                    <Truck className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Package className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                  <p className="text-sm text-gray-400">{order.itemCount} items - ${Number(order.total).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {order.status === 'packed' && (
                  <button
                    onClick={() => markAsShipped(order)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Start Delivery
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Delivery
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No deliveries found</p>
        </div>
      )}

      {/* Delivery Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Confirm Delivery</h2>
                    <p className="text-white/80">Order #{selectedOrder.id.slice(-8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{selectedOrder.customerName}</span>
                </div>
                {selectedOrder.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedOrder.address}</span>
                  </div>
                )}
                {selectedOrder.phone && (
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{selectedOrder.phone}</span>
                  </a>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium text-gray-900">{selectedOrder.itemCount}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Delivery Notes</p>
                  <p className="text-yellow-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={() => markAsDelivered(selectedOrder)}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {saving ? 'Confirming...' : 'Confirm Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Confirmation QR Modal */}
      {activeDelivery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Customer Confirmation</h2>
                    <p className="text-white/80">Order #{activeDelivery.orderNumber || activeDelivery.orderId.slice(-8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDelivery(null)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 font-medium">{activeDelivery.customerName}</span>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-inner">
                  <img
                    src={activeDelivery.qrCodeDataUrl}
                    alt="Customer Confirmation QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="mt-4 text-center text-gray-600 text-sm">
                  Have the customer scan this QR code to confirm delivery
                </p>
              </div>

              {/* Items Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Items to deliver</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeDelivery.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 m-2 text-gray-400" />
                        )}
                      </div>
                      <span className="flex-1 text-gray-700 truncate">{item.productName}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveDelivery(null)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Open URL in new tab for customer to access on their phone
                    window.open(activeDelivery.confirmationUrl, '_blank')
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Open Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}

// QR Code Scanner Component
function QRScanner({
  onScan,
  onClose
}: {
  onScan: (data: string) => void
  onClose: () => void
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
      const detector = new BarcodeDetector({ formats: ['qr_code'] })

      const scan = async () => {
        if (!videoRef.current?.videoWidth) {
          animationFrame = requestAnimationFrame(scan)
          return
        }

        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            if (qrData) {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
              }
              onScan(qrData)
              return
            }
          }
        } catch (err) {}

        animationFrame = requestAnimationFrame(scan)
      }

      scan()
    } else {
      setError('QR scanning not supported on this device')
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [scanning, onScan])

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <div className="bg-black/80 p-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Scan Delivery QR Code</h2>
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
          <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400" />
          </div>
        </div>
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-black/80 p-4 text-center">
        <p className="text-white/80">Position the QR code within the frame</p>
      </div>
    </div>
  )
}
