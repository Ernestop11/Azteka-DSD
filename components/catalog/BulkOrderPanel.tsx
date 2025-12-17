'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, Store } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface StoreOrder {
  storeId: string
  storeName: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
}

interface BulkOrderPanelProps {
  stores: Array<{ id: string; name: string }>
  onOrderSubmit?: (orders: StoreOrder[]) => void
}

export default function BulkOrderPanel({
  stores,
  onOrderSubmit,
}: BulkOrderPanelProps) {
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')

  const addStore = () => {
    if (!selectedStore) return
    const store = stores.find(s => s.id === selectedStore)
    if (!store) return

    if (storeOrders.find(so => so.storeId === selectedStore)) {
      alert('Store already added')
      return
    }

    setStoreOrders([...storeOrders, {
      storeId: selectedStore,
      storeName: store.name,
      items: [],
    }])
    setSelectedStore('')
  }

  const removeStore = (storeId: string) => {
    setStoreOrders(storeOrders.filter(so => so.storeId !== storeId))
  }

  const addItemToStore = (storeId: string, product: { id: string; name: string; price: number }) => {
    setStoreOrders(storeOrders.map(so => {
      if (so.storeId !== storeId) return so
      const existingItem = so.items.find(item => item.productId === product.id)
      if (existingItem) {
        return {
          ...so,
          items: so.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return {
        ...so,
        items: [...so.items, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
        }],
      }
    }))
  }

  const updateItemQuantity = (storeId: string, productId: string, delta: number) => {
    setStoreOrders(storeOrders.map(so => {
      if (so.storeId !== storeId) return so
      return {
        ...so,
        items: so.items.map(item => {
          if (item.productId !== productId) return item
          const newQuantity = Math.max(0, item.quantity + delta)
          if (newQuantity === 0) {
            return null
          }
          return { ...item, quantity: newQuantity }
        }).filter(Boolean) as typeof so.items,
      }
    }))
  }

  const calculateTotal = (items: StoreOrder['items']) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  const handleSubmit = async () => {
    if (storeOrders.length === 0) {
      alert('Please add at least one store')
      return
    }

    if (storeOrders.some(so => so.items.length === 0)) {
      alert('All stores must have at least one item')
      return
    }

    try {
      const response = await fetch('/api/multiorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeOrders: storeOrders.map(so => ({
            storeId: so.storeId,
            items: so.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          })),
          totalAmount: storeOrders.reduce((sum, so) => sum + calculateTotal(so.items), 0),
        }),
      })

      if (!response.ok) throw new Error('Failed to submit order')

      if (onOrderSubmit) {
        onOrderSubmit(storeOrders)
      }

      // Reset
      setStoreOrders([])
      alert('Bulk order submitted successfully!')
    } catch (error) {
      console.error('Bulk order error:', error)
      alert('Failed to submit bulk order')
    }
  }

  const grandTotal = storeOrders.reduce((sum, so) => sum + calculateTotal(so.items), 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-5 h-5" />
          Multi-Store Order
        </h3>
        <button
          onClick={addStore}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {/* Store Selector */}
      <div className="flex gap-2">
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a store...</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Store Orders */}
      <div className="space-y-4">
        {storeOrders.map((storeOrder) => (
          <div key={storeOrder.storeId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{storeOrder.storeName}</h4>
              <button
                onClick={() => removeStore(storeOrder.storeId)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {storeOrder.items.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No items added</p>
            ) : (
              <div className="space-y-2">
                {storeOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.productName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(storeOrder.storeId, item.productId, -1)}
                        className="p-1 bg-white rounded hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(storeOrder.storeId, item.productId, 1)}
                        className="p-1 bg-white rounded hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="w-20 text-right font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                  <span>Store Total:</span>
                  <span>${calculateTotal(storeOrder.items).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grand Total & Submit */}
      {storeOrders.length > 0 && (
        <div className="pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-900">Grand Total:</span>
            <span className="text-2xl font-black text-blue-600">${grandTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-5 h-5" />
            Submit Bulk Order
          </button>
        </div>
      )}
    </div>
  )
}

