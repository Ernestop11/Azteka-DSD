'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Phone,
  User,
  Calendar
} from 'lucide-react'

interface Delivery {
  id: string
  orderId: string
  customer: string
  address: string
  driver: string | null
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'
  scheduledDate: string
  completedAt: string | null
  itemCount: number
  total: number
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/ana/deliveries')
      if (res.ok) {
        const data = await res.json()
        setDeliveries(data.deliveries || [])
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>
      case 'ASSIGNED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"><User className="w-3 h-3" /> Assigned</span>
      case 'IN_TRANSIT':
        return <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"><Truck className="w-3 h-3" /> In Transit</span>
      case 'DELIVERED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Delivered</span>
      case 'FAILED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Failed</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.customer.toLowerCase().includes(search.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(search.toLowerCase()) ||
      delivery.address.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    today: deliveries.filter(d => {
      const deliveryDate = new Date(d.scheduledDate).toDateString()
      return deliveryDate === new Date().toDateString()
    }).length,
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
    delivered: deliveries.filter(d => d.status === 'DELIVERED').length
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deliveries</h1>
        <p className="text-slate-400">Track order deliveries and routes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Today
          </div>
          <p className="text-2xl font-bold text-white">{stats.today}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            Pending
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Truck className="w-4 h-4 text-purple-400" />
            In Transit
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.inTransit}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Delivered
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.delivered}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, order, or address..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Deliveries List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No deliveries found</p>
            <p className="text-sm mt-2">Deliveries will appear here when orders are marked for delivery</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredDeliveries.map(delivery => (
              <div key={delivery.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold">{delivery.customer}</h3>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                        <MapPin className="w-3 h-3" />
                        {delivery.address}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <span>Order #{delivery.orderId}</span>
                        <span>{delivery.itemCount} items</span>
                        {delivery.driver && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {delivery.driver}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatCurrency(delivery.total)}</p>
                    <p className="text-slate-500 text-sm">{formatDate(delivery.scheduledDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
