'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Activity,
  Package,
  MapPin,
  ScanBarcode,
  Truck,
  ClipboardList,
  Camera,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Download,
  RefreshCw,
  User,
  AlertCircle
} from 'lucide-react'

interface ActivitySummary {
  stockUpdates: number
  locationUpdates: number
  skuUpdates: number
  ordersPicked: number
  ordersPacked: number
  deliveriesCompleted: number
  imageUploads: number
  totalActions: number
}

interface RecentActivity {
  id: string
  actionType: string
  entityType: string | null
  entityId: string | null
  entityName: string | null
  description: string
  metadata: any
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface EmployeeData {
  id: string
  name: string
  email: string
  role: string
  summary: ActivitySummary
  recentActivities: RecentActivity[]
}

interface ApiResponse {
  employees: EmployeeData[]
  dateRange: { startDate: string; endDate: string }
  totalActivities: number
}

const ACTION_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  STOCK_UPDATE: { label: 'Stock Update', icon: Package, color: 'bg-green-100 text-green-700' },
  LOCATION_UPDATE: { label: 'Location', icon: MapPin, color: 'bg-blue-100 text-blue-700' },
  SKU_UPDATE: { label: 'SKU Scan', icon: ScanBarcode, color: 'bg-purple-100 text-purple-700' },
  EXPIRATION_UPDATE: { label: 'Expiration', icon: Calendar, color: 'bg-orange-100 text-orange-700' },
  IMAGE_UPLOAD: { label: 'Photo', icon: Camera, color: 'bg-pink-100 text-pink-700' },
  PRODUCT_CLASSIFY: { label: 'Classify', icon: Filter, color: 'bg-indigo-100 text-indigo-700' },
  ORDER_PICKED: { label: 'Picked', icon: ClipboardList, color: 'bg-amber-100 text-amber-700' },
  ORDER_PACKED: { label: 'Packed', icon: Package, color: 'bg-teal-100 text-teal-700' },
  ORDER_STATUS_CHANGE: { label: 'Status', icon: Activity, color: 'bg-gray-100 text-gray-700' },
  DELIVERY_START: { label: 'Delivery Start', icon: Truck, color: 'bg-cyan-100 text-cyan-700' },
  DELIVERY_COMPLETE: { label: 'Delivered', icon: Truck, color: 'bg-emerald-100 text-emerald-700' },
  DELIVERY_ISSUE: { label: 'Issue', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  SHIPMENT_RECEIVE: { label: 'Received', icon: Package, color: 'bg-lime-100 text-lime-700' },
  STOCK_COUNT: { label: 'Count', icon: ClipboardList, color: 'bg-yellow-100 text-yellow-700' },
  CLOCK_IN: { label: 'Clock In', icon: Clock, color: 'bg-green-100 text-green-700' },
  CLOCK_OUT: { label: 'Clock Out', icon: Clock, color: 'bg-red-100 text-red-700' },
}

export default function EmployeeWorksheetPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  // Date range (default: last 7 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/employee-activities?startDate=${startDate}&endDate=${endDate}`)
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError('Failed to load employee activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'WAREHOUSE': return 'bg-emerald-100 text-emerald-800'
      case 'DRIVER': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Loading employee activities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 text-emerald-600" />
              Employee Worksheet
            </h1>
            <p className="text-gray-600 mt-1">Track employee activities and work logs</p>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{data.employees.length}</div>
                <div className="text-sm text-gray-500">Employees</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{data.totalActivities}</div>
                <div className="text-sm text-gray-500">Total Actions</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.employees.reduce((sum, e) => sum + e.summary.stockUpdates, 0)}
                </div>
                <div className="text-sm text-gray-500">Stock Updates</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ScanBarcode className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.employees.reduce((sum, e) => sum + e.summary.skuUpdates, 0)}
                </div>
                <div className="text-sm text-gray-500">SKUs Scanned</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Cards */}
      {data && (
        <div className="space-y-4">
          {data.employees.map((employee) => {
            const isExpanded = expandedEmployee === employee.id
            const hasActivity = employee.summary.totalActions > 0

            return (
              <div
                key={employee.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                  hasActivity ? '' : 'opacity-60'
                }`}
              >
                {/* Employee Header */}
                <button
                  onClick={() => setExpandedEmployee(isExpanded ? null : employee.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(employee.role)}`}>
                          {employee.role}
                        </span>
                        <span className="text-xs text-gray-500">{employee.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quick Stats */}
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      {employee.summary.stockUpdates > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Package className="w-4 h-4" />
                          <span>{employee.summary.stockUpdates}</span>
                        </div>
                      )}
                      {employee.summary.skuUpdates > 0 && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <ScanBarcode className="w-4 h-4" />
                          <span>{employee.summary.skuUpdates}</span>
                        </div>
                      )}
                      {employee.summary.ordersPicked > 0 && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <ClipboardList className="w-4 h-4" />
                          <span>{employee.summary.ordersPicked}</span>
                        </div>
                      )}
                      {employee.summary.deliveriesCompleted > 0 && (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Truck className="w-4 h-4" />
                          <span>{employee.summary.deliveriesCompleted}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{employee.summary.totalActions}</div>
                        <div className="text-xs text-gray-500">actions</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Summary Grid */}
                    <div className="p-4 bg-gray-50 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">{employee.summary.stockUpdates}</div>
                        <div className="text-xs text-gray-500">Stock Updates</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{employee.summary.locationUpdates}</div>
                        <div className="text-xs text-gray-500">Locations</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-purple-600">{employee.summary.skuUpdates}</div>
                        <div className="text-xs text-gray-500">SKUs</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-amber-600">{employee.summary.ordersPicked}</div>
                        <div className="text-xs text-gray-500">Picked</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-teal-600">{employee.summary.ordersPacked}</div>
                        <div className="text-xs text-gray-500">Packed</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-emerald-600">{employee.summary.deliveriesCompleted}</div>
                        <div className="text-xs text-gray-500">Deliveries</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-pink-600">{employee.summary.imageUploads}</div>
                        <div className="text-xs text-gray-500">Photos</div>
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
                      {employee.recentActivities.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">No activities in this period</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {employee.recentActivities.map((activity) => {
                            const config = ACTION_TYPE_CONFIG[activity.actionType] || {
                              label: activity.actionType,
                              icon: Activity,
                              color: 'bg-gray-100 text-gray-700'
                            }
                            const Icon = config.icon

                            return (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                                      {config.label}
                                    </span>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                      {formatDate(activity.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                                  {activity.entityName && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {activity.entityName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {data.employees.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
