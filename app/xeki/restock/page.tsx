'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Minus,
  Send,
  CheckCircle,
  AlertTriangle,
  Truck
} from 'lucide-react'

interface RestockItem {
  id: string
  name: string
  sku: string
  currentQty: number
  requestedQty: number
  suggestedQty: number
}

export default function RestockPage() {
  const [items, setItems] = useState<RestockItem[]>([
    { id: '1', name: 'Mazapan De La Rosa', sku: 'MAZ-ROS-12', currentQty: 5, requestedQty: 0, suggestedQty: 20 },
    { id: '2', name: 'Pulparindo', sku: 'PUL-ORI-20', currentQty: 3, requestedQty: 0, suggestedQty: 15 },
    { id: '3', name: 'Jarritos Tamarindo 1.5L', sku: 'JAR-TAM-15', currentQty: 24, requestedQty: 0, suggestedQty: 0 },
    { id: '4', name: 'Takis Fuego', sku: 'TAK-FUE-4', currentQty: 48, requestedQty: 0, suggestedQty: 0 },
  ])
  const [submitted, setSubmitted] = useState(false)
  const [notes, setNotes] = useState('')

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, requestedQty: Math.max(0, item.requestedQty + delta) }
        : item
    ))
  }

  const setQuantity = (id: string, qty: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, requestedQty: qty } : item
    ))
  }

  const addSuggested = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item && item.suggestedQty > 0) {
      setQuantity(id, item.suggestedQty)
    }
  }

  const handleSubmit = () => {
    const itemsToRequest = items.filter(i => i.requestedQty > 0)
    if (itemsToRequest.length === 0) {
      alert('Please add items to your restock request')
      return
    }
    // TODO: Connect to real API
    setSubmitted(true)
  }

  const totalItemsRequested = items.reduce((sum, i) => sum + i.requestedQty, 0)
  const lowStockItems = items.filter(i => i.suggestedQty > 0)

  if (submitted) {
    return (
      <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Request Submitted!</h1>
        <p className="text-slate-400 text-center mb-6">
          Your restock request for {totalItemsRequested} items has been sent to the warehouse.
        </p>
        <button
          onClick={() => { setSubmitted(false); setItems(prev => prev.map(i => ({ ...i, requestedQty: 0 }))); setNotes(''); }}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
        >
          New Request
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Request Restock</h1>
        <p className="text-slate-400">Request items to be loaded on your truck</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-orange-400 font-medium">Low Stock Items</h3>
              <p className="text-slate-400 text-sm mt-1">
                {lowStockItems.length} items are running low. Suggested quantities are shown below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Select Items</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {items.map(item => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{item.name}</h3>
                  <p className="text-slate-500 text-sm">SKU: {item.sku}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Current: <span className={item.currentQty <= 5 ? 'text-orange-400' : 'text-white'}>{item.currentQty}</span> units
                  </p>
                </div>
                {item.suggestedQty > 0 && (
                  <button
                    onClick={() => addSuggested(item.id)}
                    className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    +{item.suggestedQty} suggested
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Request qty:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, -5)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                    disabled={item.requestedQty === 0}
                  >
                    <Minus className="w-4 h-4 text-slate-300" />
                  </button>
                  <input
                    type="number"
                    value={item.requestedQty}
                    onChange={(e) => setQuantity(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center bg-slate-700 border border-slate-600 rounded-lg py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, 5)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-slate-400 text-sm mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Summary & Submit */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Total items requested:</span>
          <span className="text-2xl font-bold text-white">{totalItemsRequested}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">SKUs:</span>
          <span className="text-slate-400">{items.filter(i => i.requestedQty > 0).length}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={totalItemsRequested === 0}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Submit Restock Request
      </button>
    </div>
  )
}
