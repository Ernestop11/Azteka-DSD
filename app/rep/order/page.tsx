'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Customer {
  id: string
  businessName: string
  contactName: string
  priceTier: string
  phone: string
  address: string
  city: string
  state: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  customerPrice?: number
  imageUrl: string | null
  brand?: { name: string } | null
  category?: { name: string } | null
  inStock: boolean
  unitsPerCase?: number
}

interface CartItem {
  product: Product
  quantity: number
}

function OrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = searchParams.get('customer')

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (customerId) {
      loadData()
    }
  }, [customerId])

  const loadData = async () => {
    try {
      // Load customer
      const customerRes = await fetch(`/api/rep/customer/${customerId}`)
      if (customerRes.ok) {
        const data = await customerRes.json()
        setCustomer(data.customer)
      }

      // Load products with customer pricing
      const productsRes = await fetch(`/api/rep/products?customerId=${customerId}`)
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId))
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const getItemPrice = (item: CartItem) => {
    return item.product.customerPrice ?? item.product.price
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  )

  const submitOrder = async () => {
    if (!customer || cart.length === 0) return

    setSubmitting(true)
    try {
      const orderData = {
        customerId: customer.id,
        customerName: customer.businessName,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: getItemPrice(item),
        })),
        total: cartTotal,
        notes: '',
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const data = await res.json()
        // Update last visit date
        await fetch(`/api/rep/customer/${customerId}/visit`, { method: 'POST' })

        alert(`Order #${data.id?.slice(-6) || 'NEW'} submitted successfully!`)
        setCart([])
        router.push('/rep')
      } else {
        const error = await res.json()
        alert(`Failed to submit order: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' ||
      product.category?.name === selectedCategory

    return matchesSearch && matchesCategory && product.inStock
  })

  if (!customerId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No customer selected</p>
          <Link href="/rep" className="text-blue-400 hover:text-blue-300">
            Go back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/rep"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-xl font-bold">{customer?.businessName}</h1>
              <p className="text-slate-400 text-sm">
                {customer?.contactName} • Tier {customer?.priceTier}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${customer?.phone}`}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              📞
            </a>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Product Grid */}
        <div className="flex-1 p-4">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => item.product.id === product.id)
              const displayPrice = product.customerPrice ?? product.price

              return (
                <div
                  key={product.id}
                  className={`bg-slate-800 rounded-xl p-3 transition-all ${
                    inCart ? 'ring-2 ring-emerald-500' : 'hover:bg-slate-750'
                  }`}
                >
                  <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                        📦
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-slate-400 text-xs mb-2">{product.sku}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {product.customerPrice && product.customerPrice < product.price && (
                        <span className="text-slate-500 text-xs line-through ml-1">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 min-h-[calc(100vh-73px)] flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🛒</span> Cart ({cart.length})
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-800 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-emerald-400 text-sm">
                          ${getItemPrice(item).toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold">
                        ${(getItemPrice(item) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={submitOrder}
              disabled={cart.length === 0 || submitting}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${
                cart.length === 0 || submitting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {submitting ? 'Submitting...' : `Submit Order ($${cartTotal.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RepOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <OrderContent />
    </Suspense>
  )
}
