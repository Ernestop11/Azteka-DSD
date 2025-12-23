'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Scan,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Camera
} from 'lucide-react'

// Dynamically import scanner to avoid SSR issues
const BarcodeScanner = dynamic(() => import('@/components/scanner/BarcodeScanner'), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading scanner...</div>
    </div>
  ),
})

// Types
interface PickTask {
  id: string
  orderId: string
  customerName: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  items: PickItem[]
  createdAt: string
}

interface PickItem {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage: string | null
  quantity: number
  location: string | null // e.g., "A-12-3"
  picked: boolean
}

// Priority colors
const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  URGENT: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400' },
  NORMAL: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-400' },
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400' },
}

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700' },
}

export default function PickingPage() {
  const [tasks, setTasks] = useState<PickTask[]>([])
  const [selectedTask, setSelectedTask] = useState<PickTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [scannerActive, setScannerActive] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/tasks?type=PICKING&status=PENDING,ASSIGNED,IN_PROGRESS')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  // Start picking a task
  const startTask = async (task: PickTask) => {
    try {
      await fetch(`/api/employee/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      setSelectedTask({ ...task, status: 'IN_PROGRESS' })
      // Vibrate for feedback
      if (navigator.vibrate) navigator.vibrate(50)
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  // Mark item as picked
  const pickItem = async (itemId: string) => {
    if (!selectedTask) return

    // Update local state immediately
    const updatedItems = selectedTask.items.map((item) =>
      item.id === itemId ? { ...item, picked: true } : item
    )
    setSelectedTask({ ...selectedTask, items: updatedItems })

    // Vibrate and play sound
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])

    // Check if all items picked
    const allPicked = updatedItems.every((item) => item.picked)
    if (allPicked) {
      // Auto-complete task
      await completeTask()
    }

    // Log pick action
    try {
      await fetch('/api/employee/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          itemId,
          action: 'PICK_ITEM',
        }),
      })
    } catch (error) {
      console.error('Failed to log pick:', error)
    }
  }

  // Complete task
  const completeTask = async () => {
    if (!selectedTask) return

    try {
      await fetch(`/api/employee/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      // Celebrate!
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])
      setSelectedTask(null)
      fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  // Handle barcode scan
  const handleScan = (code: string) => {
    if (!selectedTask) return

    setLastScanned(code)

    // Find item by SKU
    const item = selectedTask.items.find(
      (i) => i.productSku.toLowerCase() === code.toLowerCase() && !i.picked
    )

    if (item) {
      pickItem(item.id)
    } else {
      // Wrong item or already picked
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
    }
  }

  // Calculate progress
  const getProgress = (task: PickTask) => {
    const picked = task.items.filter((i) => i.picked).length
    return { picked, total: task.items.length, percent: Math.round((picked / task.items.length) * 100) }
  }

  // Task List View
  if (!selectedTask) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Picking Tasks</h1>
                <p className="text-emerald-100 mt-1">Tap a task to start picking</p>
              </div>
              <button
                onClick={fetchTasks}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">All caught up!</h3>
              <p className="text-gray-500 mt-2">No picking tasks right now</p>
            </div>
          ) : (
            tasks.map((task) => {
              const progress = getProgress(task)
              const priority = priorityColors[task.priority]
              const status = statusColors[task.status]

              return (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => startTask(task)}
                  className={`w-full text-left bg-white rounded-2xl shadow-sm border-l-4 ${priority.border} overflow-hidden hover:shadow-md transition-shadow`}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priority.bg} ${priority.text}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{task.customerName}</h3>
                        <p className="text-sm text-gray-500">Order #{task.orderId.slice(-8)}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {task.items.length} items
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {progress.picked > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-700">
                            {progress.picked}/{progress.total}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product preview */}
                  <div className="flex gap-1 px-4 pb-4 overflow-x-auto">
                    {task.items.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className={`w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden ${
                          item.picked ? 'ring-2 ring-emerald-400' : ''
                        }`}
                      >
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt=""
                            className={`w-full h-full object-contain ${item.picked ? 'opacity-50' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        {item.picked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    ))}
                    {task.items.length > 5 && (
                      <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">+{task.items.length - 5}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Picking View (when task is selected)
  const progress = getProgress(selectedTask)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{selectedTask.customerName}</h1>
              <p className="text-purple-200 text-sm">Order #{selectedTask.orderId.slice(-8)}</p>
            </div>
            <button
              onClick={() => setScannerActive(!scannerActive)}
              className={`p-3 rounded-full transition-colors ${
                scannerActive ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-purple-200">
                {progress.picked} of {progress.total} items picked
              </span>
              <span className="font-bold">{progress.percent}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scanner View */}
      <AnimatePresence>
        {scannerActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <BarcodeScanner
              isActive={scannerActive}
              onScan={handleScan}
              onError={(error) => console.error('Scanner error:', error)}
            />
            {lastScanned && (
              <div className="bg-gray-900 py-2 text-center">
                <span className="text-emerald-400 text-sm font-mono">
                  Last scan: {lastScanned}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {selectedTask.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                item.picked ? 'ring-2 ring-emerald-400' : ''
              }`}
            >
              <div className="flex items-center p-3">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className={`w-full h-full object-contain ${item.picked ? 'opacity-50' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 ml-4">
                  <h3 className={`font-bold text-gray-900 ${item.picked ? 'line-through opacity-50' : ''}`}>
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-500">SKU: {item.productSku}</p>

                  {/* Location */}
                  {item.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-mono font-bold text-blue-600">
                        {item.location}
                      </span>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Pick Button */}
                <button
                  onClick={() => pickItem(item.id)}
                  disabled={item.picked}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                    item.picked
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600 active:scale-95'
                  }`}
                >
                  {item.picked ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Scan className="w-8 h-8" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t px-4 py-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          {progress.picked === progress.total ? (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={completeTask}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6" />
              Complete & Pack
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setScannerActive(!scannerActive)}
                className="flex-1 py-4 bg-purple-100 text-purple-700 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {scannerActive ? 'Close Scanner' : 'Scan Barcode'}
              </button>
              <button
                onClick={completeTask}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                Skip to Pack
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
