'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Truck,
  Building,
  Warehouse,
  ChevronRight
} from 'lucide-react'

interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  vendorId: string | null
  status: string
  total: number
  itemCount: number
  createdAt: string
  expectedDate: string | null
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/po')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: React.ReactNode, bg: string, text: string, label: string }> = {
      DRAFT: { icon: <FileText className="w-3 h-3" />, bg: 'bg-slate-100', text: 'text-slate-600', label: 'Borrador' },
      PENDING: { icon: <Clock className="w-3 h-3" />, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
      CONFIRMED: { icon: <CheckCircle className="w-3 h-3" />, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmada' },
      IN_TRANSIT: { icon: <Truck className="w-3 h-3" />, bg: 'bg-purple-100', text: 'text-purple-700', label: 'En Tránsito' },
      RECEIVING: { icon: <Warehouse className="w-3 h-3" />, bg: 'bg-orange-100', text: 'text-orange-700', label: 'Recibiendo' },
      RECEIVED: { icon: <CheckCircle className="w-3 h-3" />, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Recibida' },
      STOCKED: { icon: <Package className="w-3 h-3" />, bg: 'bg-teal-100', text: 'text-teal-700', label: 'En Inventario' },
      CANCELLED: { icon: <XCircle className="w-3 h-3" />, bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' }
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <span className={`flex items-center gap-1 px-2.5 py-1 ${config.bg} ${config.text} rounded-full text-xs font-medium`}>
        {config.icon} {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.vendor.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'RECEIVING'].includes(o.status)).length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0)
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Órdenes de Compra</h1>
          <p className="text-gray-500">Maneja las órdenes a proveedores y recepción de mercancía</p>
        </div>
        <Link
          href="/ana/po/new"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <Package className="w-4 h-4" />
            Total Órdenes
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            En Proceso
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4" />
            Valor Total
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por # orden o proveedor..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-300"
        >
          <option value="all">Todos los Estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="IN_TRANSIT">En Tránsito</option>
          <option value="RECEIVING">Recibiendo</option>
          <option value="RECEIVED">Recibida</option>
          <option value="STOCKED">En Inventario</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Cargando órdenes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay órdenes de compra</p>
            <p className="text-gray-400 text-sm mt-1">Las órdenes que crees aparecerán aquí</p>
            <Link
              href="/ana/po/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-rose-100 text-rose-600 rounded-lg font-medium hover:bg-rose-200"
            >
              <Plus className="w-4 h-4" /> Crear Primera Orden
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map(order => (
              <Link
                key={order.id}
                href={`/ana/po/${order.id}`}
                className="flex items-center justify-between p-5 hover:bg-rose-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-gray-800 font-bold text-lg">#{order.poNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-gray-500">{order.vendor}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {order.itemCount} productos • Creada {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.total)}</p>
                    {order.expectedDate && (
                      <p className="text-gray-400 text-sm">Esperada {formatDate(order.expectedDate)}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
