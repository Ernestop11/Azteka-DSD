'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  itemCount: number
  items: OrderItem[]
}

function OrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [session, setSession] = useState<CustomerSession | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(!!success)

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    setSession(parsed)
    loadOrders(parsed.customerId)

    // Hide success message after 5 seconds
    if (success) {
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [router, success])

  const loadOrders = async (customerId: string) => {
    try {
      const res = await fetch(`/api/orders/history/${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing': case 'picking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'packed': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'shipped': case 'in_transit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered': case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳'
      case 'processing': case 'picking': return '📦'
      case 'packed': return '📋'
      case 'shipped': case 'in_transit': return '🚚'
      case 'delivered': case 'completed': return '✅'
      case 'cancelled': return '❌'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-emerald-400 font-bold">Order Placed!</p>
            <p className="text-emerald-300 text-sm">Your order is being prepared</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <p className="text-slate-400 text-sm">Track and reorder from past orders</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold text-white mb-2">No Orders Yet</h2>
          <p className="text-slate-400 mb-6">
            Place your first order to see it here
          </p>
          <Link
            href={`/catalog?customer=${session?.customerId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(order.status)}</span>
                  <div className="text-left">
                    <p className="text-white font-medium">Order #{order.id.slice(-6)}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-emerald-400 font-bold">${Number(order.total).toFixed(2)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Order Details (Expanded) */}
              {expandedOrder === order.id && (
                <div className="border-t border-slate-700/50 p-4 space-y-3">
                  {/* Status Timeline */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <div className={`flex flex-col items-center ${['pending', 'processing', 'picking', 'packed', 'shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'text-emerald-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${['pending', 'processing', 'picking', 'packed', 'shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="mt-1">Placed</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-600 mx-2" />
                    <div className={`flex flex-col items-center ${['processing', 'picking', 'packed', 'shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'text-emerald-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${['processing', 'picking', 'packed', 'shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="mt-1">Processing</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-600 mx-2" />
                    <div className={`flex flex-col items-center ${['shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'text-emerald-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${['shipped', 'in_transit', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="mt-1">Shipped</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-600 mx-2" />
                    <div className={`flex flex-col items-center ${['delivered', 'completed'].includes(order.status.toLowerCase()) ? 'text-emerald-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${['delivered', 'completed'].includes(order.status.toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="mt-1">Delivered</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-medium">Items ({order.itemCount})</p>
                    {order.items?.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{item.quantity}x {item.productName}</span>
                        <span className="text-slate-400">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 5 && (
                      <p className="text-slate-500 text-sm">+{(order.items?.length || 0) - 5} more items</p>
                    )}
                  </div>

                  {/* Reorder Button */}
                  <button
                    onClick={() => {
                      // TODO: Implement reorder from order
                      router.push(`/customer/reorder?from=${order.id}`)
                    }}
                    className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-medium rounded-lg transition-colors border border-emerald-500/30"
                  >
                    Reorder This Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}
