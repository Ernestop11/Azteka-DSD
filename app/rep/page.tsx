'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
}

interface SalesRep {
  id: string
  name: string
  email: string
  territory: string | null
}

export default function SalesRepDashboard() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [salesRep, setSalesRep] = useState<SalesRep | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs-visit' | 'recent'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load customers
      const res = await fetch('/api/rep/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
        setSalesRep(data.salesRep || null)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const startOrder = (customerId: string) => {
    // Store selected customer in session and navigate to order page
    sessionStorage.setItem('selectedCustomerId', customerId)
    router.push(`/rep/order?customer=${customerId}`)
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterStatus === 'needs-visit') {
      // Show customers who haven't been visited in 7+ days
      if (!customer.lastVisitDate) return true
      const daysSinceVisit = Math.floor(
        (Date.now() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceVisit >= 7
    }

    if (filterStatus === 'recent') {
      // Show customers with recent orders
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
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🚗</span>
              Sales Rep Dashboard
            </h1>
            {salesRep && (
              <p className="text-slate-400 text-sm mt-1">
                Welcome, {salesRep.name} {salesRep.territory && `• ${salesRep.territory}`}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/catalog"
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>📦</span> Catalog
            </Link>
            <Link
              href="/orders"
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>📋</span> Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Total Customers</div>
            <div className="text-2xl font-bold text-white">{customers.length}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Needs Visit</div>
            <div className="text-2xl font-bold text-red-400">
              {customers.filter(c => {
                const days = getDaysSinceVisit(c.lastVisitDate)
                return days === null || days >= 7
              }).length}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Orders Today</div>
            <div className="text-2xl font-bold text-emerald-400">0</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Sales This Week</div>
            <div className="text-2xl font-bold text-blue-400">$0.00</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search customers by name, contact, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All', icon: '📋' },
            { id: 'needs-visit', label: 'Needs Visit', icon: '🔴' },
            { id: 'recent', label: 'Recent Orders', icon: '🟢' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id as typeof filterStatus)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                filterStatus === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{filter.icon}</span> {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="px-6 pb-6">
        <div className="grid gap-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xl mb-2">No customers found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition-colors border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Visit Status Indicator */}
                    <div className={`w-3 h-3 rounded-full ${getVisitStatusColor(customer.lastVisitDate)}`} />

                    <div>
                      <h3 className="font-semibold text-lg">{customer.businessName}</h3>
                      <p className="text-slate-400 text-sm">
                        {customer.contactName} • {customer.city}, {customer.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Customer Stats */}
                    <div className="text-right">
                      <div className="text-sm text-slate-400">
                        {customer.lastVisitDate ? (
                          <>Last visit: {getDaysSinceVisit(customer.lastVisitDate)} days ago</>
                        ) : (
                          <span className="text-red-400">Never visited</span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          customer.priceTier === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                          customer.priceTier === 'B' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          Tier {customer.priceTier}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${customer.phone}`}
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Call"
                      >
                        📞
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(customer.address + ', ' + customer.city + ', ' + customer.state)}`}
                        target="_blank"
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Navigate"
                      >
                        🗺️
                      </a>
                      <button
                        onClick={() => startOrder(customer.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-2 font-medium transition-colors"
                      >
                        <span>🛒</span> Start Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
