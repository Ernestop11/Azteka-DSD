'use client'

/**
 * Employee Receiving Page
 *
 * Employees claim and process receiving tasks here:
 * - View available receiving tasks
 * - Claim a task (first come first serve)
 * - Scan items with barcode scanner
 * - Track progress
 * - Complete receiving
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Truck,
  ScanBarcode,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Clock,
  Plus,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Hash,
  Boxes,
  RefreshCw
} from 'lucide-react'
import BarcodeScanner from '@/components/scanner/BarcodeScanner'

interface POItem {
  id: string
  vendorSku: string
  description: string
  quantityOrdered: number
  quantityReceived: number
  unitCost: number
  unitsPerCase: number
  sellableUnits: number | null
  isNewProduct: boolean
  lotNumber: string | null
  expirationDate: string | null
  warehouseLocation: string | null
  product?: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
  } | null
}

interface PurchaseOrder {
  id: string
  poNumber: string | null
  status: string
  subtotal: number
  shippingCost: number
  total: number
  vendor: {
    id: string
    name: string
  } | null
  items: POItem[]
}

interface ReceivingTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  purchaseOrder: PurchaseOrder | null
}

interface AvailableTask {
  id: string
  title: string
  description: string | null
  priority: string
  createdAt: string
  purchaseOrder: {
    id: string
    poNumber: string | null
    vendor: { id: string; name: string } | null
    _count: { items: number }
  } | null
}

// Location presets
const AISLE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SHELF_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export default function ReceivingPage() {
  const router = useRouter()

  // State
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<ReceivingTask | null>(null)
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([])
  const [claiming, setClaiming] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<{
    item: POItem
    quantityAdded: number
    isComplete: boolean
    isOverReceiving: boolean
    progress: number
  } | null>(null)

  // Manual entry
  const [manualSku, setManualSku] = useState('')

  // Item details modal
  const [selectedItem, setSelectedItem] = useState<POItem | null>(null)
  const [editLocation, setEditLocation] = useState('')
  const [editLotNumber, setEditLotNumber] = useState('')
  const [editExpiration, setEditExpiration] = useState('')
  const [isMasterCase, setIsMasterCase] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Completion notes
  const [completionNotes, setCompletionNotes] = useState('')
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // Fetch receiving data
  const fetchReceivingData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/employee/receiving')
      if (!res.ok) throw new Error('Failed to fetch receiving data')

      const data = await res.json()

      if (data.data.status === 'active') {
        setActiveTask(data.data.task)
        setAvailableTasks([])
      } else {
        setActiveTask(null)
        setAvailableTasks(data.data.availableTasks || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReceivingData()
  }, [fetchReceivingData])

  // Claim a task
  const handleClaim = async (taskId: string) => {
    setClaiming(true)
    setError('')

    try {
      const res = await fetch('/api/employee/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to claim task')
      }

      const data = await res.json()
      setActiveTask(data.data)
      setAvailableTasks([])
      setSuccess('Task claimed! Ready to start receiving.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim task')
    } finally {
      setClaiming(false)
    }
  }

  // Handle barcode scan
  const handleScan = async (code: string) => {
    if (!activeTask) return

    setError('')
    setLastScanResult(null)

    try {
      const res = await fetch('/api/employee/receiving/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTask.id,
          sku: code,
          quantity: quantity,
          isMasterCase: isMasterCase,
          lotNumber: editLotNumber || undefined,
          expirationDate: editExpiration || undefined,
          location: editLocation || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        // Play error sound
        if (navigator.vibrate) navigator.vibrate([100, 50, 100])
        setError(data.error || 'Item not found on this PO')
        return
      }

      setLastScanResult(data.data)

      // Update local state
      if (activeTask.purchaseOrder) {
        const updatedItems = activeTask.purchaseOrder.items.map(item =>
          item.id === data.data.item.id ? data.data.item : item
        )
        setActiveTask({
          ...activeTask,
          purchaseOrder: {
            ...activeTask.purchaseOrder,
            items: updatedItems
          }
        })
      }

      // Reset quantity and master case toggle
      setQuantity(1)
      setIsMasterCase(false)

      // Check if all items are complete
      if (data.data.allComplete) {
        setSuccess('All items received! Ready to complete.')
      }
    } catch (err) {
      setError('Failed to process scan')
    }
  }

  // Handle manual SKU entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualSku.trim()) {
      handleScan(manualSku.trim())
      setManualSku('')
    }
  }

  // Complete receiving
  const handleComplete = async () => {
    if (!activeTask) return

    setCompleting(true)
    setError('')

    try {
      const res = await fetch('/api/employee/receiving/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTask.id,
          notes: completionNotes
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to complete receiving')
      }

      const data = await res.json()

      setSuccess(
        `Receiving completed! ${data.data.stats.productsUpdated} products updated, ` +
        `${data.data.stats.workOrdersCreated} work orders created.`
      )

      setShowCompleteModal(false)
      setActiveTask(null)
      setCompletionNotes('')

      // Refresh to show available tasks
      setTimeout(() => {
        fetchReceivingData()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete')
    } finally {
      setCompleting(false)
    }
  }

  // Calculate progress
  const getProgress = () => {
    if (!activeTask?.purchaseOrder?.items) return { received: 0, total: 0, percent: 0 }
    const items = activeTask.purchaseOrder.items
    const total = items.reduce((sum, i) => sum + i.quantityOrdered, 0)
    const received = items.reduce((sum, i) => sum + i.quantityReceived, 0)
    const percent = total > 0 ? Math.round((received / total) * 100) : 0
    return { received, total, percent }
  }

  const progress = getProgress()

  // Count new products
  const newProductCount = activeTask?.purchaseOrder?.items.filter(i => i.isNewProduct).length || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading receiving...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/employee')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Receiving</h1>
              {activeTask && (
                <p className="text-sm text-slate-400">
                  {activeTask.purchaseOrder?.vendor?.name || 'Unknown Vendor'}
                </p>
              )}
            </div>
          </div>
          <button onClick={fetchReceivingData} className="p-2 hover:bg-slate-700 rounded-lg">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-sm text-red-400 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-4 mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300">{success}</p>
        </div>
      )}

      {/* No Active Task - Show Available Tasks */}
      {!activeTask && (
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Available Receiving Tasks
          </h2>

          {availableTasks.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl p-8 text-center">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No receiving tasks available</p>
              <p className="text-slate-500 text-sm mt-1">Check back later for new shipments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{task.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {task.purchaseOrder?._count?.items || 0} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaim(task.id)}
                      disabled={claiming}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {claiming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Claim'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Task - Receiving Interface */}
      {activeTask && activeTask.purchaseOrder && (
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-bold">
                {progress.received} / {progress.total} ({progress.percent}%)
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {newProductCount > 0 && (
              <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{newProductCount} new product{newProductCount > 1 ? 's' : ''} on this PO</span>
              </div>
            )}
          </div>

          {/* Scanner Section */}
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setScannerOpen(!scannerOpen)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${scannerOpen ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <Camera className={`w-5 h-5 ${scannerOpen ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className="font-medium text-white">
                  {scannerOpen ? 'Scanner Active' : 'Open Scanner'}
                </span>
              </div>
              {scannerOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {scannerOpen && (
              <div className="px-4 pb-4">
                <BarcodeScanner
                  onScan={handleScan}
                  isActive={scannerOpen}
                  className="mb-4"
                />

                {/* Scan Options */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Quantity</label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 bg-slate-700 rounded-l-lg text-white"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-16 text-center bg-slate-700 text-white py-2 border-x border-slate-600"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 bg-slate-700 rounded-r-lg text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Master Case?</label>
                    <button
                      onClick={() => setIsMasterCase(!isMasterCase)}
                      className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                        isMasterCase
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Boxes className="w-4 h-4" />
                      {isMasterCase ? 'Yes' : 'No'}
                    </button>
                  </div>
                </div>

                {/* Manual Entry */}
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    placeholder="Enter SKU manually..."
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                  >
                    <ScanBarcode className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Last Scan Result */}
          {lastScanResult && (
            <div className={`rounded-xl p-4 border ${
              lastScanResult.isOverReceiving
                ? 'bg-amber-500/20 border-amber-500/50'
                : lastScanResult.isComplete
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-blue-500/20 border-blue-500/50'
            }`}>
              <div className="flex items-start gap-3">
                {lastScanResult.isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : lastScanResult.isOverReceiving ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <Check className="w-6 h-6 text-blue-400" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">
                    +{lastScanResult.quantityAdded}x {lastScanResult.item.description}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    {lastScanResult.item.quantityReceived} / {lastScanResult.item.quantityOrdered} received
                    {lastScanResult.isOverReceiving && ' (over-receiving)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-medium text-white">Items to Receive</h3>
            </div>
            <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
              {activeTask.purchaseOrder.items.map(item => {
                const isComplete = item.quantityReceived >= item.quantityOrdered
                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-4 ${
                      item.isNewProduct ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      {isComplete ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {item.quantityReceived}
                        </span>
                      )}
                    </div>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-mono">
                          {item.vendorSku}
                        </span>
                        {item.product?.sku && (
                          <span className="text-xs text-blue-400 font-mono">
                            → {item.product.sku}
                          </span>
                        )}
                        {item.isNewProduct && (
                          <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="text-right">
                      <p className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                        {item.quantityReceived}/{item.quantityOrdered}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.unitsPerCase || 1} per case
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Complete Button */}
          <button
            onClick={() => setShowCompleteModal(true)}
            disabled={progress.percent < 100}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
              progress.percent >= 100
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            Complete Receiving
          </button>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-slate-800 rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Complete Receiving</h2>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Items Received</span>
                  <span className="font-bold text-white">{progress.received}</span>
                </div>
                {newProductCount > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-400">New Products</span>
                    <span className="font-bold text-amber-400">{newProductCount}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Notes (optional)</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Any issues or comments..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm & Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
