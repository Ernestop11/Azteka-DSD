'use client'

import { useState, useEffect } from 'react'
import { Flag, Package, MapPin, Calendar, Check, X } from 'lucide-react'

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
  countedTotal: number
  warehouseLocation?: string
  needsDateCheck: boolean
  expirationDate?: string
  countedAt: string
  product?: Product
  counter?: { firstName: string; lastName: string }
}

export default function FlaggedPage() {
  const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
  const [flaggedItems, setFlaggedItems] = useState<CountItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLocation, setFilterLocation] = useState('')
  const [locations, setLocations] = useState<string[]>([])

  // Date entry modal
  const [showDateModal, setShowDateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CountItem | null>(null)
  const [expirationDate, setExpirationDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get inventory counts
      const countRes = await fetch('/api/employee/inventory-count')
      if (countRes.ok) {
        const countData = await countRes.json()
        const openCount = countData.counts?.find((c: InventoryCount) => c.status === 'OPEN')
        setActiveCount(openCount || null)

        if (openCount) {
          await loadFlaggedItems(openCount.id)
        }
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFlaggedItems = async (countId: string) => {
    try {
      const res = await fetch(`/api/employee/inventory-count/${countId}/items?needsDateCheck=true`)
      if (res.ok) {
        const data = await res.json()
        setFlaggedItems(data.items || [])

        // Extract unique locations
        const locs = new Set<string>()
        data.items?.forEach((item: CountItem) => {
          if (item.warehouseLocation) {
            // Get first character (aisle)
            const aisle = item.warehouseLocation.split('-')[0]
            if (aisle) locs.add(aisle)
          }
        })
        setLocations(Array.from(locs).sort())
      }
    } catch (error) {
      console.error('Failed to load flagged items:', error)
    }
  }

  // Filter items by location
  const filteredItems = flaggedItems.filter(item => {
    if (!filterLocation) return true
    return item.warehouseLocation?.startsWith(filterLocation)
  })

  // Open date entry modal
  const openDateModal = (item: CountItem) => {
    setSelectedItem(item)
    setExpirationDate(item.expirationDate ? item.expirationDate.split('T')[0] : '')
    setShowDateModal(true)
  }

  // Clear flag without setting date
  const clearFlag = async (item: CountItem) => {
    if (!activeCount) return

    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount.id}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_flag'
        })
      })

      if (res.ok) {
        await loadFlaggedItems(activeCount.id)
      }
    } catch (error) {
      console.error('Failed to clear flag:', error)
    }
  }

  // Save expiration date and clear flag
  const saveExpiration = async () => {
    if (!activeCount || !selectedItem) return

    setSaving(true)
    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount.id}/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_flag',
          expirationDate: expirationDate || null
        })
      })

      if (res.ok) {
        setShowDateModal(false)
        await loadFlaggedItems(activeCount.id)
      }
    } catch (error) {
      console.error('Failed to save expiration:', error)
    } finally {
      setSaving(false)
    }
  }

  // Quick expiration presets
  const setExpirationPreset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setExpirationDate(date.toISOString().split('T')[0])
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="text-white font-bold">Flagged for Date Check</h2>
          </div>
          <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
            {flaggedItems.length}
          </span>
        </div>

        {/* Location filter */}
        {locations.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setFilterLocation('')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                !filterLocation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              All Locations
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setFilterLocation(loc)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filterLocation === loc
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                Aisle {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Flag className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>No flagged items</p>
            <p className="text-sm">Products that need date verification will appear here</p>
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
                    className="w-14 h-14 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Package className="w-7 h-7 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.product?.name}</p>
                  <p className="text-slate-400 text-sm">{item.product?.sku}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {item.warehouseLocation && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {item.warehouseLocation}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {item.countedTotal} units
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <Flag className="w-4 h-4" />
                </div>
              </div>

              {/* Counter info */}
              <div className="text-xs text-slate-500 mb-3">
                Counted by {item.counter?.firstName} {item.counter?.lastName}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openDateModal(item)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Set Expiration
                </button>
                <button
                  onClick={() => clearFlag(item)}
                  className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Date Entry Modal */}
      {showDateModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Set Expiration Date</h3>
              <button
                onClick={() => setShowDateModal(false)}
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
                    Location: {selectedItem.warehouseLocation || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Date input */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-slate-400 text-sm mb-2">Quick Set</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '30 days', days: 30 },
                    { label: '60 days', days: 60 },
                    { label: '90 days', days: 90 },
                    { label: '6 months', days: 180 },
                    { label: '1 year', days: 365 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setExpirationPreset(preset.days)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={saveExpiration}
                disabled={saving}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save & Clear Flag
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
