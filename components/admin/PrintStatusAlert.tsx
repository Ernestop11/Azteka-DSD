'use client'

import { useState, useEffect } from 'react'
import { Printer, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react'

interface PrintAgent {
  name: string
  isOnline: boolean
  lastHeartbeat: string | null
  minutesAgo: number
  printerStatus: string
  printerName: string | null
  queueDepth: number
  lastError: string | null
}

interface PrintQueueStats {
  pending: number
  printing: number
  completedToday: number
  failedToday: number
  oldestWaitMinutes: number
}

interface PrintStatusData {
  success: boolean
  system: {
    isOnline: boolean
    hasAgents: boolean
    agentCount: number
  }
  agents: PrintAgent[]
  queue: PrintQueueStats
  alert: {
    type: 'warning' | 'info' | 'error'
    title: string
    message: string
  } | null
}

export default function PrintStatusAlert() {
  const [status, setStatus] = useState<PrintStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/print-queue/status', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch print status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Don't show if dismissed or loading
  if (dismissed || loading) return null

  // Don't show if no alert
  if (!status?.alert) return null

  const alertStyles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  const iconStyles = {
    warning: 'text-amber-500',
    info: 'text-blue-500',
    error: 'text-red-500',
  }

  return (
    <div className={`rounded-lg border p-4 ${alertStyles[status.alert.type]} mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconStyles[status.alert.type]}`}>
          {status.alert.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Printer className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{status.alert.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLoading(true)
                  fetchStatus()
                }}
                className="p-1 hover:bg-black/10 rounded"
                title="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-black/10 rounded"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm mt-1 opacity-90">{status.alert.message}</p>

          {/* Queue stats if there are pending jobs */}
          {status.queue.pending > 0 && (
            <div className="mt-2 text-sm">
              <span className="font-medium">{status.queue.pending}</span> job(s) waiting
              {status.queue.oldestWaitMinutes > 0 && (
                <span className="opacity-75">
                  {' '}(oldest: {status.queue.oldestWaitMinutes} min)
                </span>
              )}
            </div>
          )}

          {/* Expandable details */}
          {status.agents.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm mt-2 underline opacity-75 hover:opacity-100"
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          )}

          {expanded && status.agents.length > 0 && (
            <div className="mt-3 space-y-2">
              {status.agents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between text-sm bg-white/50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {agent.isOnline
                      ? `Online (${agent.minutesAgo}m ago)`
                      : `Last seen ${agent.minutesAgo}m ago`}
                  </div>
                </div>
              ))}

              <div className="text-xs opacity-75 mt-2">
                Today: {status.queue.completedToday} printed
                {status.queue.failedToday > 0 && (
                  <span className="text-red-600 ml-2">
                    {status.queue.failedToday} failed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
