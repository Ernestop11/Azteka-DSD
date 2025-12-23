'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Package,
  QrCode,
  Check,
  Plus,
  Printer,
  ChevronRight,
  Box,
  Scan,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  quantity: number
  packed: number
}

interface BoxData {
  id: string
  qrCode: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
  }>
  status: 'PACKING' | 'SEALED'
}

interface PackingTask {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  items: OrderItem[]
  boxes: BoxData[]
}

type ViewMode = 'tasks' | 'packing'

export default function PackingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('tasks')
  const [tasks, setTasks] = useState<PackingTask[]>([])
  const [selectedTask, setSelectedTask] = useState<PackingTask | null>(null)
  const [currentBox, setCurrentBox] = useState<BoxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)

  // Fetch packing tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/tasks?type=PACKING&status=PENDING,IN_PROGRESS')
      const json = await res.json()

      if (json.data) {
        setTasks(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    // Poll every 30 seconds
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  // Start packing a task
  const startPacking = async (task: PackingTask) => {
    // Update task status to IN_PROGRESS
    await fetch(`/api/employee/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    })

    setSelectedTask(task)
    setViewMode('packing')

    // Create first box if none exist
    if (task.boxes.length === 0) {
      await createNewBox(task.orderId)
    } else {
      setCurrentBox(task.boxes[0])
    }
  }

  // Create a new box for the order
  const createNewBox = async (orderId: string) => {
    try {
      const res = await fetch('/api/boxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: [], // Empty box to start
        }),
      })

      const json = await res.json()
      if (json.data) {
        const newBox: BoxData = {
          id: json.data.id,
          qrCode: json.data.qrCode,
          items: [],
          status: 'PACKING',
        }
        setCurrentBox(newBox)

        // Update selected task with new box
        if (selectedTask) {
          setSelectedTask({
            ...selectedTask,
            boxes: [...selectedTask.boxes, newBox],
          })
        }
      }
    } catch (error) {
      console.error('Failed to create box:', error)
    }
  }

  // Add item to current box
  const addItemToBox = async (item: OrderItem, quantity: number = 1) => {
    if (!currentBox || !selectedTask) return

    const existingItem = currentBox.items.find((i) => i.productId === item.productId)

    const updatedItems = existingItem
      ? currentBox.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [
          ...currentBox.items,
          {
            productId: item.productId,
            productName: item.productName,
            quantity,
          },
        ]

    setCurrentBox({ ...currentBox, items: updatedItems })

    // Update packed count in task items
    const updatedTaskItems = selectedTask.items.map((i) =>
      i.productId === item.productId
        ? { ...i, packed: Math.min(i.packed + quantity, i.quantity) }
        : i
    )

    setSelectedTask({ ...selectedTask, items: updatedTaskItems })
  }

  // Seal the current box and print QR label
  const sealBox = async () => {
    if (!currentBox) return

    setPrinting(true)

    try {
      // Update box status
      await fetch(`/api/boxes/${currentBox.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seal' }),
      })

      // Print box label (would trigger Bluetooth printer in production)
      // For now, just show success

      setCurrentBox({ ...currentBox, status: 'SEALED' })

      // Check if all items are packed
      if (selectedTask) {
        const allPacked = selectedTask.items.every((i) => i.packed >= i.quantity)

        if (allPacked) {
          // Complete the packing task
          await fetch(`/api/employee/tasks/${selectedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' }),
          })

          // Go back to task list
          setViewMode('tasks')
          setSelectedTask(null)
          setCurrentBox(null)
          fetchTasks()
        }
      }
    } catch (error) {
      console.error('Failed to seal box:', error)
    } finally {
      setPrinting(false)
    }
  }

  // Calculate progress
  const getProgress = (task: PackingTask) => {
    const totalItems = task.items.reduce((sum, i) => sum + i.quantity, 0)
    const packedItems = task.items.reduce((sum, i) => sum + i.packed, 0)
    return Math.round((packedItems / totalItems) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading packing tasks...</p>
        </motion.div>
      </div>
    )
  }

  // Task list view
  if (viewMode === 'tasks') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Packing Station</h1>
                <p className="text-sm text-slate-500">{tasks.length} orders to pack</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-3">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">All Caught Up!</h2>
                <p className="text-slate-600">No orders waiting to be packed.</p>
              </motion.div>
            ) : (
              tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-800">
                        Order #{task.orderNumber}
                      </p>
                      <p className="text-sm text-slate-500">{task.customerName}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status === 'IN_PROGRESS' ? 'Packing' : 'Ready'}
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                    {task.items.slice(0, 4).map((item) => (
                      <div
                        key={item.productId}
                        className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden"
                      >
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {task.items.length > 4 && (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-500">
                          +{task.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-800">{getProgress(task)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(task)}%` }}
                      />
                    </div>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={() => startPacking(task)}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
                  >
                    {task.status === 'IN_PROGRESS' ? 'Continue Packing' : 'Start Packing'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </main>
      </div>
    )
  }

  // Packing view
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setViewMode('tasks')
              setSelectedTask(null)
              setCurrentBox(null)
            }}
            className="flex items-center gap-2 text-slate-600"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <div className="text-center">
            <p className="font-bold text-slate-800">
              Order #{selectedTask?.orderNumber}
            </p>
            <p className="text-xs text-slate-500">{selectedTask?.customerName}</p>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Current Box */}
      {currentBox && (
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-800">Box {currentBox.qrCode}</p>
                <p className="text-sm text-purple-600">
                  {currentBox.items.reduce((sum, i) => sum + i.quantity, 0)} items
                </p>
              </div>
            </div>
            <button
              onClick={() => createNewBox(selectedTask?.orderId || '')}
              className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-600 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New Box
            </button>
          </div>
        </div>
      )}

      {/* Items to pack */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {selectedTask?.items.map((item) => {
            const remaining = item.quantity - item.packed
            const isComplete = remaining <= 0

            return (
              <motion.div
                key={item.productId}
                layout
                className={`bg-white rounded-2xl p-4 ${
                  isComplete ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Product image */}
                  <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm ${isComplete ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {item.packed} / {item.quantity} packed
                      </span>
                      {isComplete && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Add button */}
                  {!isComplete && (
                    <button
                      onClick={() => addItemToBox(item, 1)}
                      className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Quick add buttons */}
                {!isComplete && remaining > 1 && (
                  <div className="flex gap-2 mt-3 pl-20">
                    {[2, 5, remaining].filter((n, i, arr) => n <= remaining && arr.indexOf(n) === i).map((qty) => (
                      <button
                        key={qty}
                        onClick={() => addItemToBox(item, qty)}
                        className="px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200"
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="bg-white border-t border-slate-200 p-4 safe-area-bottom">
        <div className="flex gap-3">
          {/* Scan button */}
          <button className="flex-1 py-4 bg-slate-100 rounded-xl font-semibold text-slate-700 flex items-center justify-center gap-2">
            <Scan className="w-5 h-5" />
            Scan Item
          </button>

          {/* Seal & Print button */}
          <button
            onClick={sealBox}
            disabled={!currentBox || currentBox.items.length === 0 || printing}
            className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              currentBox && currentBox.items.length > 0
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {printing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                Seal & Print QR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
