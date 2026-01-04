'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  ClipboardList,
  Box,
  Send,
  Star,
  Store,
  Receipt,
  Eye
} from 'lucide-react'

interface OrderTask {
  id: string
  type: string
  title: string
  status: string
  assignee: string | null
  createdAt: string
  completedAt: string | null
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  productName: string
  productImage: string | null
}

interface Order {
  id: string
  status: string
  stage: string
  stageLabel: string
  total: number
  itemCount: number
  items: OrderItem[]
  notes: string | null
  createdAt: string
  tasks: OrderTask[]
  delivery: {
    signedBy: string
    deliveredAt: string
    notes: string | null
  } | null
}

interface SubStore {
  id: string
  businessName: string
  address: string
  phone: string
}

interface Customer {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  priceTier: string
  taxId: string | null
  group: {
    id: string
    name: string
    email: string
  } | null
  subStores: SubStore[]
  role: string
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  avgOrderValue: number
}

export default function CustomerDetailPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all')

  useEffect(() => {
    if (params.id) {
      fetchCustomer(params.id as string)
    }
  }, [params.id])

  const fetchCustomer = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ana/customers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer)
        setOrders(data.orders || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTierBadge = (tier: string) => {
    const tiers: Record<string, { bg: string, text: string, label: string }> = {
      'A': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Premium' },
      'B': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Estándar' },
      'C': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Básico' }
    }
    const config = tiers[tier] || tiers['B']
    return (
      <span className={`px-2 py-0.5 ${config.bg} ${config.text} rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    )
  }

  const getStageConfig = (stage: string) => {
    const stages: Record<string, { color: string, bgColor: string, icon: any }> = {
      pending: { color: 'text-gray-500', bgColor: 'bg-gray-100', icon: Clock },
      confirmed: { color: 'text-blue-500', bgColor: 'bg-blue-100', icon: CheckCircle2 },
      picking: { color: 'text-amber-500', bgColor: 'bg-amber-100', icon: ClipboardList },
      picked: { color: 'text-amber-600', bgColor: 'bg-amber-100', icon: ClipboardList },
      packing: { color: 'text-purple-500', bgColor: 'bg-purple-100', icon: Box },
      ready: { color: 'text-indigo-500', bgColor: 'bg-indigo-100', icon: Package },
      in_transit: { color: 'text-cyan-500', bgColor: 'bg-cyan-100', icon: Truck },
      delivered: { color: 'text-emerald-500', bgColor: 'bg-emerald-100', icon: CheckCircle2 }
    }
    return stages[stage] || stages.pending
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.stage)
    if (filter === 'delivered') return order.stage === 'delivered'
    return true
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Cliente no encontrado</p>
        <Link href="/ana/customers" className="text-rose-500 hover:underline mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Link
            href="/ana/customers"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{customer.businessName}</h1>
              {getTierBadge(customer.priceTier)}
            </div>
            <p className="text-gray-500">{customer.contactName}</p>
            {customer.group && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">{customer.group.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/ana/customers/pricing-rules?customer=${customer.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors font-medium"
          >
            <DollarSign className="w-4 h-4" />
            Precios
          </Link>
          <Link
            href={`/ana/messages?customer=${customer.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Send className="w-4 h-4" />
            Mensaje
          </Link>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-800">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-800 truncate">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dirección</p>
              <p className="font-medium text-gray-800">{customer.address}, {customer.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
              <Package className="w-4 h-4" />
              Total Pedidos
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-1">
              <DollarSign className="w-4 h-4" />
              Ingresos
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-1">
              <Clock className="w-4 h-4" />
              En Proceso
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-1">
              <Star className="w-4 h-4" />
              Promedio
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgOrderValue)}</p>
          </div>
        </div>
      )}

      {/* Sub-stores (if any) */}
      {customer.subStores.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 mb-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Tiendas ({customer.subStores.length})
          </h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {customer.subStores.map(store => (
              <Link
                key={store.id}
                href={`/ana/customers/${store.id}`}
                className="bg-white rounded-xl p-3 hover:shadow-md transition-all"
              >
                <p className="font-medium text-gray-800">{store.businessName}</p>
                <p className="text-sm text-gray-500">{store.address}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Historial de Pedidos</h2>
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'delivered' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entregados
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map(order => {
              const stageConfig = getStageConfig(order.stage)
              const StageIcon = stageConfig.icon
              const isExpanded = expandedOrder === order.id

              return (
                <div key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${stageConfig.bgColor} rounded-xl flex items-center justify-center`}>
                        <StageIcon className={`w-6 h-6 ${stageConfig.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 ${stageConfig.bgColor} ${stageConfig.color} rounded-full text-xs font-medium`}>
                            {order.stageLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>{order.itemCount} productos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(order.total)}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      {/* Progress Timeline */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Seguimiento del Pedido</h4>
                        <div className="flex items-center justify-between relative">
                          {/* Progress Line */}
                          <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                              style={{
                                width: order.stage === 'pending' ? '0%' :
                                       order.stage === 'confirmed' ? '20%' :
                                       ['picking', 'picked'].includes(order.stage) ? '40%' :
                                       ['packing', 'ready'].includes(order.stage) ? '60%' :
                                       order.stage === 'in_transit' ? '80%' :
                                       order.stage === 'delivered' ? '100%' : '0%'
                              }}
                            />
                          </div>

                          {/* Steps */}
                          {[
                            { key: 'confirmed', label: 'Confirmado', icon: CheckCircle2 },
                            { key: 'picking', label: 'Recolectando', icon: ClipboardList },
                            { key: 'packing', label: 'Empacando', icon: Box },
                            { key: 'in_transit', label: 'En Camino', icon: Truck },
                            { key: 'delivered', label: 'Entregado', icon: CheckCircle2 }
                          ].map((step, index) => {
                            const stageOrder = ['pending', 'confirmed', 'picking', 'picked', 'packing', 'ready', 'in_transit', 'delivered']
                            const currentIndex = stageOrder.indexOf(order.stage)
                            const stepIndex = stageOrder.indexOf(step.key)
                            const isCompleted = currentIndex >= stepIndex
                            const isCurrent = order.stage === step.key ||
                                              (step.key === 'picking' && order.stage === 'picked') ||
                                              (step.key === 'packing' && order.stage === 'ready')

                            return (
                              <div key={step.key} className="flex flex-col items-center z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-rose-100' : ''}`}>
                                  <step.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {step.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Tasks */}
                      {order.tasks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tareas</h4>
                          <div className="space-y-2">
                            {order.tasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    task.status === 'COMPLETED' ? 'bg-emerald-100' :
                                    task.status === 'IN_PROGRESS' ? 'bg-amber-100' : 'bg-gray-100'
                                  }`}>
                                    {task.type === 'PICKING' ? (
                                      <ClipboardList className={`w-4 h-4 ${
                                        task.status === 'COMPLETED' ? 'text-emerald-500' :
                                        task.status === 'IN_PROGRESS' ? 'text-amber-500' : 'text-gray-400'
                                      }`} />
                                    ) : (
                                      <Box className={`w-4 h-4 ${
                                        task.status === 'COMPLETED' ? 'text-emerald-500' :
                                        task.status === 'IN_PROGRESS' ? 'text-amber-500' : 'text-gray-400'
                                      }`} />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                    {task.assignee && (
                                      <p className="text-xs text-gray-500">Asignado: {task.assignee}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                    task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {task.status === 'COMPLETED' ? 'Completado' :
                                     task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                                  </span>
                                  {task.completedAt && (
                                    <p className="text-xs text-gray-400 mt-1">{formatDateShort(task.completedAt)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Delivery Confirmation */}
                      {order.delivery && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 text-emerald-700 mb-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Entrega Confirmada</span>
                          </div>
                          <div className="text-sm text-emerald-600">
                            <p>Firmado por: <strong>{order.delivery.signedBy}</strong></p>
                            <p>Fecha: {formatDate(order.delivery.deliveredAt)}</p>
                            {order.delivery.notes && <p>Notas: {order.delivery.notes}</p>}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Productos</h4>
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                          {order.items.slice(0, 5).map((item, idx) => (
                            <div key={item.id} className={`flex items-center justify-between p-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                                  <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium text-gray-700">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                              +{order.items.length - 5} productos más
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <p className="text-sm text-amber-700"><strong>Notas:</strong> {order.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          Ver Factura
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                          <Receipt className="w-4 h-4" />
                          Reimprimir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
