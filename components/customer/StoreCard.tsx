'use client'

import { Building2, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

interface Store {
  id: string
  businessName: string
  contactName: string
  phone: string
  city?: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  pendingOrders: number
  inTransitOrders: number
}

interface StoreCardProps {
  store: Store
  isSelected: boolean
  onSelect: (storeId: string) => void
}

function getDaysSince(date: string | null): number | null {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function getStoreStatus(store: Store) {
  const daysSince = getDaysSince(store.lastOrderDate)

  // Critical: Never ordered OR 14+ days
  if (daysSince === null || daysSince >= 14) {
    return {
      status: 'critical' as const,
      borderClass: 'border-l-red-500',
      dotClass: 'bg-red-500',
      textClass: 'text-red-400',
      label: daysSince === null ? 'New' : `${daysSince}d`,
      Icon: AlertCircle
    }
  }

  // Warning: 7-14 days
  if (daysSince >= 7) {
    return {
      status: 'warning' as const,
      borderClass: 'border-l-amber-500',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-400',
      label: `${daysSince}d`,
      Icon: Clock
    }
  }

  // Healthy: Within 7 days
  return {
    status: 'healthy' as const,
    borderClass: 'border-l-emerald-500',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    label: daysSince === 0 ? 'Today' : `${daysSince}d`,
    Icon: CheckCircle
  }
}

function getShortName(businessName: string, city?: string): string {
  // For "La Superior" stores, format as "La Superior #X, City"
  const superiorMatch = businessName.match(/la\s*superior\s*#?(\d+)/i)
  if (superiorMatch) {
    const storeNum = superiorMatch[1]
    const cityName = city || ''
    return cityName ? `La Superior #${storeNum}, ${cityName}` : `La Superior #${storeNum}`
  }

  // If name contains " - ", take the last part (store name)
  const parts = businessName.split(' - ')
  return parts.length > 1 ? parts[parts.length - 1] : businessName
}

export default function StoreCard({ store, isSelected, onSelect }: StoreCardProps) {
  const status = getStoreStatus(store)
  const hasActiveOrders = store.pendingOrders > 0 || store.inTransitOrders > 0

  return (
    <button
      onClick={() => onSelect(store.id)}
      className={`
        w-full text-left rounded-lg p-3
        bg-slate-800 border-l-4 ${status.borderClass}
        transition-all duration-200
        ${isSelected
          ? 'ring-2 ring-emerald-500 bg-slate-700'
          : 'hover:bg-slate-750'
        }
      `}
    >
      {/* Store Name + Status */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium text-white text-sm truncate flex-1">
          {getShortName(store.businessName, store.city)}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Active orders indicator */}
          {hasActiveOrders && (
            <div className="flex gap-1">
              {store.pendingOrders > 0 && (
                <span className="w-5 h-5 bg-blue-500/30 text-blue-400 text-[10px] rounded-full flex items-center justify-center font-bold">
                  {store.pendingOrders}
                </span>
              )}
              {store.inTransitOrders > 0 && (
                <span className="w-5 h-5 bg-purple-500/30 text-purple-400 text-[10px] rounded-full flex items-center justify-center font-bold">
                  {store.inTransitOrders}
                </span>
              )}
            </div>
          )}
          {/* Days since order */}
          <span className={`text-xs font-bold ${status.textClass}`}>
            {status.label}
          </span>
          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Contact */}
      <p className="text-xs text-slate-400 truncate">{store.contactName}</p>
    </button>
  )
}
