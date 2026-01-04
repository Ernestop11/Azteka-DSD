'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import LinksTab from '@/components/rep/LinksTab'

// Dynamically import RouteBuilder to avoid SSR issues with Google Maps
const RouteBuilder = dynamic(() => import('@/components/rep/RouteBuilder'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-slate-950">
      <div className="text-white text-xl flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Loading Route Builder...
      </div>
    </div>
  )
})

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
  lastVisitDate: string | null
  nextScheduledVisit: string | null
  visitFrequency: string | null
  orderCount?: number
  lastOrderDate?: string | null
  totalSpent?: number
  latitude?: number
  longitude?: number
}

interface RepSession {
  id: string
  name: string
  email: string
  role: string
  token: string
}

export default function RepDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<RepSession | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs-visit' | 'recent'>('all')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'customers' | 'route' | 'links'>('customers')
  const [newCustomer, setNewCustomer] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'TX',
    zipCode: '',
    priceTier: 'B',
    saleDate: new Date().toISOString().split('T')[0], // Today as default
    visitFrequency: '14', // Every 2 weeks default
  })

  useEffect(() => {
    // Check session
    const stored = localStorage.getItem('repSession')
    if (!stored) {
      router.replace('/rep/login')
      return
    }

    try {
      const parsed = JSON.parse(stored)
      setSession(parsed)
      loadData(parsed.token)
    } catch {
      router.replace('/rep/login')
    }
  }, [router])

  const loadData = async (token: string) => {
    try {
      const res = await fetch('/api/rep/customers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('repSession')
    router.replace('/rep/login')
  }

  const startOrder = (customerId: string) => {
    sessionStorage.setItem('selectedCustomerId', customerId)
    // Go directly to catalog - favorites accessible via hamburger menu
    router.push(`/catalog?customer=${customerId}&mode=rep`)
  }

  const viewCustomerDetail = (customerId: string) => {
    router.push(`/rep/customer/${customerId}`)
  }

  const shareOrderLink = async (customerId: string) => {
    if (!session) return

    try {
      const res = await fetch('/api/customer/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          createdById: session.id,
          type: 'MAGIC_LINK',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const magicLink = data.magicLink

        // Try to use native share if available (mobile)
        if (navigator.share) {
          await navigator.share({
            title: 'Order with Azteka',
            text: `Hi! Here's your link to place an order with us:`,
            url: magicLink,
          })
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(magicLink)
          alert(`Link copied to clipboard!\n\n${magicLink}\n\nShare this with your customer.`)
        }
      } else {
        alert('Failed to generate link')
      }
    } catch (error) {
      console.error('Share link error:', error)
      alert('Failed to share link')
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setSaving(true)
    try {
      const res = await fetch('/api/rep/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(newCustomer),
      })

      if (res.ok) {
        const data = await res.json()
        setCustomers([data.customer, ...customers])
        setShowAddCustomer(false)
        setNewCustomer({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: 'TX',
          zipCode: '',
          priceTier: 'B',
          saleDate: new Date().toISOString().split('T')[0],
          visitFrequency: '14',
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add customer')
      }
    } catch (error) {
      alert('Failed to add customer')
    } finally {
      setSaving(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterStatus === 'needs-visit') {
      if (!customer.lastVisitDate) return true
      const daysSinceVisit = Math.floor(
        (Date.now() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceVisit >= 7
    }

    if (filterStatus === 'recent') {
      return customer.lastOrderDate &&
        new Date(customer.lastOrderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    return true
  })

  const getDaysSinceVisit = (lastVisit: string | null) => {
    if (!lastVisit) return null
    return Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
  }

  const getVisitStatusColor = (lastVisit: string | null) => {
    const days = getDaysSinceVisit(lastVisit)
    if (days === null) return 'bg-gray-500'
    if (days <= 3) return 'bg-green-500'
    if (days <= 7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Safe area background for iPhone notch */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900 z-40" style={{ height: 'env(safe-area-inset-top)' }} />

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 md:px-6 md:py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.625rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-3xl">🚗</span>
            <div>
              <h1 className="text-base md:text-2xl font-bold leading-tight">
                Sales Rep
              </h1>
              {session && (
                <p className="text-slate-400 text-[11px] md:text-sm">
                  {session.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <button
              onClick={() => router.push('/rep/seed-invoice')}
              className="p-2 md:px-4 md:py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-400 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              title="Upload Invoice"
            >
              <span className="text-lg md:text-base">📄</span>
              <span className="hidden md:inline">Seed Invoice</span>
            </button>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="p-2 md:px-4 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <span className="text-lg md:text-base">➕</span>
              <span className="hidden md:inline">Add Customer</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 md:px-4 md:py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <span className="text-lg md:text-base">🚪</span>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-slate-900 border-b border-slate-800 flex">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'customers'
              ? 'text-white border-b-2 border-emerald-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <span>👥</span>
          Customers
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'route'
              ? 'text-white border-b-2 border-blue-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <span>🗺️</span>
          Route Builder
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'links'
              ? 'text-white border-b-2 border-emerald-500 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <span>🔗</span>
          Links
        </button>
      </div>

      {/* Route Builder Tab */}
      {activeTab === 'route' && (
        <div className="h-[calc(100vh-120px)]">
          <RouteBuilder customers={customers} />
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && session && (
        <div className="h-[calc(100vh-120px)] overflow-y-auto">
          <LinksTab repId={session.id} customers={customers} />
        </div>
      )}

      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <>
      {/* Stats Bar - Compact on mobile */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-3 py-2 md:px-6 md:py-4">
        <div className="flex gap-2 md:grid md:grid-cols-4 md:gap-4 overflow-x-auto pb-1 md:pb-0 -mx-3 px-3 md:mx-0 md:px-0">
          <div className="bg-slate-800 rounded-lg md:rounded-xl px-3 py-2 md:p-4 flex-shrink-0 min-w-[80px] md:min-w-0">
            <div className="text-slate-400 text-[10px] md:text-sm">Customers</div>
            <div className="text-lg md:text-2xl font-bold text-white">{customers.length}</div>
          </div>
          <div className="bg-slate-800 rounded-lg md:rounded-xl px-3 py-2 md:p-4 flex-shrink-0 min-w-[80px] md:min-w-0">
            <div className="text-slate-400 text-[10px] md:text-sm">Needs Visit</div>
            <div className="text-lg md:text-2xl font-bold text-red-400">
              {customers.filter(c => {
                const days = getDaysSinceVisit(c.lastVisitDate)
                return days === null || days >= 7
              }).length}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg md:rounded-xl px-3 py-2 md:p-4 flex-shrink-0 min-w-[80px] md:min-w-0">
            <div className="text-slate-400 text-[10px] md:text-sm">Orders Today</div>
            <div className="text-lg md:text-2xl font-bold text-emerald-400">0</div>
          </div>
          <div className="bg-slate-800 rounded-lg md:rounded-xl px-3 py-2 md:p-4 flex-shrink-0 min-w-[80px] md:min-w-0">
            <div className="text-slate-400 text-[10px] md:text-sm">This Week</div>
            <div className="text-lg md:text-2xl font-bold text-blue-400">$0</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-3 py-2 md:px-6 md:py-4 space-y-2 md:space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-slate-800 border border-slate-700 rounded-lg md:rounded-xl text-white text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          </div>
        </div>
        <div className="flex gap-1.5 md:gap-2">
          {[
            { id: 'all', label: 'All', icon: '📋' },
            { id: 'needs-visit', label: 'Needs Visit', icon: '🔴' },
            { id: 'recent', label: 'Recent', icon: '🟢' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id as typeof filterStatus)}
              className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-colors whitespace-nowrap text-xs md:text-sm ${
                filterStatus === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
              }`}
            >
              <span className="text-xs md:text-sm">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="px-3 pb-6 md:px-6">
        <div className="grid gap-2 md:gap-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xl mb-2">No customers found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Customer Info - Clickable */}
                <div
                  onClick={() => viewCustomerDetail(customer.id)}
                  className="p-3 md:p-4 cursor-pointer hover:bg-slate-750 active:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full mt-1.5 flex-shrink-0 ${getVisitStatusColor(customer.lastVisitDate)}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-[15px] md:text-lg truncate">{customer.businessName}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium flex-shrink-0 ${
                          customer.priceTier === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                          customer.priceTier === 'B' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {customer.priceTier}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs md:text-sm truncate mt-0.5">
                        {customer.contactName ? `${customer.contactName} • ` : ''}{customer.city}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {customer.lastVisitDate ? (
                          <span className="text-slate-500 text-[11px] md:text-xs">
                            Last visit: {getDaysSinceVisit(customer.lastVisitDate)}d ago
                          </span>
                        ) : (
                          <span className="text-red-400 text-[11px] md:text-xs font-medium">New customer</span>
                        )}
                        {customer.orderCount && customer.orderCount > 0 && (
                          <span className="text-slate-500 text-[11px] md:text-xs">
                            • {customer.orderCount} orders
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Always visible row on mobile */}
                <div
                  className="flex border-t border-slate-700/50 bg-slate-800/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition-colors border-r border-slate-700/50"
                  >
                    <span className="text-base">📞</span>
                    <span className="text-xs md:text-sm">Call</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(customer.address + ', ' + customer.city + ', ' + customer.state)}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition-colors border-r border-slate-700/50"
                  >
                    <span className="text-base">🗺️</span>
                    <span className="text-xs md:text-sm">Map</span>
                  </a>
                  <button
                    onClick={() => shareOrderLink(customer.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 text-blue-400 hover:bg-blue-600/20 active:bg-blue-600/30 transition-colors border-r border-slate-700/50"
                  >
                    <span className="text-base">🔗</span>
                    <span className="text-xs md:text-sm">Share</span>
                  </button>
                  <button
                    onClick={() => startOrder(customer.id)}
                    className="flex-[1.3] flex items-center justify-center gap-1.5 py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white font-medium transition-colors"
                  >
                    <span className="text-base">🛒</span>
                    <span className="text-xs md:text-sm">Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
        </>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center">
          <div className="bg-slate-900 w-full md:w-[500px] md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Customer</h2>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Business Name *</label>
                <input
                  type="text"
                  value={newCustomer.businessName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                  required
                  placeholder="Store name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newCustomer.contactName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contactName: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Address *</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  required
                  placeholder="Street address"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">City *</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">State</label>
                  <input
                    type="text"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    maxLength={2}
                    placeholder="TX"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">ZIP</label>
                  <input
                    type="text"
                    value={newCustomer.zipCode}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Scheduling Section */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <h3 className="text-slate-300 font-medium mb-3">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">First Sale Date</label>
                    <input
                      type="date"
                      value={newCustomer.saleDate}
                      onChange={(e) => setNewCustomer({ ...newCustomer, saleDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Visit Frequency</label>
                    <select
                      value={newCustomer.visitFrequency}
                      onChange={(e) => setNewCustomer({ ...newCustomer, visitFrequency: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="7">Weekly</option>
                      <option value="14">Every 2 weeks</option>
                      <option value="21">Every 3 weeks</option>
                      <option value="28">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Price Tier</label>
                <select
                  value={newCustomer.priceTier}
                  onChange={(e) => setNewCustomer({ ...newCustomer, priceTier: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="A">Tier A (10% off)</option>
                  <option value="B">Tier B (Standard)</option>
                  <option value="C">Tier C (5% markup)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Customer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
