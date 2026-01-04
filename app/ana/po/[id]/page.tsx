'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Printer,
  Edit,
  X,
  Check,
  User,
  Ship,
  Plus
} from 'lucide-react'

interface POItem {
  id: string
  productId: string | null
  vendorSku: string
  description: string
  quantity: number
  quantityReceived: number
  unitCost: number
  total: number
  unitsPerCase: number
  sellableUnits: number | null
  unitPricePerPiece: number
  product: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
    currentPrice: number
    currentCost: number | null
  } | null
}

interface ShippingExpense {
  id: string
  amount: number
  carrierName: string | null
  invoiceNumber: string | null
  deliveryDate: string | null
  notes: string | null
}

interface PurchaseOrder {
  id: string
  poNumber: string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  totalWithShipping: number
  totalShipping: number
  notes: string | null
  createdAt: string
  expectedDate: string | null
  receivedDate: string | null
  vendor: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  items: POItem[]
  shippingExpenses: ShippingExpense[]
  receivingTask: {
    id: string
    status: string
    assignee: string | null
    completedAt: string | null
  } | null
}

export default function PODetailPage() {
  const params = useParams()
  const router = useRouter()
  const [po, setPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPO(params.id as string)
    }
  }, [params.id])

  const fetchPO = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ana/po/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPO(data.po)
      } else {
        router.push('/ana/po')
      }
    } catch (error) {
      console.error('Error loading PO:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!po) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/ana/po/${po.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setPO({ ...po, status: newStatus })
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string, bgColor: string, label: string, icon: any }> = {
      DRAFT: { color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Borrador', icon: FileText },
      PENDING: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Pendiente', icon: Clock },
      CONFIRMED: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Confirmada', icon: CheckCircle2 },
      IN_TRANSIT: { color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'En Tránsito', icon: Truck },
      RECEIVING: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Recibiendo', icon: Package },
      RECEIVED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Recibida', icon: CheckCircle2 },
      STOCKED: { color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'En Inventario', icon: CheckCircle2 },
      CANCELLED: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelada', icon: X }
    }
    return configs[status] || configs.PENDING
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (!po) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Orden no encontrada</p>
        <Link href="/ana/po" className="text-rose-500 hover:underline mt-2 inline-block">
          Volver a órdenes
        </Link>
      </div>
    )
  }

  const statusConfig = getStatusConfig(po.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Link
            href="/ana/po"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                PO #{po.poNumber}
              </h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 ${statusConfig.bgColor} ${statusConfig.color} rounded-full text-sm font-medium`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-gray-500">Creada {formatDateTime(po.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Edit className="w-4 h-4" />
            Cambiar Estado
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Vendor Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-500" />
            Proveedor
          </h3>
          {po.vendor ? (
            <div>
              <p className="text-xl font-bold text-gray-800 mb-2">{po.vendor.name}</p>
              <div className="space-y-2 text-sm text-gray-600">
                {po.vendor.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {po.vendor.email}
                  </p>
                )}
                {po.vendor.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {po.vendor.phone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Sin proveedor asignado</p>
          )}
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Detalles de Orden
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(po.total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos</p>
              <p className="text-2xl font-bold text-gray-800">{po.items.length}</p>
            </div>
            {po.expectedDate && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha Esperada
                </p>
                <p className="text-gray-800 font-medium">{formatDate(po.expectedDate)}</p>
              </div>
            )}
            {po.receivedDate && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Recibida
                </p>
                <p className="text-emerald-600 font-medium">{formatDateTime(po.receivedDate)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receiving Task */}
      {po.receivingTask && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 mb-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Tarea de Recepción
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700">
                Estado: <span className="font-semibold">{po.receivingTask.status}</span>
              </p>
              {po.receivingTask.assignee && (
                <p className="text-amber-600 text-sm">Asignado a: {po.receivingTask.assignee}</p>
              )}
            </div>
            {po.receivingTask.completedAt && (
              <p className="text-emerald-600 text-sm">
                Completada: {formatDateTime(po.receivingTask.completedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {po.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Notas:</strong> {po.notes}
          </p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Productos ({po.items.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {po.items.map(item => (
            <div key={item.id} className="flex items-start lg:items-center justify-between p-4 hover:bg-gray-50 gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.product?.name || item.description || 'Producto desconocido'}</p>
                  <p className="text-sm text-gray-500">SKU: {item.product?.sku || item.vendorSku || 'N/A'}</p>
                  {item.unitsPerCase > 1 && (
                    <p className="text-xs text-purple-600 font-medium mt-1">
                      {item.unitsPerCase} pzas/caja
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-8 text-right">
                <div className="min-w-[60px]">
                  <p className="text-lg font-bold text-gray-800">{item.quantity}</p>
                  <p className="text-xs text-gray-500">{item.unitsPerCase > 1 ? 'Cajas' : 'Unidades'}</p>
                </div>
                {item.quantityReceived > 0 && (
                  <div className="min-w-[60px]">
                    <p className={`text-lg font-bold ${item.quantityReceived === item.quantity ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.quantityReceived}
                    </p>
                    <p className="text-xs text-gray-500">Recibido</p>
                  </div>
                )}
                <div className="min-w-[80px]">
                  <p className="text-gray-600">{formatCurrency(item.unitCost)}</p>
                  <p className="text-xs text-gray-500">{item.unitsPerCase > 1 ? 'Por Caja' : 'Costo Unit.'}</p>
                  {item.unitsPerCase > 1 && (
                    <p className="text-xs text-purple-600 mt-1">
                      {formatCurrency(item.unitPricePerPiece)} /pza
                    </p>
                  )}
                </div>
                <div className="min-w-[90px]">
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(item.total)}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="text-right space-y-2">
              <div>
                <p className="text-sm text-gray-500">Subtotal Productos</p>
                <p className="text-xl font-bold text-gray-700">{formatCurrency(po.total)}</p>
              </div>
              {po.totalShipping > 0 && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Total Envíos</p>
                    <p className="text-lg font-semibold text-blue-600">+ {formatCurrency(po.totalShipping)}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Gran Total</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(po.totalWithShipping)}</p>
                  </div>
                </>
              )}
              {!po.totalShipping && (
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(po.total)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Expenses Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Ship className="w-5 h-5 text-blue-500" />
            Gastos de Envío ({po.shippingExpenses?.length || 0})
          </h3>
          <Link
            href={`/ana/shipping?poId=${po.id}&vendorId=${po.vendor?.id || ''}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Envío
          </Link>
        </div>

        {po.shippingExpenses && po.shippingExpenses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {po.shippingExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {expense.carrierName || 'Transportista'}
                      {expense.invoiceNumber && <span className="text-gray-500 font-normal"> - {expense.invoiceNumber}</span>}
                    </p>
                    {expense.deliveryDate && (
                      <p className="text-sm text-gray-500">
                        Entrega: {formatDate(expense.deliveryDate)}
                      </p>
                    )}
                    {expense.notes && (
                      <p className="text-sm text-gray-400 truncate max-w-xs">{expense.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(expense.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No hay gastos de envío registrados</p>
            <p className="text-sm text-gray-400">Agrega los gastos de flete para calcular el costo real</p>
          </div>
        )}

        {po.shippingExpenses && po.shippingExpenses.length > 0 && (
          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700">Total Gastos de Envío</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(po.totalShipping)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Cambiar Estado</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { value: 'PENDING', label: 'Pendiente', icon: Clock, color: 'amber' },
                { value: 'CONFIRMED', label: 'Confirmada', icon: CheckCircle2, color: 'blue' },
                { value: 'IN_TRANSIT', label: 'En Tránsito', icon: Truck, color: 'cyan' },
                { value: 'RECEIVING', label: 'Recibiendo', icon: Package, color: 'orange' },
                { value: 'RECEIVED', label: 'Recibida', icon: CheckCircle2, color: 'emerald' },
                { value: 'STOCKED', label: 'En Inventario', icon: Package, color: 'teal' },
                { value: 'CANCELLED', label: 'Cancelada', icon: X, color: 'red' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateStatus(option.value)}
                  disabled={updating || po.status === option.value}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    po.status === option.value
                      ? `bg-${option.color}-100 border-2 border-${option.color}-400`
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  } ${updating ? 'opacity-50' : ''}`}
                >
                  <option.icon className={`w-5 h-5 text-${option.color}-500`} />
                  <span className="font-medium text-gray-800">{option.label}</span>
                  {po.status === option.value && (
                    <Check className="w-5 h-5 text-emerald-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
