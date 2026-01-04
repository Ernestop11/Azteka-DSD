'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Building2,
  Search,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Settings,
  Plus,
  Filter,
  ArrowUpRight,
  Store,
  Crown,
  X,
  Check,
  AlertCircle
} from 'lucide-react'

interface Customer {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  priceTier: string
  groupId: string | null
  groupName: string | null
  role: string
  parentCustomerId: string | null
  subStoreCount: number
  totalOrders: number
  totalRevenue: number
  lastOrderDate: string | null
}

interface CustomerGroup {
  id: string
  name: string
  email: string
  customerCount: number
  totalRevenue: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [view, setView] = useState<'all' | 'groups'>('groups')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    priceTier: 'B',
    taxId: '',
    groupId: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin pedidos'
    return new Date(dateStr).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
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

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.businessName.toLowerCase().includes(search.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(search.toLowerCase())
    const matchesTier = tierFilter === 'all' || customer.priceTier === tierFilter
    const matchesGroup = !selectedGroup || customer.groupId === selectedGroup
    return matchesSearch && matchesTier && matchesGroup
  })

  const stats = {
    total: customers.length,
    groups: groups.length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0)
  }

  const resetNewCustomer = () => {
    setNewCustomer({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      priceTier: 'B',
      taxId: '',
      groupId: ''
    })
    setError('')
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.businessName) {
      setError('Nombre del negocio es requerido')
      return
    }
    if (!newCustomer.address) {
      setError('Dirección es requerida')
      return
    }
    if (!newCustomer.city) {
      setError('Ciudad es requerida')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/ana/customers/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCustomer,
          groupId: newCustomer.groupId || null
        })
      })

      if (res.ok) {
        await fetchCustomers()
        setShowNewModal(false)
        resetNewCustomer()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al crear cliente')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500">Administra clientes, grupos y reglas de precio</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ana/customers/pricing-rules"
            className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Reglas de Precio
          </Link>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <Users className="w-4 h-4" />
            Total Clientes
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-2">
            <Building2 className="w-4 h-4" />
            Grupos
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.groups}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4" />
            Ingresos Totales
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <button
          onClick={() => { setView('groups'); setSelectedGroup(null) }}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            view === 'groups'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Por Grupo
        </button>
        <button
          onClick={() => { setView('all'); setSelectedGroup(null) }}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            view === 'all'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          Todos
        </button>
      </div>

      {/* Groups View */}
      {view === 'groups' && !selectedGroup && (
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
            ))
          ) : groups.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No hay grupos creados</p>
              <p className="text-gray-400 text-sm mt-1">Crea un grupo para agrupar tiendas de un mismo dueño</p>
            </div>
          ) : (
            groups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md">
                      <Crown className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                      <p className="text-gray-500 text-sm">{group.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{group.customerCount}</p>
                    <p className="text-xs text-gray-500">Tiendas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(group.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">Ingresos</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected Group or All Customers View */}
      {(view === 'all' || selectedGroup) && (
        <>
          {/* Back button if viewing group */}
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Volver a Grupos
            </button>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-300"
            >
              <option value="all">Todos los Precios</option>
              <option value="A">Premium (A)</option>
              <option value="B">Estándar (B)</option>
              <option value="C">Básico (C)</option>
            </select>
          </div>

          {/* Customers List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 mt-4">Cargando clientes...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No se encontraron clientes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => (
                  <Link
                    key={customer.id}
                    href={`/ana/customers/${customer.id}`}
                    className="block p-4 lg:p-5 hover:bg-rose-50/50 transition-colors group"
                  >
                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md font-bold flex-shrink-0">
                          {customer.businessName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-gray-800 font-bold truncate">{customer.businessName}</h3>
                            {getTierBadge(customer.priceTier)}
                          </div>
                          <p className="text-gray-500 text-sm truncate">{customer.contactName}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">{customer.totalOrders} pedidos</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(customer.totalRevenue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-lg flex-shrink-0">
                          {customer.businessName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-gray-800 font-bold truncate max-w-[200px]">{customer.businessName}</h3>
                            {getTierBadge(customer.priceTier)}
                            {customer.subStoreCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                                <Store className="w-3 h-3" />
                                {customer.subStoreCount}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm truncate">{customer.contactName}</p>
                          <div className="flex items-center gap-4 mt-1 text-gray-400 text-xs">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {customer.city}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">{customer.totalOrders}</p>
                          <p className="text-xs text-gray-500">Pedidos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(customer.totalRevenue)}</p>
                          <p className="text-xs text-gray-500">Último: {formatDate(customer.lastOrderDate)}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* New Customer Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowNewModal(false); resetNewCustomer() }}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Nuevo Cliente</h2>
                <button onClick={() => { setShowNewModal(false); resetNewCustomer() }} className="text-gray-400 hover:text-gray-600">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio *</label>
                  <input
                    type="text"
                    value={newCustomer.businessName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                    placeholder="Ej: Tienda El Sol"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
                  <input
                    type="text"
                    value={newCustomer.contactName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contactName: e.target.value })}
                    placeholder="Ej: Juan Pérez (opcional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="555-123-4567 (opcional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="cliente@email.com (opcional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Calle y número"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Ciudad"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    placeholder="Estado"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Precio</label>
                  <select
                    value={newCustomer.priceTier}
                    onChange={(e) => setNewCustomer({ ...newCustomer, priceTier: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  >
                    <option value="A">Premium (A)</option>
                    <option value="B">Estándar (B)</option>
                    <option value="C">Básico (C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                  <select
                    value={newCustomer.groupId}
                    onChange={(e) => setNewCustomer({ ...newCustomer, groupId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  >
                    <option value="">Sin grupo</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RFC/Tax ID</label>
                  <input
                    type="text"
                    value={newCustomer.taxId}
                    onChange={(e) => setNewCustomer({ ...newCustomer, taxId: e.target.value })}
                    placeholder="RFC (opcional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowNewModal(false); resetNewCustomer() }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Crear Cliente
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
