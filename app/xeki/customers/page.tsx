'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Navigation,
  Plus
} from 'lucide-react'

interface Customer {
  id: string
  businessName: string
  contactName: string
  address: string
  phone: string
  lastOrder: string | null
  totalOrders: number
  balance: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    // TODO: Connect to real API
    setLoading(false)
    // Mock data
    setCustomers([
      {
        id: '1',
        businessName: 'Taqueria Los Primos',
        contactName: 'Carlos Martinez',
        address: '1234 Main St, Los Angeles, CA',
        phone: '(323) 555-0123',
        lastOrder: '2 days ago',
        totalOrders: 45,
        balance: 0
      },
      {
        id: '2',
        businessName: 'La Michoacana #5',
        contactName: 'Maria Gonzalez',
        address: '5678 Central Ave, Los Angeles, CA',
        phone: '(323) 555-0456',
        lastOrder: '1 week ago',
        totalOrders: 32,
        balance: 180.50
      },
      {
        id: '3',
        businessName: 'Carniceria El Toro',
        contactName: 'Jose Rodriguez',
        address: '910 Broadway, Los Angeles, CA',
        phone: '(323) 555-0789',
        lastOrder: '3 days ago',
        totalOrders: 28,
        balance: 0
      },
      {
        id: '4',
        businessName: 'Panaderia La Rosa',
        contactName: 'Ana Lopez',
        address: '234 First St, Los Angeles, CA',
        phone: '(323) 555-0222',
        lastOrder: 'Today',
        totalOrders: 15,
        balance: 125.00
      }
    ])
  }

  const filteredCustomers = customers.filter(c =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Customers</h1>
          <p className="text-slate-400">{customers.length} active accounts</p>
        </div>
        <button className="p-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-800 rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{customer.businessName}</h3>
                    <p className="text-slate-400 text-sm">{customer.contactName}</p>
                  </div>
                  {customer.balance > 0 && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-lg">
                      {formatCurrency(customer.balance)} due
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {customer.address}
                  </p>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {customer.lastOrder || 'No orders'}
                    </span>
                    <span className="text-slate-500">
                      {customer.totalOrders} orders
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 grid grid-cols-3 divide-x divide-slate-700">
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center justify-center gap-2 py-3 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm">Navigate</span>
                </a>
                <a
                  href={`/xeki/orders?customer=${customer.id}`}
                  className="flex items-center justify-center gap-2 py-3 text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">New Order</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
