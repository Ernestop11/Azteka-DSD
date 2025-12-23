'use client'

/**
 * Ana's Control Tower Dashboard
 *
 * Real-time operational overview designed for minimal interaction.
 * Large visual indicators, auto-refresh every 30 seconds.
 * Optimized for quick scanning - Ana has dyslexia.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Truck,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ShoppingCart,
  Box,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Upload,
  ClipboardList,
  PackagePlus
} from 'lucide-react'

interface DashboardStats {
  pendingTasks: number
  inProgressTasks: number
  completedToday: number
  activeEmployees: number
  ordersToday: number
  ordersDelivered: number
}

interface ActiveTask {
  id: string
  type: string
  title: string
  status: string
  assignee?: string
  orderId?: string
  startedAt?: string
  priority: string
}

interface RecentOrder {
  id: string
  customerName: string
  total: number
  status: string
  itemCount: number
  createdAt: string
}

interface IncomingShipment {
  id: string
  poNumber: string | null
  vendorName: string
  status: string
  itemCount: number
  total: number
  expectedDate: string | null
  createdAt: string
}

export default function ControlTowerPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [incomingShipments, setIncomingShipments] = useState<IncomingShipment[]>([])
  const [pendingWorkOrders, setPendingWorkOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, ordersRes, posRes, workOrdersRes] = await Promise.all([
        fetch('/api/admin/control-tower/stats'),
        fetch('/api/admin/control-tower/tasks'),
        fetch('/api/admin/control-tower/orders'),
        fetch('/api/admin/po?limit=5'),
        fetch('/api/admin/work-orders?status=PENDING&limit=1')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setActiveTasks(tasksData.data || [])
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.data || [])
      }

      // Fetch incoming shipments (POs not yet received)
      if (posRes.ok) {
        const posData = await posRes.json()
        const shipments = (posData.data || [])
          .filter((po: any) => po.status !== 'RECEIVED' && po.status !== 'STOCKED' && po.status !== 'CANCELLED')
          .map((po: any) => ({
            id: po.id,
            poNumber: po.poNumber,
            vendorName: po.vendor?.name || 'Unknown Vendor',
            status: po.status,
            itemCount: po._count?.items || po.items?.length || 0,
            total: Number(po.total),
            expectedDate: po.expectedDate,
            createdAt: po.createdAt,
          }))
        setIncomingShipments(shipments)
      }

      // Fetch pending work orders count
      if (workOrdersRes.ok) {
        const woData = await workOrdersRes.json()
        setPendingWorkOrders(woData.stats?.pending || 0)
      }

      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Control Tower fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading Control Tower...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Control Tower</h1>
          <p className="text-slate-400 mt-1">
            {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              autoRefresh
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={fetchData}
            className="p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <span className="text-red-300 text-lg">{error}</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/po')}
          className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white text-left hover:from-indigo-500 hover:to-purple-500 transition-all group"
        >
          <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold block">Upload PO</span>
          <span className="text-sm text-white/70">New shipment</span>
        </button>
        <button
          onClick={() => router.push('/admin/work-orders')}
          className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl text-white text-left hover:from-amber-500 hover:to-orange-500 transition-all group relative"
        >
          <ClipboardList className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold block">Work Orders</span>
          <span className="text-sm text-white/70">New products</span>
          {pendingWorkOrders > 0 && (
            <span className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {pendingWorkOrders}
            </span>
          )}
        </button>
        <button
          onClick={() => router.push('/admin/vendors')}
          className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl text-white text-left hover:from-cyan-500 hover:to-blue-500 transition-all group"
        >
          <PackagePlus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold block">Vendors</span>
          <span className="text-sm text-white/70">Manage suppliers</span>
        </button>
        <button
          onClick={() => router.push('/admin/products')}
          className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white text-left hover:from-emerald-500 hover:to-teal-500 transition-all group"
        >
          <Package className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold block">Products</span>
          <span className="text-sm text-white/70">Catalog</span>
        </button>
      </div>

      {/* Incoming Shipments Section */}
      {incomingShipments.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            Incoming Shipments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomingShipments.map(shipment => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </div>
      )}

      {/* Main Stats - Large Visual Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Orders Today */}
        <StatCard
          icon={ShoppingCart}
          label="Orders Today"
          value={stats?.ordersToday ?? 0}
          color="blue"
          subtitle={`${stats?.ordersDelivered ?? 0} delivered`}
        />

        {/* Active Employees */}
        <StatCard
          icon={Users}
          label="Clocked In"
          value={stats?.activeEmployees ?? 0}
          color="green"
          subtitle="employees working"
        />

        {/* Pending Tasks */}
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats?.pendingTasks ?? 0}
          color={stats?.pendingTasks && stats.pendingTasks > 5 ? 'yellow' : 'gray'}
          subtitle="waiting to start"
        />

        {/* In Progress */}
        <StatCard
          icon={Package}
          label="In Progress"
          value={stats?.inProgressTasks ?? 0}
          color="purple"
          subtitle="tasks active"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Completion Progress */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Today's Progress
          </h2>
          <div className="space-y-4">
            <ProgressBar
              label="Orders Delivered"
              current={stats?.ordersDelivered ?? 0}
              total={stats?.ordersToday ?? 1}
              color="emerald"
            />
            <ProgressBar
              label="Tasks Completed"
              current={stats?.completedToday ?? 0}
              total={(stats?.completedToday ?? 0) + (stats?.pendingTasks ?? 0) + (stats?.inProgressTasks ?? 0)}
              color="blue"
            />
          </div>
        </div>

        {/* Active Tasks List */}
        <div className="bg-slate-800 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" />
            Active Tasks
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-400">All caught up!</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-400" />
          Recent Orders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentOrders.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No orders today</p>
            </div>
          ) : (
            recentOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component - Large, easy to read
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle
}: {
  icon: any
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray'
  subtitle?: string
}) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    gray: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    gray: 'text-slate-400'
  }

  return (
    <div className={`rounded-2xl p-6 border-2 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-8 h-8 ${iconColors[color]}`} />
        <span className="text-lg font-medium text-slate-300">{label}</span>
      </div>
      <p className="text-5xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

// Progress Bar Component
function ProgressBar({
  label,
  current,
  total,
  color
}: {
  label: string
  current: number
  total: number
  color: 'emerald' | 'blue' | 'purple'
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{current} / {total} ({percentage}%)</span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Task Row Component
function TaskRow({ task }: { task: ActiveTask }) {
  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400'
  }

  const typeIcons = {
    PICKING: Package,
    PACKING: Box,
    DELIVERY: Truck
  }

  const Icon = typeIcons[task.type as keyof typeof typeIcons] || Package

  const priorityColors = {
    URGENT: 'border-l-red-500',
    HIGH: 'border-l-orange-500',
    NORMAL: 'border-l-slate-500',
    LOW: 'border-l-slate-600'
  }

  return (
    <div className={`bg-slate-700/50 rounded-lg p-4 border-l-4 ${priorityColors[task.priority as keyof typeof priorityColors] || 'border-l-slate-500'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-white font-medium">{task.title}</p>
            {task.assignee && (
              <p className="text-sm text-slate-400">{task.assignee}</p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors] || 'bg-slate-600 text-slate-300'}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}

// Order Card Component
function OrderCard({ order }: { order: RecentOrder }) {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    picking: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    packed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }

  const statusIcons = {
    pending: Clock,
    picking: Package,
    packed: Box,
    shipped: Truck,
    delivered: CheckCircle2
  }

  const Icon = statusIcons[order.status as keyof typeof statusIcons] || Clock
  const colorClass = statusColors[order.status as keyof typeof statusColors] || 'bg-slate-600'

  return (
    <div className={`rounded-xl p-4 border ${colorClass}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-white">#{order.id.slice(-8)}</span>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-300 font-medium truncate">{order.customerName}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-slate-400 text-sm">{order.itemCount} items</span>
        <span className="text-white font-bold">${Number(order.total).toFixed(2)}</span>
      </div>
    </div>
  )
}

// Shipment Card Component
function ShipmentCard({ shipment }: { shipment: IncomingShipment }) {
  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    IN_TRANSIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    RECEIVING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  }

  const statusLabels = {
    PENDING: 'Awaiting Confirm',
    CONFIRMED: 'Confirmed',
    IN_TRANSIT: 'In Transit',
    RECEIVING: 'Being Received',
  }

  const colorClass = statusColors[shipment.status as keyof typeof statusColors] || 'bg-slate-600'
  const label = statusLabels[shipment.status as keyof typeof statusLabels] || shipment.status

  return (
    <div className={`rounded-xl p-4 border ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-white">
          {shipment.poNumber || `PO-${shipment.id.slice(0, 8)}`}
        </span>
        <Truck className="w-5 h-5" />
      </div>
      <p className="text-slate-300 font-medium truncate">{shipment.vendorName}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-slate-400 text-sm">{shipment.itemCount} items</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-slate-400 text-sm">
          {shipment.expectedDate
            ? new Date(shipment.expectedDate).toLocaleDateString()
            : 'No ETA'}
        </span>
        <span className="text-white font-bold">${shipment.total.toFixed(2)}</span>
      </div>
    </div>
  )
}
