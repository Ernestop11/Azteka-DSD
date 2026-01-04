'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Building,
  Calendar,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react'

interface Deposit {
  id: string
  date: string
  amount: number
  type: 'CASH' | 'CHECK' | 'CARD' | 'ACH'
  source: string
  status: 'PENDING' | 'DEPOSITED' | 'RECONCILED'
  notes: string | null
  bankReference: string | null
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    // TODO: Connect to real API
    setLoading(false)
    // Mock data
    setDeposits([
      {
        id: '1',
        date: new Date().toISOString(),
        amount: 3250.00,
        type: 'CASH',
        source: 'Daily Sales',
        status: 'PENDING',
        notes: null,
        bankReference: null
      },
      {
        id: '2',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1580.50,
        type: 'CHECK',
        source: 'Customer Payment - Los Compadres',
        status: 'DEPOSITED',
        notes: 'Check #4521',
        bankReference: 'DEP-001234'
      },
      {
        id: '3',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 4720.00,
        type: 'CASH',
        source: 'Daily Sales',
        status: 'RECONCILED',
        notes: null,
        bankReference: 'DEP-001233'
      }
    ])
  }

  const getTypeIcon = (type: Deposit['type']) => {
    switch (type) {
      case 'CASH': return <Banknote className="w-5 h-5 text-emerald-400" />
      case 'CHECK': return <Receipt className="w-5 h-5 text-blue-400" />
      case 'CARD': return <CreditCard className="w-5 h-5 text-purple-400" />
      case 'ACH': return <Building className="w-5 h-5 text-orange-400" />
    }
  }

  const getStatusBadge = (status: Deposit['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>
      case 'DEPOSITED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"><Building className="w-3 h-3" /> Deposited</span>
      case 'RECONCILED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Reconciled</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const filteredDeposits = deposits.filter(deposit =>
    deposit.source.toLowerCase().includes(search.toLowerCase()) ||
    deposit.bankReference?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    pending: deposits.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0),
    deposited: deposits.filter(d => d.status === 'DEPOSITED').reduce((sum, d) => sum + d.amount, 0),
    total: deposits.reduce((sum, d) => sum + d.amount, 0)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposits</h1>
          <p className="text-slate-400">Track cash and check deposits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Deposit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            Pending
          </div>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.pending)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Building className="w-4 h-4 text-blue-400" />
            Deposited
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.deposited)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            This Week
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.total)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deposits..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Deposits List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No deposits found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredDeposits.map(deposit => (
              <div key={deposit.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                      {getTypeIcon(deposit.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium">{deposit.source}</h3>
                        {getStatusBadge(deposit.status)}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(deposit.date)}
                        </span>
                        <span>{deposit.type}</span>
                        {deposit.bankReference && (
                          <span className="text-slate-400">Ref: {deposit.bankReference}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(deposit.amount)}</p>
                    {deposit.notes && (
                      <p className="text-slate-500 text-sm">{deposit.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          Full deposit tracking is being built. This will connect to bank reconciliation and generate daily cash reports.
        </p>
      </div>

      {/* Record Deposit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Record Deposit</h2>
            <p className="text-slate-400 mb-6">
              Deposit recording form coming soon.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
