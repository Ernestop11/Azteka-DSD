'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Send
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: string
  amount: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  dueDate: string
  createdAt: string
  paidAt: string | null
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    // TODO: Connect to real API
    setLoading(false)
    // Mock data
    setInvoices([
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customer: 'La Michoacana',
        amount: 1250.00,
        status: 'PAID',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customer: 'Taqueria Los Primos',
        amount: 890.50,
        status: 'SENT',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        customer: 'Carniceria Central',
        amount: 2340.00,
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null
      }
    ])
  }

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs"><FileText className="w-3 h-3" /> Draft</span>
      case 'SENT':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"><Send className="w-3 h-3" /> Sent</span>
      case 'PAID':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Paid</span>
      case 'OVERDUE':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"><AlertCircle className="w-3 h-3" /> Overdue</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: invoices.reduce((sum, i) => sum + i.amount, 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
    pending: invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400">Manage customer invoices and payments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors">
          <FileText className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Total
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.total)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Collected
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            Pending
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.pending)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Overdue
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdue)}</p>
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
            placeholder="Search invoice or customer..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{invoice.customer}</td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <span className={invoice.status === 'OVERDUE' ? 'text-red-400' : 'text-slate-400'}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-bold">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          Full invoicing system is being built. This will include PDF generation, email sending, and payment tracking integration.
        </p>
      </div>
    </div>
  )
}
