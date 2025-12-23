'use client'

/**
 * Employee Payroll Dashboard
 *
 * Shows employee time entries, calculates hours worked, and estimates payroll.
 * Ana can see who's clocked in, review activity, and export for payroll.
 */

import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Timer,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: string
  hourlyRate: number
  active: boolean
}

interface TimeEntry {
  id: string
  employeeId: string
  clockIn: string
  clockOut: string | null
  hoursWorked: number | null
  employee?: Employee
}

interface EmployeeSummary {
  employee: Employee
  entries: TimeEntry[]
  totalHours: number
  estimatedPay: number
  isClockedIn: boolean
}

interface PayrollPeriod {
  start: Date
  end: Date
  label: string
}

export default function PayrollPage() {
  const [summaries, setSummaries] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'today' | 'week' | 'biweekly' | 'month'>('week')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  // Calculate date range based on period
  const getDateRange = (): PayrollPeriod => {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'Today' }

      case 'week':
        // Start of this week (Sunday)
        const dayOfWeek = now.getDay()
        start.setDate(now.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'This Week' }

      case 'biweekly':
        // Last 14 days
        start.setDate(now.getDate() - 14)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'Last 2 Weeks' }

      case 'month':
        // Start of this month
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        return { start, end, label: 'This Month' }
    }
  }

  // Fetch employee data
  const fetchData = async () => {
    setLoading(true)
    try {
      const range = getDateRange()
      const params = new URLSearchParams({
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString()
      })

      const res = await fetch(`/api/admin/payroll?${params}`)
      if (!res.ok) throw new Error('Failed to fetch employee data')

      const data = await res.json()
      setSummaries(data.data || [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  // Calculate totals
  const totalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0)
  const totalPay = summaries.reduce((sum, s) => sum + s.estimatedPay, 0)
  const clockedInCount = summaries.filter(s => s.isClockedIn).length

  // Export to CSV
  const exportCSV = () => {
    const range = getDateRange()
    const headers = ['Employee', 'Role', 'Hours Worked', 'Hourly Rate', 'Estimated Pay']
    const rows = summaries.map(s => [
      `${s.employee.firstName} ${s.employee.lastName}`,
      s.employee.role,
      s.totalHours.toFixed(2),
      `$${s.employee.hourlyRate.toFixed(2)}`,
      `$${s.estimatedPay.toFixed(2)}`
    ])

    const csv = [
      `Payroll Report - ${range.label}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600">Time tracking and payroll overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['today', 'week', 'biweekly', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'today' ? 'Today' :
               p === 'week' ? 'This Week' :
               p === 'biweekly' ? 'Bi-Weekly' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={Users}
          label="Active Employees"
          value={summaries.length}
          color="blue"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Clocked In Now"
          value={clockedInCount}
          color="green"
        />
        <SummaryCard
          icon={Timer}
          label="Total Hours"
          value={totalHours.toFixed(1)}
          color="purple"
        />
        <SummaryCard
          icon={DollarSign}
          label="Estimated Payroll"
          value={`$${totalPay.toFixed(2)}`}
          color="emerald"
        />
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employee Breakdown</h2>
        </div>

        {summaries.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No employee activity for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {summaries.map(summary => (
              <EmployeeRow
                key={summary.employee.id}
                summary={summary}
                isExpanded={expandedEmployee === summary.employee.id}
                onToggle={() => setExpandedEmployee(
                  expandedEmployee === summary.employee.id ? null : summary.employee.id
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Summary Card Component
function SummaryCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: any
  label: string
  value: string | number
  color: 'blue' | 'green' | 'purple' | 'emerald'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

// Employee Row Component
function EmployeeRow({
  summary,
  isExpanded,
  onToggle
}: {
  summary: EmployeeSummary
  isExpanded: boolean
  onToggle: () => void
}) {
  const roleColors: Record<string, string> = {
    WAREHOUSE: 'bg-blue-100 text-blue-700',
    DRIVER: 'bg-purple-100 text-purple-700',
    OFFICE: 'bg-gray-100 text-gray-700',
    MANAGER: 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              {summary.employee.firstName} {summary.employee.lastName}
              {summary.isClockedIn && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Working
                </span>
              )}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[summary.employee.role] || 'bg-gray-100 text-gray-600'}`}>
              {summary.employee.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{summary.totalHours.toFixed(1)} hrs</p>
            <p className="text-sm text-gray-500">${summary.employee.hourlyRate}/hr</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">${summary.estimatedPay.toFixed(2)}</p>
            <p className="text-xs text-gray-400">estimated</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Time Entries */}
      {isExpanded && summary.entries.length > 0 && (
        <div className="px-4 pb-4 bg-gray-50">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Clock In</th>
                  <th className="px-4 py-2 text-left text-gray-600">Clock Out</th>
                  <th className="px-4 py-2 text-right text-gray-600">Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {summary.entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(entry.clockIn).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {entry.clockOut
                        ? new Date(entry.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : <span className="text-emerald-600 font-medium">Active</span>
                      }
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                      {entry.hoursWorked?.toFixed(2) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
