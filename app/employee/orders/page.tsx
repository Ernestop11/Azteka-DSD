'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ClipboardList,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Camera,
  X,
  MapPin,
  Printer,
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Check,
  Truck,
  Bluetooth,
  Tag
} from 'lucide-react'
import Image from 'next/image'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
    warehouseLocation: string | null
    unitsPerCase: number
  }
  picked?: boolean
}

interface Order {
  id: string
  status: string
  customerName: string
  total: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  picking: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  picking: Package,
  packed: CheckCircle2,
  shipped: Truck,
  delivered: Check,
}

export default function OrderPickingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [pickedItems, setPickedItems] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [currentScanItem, setCurrentScanItem] = useState<OrderItem | null>(null)
  const [btDevice, setBtDevice] = useState<any>(null)
  const [btCharacteristic, setBtCharacteristic] = useState<any>(null)
  const [btConnecting, setBtConnecting] = useState(false)
  const [btStatus, setBtStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/employee/orders')
        const data = await res.json()
        if (data.data) {
          setOrders(data.data)
        }
      } catch (err) {
        console.error('Failed to load orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  // Filter orders by status
  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true
    return o.status.toLowerCase() === statusFilter
  })

  // Connect to Bluetooth thermal printer
  const connectBluetoothPrinter = async () => {
    if (!('bluetooth' in navigator)) {
      setError('Bluetooth not supported on this device')
      return
    }

    setBtConnecting(true)
    setBtStatus('connecting')

    try {
      // Request Bluetooth device - common thermal printer service UUIDs
      // @ts-ignore - Web Bluetooth API
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'BT' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Phomemo' },
          { namePrefix: 'M220' },
          { namePrefix: 'M200' },
          { namePrefix: 'M110' },
          { namePrefix: 'ZQ' },
          { namePrefix: 'QL' },
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Nordic UART
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Phomemo
        ]
      })

      setBtDevice(device)

      // Connect to GATT server
      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to printer')

      // Try to find the printer service and characteristic
      const services = await server.getPrimaryServices()

      for (const service of services) {
        const characteristics = await service.getCharacteristics()
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            setBtCharacteristic(char)
            setBtStatus('connected')
            setSuccess(`Connected to ${device.name || 'Bluetooth Printer'}`)
            setTimeout(() => setSuccess(''), 3000)
            return
          }
        }
      }

      throw new Error('No writable characteristic found')
    } catch (err: any) {
      console.error('Bluetooth connection error:', err)
      setBtStatus('disconnected')
      if (err.name !== 'NotFoundError') {
        setError(err.message || 'Failed to connect to printer')
      }
    } finally {
      setBtConnecting(false)
    }
  }

  // Print sticker via Bluetooth
  const printItemSticker = async (item: OrderItem, orderId: string) => {
    if (!btCharacteristic) {
      setError('Printer not connected')
      return
    }

    try {
      // ESC/POS commands for thermal printer
      const encoder = new TextEncoder()

      // Initialize printer + set alignment center
      const initCmd = new Uint8Array([0x1B, 0x40, 0x1B, 0x61, 0x01])

      // Text content
      const textContent = [
        '========================',
        item.product.name.substring(0, 24).toUpperCase(),
        '------------------------',
        `SKU: ${item.product.sku}`,
        `Qty: ${item.quantity} ${item.product.unitsPerCase ? `(${item.product.unitsPerCase}ct)` : 'pcs'}`,
        `Order: #${orderId.slice(-8)}`,
        `Packed: ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        '========================',
        '\n\n\n' // Feed paper
      ].join('\n')

      const textBytes = encoder.encode(textContent)

      // Cut paper command (if supported)
      const cutCmd = new Uint8Array([0x1D, 0x56, 0x00])

      // Send commands
      await btCharacteristic.writeValue(initCmd)
      await btCharacteristic.writeValue(textBytes)
      await btCharacteristic.writeValue(cutCmd)

      setSuccess(`Printed sticker for ${item.product.name}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      console.error('Print error:', err)
      setError('Print failed: ' + (err.message || 'Unknown error'))
    }
  }

  // Print all stickers for an order
  const printAllStickers = async (order: Order) => {
    if (!btCharacteristic) {
      setError('Printer not connected. Click the Bluetooth button to connect.')
      return
    }

    for (const item of order.items) {
      await printItemSticker(item, order.id)
      await new Promise(r => setTimeout(r, 500)) // Small delay between prints
    }

    setSuccess(`Printed ${order.items.length} stickers for order #${order.id.slice(-8)}`)
  }

  // Start picking an order
  const startPicking = async (order: Order) => {
    setSelectedOrder(order)
    setPickedItems({})
    setError('')
    setSuccess('')

    // Update status to picking if pending
    if (order.status.toLowerCase() === 'pending') {
      try {
        await fetch(`/api/employee/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'picking' })
        })

        setOrders(prev => prev.map(o =>
          o.id === order.id ? { ...o, status: 'picking' } : o
        ))
      } catch (err) {
        console.error('Failed to update order status:', err)
      }
    }
  }

  // Mark item as picked
  const toggleItemPicked = (itemId: string) => {
    setPickedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  // Handle barcode scan for picking
  const handleScanPick = (barcode: string) => {
    if (!currentScanItem) return

    // Check if scanned barcode matches the item's SKU
    if (barcode === currentScanItem.product.sku) {
      toggleItemPicked(currentScanItem.id)
      setSuccess(`Picked: ${currentScanItem.product.name}`)
      setTimeout(() => setSuccess(''), 2000)
    } else {
      setError(`Scanned SKU (${barcode}) does not match expected (${currentScanItem.product.sku})`)
      setTimeout(() => setError(''), 3000)
    }

    setScannerOpen(false)
    setCurrentScanItem(null)
  }

  // Complete picking and mark as packed
  const completePicking = async () => {
    if (!selectedOrder) return

    // Check if all items are picked
    const allPicked = selectedOrder.items.every(item => pickedItems[item.id])
    if (!allPicked) {
      setError('Please pick all items before completing')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/employee/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'packed' })
      })

      if (!res.ok) {
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? { ...o, status: 'packed' } : o
      ))

      setSuccess('Order packed successfully! Ready for QR code printing.')
      setSelectedOrder(null)
      setPickedItems({})
    } catch (err: any) {
      setError(err.message || 'Failed to complete picking')
    } finally {
      setSaving(false)
    }
  }

  // Print QR code packing slip
  const printPackingSlip = (order: Order) => {
    // Generate QR code data
    const qrData = JSON.stringify({
      orderId: order.id,
      customer: order.customerName,
      total: order.total,
      items: order.items.length
    })

    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Packing Slip - Order ${order.id.slice(-8)}</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .qr { text-align: center; margin: 20px 0; }
            .details { margin-top: 20px; }
            .item { padding: 8px 0; border-bottom: 1px solid #eee; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Azteka DSD</h2>
            <h3>Packing Slip</h3>
            <p>Order #${order.id.slice(-8)}</p>
          </div>
          <div class="qr">
            <canvas id="qrcode"></canvas>
          </div>
          <div class="details">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
            <p><strong>Items:</strong></p>
            ${order.items.map(item => `
              <div class="item">
                ${item.quantity}x ${item.product.name} (${item.product.sku})
              </div>
            `).join('')}
          </div>
          <script>
            QRCode.toCanvas(document.getElementById('qrcode'), '${btoa(qrData)}', { width: 200 }, function(error) {
              if (!error) {
                setTimeout(() => { window.print(); }, 500);
              }
            });
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
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
            <h1 className="text-2xl font-bold text-gray-900">Order Picking</h1>
            <p className="text-gray-600">Pick and pack orders for delivery</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Bluetooth Printer Button */}
            <button
              onClick={connectBluetoothPrinter}
              disabled={btConnecting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                btStatus === 'connected'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                  : btStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bluetooth className={`w-5 h-5 ${btStatus === 'connected' ? 'text-blue-600' : ''}`} />
              )}
              <span className="hidden sm:inline">
                {btStatus === 'connected' ? btDevice?.name || 'Printer' : btStatus === 'connecting' ? 'Connecting...' : 'Connect Printer'}
              </span>
            </button>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{filteredOrders.length}</p>
              <p className="text-sm text-gray-500">orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['pending', 'picking', 'packed', 'shipped', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusIcons[order.status.toLowerCase()] || Clock
          const isExpanded = expandedOrder === order.id

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[order.status.toLowerCase()] || 'bg-gray-100'}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            {item.product.warehouseLocation && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.product.warehouseLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => startPicking(order)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        Start Picking
                      </button>
                    )}
                    {order.status.toLowerCase() === 'packed' && (
                      <>
                        <button
                          onClick={() => printPackingSlip(order)}
                          className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                        >
                          <Printer className="w-5 h-5" />
                          Print QR Slip
                        </button>
                        <button
                          onClick={() => printAllStickers(order)}
                          disabled={btStatus !== 'connected'}
                          className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                            btStatus === 'connected'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Tag className="w-5 h-5" />
                          Print Stickers
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Picking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pick Order #{selectedOrder.id.slice(-8)}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Success/Error Messages */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Progress */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">
                    {Object.values(pickedItems).filter(Boolean).length} / {selectedOrder.items.length} items
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${(Object.values(pickedItems).filter(Boolean).length / selectedOrder.items.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Pick List */}
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      pickedItems[item.id]
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleItemPicked(item.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          pickedItems[item.id]
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {pickedItems[item.id] ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{item.quantity}</span>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${pickedItems[item.id] ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500 font-mono">{item.product.sku}</span>
                          {item.product.warehouseLocation && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <MapPin className="w-3 h-3" />
                              {item.product.warehouseLocation}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentScanItem(item)
                          setScannerOpen(true)
                        }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Scan barcode"
                      >
                        <ScanBarcode className="w-5 h-5 text-gray-600" />
                      </button>
                      {btStatus === 'connected' && (
                        <button
                          onClick={() => printItemSticker(item, selectedOrder.id)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Print sticker"
                        >
                          <Tag className="w-5 h-5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Button */}
              <button
                onClick={completePicking}
                disabled={saving || !selectedOrder.items.every(item => pickedItems[item.id])}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {saving ? 'Completing...' : 'Complete & Pack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <PickScanner
          onScan={handleScanPick}
          onClose={() => {
            setScannerOpen(false)
            setCurrentScanItem(null)
          }}
          expectedSku={currentScanItem?.product.sku || ''}
        />
      )}
    </div>
  )
}

// Barcode Scanner Component for Picking
function PickScanner({
  onScan,
  onClose,
  expectedSku
}: {
  onScan: (barcode: string) => void
  onClose: () => void
  expectedSku: string
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
          <h2 className="text-white font-semibold">Scan to Pick</h2>
          <p className="text-white/70 text-sm">Expected: {expectedSku}</p>
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
          <div className="w-64 h-48 border-2 border-white/50 rounded-lg" />
        </div>
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-lg">
            <p className="text-white text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
