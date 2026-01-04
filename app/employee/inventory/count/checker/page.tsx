'use client'

import { useState, useEffect } from 'react'
import { Check, RefreshCw, Edit3, Package, User, Clock, X } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface InventoryCount {
  id: string
  name: string
  status: string
}

interface Product {
  id: string
  name: string
  sku: string
  imageUrl?: string
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
  status: string
  countedAt: string
  verifiedAt?: string
  correctionNote?: string
  originalCount?: number
  product?: Product
  counter?: { id: string; firstName: string; lastName: string }
  checker?: { id: string; firstName: string; lastName: string }
}

type FilterStatus = 'all' | 'COUNTED' | 'VERIFIED' | 'RECOUNT_NEEDED' | 'CORRECTED'

export default function CheckerPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
  const [items, setItems] = useState<CountItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('COUNTED')
  const [filterCounter, setFilterCounter] = useState<string>('')
  const [counters, setCounters] = useState<{ id: string; name: string }[]>([])

  // Correction modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CountItem | null>(null)
  const [correctedTotal, setCorrectedTotal] = useState(0)
  const [correctionNote, setCorrectionNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCount) refreshItems()
    }, 30000)
    return () => clearInterval(interval)
  }, [activeCount])

  const loadData = async () => {
    try {
      // Get employee
      const empRes = await fetch('/api/employee/me')
      if (empRes.ok) {
        const empData = await empRes.json()
        setEmployee(empData.employee)
      }

      // Get inventory counts
      const countRes = await fetch('/api/employee/inventory-count')
      if (countRes.ok) {
        const countData = await countRes.json()
        const openCount = countData.counts?.find((c: InventoryCount) => c.status === 'OPEN')
        setActiveCount(openCount || null)

        if (openCount) {
          await loadItems(openCount.id)
        }
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async (countId: string) => {
    try {
      const res = await fetch(`/api/employee/inventory-count/${countId}/items`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])

        // Extract unique counters
        const counterMap = new Map<string, string>()
        data.items?.forEach((item: CountItem) => {
          if (item.counter) {
            counterMap.set(item.counter.id, `${item.counter.firstName} ${item.counter.lastName}`)
          }
        })
        setCounters(Array.from(counterMap.entries()).map(([id, name]) => ({ id, name })))
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    }
  }

  const refreshItems = async () => {
    if (!activeCount) return
    setRefreshing(true)
    await loadItems(activeCount.id)
    setRefreshing(false)
  }

  // Filter items
  const filteredItems = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    if (filterCounter && item.counter?.id !== filterCounter) return false
    return true
  })

  // Status counts
  const statusCounts = {
    all: items.length,
    COUNTED: items.filter(i => i.status === 'COUNTED').length,
    VERIFIED: items.filter(i => i.status === 'VERIFIED').length,
    RECOUNT_NEEDED: items.filter(i => i.status === 'RECOUNT_NEEDED').length,
    CORRECTED: items.filter(i => i.status === 'CORRECTED').length,
  }

  // Actions
  const verifyItem = async (item: CountItem) => {
    if (!employee) return

    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount?.id}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          checkerId: employee.id
        })
      })

      if (res.ok) {
        await refreshItems()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to verify')
      }
    } catch (error) {
      console.error('Verify failed:', error)
    }
  }

  const flagForRecount = async (item: CountItem) => {
    if (!employee) return

    const note = prompt('Why does this need a recount?')
    if (!note) return

    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount?.id}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recount',
          checkerId: employee.id,
          correctionNote: note
        })
      })

      if (res.ok) {
        await refreshItems()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to flag for recount')
      }
    } catch (error) {
      console.error('Recount flag failed:', error)
    }
  }

  const openCorrectionModal = (item: CountItem) => {
    setSelectedItem(item)
    setCorrectedTotal(item.countedTotal)
    setCorrectionNote('')
    setShowCorrectionModal(true)
  }

  const submitCorrection = async () => {
    if (!employee || !selectedItem || !correctionNote.trim()) {
      alert('Please provide a correction note')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount?.id}/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'correct',
          checkerId: employee.id,
          correctedTotal,
          correctionNote: correctionNote.trim()
        })
      })

      if (res.ok) {
        setShowCorrectionModal(false)
        await refreshItems()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to submit correction')
      }
    } catch (error) {
      console.error('Correction failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    )
  }

  if (!activeCount) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
        <Package className="w-16 h-16 text-slate-500" />
        <h2 className="text-xl font-bold text-white">No Active Count Session</h2>
        <p className="text-slate-400 text-center">
          Start a count session from the Count tab first.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats */}
      <div className="p-4 bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Checker Dashboard</h2>
          <button
            onClick={refreshItems}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'COUNTED', label: 'Pending' },
            { key: 'VERIFIED', label: 'Verified' },
            { key: 'RECOUNT_NEEDED', label: 'Recount' },
            { key: 'CORRECTED', label: 'Corrected' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as FilterStatus)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filterStatus === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {label} ({statusCounts[key as FilterStatus]})
            </button>
          ))}
        </div>

        {/* Counter filter */}
        {counters.length > 0 && (
          <div className="mt-3">
            <select
              value={filterCounter}
              onChange={(e) => setFilterCounter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">All Counters</option>
              {counters.map((counter) => (
                <option key={counter.id} value={counter.id}>
                  {counter.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No items to show
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 rounded-xl p-4"
            >
              {/* Product Info */}
              <div className="flex items-start gap-3 mb-3">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product?.name}
                    className="w-12 h-12 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.product?.name}</p>
                  <p className="text-slate-400 text-sm">{item.product?.sku}</p>
                </div>
                {/* Status badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  item.status === 'VERIFIED' ? 'bg-green-600 text-white' :
                  item.status === 'RECOUNT_NEEDED' ? 'bg-yellow-600 text-white' :
                  item.status === 'CORRECTED' ? 'bg-blue-600 text-white' :
                  'bg-slate-600 text-white'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Count details */}
              <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                <div>
                  <p className="text-slate-400 text-xs">Expected</p>
                  <p className="text-white font-bold">{item.expectedQuantity}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Counted</p>
                  <p className="text-white font-bold">
                    {item.originalCount !== null && item.originalCount !== undefined ? (
                      <>
                        <span className="line-through text-slate-500 mr-1">{item.originalCount}</span>
                        {item.countedTotal}
                      </>
                    ) : (
                      item.countedTotal
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Variance</p>
                  <p className={`font-bold ${
                    item.variance > 0 ? 'text-green-400' :
                    item.variance < 0 ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {item.variance > 0 ? '+' : ''}{item.variance}
                  </p>
                </div>
              </div>

              {/* Counter info */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.counter?.firstName} {item.counter?.lastName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(item.countedAt)}
                </span>
                {item.warehouseLocation && (
                  <span>
                    Loc: {item.warehouseLocation}
                  </span>
                )}
              </div>

              {/* Correction note */}
              {item.correctionNote && (
                <div className="bg-slate-700 rounded-lg p-2 mb-3 text-sm text-slate-300">
                  {item.correctionNote}
                </div>
              )}

              {/* Action buttons - only show for pending items */}
              {item.status === 'COUNTED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => verifyItem(item)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Verify
                  </button>
                  <button
                    onClick={() => flagForRecount(item)}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recount
                  </button>
                  <button
                    onClick={() => openCorrectionModal(item)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Correct
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Stats */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{statusCounts.VERIFIED}</p>
            <p className="text-xs text-slate-400">Verified</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{statusCounts.COUNTED}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{statusCounts.CORRECTED}</p>
            <p className="text-xs text-slate-400">Corrected</p>
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Correct Count</h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Product */}
              <div className="flex items-center gap-3">
                {selectedItem.product?.imageUrl ? (
                  <img
                    src={selectedItem.product.imageUrl}
                    alt={selectedItem.product?.name}
                    className="w-12 h-12 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{selectedItem.product?.name}</p>
                  <p className="text-slate-400 text-sm">
                    Original count: {selectedItem.countedTotal} | Expected: {selectedItem.expectedQuantity}
                  </p>
                </div>
              </div>

              {/* Corrected total */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Corrected Total</label>
                <input
                  type="number"
                  value={correctedTotal}
                  onChange={(e) => setCorrectedTotal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl font-bold"
                />
              </div>

              {/* Correction note */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Reason for Correction <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="Why are you correcting this count?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={submitCorrection}
                disabled={saving || !correctionNote.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Correction
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
