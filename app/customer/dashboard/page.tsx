'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  itemCount: number
}

interface FavoriteProduct {
  id: string
  name: string
  imageUrl: string | null
  customerPrice: number
  orderCount: number
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, lastOrderDays: null as number | null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    setSession(parsed)
    loadDashboardData(parsed.customerId)
  }, [router])

  const loadDashboardData = async (customerId: string) => {
    try {
      // Load recent orders
      const ordersRes = await fetch(`/api/orders/history/${customerId}?limit=5`)
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.orders || [])

        // Calculate stats
        const orders = ordersData.orders || []
        const totalOrders = ordersData.totalCount || orders.length
        const totalSpent = orders.reduce((sum: number, o: Order) => sum + Number(o.total), 0)
        const lastOrderDays = orders.length > 0
          ? Math.floor((Date.now() - new Date(orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : null

        setStats({ totalOrders, totalSpent, lastOrderDays })
      }

      // Load favorites
      const favRes = await fetch(`/api/rep/customer/${customerId}/favorites`)
      if (favRes.ok) {
        const favData = await favRes.json()
        setFavorites((favData.favorites || []).slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': case 'picking': return 'bg-blue-500/20 text-blue-400'
      case 'shipped': case 'in_transit': return 'bg-purple-500/20 text-purple-400'
      case 'delivered': case 'completed': return 'bg-emerald-500/20 text-emerald-400'
      default: return 'bg-slate-500/20 text-slate-400'
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
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back! 👋
        </h1>
        <p className="text-emerald-100 mb-4">
          Ready to place your next order?
        </p>
        <Link
          href={`/catalog?customer=${session?.customerId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Order
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
          <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
          <p className="text-xs text-slate-400">Total Orders</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
          <p className="text-2xl font-bold text-emerald-400">${stats.totalSpent.toFixed(0)}</p>
          <p className="text-xs text-slate-400">Total Spent</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
          <p className="text-2xl font-bold text-white">
            {stats.lastOrderDays !== null ? `${stats.lastOrderDays}d` : '—'}
          </p>
          <p className="text-xs text-slate-400">Since Last</p>
        </div>
      </div>

      {/* Quick Reorder Section */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Quick Reorder</h2>
            <Link href="/customer/reorder" className="text-emerald-400 text-sm hover:underline">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {favorites.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/catalog?customer=${session?.customerId}&highlight=${product.id}`}
                className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:border-emerald-500/50 transition-colors"
              >
                <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  )}
                </div>
                <p className="text-xs text-white font-medium line-clamp-2">{product.name}</p>
                <p className="text-xs text-emerald-400">${product.customerPrice.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Recent Orders</h2>
          <Link href="/customer/orders" className="text-emerald-400 text-sm hover:underline">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-slate-400">No orders yet</p>
            <Link
              href={`/catalog?customer=${session?.customerId}`}
              className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Order #{order.id.slice(-6)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                  </span>
                  <span className="text-emerald-400 font-bold">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Section */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Need Help?</p>
            <p className="text-slate-400 text-sm">Chat with your sales rep</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
            Chat
          </button>
        </div>
      </div>
    </div>
  )
}
