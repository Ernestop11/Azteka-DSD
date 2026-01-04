'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  MapPin,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone
} from 'lucide-react'

interface DashboardData {
  truckInventory: number
  pendingDeliveries: number
  completedToday: number
  salesToday: number
}

interface NextStop {
  id: string
  customer: string
  address: string
  phone: string
  items: number
  eta: string
}

export default function XekiDashboard() {
  const [stats, setStats] = useState<DashboardData>({
    truckInventory: 0,
    pendingDeliveries: 0,
    completedToday: 0,
    salesToday: 0
  })
  const [nextStops, setNextStops] = useState<NextStop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    // TODO: Connect to real API
    setLoading(false)
    // Mock data
    setStats({
      truckInventory: 245,
      pendingDeliveries: 8,
      completedToday: 5,
      salesToday: 1850.00
    })
    setNextStops([
      {
        id: '1',
        customer: 'Taqueria Los Primos',
        address: '1234 Main St, Los Angeles, CA',
        phone: '(323) 555-0123',
        items: 12,
        eta: '15 min'
      },
      {
        id: '2',
        customer: 'La Michoacana #5',
        address: '5678 Central Ave, Los Angeles, CA',
        phone: '(323) 555-0456',
        items: 8,
        eta: '35 min'
      }
    ])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Good morning, Xeki!</h1>
        <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Truck className="w-5 h-5" />
            <span className="text-sm">Truck Inventory</span>
          </div>
          <p className="text-3xl font-bold">{stats.truckInventory}</p>
          <p className="text-sm opacity-80">items loaded</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
          <p className="text-sm opacity-80">deliveries</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold">{stats.completedToday}</p>
          <p className="text-sm opacity-80">today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm">Sales Today</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.salesToday)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a href="/xeki/truck" className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors text-center">
          <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-white text-sm">My Truck</p>
        </a>
        <a href="/xeki/deliveries" className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition-colors text-center">
          <MapPin className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-white text-sm">Deliveries</p>
        </a>
        <a href="/xeki/restock" className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors text-center">
          <Truck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-white text-sm">Restock</p>
        </a>
      </div>

      {/* Next Stops */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Next Stops</h2>
          <a href="/xeki/deliveries" className="text-blue-400 text-sm hover:underline">View All</a>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : nextStops.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>All deliveries completed!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {nextStops.map((stop, index) => (
              <div key={stop.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-blue-500' : 'bg-slate-600'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{stop.customer}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {stop.address}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">{stop.eta}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pl-11">
                  <span className="text-slate-400 text-sm">{stop.items} items</span>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${stop.phone}`}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 text-slate-300" />
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert */}
      <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-orange-400 font-medium">Low Stock Alert</h3>
            <p className="text-slate-400 text-sm mt-1">
              3 items running low in truck. Consider restocking before next route.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
