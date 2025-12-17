'use client'

/**
 * Warehouse Print Job Details Page
 * View individual print job details and preview/reprint
 *
 * LAP W1: Warehouse Auto-Print Engine - Phase 4
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { PrintQueueEntry } from '@/warehouse/print/printTypes'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PrintJobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [job, setJob] = useState<PrintQueueEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch job details
  const fetchJob = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/warehouse/print-queue/${jobId}`)
      // const result = await response.json()
      // setJob(result.job)

      // Stub for now
      setJob(null)
      setError('Print job not found (API not yet implemented)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
  }, [jobId])

  // Reprint job
  const handleReprint = async () => {
    if (!confirm('Reprint this packing slip?')) return

    try {
      // TODO: Implement API call
      // await fetch(`/api/warehouse/print-queue/${jobId}/reprint`, { method: 'POST' })
      console.log(`Reprint job ${jobId} - not yet implemented`)
      await fetchJob()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reprint')
    }
  }

  // Cancel job
  const handleCancel = async () => {
    if (!confirm('Cancel this print job?')) return

    try {
      // TODO: Implement API call
      // await fetch(`/api/warehouse/print-queue/${jobId}/cancel`, { method: 'POST' })
      console.log(`Cancel job ${jobId} - not yet implemented`)
      await fetchJob()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    }
  }

  // Delete job
  const handleDelete = async () => {
    if (!confirm('Delete this print job? This cannot be undone.')) return

    try {
      // TODO: Implement API call
      // await fetch(`/api/warehouse/print-queue/${jobId}`, { method: 'DELETE' })
      console.log(`Delete job ${jobId} - not yet implemented`)
      router.push('/warehouse/print-queue')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      // TODO: Implement PDF download
      // const response = await fetch(`/api/warehouse/print-queue/${jobId}/pdf`)
      // const blob = await response.blob()
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = `packing-slip-${job?.orderNumber}.pdf`
      // a.click()
      console.log(`Download PDF for job ${jobId} - not yet implemented`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => router.push('/warehouse/print-queue')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Print job not found</p>
            <button
              onClick={() => router.push('/warehouse/print-queue')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    printing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/warehouse/print-queue')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            <span>←</span> Back to Queue
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Print Job Details</h1>
          <p className="mt-2 text-gray-600">Job ID: {job.id}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Status Card */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${statusColors[job.status === 'queued' ? 'pending' : job.status]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Current Status</p>
              <p className="text-3xl font-bold mt-1 uppercase">{job.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-75">Priority</p>
              <p className="text-2xl font-bold mt-1 uppercase">{job.priority}</p>
            </div>
          </div>
          {job.errorMessage && (
            <div className="mt-4 p-3 bg-white/50 rounded border border-red-300">
              <p className="text-sm font-medium text-red-900">Error:</p>
              <p className="text-sm text-red-800 mt-1">{job.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Number</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{job.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Order ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{job.orderId}</dd>
            </div>
            {job.metadata?.storeName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Store</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.metadata.storeName}</dd>
              </div>
            )}
            {job.metadata?.salesRepName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Sales Rep</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.metadata.salesRepName}</dd>
              </div>
            )}
            {job.metadata?.itemCount !== undefined && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Items</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.metadata.itemCount}</dd>
              </div>
            )}
            {job.metadata?.totalUnits !== undefined && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Units</dt>
                <dd className="mt-1 text-sm text-gray-900">{job.metadata.totalUnits}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Print Job Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Print Job Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Copies</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.copies}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Attempts</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.attemptCount} / {job.maxAttempts}
              </dd>
            </div>
            {job.printerId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Printer ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{job.printerId}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(job.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : new Date(job.createdAt).toLocaleString()}
              </dd>
            </div>
            {job.completedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(job.completedAt).toLocaleString()}
                </dd>
              </div>
            )}
            {job.scheduledFor && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(job.scheduledFor).toLocaleString()}
                </dd>
              </div>
            )}
            {job.lockedBy && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Locked By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.lockedBy}</dd>
                </div>
                {job.lockedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Locked At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(job.lockedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {job.status === 'completed' && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleReprint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Reprint
                </button>
              </>
            )}
            {job.status !== 'completed' && job.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Cancel Job
              </button>
            )}
            {(job.status === 'completed' ||
              job.status === 'failed' ||
              job.status === 'cancelled') && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Job
              </button>
            )}
            <button
              onClick={fetchJob}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* PDF Preview Placeholder */}
        {job.status === 'completed' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PDF Preview</h2>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                PDF preview will be displayed here once implemented
              </p>
              <button
                onClick={handleDownloadPDF}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
