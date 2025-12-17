'use client'

/**
 * Warehouse Print Queue Management Page
 * Minimal admin panel for viewing and managing print jobs
 *
 * LAP W1: Warehouse Auto-Print Engine - Phase 4
 */

import { useState, useEffect } from 'react'
import type {
  PrintQueueEntry,
  PrintQueueSummary,
  PrintQueueFilters,
} from '@/warehouse/print/printTypes'

// ============================================================================
// TYPES
// ============================================================================

interface QueueData {
  jobs: PrintQueueEntry[]
  summary: PrintQueueSummary
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PrintQueuePage() {
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PrintQueueFilters>({
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch queue data
  const fetchQueue = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call when implemented
      // const response = await fetch('/api/warehouse/print-queue', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters),
      // })
      // const result = await response.json()
      // setData(result)

      // Stub data for now
      const stubData: QueueData = {
        jobs: [],
        summary: {
          totalJobs: 0,
          pendingJobs: 0,
          printingJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          cancelledJobs: 0,
        },
      }
      setData(stubData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchQueue()
  }, [filters])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, filters])

  // Retry failed jobs
  const handleRetryFailed = async () => {
    try {
      // TODO: Implement API call
      // await fetch('/api/warehouse/print-queue/retry-failed', { method: 'POST' })
      console.log('Retry failed jobs - not yet implemented')
      await fetchQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry jobs')
    }
  }

  // Cancel job
  const handleCancelJob = async (jobId: string) => {
    if (!confirm('Cancel this print job?')) return

    try {
      // TODO: Implement API call
      // await fetch(`/api/warehouse/print-queue/${jobId}/cancel`, { method: 'POST' })
      console.log(`Cancel job ${jobId} - not yet implemented`)
      await fetchQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job')
    }
  }

  // Reprint job
  const handleReprint = async (jobId: string) => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/warehouse/print-queue/${jobId}/reprint`, { method: 'POST' })
      console.log(`Reprint job ${jobId} - not yet implemented`)
      await fetchQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reprint')
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading print queue...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Print Queue</h1>
          <p className="mt-2 text-gray-600">Warehouse packing slip print management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <SummaryCard label="Total" value={data.summary.totalJobs || 0} color="gray" />
            <SummaryCard label="Pending" value={data.summary.pendingJobs || 0} color="blue" />
            <SummaryCard label="Printing" value={data.summary.printingJobs || 0} color="yellow" />
            <SummaryCard label="Completed" value={data.summary.completedJobs || 0} color="green" />
            <SummaryCard label="Failed" value={data.summary.failedJobs || 0} color="red" />
            <SummaryCard label="Cancelled" value={data.summary.cancelledJobs || 0} color="gray" />
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Auto-refresh (5s)</span>
            </label>

            {/* Status filter */}
            <select
              value={filters.status as string || 'all'}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value as any })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="printing">Printing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Refresh button */}
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            {/* Retry failed button */}
            <button
              onClick={handleRetryFailed}
              disabled={!data || data.summary.failedJobs === 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
            >
              Retry Failed ({data?.summary.failedJobs || 0})
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attempts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data && data.jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No print jobs in queue
                    </td>
                  </tr>
                ) : (
                  data?.jobs.map((job) => (
                    <JobRow
                      key={job.id || job.jobId}
                      job={job}
                      onCancel={handleCancelJob}
                      onReprint={handleReprint}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Footer */}
        {data && data.summary.successRate !== undefined && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Success Rate:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {data.summary.successRate.toFixed(1)}%
                </span>
              </div>
              {data.summary.averageCompletionTime && (
                <div>
                  <span className="text-gray-500">Avg Completion:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {(data.summary.averageCompletionTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {data.summary.oldestPendingJob && (
                <div>
                  <span className="text-gray-500">Oldest Pending:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {formatRelativeTime(data.summary.oldestPendingJob)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'red'
}) {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-900 border-gray-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    red: 'bg-red-50 text-red-900 border-red-200',
  }

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function JobRow({
  job,
  onCancel,
  onReprint,
}: {
  job: PrintQueueEntry
  onCancel: (jobId: string) => void
  onReprint: (jobId: string) => void
}) {
  const statusColors = {
    pending: 'bg-blue-100 text-blue-800',
    printing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  const priorityColors = {
    low: 'text-gray-600',
    normal: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{job.orderNumber}</p>
          <p className="text-xs text-gray-500">{job.orderId}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[job.status === 'queued' ? 'pending' : job.status]
          }`}
        >
          {job.status}
        </span>
        {job.errorMessage && (
          <p className="text-xs text-red-600 mt-1">{job.errorMessage}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-medium ${priorityColors[job.priority]}`}>
          {job.priority}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {job.attemptCount} / {job.maxAttempts}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatRelativeTime(job.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {job.status !== 'completed' && job.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(job.id || job.jobId)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Cancel
            </button>
          )}
          {job.status === 'completed' && (
            <button
              onClick={() => onReprint(job.id || job.jobId)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Reprint
            </button>
          )}
          <a
            href={`/warehouse/print/${job.id}`}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
          >
            Details
          </a>
        </div>
      </td>
    </tr>
  )
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}
