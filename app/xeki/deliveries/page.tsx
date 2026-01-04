'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  CheckCircle,
  Clock,
  Phone,
  Navigation,
  Package,
  DollarSign,
  Camera,
  AlertCircle
} from 'lucide-react'

interface Delivery {
  id: string
  orderId: string
  customer: string
  address: string
  phone: string
  items: number
  total: number
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED'
  eta: string | null
  notes: string | null
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDelivery, setActiveDelivery] = useState<string | null>(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    // TODO: Connect to real API
    setLoading(false)
    setActiveDelivery('1')
    // Mock data
    setDeliveries([
      {
        id: '1',
        orderId: 'ORD-001',
        customer: 'Taqueria Los Primos',
        address: '1234 Main St, Los Angeles, CA 90001',
        phone: '(323) 555-0123',
        items: 12,
        total: 245.00,
        status: 'IN_PROGRESS',
        eta: '15 min',
        notes: 'Side entrance, ring bell twice'
      },
      {
        id: '2',
        orderId: 'ORD-002',
        customer: 'La Michoacana #5',
        address: '5678 Central Ave, Los Angeles, CA 90011',
        phone: '(323) 555-0456',
        items: 8,
        total: 180.50,
        status: 'PENDING',
        eta: '35 min',
        notes: null
      },
      {
        id: '3',
        orderId: 'ORD-003',
        customer: 'Carniceria El Toro',
        address: '910 Broadway, Los Angeles, CA 90014',
        phone: '(323) 555-0789',
        items: 15,
        total: 420.00,
        status: 'PENDING',
        eta: '55 min',
        notes: 'Ask for Maria'
      },
      {
        id: '4',
        orderId: 'ORD-000',
        customer: 'Panaderia La Rosa',
        address: '234 First St, Los Angeles, CA 90012',
        phone: '(323) 555-0222',
        items: 6,
        total: 125.00,
        status: 'DELIVERED',
        eta: null,
        notes: null
      }
    ])
  }

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>
      case 'IN_PROGRESS':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"><Navigation className="w-3 h-3" /> In Progress</span>
      case 'DELIVERED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Delivered</span>
      case 'FAILED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"><AlertCircle className="w-3 h-3" /> Failed</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const pendingDeliveries = deliveries.filter(d => d.status !== 'DELIVERED')
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED')

  const handleMarkDelivered = (id: string) => {
    setDeliveries(prev => prev.map(d =>
      d.id === id ? { ...d, status: 'DELIVERED' as const, eta: null } : d
    ))
    // Move to next delivery
    const currentIndex = deliveries.findIndex(d => d.id === id)
    const nextPending = deliveries.find((d, i) => i > currentIndex && d.status === 'PENDING')
    if (nextPending) {
      setActiveDelivery(nextPending.id)
      setDeliveries(prev => prev.map(d =>
        d.id === nextPending.id ? { ...d, status: 'IN_PROGRESS' as const } : d
      ))
    } else {
      setActiveDelivery(null)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Today's Route</h1>
        <p className="text-slate-400">{pendingDeliveries.length} stops remaining • {completedDeliveries.length} completed</p>
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 mb-6 text-white">
          {(() => {
            const delivery = deliveries.find(d => d.id === activeDelivery)
            if (!delivery) return null
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm opacity-80">Current Stop</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-sm">{delivery.eta}</span>
                </div>
                <h2 className="text-xl font-bold mb-2">{delivery.customer}</h2>
                <p className="text-sm opacity-90 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {delivery.address}
                </p>
                {delivery.notes && (
                  <p className="text-sm bg-white/10 rounded-lg p-2 mb-4">
                    📝 {delivery.notes}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span>{delivery.items} items</span>
                  <span className="font-bold text-lg">{formatCurrency(delivery.total)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <a
                    href={`tel:${delivery.phone}`}
                    className="flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">Call</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(delivery.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    <span className="text-sm">Navigate</span>
                  </a>
                  <button className="flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm">Photo</span>
                  </button>
                </div>
                <button
                  onClick={() => handleMarkDelivered(delivery.id)}
                  className="w-full mt-4 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Mark as Delivered
                </button>
              </>
            )
          })()}
        </div>
      )}

      {/* Upcoming Stops */}
      {pendingDeliveries.filter(d => d.id !== activeDelivery).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Upcoming Stops</h3>
          <div className="space-y-3">
            {pendingDeliveries.filter(d => d.id !== activeDelivery).map((delivery, index) => (
              <div key={delivery.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 2}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{delivery.customer}</h4>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {delivery.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">{delivery.items} items</span>
                      <span className="text-white font-medium">{formatCurrency(delivery.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedDeliveries.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Completed Today</h3>
          <div className="space-y-3">
            {completedDeliveries.map(delivery => (
              <div key={delivery.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-slate-300">{delivery.customer}</h4>
                      <p className="text-slate-500 text-sm">{delivery.items} items</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-medium">{formatCurrency(delivery.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
