'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  ClipboardList,
  Truck,
  Warehouse,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Timer
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

interface Stats {
  pendingOrders: number
  completedToday: number
  lowStockItems: number
  pendingDeliveries: number
}

interface ClockStatus {
  hasEmployee: boolean
  employeeId?: string
  employeeName?: string
  isClockedIn: boolean
  clockInTime?: string
  timeEntryId?: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({
    pendingOrders: 0,
    completedToday: 0,
    lowStockItems: 0,
    pendingDeliveries: 0
  })
  const [loading, setLoading] = useState(true)
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null)
  const [clockLoading, setClockLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState<string>('')

  // Calculate elapsed work time
  const calculateElapsed = useCallback(() => {
    if (!clockStatus?.clockInTime) return ''
    const start = new Date(clockStatus.clockInTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [clockStatus?.clockInTime])

  // Update elapsed time every second
  useEffect(() => {
    if (!clockStatus?.isClockedIn) return

    const timer = setInterval(() => {
      setElapsedTime(calculateElapsed())
    }, 1000)

    // Initial calculation
    setElapsedTime(calculateElapsed())

    return () => clearInterval(timer)
  }, [clockStatus?.isClockedIn, calculateElapsed])

  useEffect(() => {
    async function loadData() {
      try {
        // Get user session
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        if (sessionData.user) {
          setUser(sessionData.user)
        }

        // Check clock status and auto clock-in if needed
        const clockRes = await fetch('/api/employee/clock')
        const clockData = await clockRes.json()

        if (clockData.hasEmployee && !clockData.isClockedIn) {
          // Auto clock-in
          const clockInRes = await fetch('/api/employee/clock', { method: 'POST' })
          const clockInData = await clockInRes.json()
          if (clockInData.success) {
            setClockStatus({
              hasEmployee: true,
              employeeId: clockData.employeeId,
              employeeName: clockData.employeeName,
              isClockedIn: true,
              clockInTime: clockInData.clockInTime,
              timeEntryId: clockInData.timeEntryId
            })
          }
        } else {
          setClockStatus(clockData)
        }

        // TODO: Load actual stats from API
        setStats({
          pendingOrders: 12,
          completedToday: 8,
          lowStockItems: 5,
          pendingDeliveries: 4
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleClockOut = async () => {
    setClockLoading(true)
    try {
      const res = await fetch('/api/employee/clock', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setClockStatus(prev => prev ? { ...prev, isClockedIn: false, clockInTime: undefined } : null)
      }
    } catch (error) {
      console.error('Clock out failed:', error)
    } finally {
      setClockLoading(false)
    }
  }

  const handleClockIn = async () => {
    setClockLoading(true)
    try {
      const res = await fetch('/api/employee/clock', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setClockStatus(prev => prev ? {
          ...prev,
          isClockedIn: true,
          clockInTime: data.clockInTime,
          timeEntryId: data.timeEntryId
        } : null)
      }
    } catch (error) {
      console.error('Clock in failed:', error)
    } finally {
      setClockLoading(false)
    }
  }

  const isWarehouse = user?.role === 'WAREHOUSE' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isDriver = user?.role === 'DRIVER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const quickActions = [
    {
      title: 'Scan Products',
      description: 'Scan barcodes to seed SKUs to products',
      icon: Package,
      href: '/employee/products',
      color: 'from-blue-500 to-blue-600',
      show: isWarehouse
    },
    {
      title: 'Manage Inventory',
      description: 'Update stock counts and locations',
      icon: Warehouse,
      href: '/employee/inventory',
      color: 'from-purple-500 to-purple-600',
      show: isWarehouse
    },
    {
      title: 'Pick Orders',
      description: 'View and fulfill pending orders',
      icon: ClipboardList,
      href: '/employee/orders',
      color: 'from-orange-500 to-orange-600',
      show: isWarehouse
    },
    {
      title: 'Deliveries',
      description: 'Scan and confirm deliveries',
      icon: Truck,
      href: '/employee/delivery',
      color: 'from-emerald-500 to-emerald-600',
      show: isDriver
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name || user?.email?.split('@')[0] || 'Employee'}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'WAREHOUSE' && 'Warehouse Operations Dashboard'}
          {user?.role === 'DRIVER' && 'Delivery Dashboard'}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && 'Full Access Dashboard'}
        </p>
      </div>

      {/* Clock Status Card */}
      {clockStatus?.hasEmployee && (
        <div className={`rounded-xl shadow-sm overflow-hidden ${
          clockStatus.isClockedIn
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  clockStatus.isClockedIn ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {clockStatus.isClockedIn ? (
                    <Timer className="w-7 h-7 text-white" />
                  ) : (
                    <Clock className="w-7 h-7 text-white/70" />
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-sm">
                    {clockStatus.isClockedIn ? 'Currently Working' : 'Not Clocked In'}
                  </p>
                  {clockStatus.isClockedIn && clockStatus.clockInTime && (
                    <>
                      <p className="text-white text-3xl font-mono font-bold">{elapsedTime}</p>
                      <p className="text-white/70 text-xs mt-1">
                        Started at {new Date(clockStatus.clockInTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </>
                  )}
                  {!clockStatus.isClockedIn && (
                    <p className="text-white/70 text-lg">Ready to start your shift?</p>
                  )}
                </div>
              </div>

              <button
                onClick={clockStatus.isClockedIn ? handleClockOut : handleClockIn}
                disabled={clockLoading}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  clockStatus.isClockedIn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-emerald-700'
                } disabled:opacity-50`}
              >
                {clockLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : clockStatus.isClockedIn ? (
                  <>
                    <Square className="w-5 h-5" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Clock In
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isWarehouse && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                  <p className="text-sm text-gray-500">Completed Today</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                </div>
              </div>
            </div>
          </>
        )}

        {isDriver && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
                <p className="text-sm text-gray-500">Pending Deliveries</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.filter(action => action.show).map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-xl shadow-sm overflow-hidden text-left group hover:shadow-md transition-shadow"
              >
                <div className={`bg-gradient-to-r ${action.color} p-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Order #1234 packed and ready</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">SKU scanned for Sabritas Chips</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Warehouse className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Inventory updated: 24 cases added</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
