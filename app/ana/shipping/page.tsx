'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Package,
  Building2,
  X,
  Check,
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react'

interface ShippingExpense {
  id: string
  purchaseOrderId: string | null
  vendorId: string | null
  invoiceNumber: string | null
  invoiceDate: string | null
  deliveryDate: string | null
  amount: number
  carrierName: string | null
  trackingNumber: string | null
  notes: string | null
  createdAt: string
  vendor: { id: string; name: string } | null
  purchaseOrder: { id: string; poNumber: string; total: number } | null
}

interface Vendor {
  id: string
  name: string
  code: string | null
}

interface PurchaseOrder {
  id: string
  poNumber: string | null
  vendorId: string | null
}

export default function ShippingExpensesPage() {
  const searchParams = useSearchParams()
  const [expenses, setExpenses] = useState<ShippingExpense[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [stats, setStats] = useState({ totalExpenses: 0, totalAmount: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState<string>('all')

  // New expense modal
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newExpense, setNewExpense] = useState({
    purchaseOrderId: '',
    vendorId: '',
    invoiceNumber: '',
    invoiceDate: '',
    deliveryDate: '',
    amount: '',
    carrierName: '',
    trackingNumber: '',
    notes: ''
  })

  // Check for query params to pre-fill from PO detail page
  useEffect(() => {
    const poId = searchParams.get('poId')
    const vendorId = searchParams.get('vendorId')
    if (poId || vendorId) {
      setNewExpense(prev => ({
        ...prev,
        purchaseOrderId: poId || '',
        vendorId: vendorId || ''
      }))
      setShowNewModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/shipping')
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses || [])
        setVendors(data.vendors || [])
        setPurchaseOrders(data.purchaseOrders || [])
        setStats(data.stats || { totalExpenses: 0, totalAmount: 0, thisMonth: 0 })
      }
    } catch (error) {
      console.error('Error loading shipping expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetNewExpense = () => {
    setNewExpense({
      purchaseOrderId: '',
      vendorId: '',
      invoiceNumber: '',
      invoiceDate: '',
      deliveryDate: '',
      amount: '',
      carrierName: '',
      trackingNumber: '',
      notes: ''
    })
    setError('')
  }

  const handleCreateExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      setError('El monto es requerido')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/ana/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          purchaseOrderId: newExpense.purchaseOrderId || null,
          vendorId: newExpense.vendorId || null
        })
      })

      if (res.ok) {
        await fetchExpenses()
        setShowNewModal(false)
        resetNewExpense()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al crear gasto')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // When PO is selected, auto-fill vendor
  const handlePOSelect = (poId: string) => {
    setNewExpense({ ...newExpense, purchaseOrderId: poId })
    const po = purchaseOrders.find(p => p.id === poId)
    if (po?.vendorId) {
      setNewExpense(prev => ({ ...prev, purchaseOrderId: poId, vendorId: po.vendorId || '' }))
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !search ||
      expense.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      expense.carrierName?.toLowerCase().includes(search.toLowerCase()) ||
      expense.vendor?.name.toLowerCase().includes(search.toLowerCase()) ||
      expense.purchaseOrder?.poNumber?.toLowerCase().includes(search.toLowerCase())
    const matchesVendor = vendorFilter === 'all' || expense.vendorId === vendorFilter
    return matchesSearch && matchesVendor
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Gastos de Envío</h1>
          <p className="text-gray-500">Registra fletes y envíos por separado de las órdenes de compra</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Gasto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <FileText className="w-4 h-4" />
            Total Registros
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalExpenses}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4" />
            Total Gastado
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-2">
            <TrendingUp className="w-4 h-4" />
            Este Mes
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.thisMonth)}</p>
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
            placeholder="Buscar por factura, carrier, proveedor..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-300"
        >
          <option value="all">Todos los Proveedores</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Cargando gastos...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay gastos de envío registrados</p>
            <p className="text-gray-400 text-sm mt-1">Los gastos que registres aparecerán aquí</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-rose-100 text-rose-600 rounded-lg font-medium hover:bg-rose-200"
            >
              <Plus className="w-4 h-4" /> Registrar Primer Gasto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-5 hover:bg-rose-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-gray-800 font-bold text-lg">
                        {expense.carrierName || 'Envío'}
                      </h3>
                      {expense.invoiceNumber && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          #{expense.invoiceNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {expense.vendor && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {expense.vendor.name}
                        </span>
                      )}
                      {expense.purchaseOrder && (
                        <Link
                          href={`/ana/po/${expense.purchaseOrder.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Package className="w-3 h-3" />
                          PO #{expense.purchaseOrder.poNumber}
                        </Link>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(expense.deliveryDate || expense.createdAt)}
                      </span>
                    </div>
                    {expense.notes && (
                      <p className="text-gray-400 text-sm mt-1 truncate max-w-md">{expense.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-600">{formatCurrency(expense.amount)}</p>
                  {expense.purchaseOrder && (
                    <p className="text-xs text-gray-400">
                      PO Total: {formatCurrency(expense.purchaseOrder.total)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Expense Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowNewModal(false); resetNewExpense() }}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Nuevo Gasto de Envío</h2>
                <button onClick={() => { setShowNewModal(false); resetNewExpense() }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Compra (Opcional)</label>
                  <select
                    value={newExpense.purchaseOrderId}
                    onChange={(e) => handlePOSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  >
                    <option value="">Sin PO asociada</option>
                    {purchaseOrders.map(po => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber || po.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select
                    value={newExpense.vendorId}
                    onChange={(e) => setNewExpense({ ...newExpense, vendorId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier/Transportista</label>
                  <input
                    type="text"
                    value={newExpense.carrierName}
                    onChange={(e) => setNewExpense({ ...newExpense, carrierName: e.target.value })}
                    placeholder="Ej: FedEx, Entrega Proveedor"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"># Factura</label>
                  <input
                    type="text"
                    value={newExpense.invoiceNumber}
                    onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })}
                    placeholder="INV-12345"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega</label>
                  <input
                    type="date"
                    value={newExpense.deliveryDate}
                    onChange={(e) => setNewExpense({ ...newExpense, deliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"># Tracking</label>
                  <input
                    type="text"
                    value={newExpense.trackingNumber}
                    onChange={(e) => setNewExpense({ ...newExpense, trackingNumber: e.target.value })}
                    placeholder="Opcional"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Factura</label>
                  <input
                    type="date"
                    value={newExpense.invoiceDate}
                    onChange={(e) => setNewExpense({ ...newExpense, invoiceDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowNewModal(false); resetNewExpense() }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExpense}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Registrar Gasto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
