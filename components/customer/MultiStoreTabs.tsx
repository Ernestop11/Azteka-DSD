'use client'

import { Building2, Package, Truck, AlertCircle } from 'lucide-react'

interface Store {
  id: string
  businessName: string
  contactName: string
  orderCount: number
  totalSpent: number
  pendingOrders: number
  inTransitOrders: number
  lastOrderDate: string | null
}

interface MultiStoreTabsProps {
  stores: Store[]
  selectedStoreId: string | null
  onSelectStore: (storeId: string | null) => void
}

export default function MultiStoreTabs({
  stores,
  selectedStoreId,
  onSelectStore
}: MultiStoreTabsProps) {
  // Extract store name suffix (e.g., "Las Superior - Main" -> "Main")
  const getShortName = (businessName: string) => {
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  const getDaysSince = (date: string | null) => {
    if (!date) return null
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700">
      <div className="flex overflow-x-auto scrollbar-hide">
        {/* All Stores Tab */}
        <button
          onClick={() => onSelectStore(null)}
          className={`flex-shrink-0 px-4 py-3 border-b-2 transition-all ${
            selectedStoreId === null
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-transparent hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className={`w-4 h-4 ${selectedStoreId === null ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className={`text-sm font-medium ${selectedStoreId === null ? 'text-emerald-400' : 'text-slate-300'}`}>
              All
            </span>
          </div>
        </button>

        {/* Individual Store Tabs */}
        {stores.map((store) => {
          const isActive = selectedStoreId === store.id
          const daysSince = getDaysSince(store.lastOrderDate)
          const needsAttention = daysSince !== null && daysSince > 14
          const hasActiveOrders = store.pendingOrders > 0 || store.inTransitOrders > 0

          return (
            <button
              key={store.id}
              onClick={() => onSelectStore(store.id)}
              className={`flex-shrink-0 min-w-[100px] px-4 py-3 border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-transparent hover:bg-slate-800'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate max-w-[80px] ${
                    isActive ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {getShortName(store.businessName)}
                  </span>
                  {/* Status Indicators */}
                  {needsAttention && (
                    <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1">
                  {store.pendingOrders > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full font-medium">
                      <Package className="w-2.5 h-2.5 inline mr-0.5" />
                      {store.pendingOrders}
                    </span>
                  )}
                  {store.inTransitOrders > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full font-medium">
                      <Truck className="w-2.5 h-2.5 inline mr-0.5" />
                      {store.inTransitOrders}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
