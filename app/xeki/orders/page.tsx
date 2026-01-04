'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle,
  Package
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  inTruck: number
}

interface CartItem {
  product: Product
  quantity: number
}

export default function QuickOrderPage() {
  const [products] = useState<Product[]>([
    { id: '1', name: 'Jarritos Tamarindo 1.5L', sku: 'JAR-TAM-15', price: 2.50, inTruck: 24 },
    { id: '2', name: 'Takis Fuego', sku: 'TAK-FUE-4', price: 1.99, inTruck: 48 },
    { id: '3', name: 'Mazapan De La Rosa', sku: 'MAZ-ROS-12', price: 0.75, inTruck: 5 },
    { id: '4', name: 'Salsa Valentina 370ml', sku: 'VAL-HOT-370', price: 1.50, inTruck: 18 },
    { id: '5', name: 'Pulparindo', sku: 'PUL-ORI-20', price: 0.50, inTruck: 3 },
  ])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.inTruck) }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta
        if (newQty <= 0) return item
        if (newQty > item.product.inTruck) return item
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = () => {
    if (cart.length === 0) return
    // TODO: Connect to real API
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Order Created!</h1>
        <p className="text-slate-400 text-center mb-4">
          {totalItems} items • {formatCurrency(total)}
        </p>
        <p className="text-slate-500 text-sm text-center mb-6">
          The order has been recorded and items will be deducted from your truck inventory.
        </p>
        <button
          onClick={() => { setSubmitted(false); setCart([]); }}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
        >
          New Order
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quick Order</h1>
        <p className="text-slate-400">Create a sale from truck inventory</p>
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

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {filteredProducts.map(product => {
          const inCart = cart.find(item => item.product.id === product.id)
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.inTruck === 0 || (inCart && inCart.quantity >= product.inTruck)}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-blue-400 font-bold">{formatCurrency(product.price)}</p>
              <p className="text-slate-500 text-xs mt-1">{product.inTruck} in truck</p>
              {inCart && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                  {inCart.quantity}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Cart Drawer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-slate-800 border-t border-slate-700 p-4 z-40">
          <div className="max-w-xl mx-auto">
            {/* Cart Items */}
            <div className="max-h-40 overflow-y-auto mb-4 space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{item.product.name}</p>
                    <p className="text-slate-400 text-xs">{formatCurrency(item.product.price)} ea</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="p-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="p-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Submit */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{totalItems} items</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
