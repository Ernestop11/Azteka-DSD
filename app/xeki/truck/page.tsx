'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Camera,
  Barcode
} from 'lucide-react'

interface TruckItem {
  id: string
  productId: string
  name: string
  sku: string
  quantity: number
  lowStock: boolean
  imageUrl: string | null
  price: number
}

export default function TruckInventoryPage() {
  const [items, setItems] = useState<TruckItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    fetchTruckInventory()
  }, [])

  const fetchTruckInventory = async () => {
    // TODO: Connect to real API
    setLoading(false)
    // Mock data
    setItems([
      { id: '1', productId: 'p1', name: 'Jarritos Tamarindo 1.5L', sku: 'JAR-TAM-15', quantity: 24, lowStock: false, imageUrl: null, price: 2.50 },
      { id: '2', productId: 'p2', name: 'Takis Fuego', sku: 'TAK-FUE-4', quantity: 48, lowStock: false, imageUrl: null, price: 1.99 },
      { id: '3', productId: 'p3', name: 'Mazapan De La Rosa', sku: 'MAZ-ROS-12', quantity: 5, lowStock: true, imageUrl: null, price: 0.75 },
      { id: '4', productId: 'p4', name: 'Salsa Valentina 370ml', sku: 'VAL-HOT-370', quantity: 18, lowStock: false, imageUrl: null, price: 1.50 },
      { id: '5', productId: 'p5', name: 'Pulparindo', sku: 'PUL-ORI-20', quantity: 3, lowStock: true, imageUrl: null, price: 0.50 }
    ])
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter(i => i.lowStock).length
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Truck</h1>
          <p className="text-slate-400">Inventory on vehicle</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Barcode className="w-4 h-4" />
          Scan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Package className="w-4 h-4" />
            Total Items
          </div>
          <p className="text-2xl font-bold text-white">{totalItems}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Low Stock
          </div>
          <p className="text-2xl font-bold text-orange-400">{lowStockItems}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredItems.map(item => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-white font-medium truncate pr-2">{item.name}</h3>
                      {item.lowStock && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                          Low
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">SKU: {item.sku}</p>
                    <p className="text-blue-400 text-sm mt-1">{formatCurrency(item.price)} each</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-lg font-bold ${item.lowStock ? 'text-orange-400' : 'text-white'}`}>
                    {item.quantity} units
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                      <Minus className="w-4 h-4 text-slate-300" />
                    </button>
                    <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Restock Button */}
      <div className="mt-6">
        <a
          href="/xeki/restock"
          className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl text-center transition-all"
        >
          Request Restock ({lowStockItems} items low)
        </a>
      </div>
    </div>
  )
}
