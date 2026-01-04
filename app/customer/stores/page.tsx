'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, ChevronRight, Package, TrendingUp, Clock, Plus, Users } from 'lucide-react'

interface SubStore {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
  lastOrderDate: string | null
  orderCount: number
  totalSpent: number
}

interface StoreStats {
  totalStores: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export default function CustomerStoresPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ customerId: string; businessName: string; role: string } | null>(null)
  const [stores, setStores] = useState<SubStore[]>([])
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<SubStore | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored)
    if (parsed.role !== 'OWNER') {
      router.replace('/customer/dashboard')
      return
    }

    setSession(parsed)
    loadStores(parsed.customerId)
  }, [router])

  const loadStores = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/customer/stores?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setStores(data.stores || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const startOrderForStore = (storeId: string) => {
    // Set the selected store and redirect to catalog
    sessionStorage.setItem('delegatedStoreId', storeId)
    router.push(`/catalog?customer=${storeId}&delegated=true`)
  }

  const getDaysSince = (date: string | null) => {
    if (!date) return null
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      {/* Header Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Stores</h1>
        <p className="text-slate-400 text-sm">Manage orders for all your locations</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Locations</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalStores}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Avg Order</span>
            </div>
            <p className="text-2xl font-bold text-white">${stats.averageOrderValue.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Stores List */}
      <div className="space-y-3">
        {stores.map((store) => {
          const daysSinceOrder = getDaysSince(store.lastOrderDate)
          const needsAttention = daysSinceOrder !== null && daysSinceOrder > 14

          return (
            <div
              key={store.id}
              className={`bg-slate-800 rounded-xl p-4 border ${
                needsAttention ? 'border-amber-500/50' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{store.businessName}</h3>
                  <p className="text-sm text-slate-400">{store.contactName}</p>
                </div>
                {needsAttention && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                    {daysSinceOrder}d ago
                  </span>
                )}
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-white">{store.orderCount}</p>
                  <p className="text-[10px] text-slate-400">Orders</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-emerald-400">${(store.totalSpent / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-slate-400">Spent</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-white">
                    {daysSinceOrder !== null ? `${daysSinceOrder}d` : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400">Last Order</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => startOrderForStore(store.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Order
                </button>
                <button
                  onClick={() => setSelectedStore(store)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          )
        })}

        {stores.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No stores found</p>
            <p className="text-slate-500 text-sm mt-1">Contact support to add locations</p>
          </div>
        )}
      </div>

      {/* Store Detail Modal */}
      {selectedStore && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setSelectedStore(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedStore.businessName}</h2>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-slate-800 rounded-full"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Contact</h3>
                <p className="text-white">{selectedStore.contactName}</p>
                <a href={`tel:${selectedStore.phone}`} className="text-emerald-400 text-sm">
                  {selectedStore.phone}
                </a>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{selectedStore.orderCount}</p>
                    <p className="text-xs text-slate-400">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">
                      ${selectedStore.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">Total Spent</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStore(null)
                  startOrderForStore(selectedStore.id)
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
              >
                Start Order for This Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
