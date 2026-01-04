'use client'

import Link from 'next/link'
import {
  Building2, Package, TrendingUp, Clock, Plus, Truck,
  ChevronRight, AlertCircle, DollarSign
} from 'lucide-react'

interface Store {
  id: string
  businessName: string
  contactName: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  lastOrderStatus: string | null
  pendingOrders: number
  inTransitOrders: number
}

interface AggregateStats {
  totalStores: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  pendingOrders: number
  inTransitOrders: number
}

interface AllStoresOverviewProps {
  stores: Store[]
  stats: AggregateStats | null
  onSelectStore: (storeId: string) => void
}

export default function AllStoresOverview({
  stores,
  stats,
  onSelectStore
}: AllStoresOverviewProps) {
  const getDaysSince = (date: string | null) => {
    if (!date) return null
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get stores sorted by need for attention (longest since last order first)
  const sortedStores = [...stores].sort((a, b) => {
    const daysA = getDaysSince(a.lastOrderDate) ?? 999
    const daysB = getDaysSince(b.lastOrderDate) ?? 999
    return daysB - daysA
  })

  // Stores needing attention (no order in 14+ days)
  const storesNeedingAttention = stores.filter(s => {
    const days = getDaysSince(s.lastOrderDate)
    return days === null || days > 14
  })

  // Extract store name suffix
  const getShortName = (businessName: string) => {
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-100" />
              <span className="text-emerald-100 text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${(stats.totalRevenue / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Avg Order</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${stats.avgOrderValue.toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {/* Attention Alert */}
      {storesNeedingAttention.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-400 font-medium">
                {storesNeedingAttention.length} store{storesNeedingAttention.length !== 1 ? 's' : ''} need attention
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {storesNeedingAttention.map(s => getShortName(s.businessName)).join(', ')} - no recent orders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Orders Summary */}
      {stats && (stats.pendingOrders > 0 || stats.inTransitOrders > 0) && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-white font-medium mb-3">Active Orders</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Package className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-slate-400">Pending / Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <Truck className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-lg font-bold text-white">{stats.inTransitOrders}</p>
                <p className="text-xs text-slate-400">In Transit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Stores List */}
      <div>
        <h3 className="text-white font-medium mb-3">All Stores</h3>
        <div className="space-y-2">
          {sortedStores.map((store) => {
            const daysSince = getDaysSince(store.lastOrderDate)
            const needsAttention = daysSince === null || daysSince > 14

            return (
              <button
                key={store.id}
                onClick={() => onSelectStore(store.id)}
                className={`w-full bg-slate-800 rounded-xl p-4 border transition-all text-left ${
                  needsAttention
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      needsAttention
                        ? 'bg-amber-500/20'
                        : 'bg-slate-700'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        needsAttention ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{getShortName(store.businessName)}</p>
                      <p className="text-xs text-slate-400">{store.contactName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quick Stats */}
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">
                        ${(store.totalSpent / 1000).toFixed(1)}k
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {store.orderCount} orders
                      </p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-1">
                      {store.pendingOrders > 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                          {store.pendingOrders}
                        </span>
                      )}
                      {store.inTransitOrders > 0 && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
                          {store.inTransitOrders}
                        </span>
                      )}
                      {needsAttention && (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">
                          {daysSince ? `${daysSince}d` : 'New'}
                        </span>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
