'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Plus, Minus, Check, X, ShoppingCart } from 'lucide-react'

interface Store {
  id: string
  businessName: string
}

interface StoreSelectionMenuProps {
  isOpen: boolean
  onClose: () => void
  stores: Store[]
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string | null
  }
  onAddToStore: (storeId: string, storeName: string, quantity: number) => void
  position?: { x: number; y: number }
}

export default function StoreSelectionMenu({
  isOpen,
  onClose,
  stores,
  product,
  onAddToStore,
  position
}: StoreSelectionMenuProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addedStores, setAddedStores] = useState<Set<string>>(new Set())

  // Reset when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantities({})
      setAddedStores(new Set())
    }
  }, [isOpen])

  const getShortName = (businessName: string) => {
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  const handleQuantityChange = (storeId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [storeId]: Math.max(0, (prev[storeId] || 0) + delta)
    }))
  }

  const handleAddToStore = (storeId: string, storeName: string) => {
    const qty = quantities[storeId] || 1
    onAddToStore(storeId, storeName, qty)
    setAddedStores(prev => new Set([...prev, storeId]))

    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [storeId]: 0 }))

    // Auto-close after a brief delay if all done
    setTimeout(() => {
      if (addedStores.size + 1 === stores.length) {
        onClose()
      }
    }, 500)
  }

  const handleQuickAddAll = () => {
    stores.forEach(store => {
      const qty = quantities[store.id] || 1
      if (qty > 0) {
        onAddToStore(store.id, getShortName(store.businessName), qty)
      }
    })
    onClose()
  }

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            style={{
              left: position ? Math.min(position.x, window.innerWidth - 320) : '50%',
              top: position ? Math.min(position.y, window.innerHeight - 400) : '50%',
              transform: position ? 'none' : 'translate(-50%, -50%)',
              width: 'min(320px, 90vw)',
              maxHeight: '80vh'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">Add to Store</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-emerald-100 text-sm line-clamp-1">{product.name}</p>
              <p className="text-emerald-200 text-xs">${product.price.toFixed(2)} per case</p>
            </div>

            {/* Store List */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {stores.map((store) => {
                const qty = quantities[store.id] || 0
                const isAdded = addedStores.has(store.id)

                return (
                  <div
                    key={store.id}
                    className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors ${
                      isAdded
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Building2 className={`w-5 h-5 ${isAdded ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isAdded ? 'text-emerald-400' : 'text-white'}`}>
                        {getShortName(store.businessName)}
                      </p>
                    </div>

                    {isAdded ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Added</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-slate-700 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(store.id, -1)}
                            className="p-1.5 hover:bg-slate-600 rounded-l-lg transition-colors"
                            disabled={qty === 0}
                          >
                            <Minus className="w-3 h-3 text-slate-300" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-white">
                            {qty || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(store.id, 1)}
                            className="p-1.5 hover:bg-slate-600 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-300" />
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddToStore(store.id, getShortName(store.businessName))}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
              <button
                onClick={handleQuickAddAll}
                disabled={totalQuantity === 0 && addedStores.size === 0}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  totalQuantity === 0 && addedStores.size === 0
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to All Stores
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
