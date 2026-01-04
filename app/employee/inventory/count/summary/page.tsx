'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Lock,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface InventoryCount {
  id: string
  name: string
  status: string
  createdAt: string
  closedAt?: string
}

interface Summary {
  count: InventoryCount
  totals: {
    itemsCounted: number
    totalCases: number
    totalCapitalCost: number
    totalCapitalSell: number
    totalVariance: number
    positiveVariance: number
    negativeVariance: number
    flaggedForDateCheck: number
  }
  statusCounts: {
    COUNTED: number
    VERIFIED: number
    RECOUNT_NEEDED: number
    CORRECTED: number
  }
  counterStats: Array<{
    id: string
    name: string
    itemsCounted: number
    corrections: number
  }>
  checkerStats: Array<{
    id: string
    name: string
    itemsVerified: number
    correctionsMade: number
  }>
  discrepancies: Array<{
    productId: string
    productName: string
    sku: string
    expected: number
    counted: number
    variance: number
    variancePercent: number
  }>
}

export default function SummaryPage() {
  const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get inventory counts
      const countRes = await fetch('/api/employee/inventory-count')
      if (countRes.ok) {
        const countData = await countRes.json()
        const openCount = countData.counts?.find((c: InventoryCount) => c.status === 'OPEN')
        setActiveCount(openCount || null)

        if (openCount) {
          await loadSummary(openCount.id)
        }
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async (countId: string) => {
    try {
      const res = await fetch(`/api/employee/inventory-count/${countId}/summary`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to load summary:', error)
    }
  }

  const refreshSummary = async () => {
    if (!activeCount) return
    setRefreshing(true)
    await loadSummary(activeCount.id)
    setRefreshing(false)
  }

  const closeCountSession = async () => {
    if (!activeCount || !summary) return

    const pendingItems = summary.statusCounts.COUNTED + summary.statusCounts.RECOUNT_NEEDED
    if (pendingItems > 0) {
      const confirm = window.confirm(
        `There are ${pendingItems} items not yet verified. Are you sure you want to close this count session?`
      )
      if (!confirm) return
    }

    setClosing(true)
    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLOSED',
          totalCases: summary.totals.totalCases,
          totalCapitalCost: summary.totals.totalCapitalCost,
          totalCapitalSell: summary.totals.totalCapitalSell
        })
      })

      if (res.ok) {
        alert('Count session closed successfully!')
        setActiveCount(prev => prev ? { ...prev, status: 'CLOSED' } : null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to close session')
      }
    } catch (error) {
      console.error('Failed to close session:', error)
    } finally {
      setClosing(false)
    }
  }

  const exportCSV = () => {
    if (!summary) return

    let csv = 'Product,SKU,Expected,Counted,Variance,Variance %\n'
    summary.discrepancies.forEach(d => {
      csv += `"${d.productName}",${d.sku},${d.expected},${d.counted},${d.variance},${d.variancePercent}%\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-count-${activeCount?.name.replace(/\s+/g, '-')}-discrepancies.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    )
  }

  if (!activeCount) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
        <Package className="w-16 h-16 text-slate-500" />
        <h2 className="text-xl font-bold text-white">No Active Count Session</h2>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
        <RefreshCw className="w-16 h-16 text-slate-500" />
        <h2 className="text-xl font-bold text-white">Loading Summary...</h2>
      </div>
    )
  }

  const isClosed = activeCount.status === 'CLOSED'

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">{summary.count.name}</h2>
          <p className="text-slate-400 text-sm">
            {isClosed ? 'Closed' : 'In Progress'} | {summary.totals.itemsCounted} items
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshSummary}
            disabled={refreshing}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-900/50 border border-emerald-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">Total Cases</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totals.totalCases.toLocaleString()}</p>
        </div>

        <div className="bg-blue-900/50 border border-blue-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Capital @ Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totals.totalCapitalCost)}</p>
        </div>

        <div className="bg-purple-900/50 border border-purple-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Capital @ Sell</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totals.totalCapitalSell)}</p>
        </div>

        <div className={`${summary.totals.totalVariance >= 0 ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'} border rounded-xl p-4`}>
          <div className={`flex items-center gap-2 ${summary.totals.totalVariance >= 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>
            {summary.totals.totalVariance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm">Net Variance</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {summary.totals.totalVariance > 0 ? '+' : ''}{summary.totals.totalVariance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-white font-bold mb-3">Verification Status</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-yellow-400">{summary.statusCounts.COUNTED}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{summary.statusCounts.VERIFIED}</p>
            <p className="text-xs text-slate-400">Verified</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{summary.statusCounts.RECOUNT_NEEDED}</p>
            <p className="text-xs text-slate-400">Recount</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{summary.statusCounts.CORRECTED}</p>
            <p className="text-xs text-slate-400">Corrected</p>
          </div>
        </div>
      </div>

      {/* Counter Stats */}
      {summary.counterStats.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Counter Performance
          </h3>
          <div className="space-y-2">
            {summary.counterStats.map((counter) => (
              <div key={counter.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <span className="text-white">{counter.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">{counter.itemsCounted} items</span>
                  {counter.corrections > 0 && (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {counter.corrections}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checker Stats */}
      {summary.checkerStats.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Checker Activity
          </h3>
          <div className="space-y-2">
            {summary.checkerStats.map((checker) => (
              <div key={checker.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <span className="text-white">{checker.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400">{checker.itemsVerified} verified</span>
                  {checker.correctionsMade > 0 && (
                    <span className="text-blue-400">{checker.correctionsMade} corrected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies */}
      {summary.discrepancies.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Top Discrepancies
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary.discrepancies.slice(0, 10).map((d) => (
              <div key={d.productId} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{d.productName}</p>
                  <p className="text-slate-500 text-xs">{d.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${d.variance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {d.variance > 0 ? '+' : ''}{d.variance}
                  </p>
                  <p className="text-slate-500 text-xs">{d.variancePercent}%</p>
                </div>
              </div>
            ))}
          </div>
          {summary.discrepancies.length > 10 && (
            <p className="text-slate-500 text-sm text-center mt-2">
              +{summary.discrepancies.length - 10} more discrepancies
            </p>
          )}
        </div>
      )}

      {/* Flagged Items Warning */}
      {summary.totals.flaggedForDateCheck > 0 && (
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">{summary.totals.flaggedForDateCheck} items need date verification</span>
          </div>
          <p className="text-red-300 text-sm mt-1">
            Check the Flagged tab to set expiration dates before closing.
          </p>
        </div>
      )}

      {/* Close Session Button */}
      {!isClosed && (
        <button
          onClick={closeCountSession}
          disabled={closing}
          className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          {closing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Close Count Session
            </>
          )}
        </button>
      )}

      {isClosed && (
        <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-bold">Count Session Closed</p>
          <p className="text-green-300 text-sm">
            Closed on {new Date(activeCount.closedAt!).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}
