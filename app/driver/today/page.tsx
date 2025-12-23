'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  Camera,
  X,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Check,
  ScanBarcode,
  DollarSign,
  RotateCcw,
  Route,
  Fuel,
  Timer,
  Coffee,
  Play,
  Pause,
  Home,
  Settings,
  MessageCircle,
  Send,
  Wrench,
  AlertTriangle,
  Calendar,
  Gauge,
  TrendingUp,
  ShoppingCart,
  Printer,
  Receipt,
  Tag,
  Users,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Plus,
  Minus,
  Search,
  Filter,
  Box,
  RefreshCw,
  Edit3,
  Save,
  ChevronUp,
  Building2,
  CircleDot,
  Target,
  Zap,
  MapPinned,
  Car,
  FileText,
  Mail,
  Bell,
  Thermometer,
  Droplets,
  Battery,
  Activity,
  Circle,
  Map
} from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Dynamically import RouteMap to avoid SSR issues with Google Maps
const RouteMap = dynamic(() => import('@/components/driver/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-700/50 rounded-xl flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading map...</div>
    </div>
  )
})

// ============================================
// TYPES
// ============================================

interface RouteStop {
  id: string
  type: 'delivery' | 'pickup' | 'warehouse' | 'sale'
  customerName: string
  address: string
  phone?: string
  orderId?: string
  items: RouteItem[]
  total: number
  status: 'pending' | 'in_transit' | 'arrived' | 'completed' | 'skipped'
  eta?: string
  distanceFromPrev?: number
  notes?: string
  priority: 'normal' | 'rush' | 'fragile'
  timeWindow?: { start: string; end: string }
  completedAt?: string
  signature?: string
  photoProof?: string
  lat?: number
  lng?: number
}

interface RouteItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  imageUrl?: string
  picked?: boolean
}

interface TruckInventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  imageUrl?: string
  category?: string
  price: number
  lowStock?: boolean
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: Date
  read: boolean
}

interface MaintenanceItem {
  id: string
  type: 'oil_change' | 'tire_rotation' | 'brake_check' | 'inspection' | 'other'
  description: string
  dueDate: Date
  dueMileage?: number
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  lastCompleted?: Date
}

interface DailyStats {
  totalMiles: number
  totalDeliveries: number
  completedDeliveries: number
  totalSales: number
  salesAmount: number
  fuelUsed: number
  hoursWorked: number
  avgDeliveryTime: number
}

interface TruckStatus {
  fuelLevel: number
  engineTemp: number
  oilLife: number
  tirePressure: { fl: number; fr: number; rl: number; rr: number }
  batteryLevel: number
  mileage: number
  nextOilChange: number
  nextInspection: Date
}

type RouteMode = 'delivery' | 'sales'
type ActiveTab = 'route' | 'sales' | 'warehouse' | 'truck' | 'messages'

// ============================================
// GAUGE COMPONENT
// ============================================

function CircularGauge({
  value,
  max,
  label,
  unit,
  color = 'orange',
  size = 'md',
  warning,
  danger
}: {
  value: number
  max: number
  label: string
  unit?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  warning?: number
  danger?: number
}) {
  const percentage = Math.min(100, (value / max) * 100)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  let gaugeColor = color
  if (danger && value >= danger) {
    gaugeColor = 'red'
  } else if (warning && value >= warning) {
    gaugeColor = 'yellow'
  }

  const colorClasses: Record<string, string> = {
    orange: 'stroke-orange-500',
    green: 'stroke-green-500',
    blue: 'stroke-blue-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500',
    purple: 'stroke-purple-500'
  }

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          strokeWidth="8"
          fill="none"
          className="stroke-slate-700"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          strokeWidth="8"
          fill="none"
          className={colorClasses[gaugeColor]}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${textSizes[size]} text-white`}>{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      <div className="absolute -bottom-4 text-xs text-slate-400 text-center w-full">
        {label}
      </div>
    </div>
  )
}

function LinearGauge({
  value,
  max,
  label,
  icon: Icon,
  color = 'orange',
  showPercentage = true,
  warning,
  danger
}: {
  value: number
  max: number
  label: string
  icon?: any
  color?: string
  showPercentage?: boolean
  warning?: number
  danger?: number
}) {
  const percentage = Math.min(100, (value / max) * 100)

  let gaugeColor = color
  if (danger && percentage <= danger) {
    gaugeColor = 'red'
  } else if (warning && percentage <= warning) {
    gaugeColor = 'yellow'
  }

  const bgColors: Record<string, string> = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="text-sm text-slate-300">{label}</span>
        </div>
        {showPercentage && (
          <span className={`text-sm font-bold ${gaugeColor === 'red' ? 'text-red-400' : gaugeColor === 'yellow' ? 'text-yellow-400' : 'text-white'}`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColors[gaugeColor]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// DRAGGABLE STOP ITEM
// ============================================

function DraggableStop({
  stop,
  index,
  isExpanded,
  isCurrent,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onNavigate,
  onCall,
  onArrive,
  onComplete,
  onSkip
}: {
  stop: RouteStop
  index: number
  isExpanded: boolean
  isCurrent: boolean
  onToggle: () => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onNavigate: (address: string) => void
  onCall: (phone: string) => void
  onArrive: (id: string) => void
  onComplete: (stop: RouteStop) => void
  onSkip: (id: string) => void
}) {
  const isCompleted = stop.status === 'completed'
  const isWarehouse = stop.type === 'warehouse'

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'rush': return 'bg-red-100 text-red-700 border-red-300'
      case 'fragile': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_transit': return 'bg-blue-100 text-blue-700'
      case 'arrived': return 'bg-purple-100 text-purple-700'
      case 'skipped': return 'bg-gray-100 text-gray-500'
      default: return 'bg-orange-100 text-orange-700'
    }
  }

  return (
    <div
      draggable={!isWarehouse && !isCompleted}
      onDragStart={(e) => !isWarehouse && !isCompleted && onDragStart(e, index)}
      onDragOver={(e) => !isWarehouse && onDragOver(e)}
      onDrop={(e) => !isWarehouse && onDrop(e, index)}
      className={`bg-slate-800 rounded-xl overflow-hidden border transition-all ${
        isCurrent
          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
          : isCompleted
            ? 'border-slate-700 opacity-60'
            : 'border-slate-700 hover:border-slate-600'
      } ${!isWarehouse && !isCompleted ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="p-4 flex items-center gap-3">
        {!isWarehouse && !isCompleted && (
          <div className="text-slate-500 cursor-grab">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isWarehouse
            ? 'bg-blue-600/20 text-blue-400'
            : isCompleted
              ? 'bg-green-600/20 text-green-400'
              : isCurrent
                ? 'bg-orange-600 text-white animate-pulse'
                : 'bg-slate-700 text-slate-400'
        }`}>
          {isWarehouse ? (
            <Home className="w-5 h-5" />
          ) : isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <span className="font-bold">{index}</span>
          )}
        </div>

        <button onClick={onToggle} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{stop.customerName}</h4>
            {stop.priority !== 'normal' && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(stop.priority)}`}>
                {stop.priority}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 truncate">{stop.address}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(stop.status)}`}>
              {stop.status.replace('_', ' ')}
            </span>
            {stop.eta && !isCompleted && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ETA {stop.eta}
              </span>
            )}
            {stop.distanceFromPrev && (
              <span className="text-xs text-slate-500">
                {stop.distanceFromPrev.toFixed(1)} mi
              </span>
            )}
          </div>
        </button>

        <div className="text-right flex-shrink-0">
          {!isWarehouse && (
            <p className="font-semibold text-green-400">${stop.total.toFixed(2)}</p>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500 mx-auto mt-1" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500 mx-auto mt-1" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate(stop.address)}
              className="flex-1 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
            {stop.phone && (
              <button
                onClick={() => onCall(stop.phone!)}
                className="flex-1 py-2.5 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-600/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            )}
          </div>

          {stop.timeWindow && (
            <div className="flex items-center gap-2 text-sm p-3 bg-slate-700/50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300">
                Window: {stop.timeWindow.start} - {stop.timeWindow.end}
              </span>
            </div>
          )}

          {stop.notes && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-200">{stop.notes}</p>
            </div>
          )}

          {stop.items.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-400 mb-2">
                Items ({stop.items.length})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stop.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">×{item.quantity}</p>
                      <p className="text-xs text-slate-400">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isWarehouse && !isCompleted && (
            <div className="flex gap-2 pt-2">
              {stop.status === 'pending' && (
                <button
                  onClick={() => onArrive(stop.id)}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Arrived
                </button>
              )}
              {(stop.status === 'arrived' || stop.status === 'in_transit') && (
                <button
                  onClick={() => onComplete(stop)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Delivery
                </button>
              )}
              <button
                onClick={() => onSkip(stop.id)}
                className="py-3 px-4 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {isCompleted && stop.completedAt && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-sm text-green-300">
                Delivered at {new Date(stop.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('route')
  const [routeMode, setRouteMode] = useState<RouteMode>('delivery')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [stops, setStops] = useState<RouteStop[]>([])
  const [expandedStop, setExpandedStop] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null)
  const [routeStarted, setRouteStarted] = useState(false)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [truckInventory, setTruckInventory] = useState<TruckInventoryItem[]>([])
  const [inventorySearch, setInventorySearch] = useState('')
  const [restockRequest, setRestockRequest] = useState<TruckInventoryItem | null>(null)

  const [salesMode, setSalesMode] = useState(false)
  const [salesCart, setSalesCart] = useState<{ item: TruckInventoryItem; qty: number }[]>([])
  const [salesCustomer, setSalesCustomer] = useState('')

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messageRecipient, setMessageRecipient] = useState('Isabel')

  const [truckStatus, setTruckStatus] = useState<TruckStatus>({
    fuelLevel: 72,
    engineTemp: 195,
    oilLife: 45,
    tirePressure: { fl: 35, fr: 35, rl: 34, rr: 35 },
    batteryLevel: 98,
    mileage: 124532,
    nextOilChange: 127500,
    nextInspection: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  })

  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([])
  const [mileageInput, setMileageInput] = useState('')
  const [deliveryConfirmModal, setDeliveryConfirmModal] = useState(false)

  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalMiles: 0,
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalSales: 0,
    salesAmount: 0,
    fuelUsed: 0,
    hoursWorked: 0,
    avgDeliveryTime: 0,
  })

  const calculateRouteStats = useCallback(() => {
    const totalMiles = stops.reduce((sum, stop) => sum + (stop.distanceFromPrev || 0), 0)
    const estimatedFuel = totalMiles / 12
    const estimatedTime = totalMiles * 2.5
    const breakTime = Math.floor(estimatedTime / 120) * 15
    const pendingStops = stops.filter(s => s.status === 'pending' && s.type !== 'warehouse')
    const completedStops = stops.filter(s => s.status === 'completed' && s.type !== 'warehouse')
    const gasStopsNeeded = estimatedFuel > (truckStatus.fuelLevel / 100) * 30 ? 1 : 0

    return {
      totalMiles: totalMiles.toFixed(1),
      estimatedFuel: estimatedFuel.toFixed(1),
      estimatedTime: Math.round(estimatedTime + breakTime),
      estimatedHours: Math.floor((estimatedTime + breakTime) / 60),
      estimatedMinutes: Math.round((estimatedTime + breakTime) % 60),
      breakTime,
      stopsCount: stops.filter(s => s.type !== 'warehouse').length,
      pendingCount: pendingStops.length,
      completedCount: completedStops.length,
      deliveryValue: stops.reduce((sum, s) => sum + s.total, 0),
      gasStopsNeeded,
      fuelAfterRoute: Math.max(0, truckStatus.fuelLevel - (estimatedFuel / 30) * 100)
    }
  }, [stops, truckStatus.fuelLevel])

  const routeStats = calculateRouteStats()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch business settings to get warehouse address and business name
      let warehouseAddress = '1234 Industrial Blvd, Dallas, TX 75001' // fallback
      let warehousePhone = '(214) 555-0100' // fallback
      let businessName = 'Azteka' // fallback

      try {
        const settingsRes = await fetch('/api/settings/public')
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          if (settings.warehouseAddress) {
            // Build full warehouse address from components
            const parts = [
              settings.warehouseAddress,
              settings.warehouseCity,
              settings.warehouseState,
              settings.warehouseZipCode
            ].filter(Boolean)
            warehouseAddress = parts.join(', ') || warehouseAddress
          }
          if (settings.phone) {
            warehousePhone = settings.phone
          }
          if (settings.name) {
            businessName = settings.name.replace(/\s*(LLC|Inc|Corp|Co)\.?$/i, '').trim() || businessName
          }
        }
      } catch (e) {
        console.warn('Could not load business settings, using defaults')
      }

      // Use the dedicated driver API endpoint
      const driverRes = await fetch('/api/driver/today')

      let loadedStops: RouteStop[] = []
      let loadedInventory: TruckInventoryItem[] = []

      if (driverRes.ok) {
        const data = await driverRes.json()

        // Transform API stops to RouteStop format
        if (data.stops && Array.isArray(data.stops)) {
          loadedStops = data.stops.map((stop: any, idx: number) => ({
            id: stop.id,
            type: 'delivery' as const,
            customerName: stop.customerName,
            address: `${stop.address}, ${stop.city || ''}, ${stop.state || 'TX'}`.trim().replace(/, ,/g, ','),
            phone: stop.phone || '',
            orderId: stop.orderId,
            items: (stop.items || []).map((item: any) => ({
              id: item.id,
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              price: item.price,
              imageUrl: item.imageUrl
            })),
            total: stop.total,
            status: stop.status as any,
            priority: stop.priority || 'normal',
            distanceFromPrev: 3 + Math.random() * 8,
            eta: new Date(Date.now() + (idx + 1) * 45 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            notes: stop.notes
          }))
        }

        // Load truck inventory from API
        if (data.truckInventory && Array.isArray(data.truckInventory)) {
          loadedInventory = data.truckInventory.map((item: any) => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
            lowStock: item.quantity < 5
          }))
        }
      }

      // Add warehouse stops at beginning and end
      loadedStops = [
        {
          id: 'warehouse-start',
          type: 'warehouse',
          customerName: `${businessName} Warehouse`,
          address: warehouseAddress,
          phone: warehousePhone,
          items: [],
          total: 0,
          status: 'completed',
          priority: 'normal'
        },
        ...loadedStops,
        {
          id: 'warehouse-end',
          type: 'warehouse',
          customerName: `${businessName} Warehouse (Return)`,
          address: warehouseAddress,
          phone: warehousePhone,
          items: [],
          total: 0,
          status: 'pending',
          priority: 'normal'
        }
      ]

      // Demo fallback if no real data - use addresses near the warehouse
      if (loadedStops.length <= 2) {
        // Get state from warehouse address to use appropriate demo locations
        const warehouseState = warehouseAddress.includes(', CA') ? 'CA' :
                              warehouseAddress.includes(', TX') ? 'TX' : 'CA'

        // Demo addresses based on warehouse region
        const demoAddresses = warehouseState === 'CA' ? {
          demo1: { name: 'La Michoacana Market', address: '612 Main St, Fairfield, CA 94533', phone: '(707) 555-0102' },
          demo2: { name: 'Tienda El Sol', address: '1420 Travis Blvd, Fairfield, CA 94533', phone: '(707) 555-0103' }
        } : {
          demo1: { name: 'La Michoacana #12', address: '4521 Oak Lawn Ave, Dallas, TX 75219', phone: '(214) 555-0102' },
          demo2: { name: 'Tienda El Sol', address: '8901 Harry Hines Blvd, Dallas, TX 75235', phone: '(214) 555-0103' }
        }

        loadedStops = [
          { id: 'warehouse-start', type: 'warehouse', customerName: `${businessName} Warehouse`, address: warehouseAddress, items: [], total: 0, status: 'completed', priority: 'normal' },
          { id: 'demo-1', type: 'delivery', customerName: demoAddresses.demo1.name, address: demoAddresses.demo1.address, phone: demoAddresses.demo1.phone, orderId: 'ORD-DEMO-001', items: [{ id: '1', name: 'Sabritas Original 12pk', sku: 'SAB-001', quantity: 4, price: 28.99, picked: true }, { id: '2', name: 'Coca-Cola 24pk', sku: 'COC-001', quantity: 2, price: 18.99, picked: true }], total: 153.94, status: 'pending', priority: 'normal', eta: '10:30 AM', distanceFromPrev: 5.2 },
          { id: 'demo-2', type: 'delivery', customerName: demoAddresses.demo2.name, address: demoAddresses.demo2.address, phone: demoAddresses.demo2.phone, orderId: 'ORD-DEMO-002', items: [{ id: '3', name: 'Takis Fuego 20ct', sku: 'TAK-001', quantity: 3, price: 24.99 }], total: 74.97, status: 'pending', priority: 'rush', eta: '11:15 AM', distanceFromPrev: 8.1, notes: 'Use back entrance' },
          { id: 'warehouse-end', type: 'warehouse', customerName: `${businessName} Warehouse (Return)`, address: warehouseAddress, items: [], total: 0, status: 'pending', priority: 'normal' }
        ]
      }

      // Fallback inventory if empty
      if (loadedInventory.length === 0) {
        loadedInventory = [
          { id: '1', name: 'Sabritas Original 12pk', sku: 'SAB-001', quantity: 24, price: 28.99, category: 'Chips' },
          { id: '2', name: 'Takis Fuego 20ct', sku: 'TAK-001', quantity: 18, price: 24.99, category: 'Chips' },
          { id: '3', name: 'Coca-Cola 24pk', sku: 'COC-001', quantity: 12, price: 18.99, category: 'Beverages' },
          { id: '4', name: 'Jarritos Variety 24pk', sku: 'JAR-001', quantity: 8, price: 22.99, category: 'Beverages' }
        ]
      }

      setStops(loadedStops)
      setTruckInventory(loadedInventory)

      setMessages([
        { id: '1', from: 'Isabel', to: 'driver', content: 'Order #003 is ready. Added extra Mazapan.', timestamp: new Date(Date.now() - 1800000), read: true },
        { id: '2', from: 'Santiago', to: 'driver', content: 'New rush order for Tienda El Sol.', timestamp: new Date(Date.now() - 3600000), read: false }
      ])

      setMaintenance([
        { id: '1', type: 'oil_change', description: 'Oil Change', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), dueMileage: 127500, status: 'upcoming' },
        { id: '2', type: 'tire_rotation', description: 'Tire Rotation', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: 'upcoming' },
        { id: '3', type: 'brake_check', description: 'Brake Inspection', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'overdue' }
      ])

      const completed = loadedStops.filter(s => s.status === 'completed').length
      setDailyStats({
        totalMiles: 25.6,
        totalDeliveries: loadedStops.filter(s => s.type === 'delivery').length,
        completedDeliveries: Math.max(0, completed - 1),
        totalSales: 2,
        salesAmount: 156.78,
        fuelUsed: 2.1,
        hoursWorked: 2.5,
        avgDeliveryTime: 12
      })

    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const startRoute = () => {
    setRouteStarted(true)
    setCurrentStopIndex(1)
    setSuccess('Route started! Drive safe.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const pauseRoute = () => {
    setRouteStarted(false)
    setSuccess('Route paused')
    setTimeout(() => setSuccess(''), 2000)
  }

  const arriveAtStop = (stopId: string) => {
    setStops(prev => prev.map(s =>
      s.id === stopId ? { ...s, status: 'arrived' } : s
    ))
    setSuccess('Arrived at stop')
    setTimeout(() => setSuccess(''), 2000)
  }

  const completeDelivery = async (stop: RouteStop) => {
    setStops(prev => prev.map(s =>
      s.id === stop.id
        ? { ...s, status: 'completed', completedAt: new Date().toISOString() }
        : s
    ))

    setDailyStats(prev => ({
      ...prev,
      completedDeliveries: prev.completedDeliveries + 1,
      totalMiles: prev.totalMiles + (stop.distanceFromPrev || 0)
    }))

    setCurrentStopIndex(prev => Math.min(prev + 1, stops.length - 1))
    setSelectedStop(null)
    setDeliveryConfirmModal(false)
    setSuccess(`Delivered to ${stop.customerName}!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const skipStop = (stopId: string) => {
    setStops(prev => prev.map(s =>
      s.id === stopId ? { ...s, status: 'skipped' } : s
    ))
    setCurrentStopIndex(prev => Math.min(prev + 1, stops.length - 1))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newStops = [...stops]
    const [removed] = newStops.splice(draggedIndex, 1)
    newStops.splice(dropIndex, 0, removed)
    setStops(newStops)
    setDraggedIndex(null)
    setSuccess('Route reordered')
    setTimeout(() => setSuccess(''), 2000)
  }

  const openNavigation = (address: string) => {
    const encoded = encodeURIComponent(address)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${encoded}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank')
    }
  }

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const addToSalesCart = (item: TruckInventoryItem) => {
    setSalesCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) {
        return prev.map(c =>
          c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { item, qty: 1 }]
    })
  }

  const removeFromSalesCart = (itemId: string) => {
    setSalesCart(prev => {
      const existing = prev.find(c => c.item.id === itemId)
      if (existing && existing.qty > 1) {
        return prev.map(c =>
          c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c
        )
      }
      return prev.filter(c => c.item.id !== itemId)
    })
  }

  const completeSale = async () => {
    if (salesCart.length === 0 || !salesCustomer) return

    const total = salesCart.reduce((sum, c) => sum + (c.item.price * c.qty), 0)

    setTruckInventory(prev => prev.map(item => {
      const cartItem = salesCart.find(c => c.item.id === item.id)
      if (cartItem) {
        return { ...item, quantity: item.quantity - cartItem.qty }
      }
      return item
    }))

    setDailyStats(prev => ({
      ...prev,
      totalSales: prev.totalSales + 1,
      salesAmount: prev.salesAmount + total
    }))

    setSalesCart([])
    setSalesCustomer('')
    setSalesMode(false)
    setSuccess(`Sale completed! Total: $${total.toFixed(2)}`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const salesTotal = salesCart.reduce((sum, c) => sum + (c.item.price * c.qty), 0)

  const requestRestock = async (item: TruckInventoryItem, quantity: number) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      from: 'driver',
      to: 'Isabel',
      content: `Restock Request: ${item.name} (${item.sku}) - Need ${quantity} units`,
      timestamp: new Date(),
      read: true
    }
    setMessages(prev => [...prev, newMsg])
    setRestockRequest(null)
    setSuccess('Restock request sent to warehouse')
    setTimeout(() => setSuccess(''), 3000)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const msg: Message = {
      id: Date.now().toString(),
      from: 'driver',
      to: messageRecipient,
      content: newMessage,
      timestamp: new Date(),
      read: true
    }
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setSuccess('Message sent')
    setTimeout(() => setSuccess(''), 2000)
  }

  const updateMileage = () => {
    const miles = parseInt(mileageInput)
    if (isNaN(miles) || miles <= truckStatus.mileage) return

    const milesDriven = miles - truckStatus.mileage
    setTruckStatus(prev => ({
      ...prev,
      mileage: miles,
      oilLife: Math.max(0, prev.oilLife - (milesDriven / 30)),
      fuelLevel: Math.max(0, prev.fuelLevel - (milesDriven / 12 / 0.3))
    }))
    setDailyStats(prev => ({
      ...prev,
      totalMiles: prev.totalMiles + milesDriven,
      fuelUsed: prev.fuelUsed + (milesDriven / 12)
    }))
    setMileageInput('')
    setSuccess('Mileage updated')
    setTimeout(() => setSuccess(''), 2000)
  }

  const markMaintenanceComplete = (id: string) => {
    setMaintenance(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'completed', lastCompleted: new Date() } : m
    ))
    setSuccess('Maintenance marked complete')
    setTimeout(() => setSuccess(''), 2000)
  }

  const filteredInventory = truckInventory.filter(item =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  )

  const unreadMessages = messages.filter(m => !m.read && m.to === 'driver').length
  const overdueMaintenanceCount = maintenance.filter(m => m.status === 'overdue').length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header with Gauges */}
      <header className="bg-gradient-to-b from-slate-800 to-slate-900 p-4 pb-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="w-7 h-7 text-orange-500" />
              Driver Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {routeStarted && <span className="ml-2 text-green-400">• Route Active</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadMessages > 0 && (
              <button
                onClick={() => setActiveTab('messages')}
                className="relative p-2 bg-slate-700/50 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {unreadMessages}
                </span>
              </button>
            )}
            <button
              onClick={loadData}
              className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Gauges Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center border border-slate-700">
            <CircularGauge value={routeStats.pendingCount} max={routeStats.stopsCount || 1} label="Stops Left" color="orange" size="sm" />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center border border-slate-700">
            <CircularGauge value={routeStats.estimatedHours} max={10} label="Hours" unit={`${routeStats.estimatedMinutes}m`} color="blue" size="sm" />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center border border-slate-700">
            <CircularGauge value={parseFloat(routeStats.totalMiles)} max={100} label="Miles" color="purple" size="sm" />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center border border-slate-700">
            <CircularGauge value={Math.round(truckStatus.fuelLevel)} max={100} label="Fuel" unit="%" color="green" size="sm" warning={30} danger={15} />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700 px-2 py-2 flex gap-1 overflow-x-auto">
        {[
          { id: 'route', label: 'Route', icon: Route, badge: routeStats.pendingCount },
          { id: 'sales', label: 'Sales', icon: ShoppingCart, badge: salesCart.length || null },
          { id: 'warehouse', label: 'Inventory', icon: Box, badge: truckInventory.filter(i => i.lowStock).length || null },
          { id: 'truck', label: 'Truck', icon: Gauge, badge: overdueMaintenanceCount || null },
          { id: 'messages', label: 'Chat', icon: MessageCircle, badge: unreadMessages || null }
        ].map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as ActiveTab)}
            className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-lg font-medium text-sm flex flex-col items-center gap-1 transition-all relative ${
              activeTab === id
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
            {badge != null && badge > 0 && (
              <span className={`absolute top-0.5 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                id === 'truck' && overdueMaintenanceCount > 0 ? 'bg-red-500' : 'bg-orange-500'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Alerts */}
      <div className="px-4 pt-4 space-y-2">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 text-sm flex-1">{error}</span>
            <button onClick={() => setError('')}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-200 text-sm font-medium">{success}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* ROUTE TAB */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-1 flex">
              <button
                onClick={() => setRouteMode('delivery')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  routeMode === 'delivery' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                Delivery
              </button>
              <button
                onClick={() => setRouteMode('sales')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  routeMode === 'sales' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Sales
              </button>
            </div>

            {/* Embedded Route Map */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl overflow-hidden border border-slate-700">
              {/* Google Maps Embedded View */}
              <div className="relative">
                <RouteMap
                  stops={stops}
                  warehouseAddress={stops[0]?.address || ''}
                  currentStopIndex={currentStopIndex}
                  isNavigating={routeStarted}
                  height="280px"
                  onStopClick={(stopId) => {
                    const stopIdx = stops.findIndex(s => s.id === stopId)
                    if (stopIdx >= 0) {
                      setCurrentStopIndex(stopIdx)
                    }
                  }}
                  onNavigateToStop={(stopId) => {
                    const stop = stops.find(s => s.id === stopId)
                    if (stop) {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`, '_blank')
                    }
                  }}
                />
                {/* Full Route Button - overlay on map */}
                <button
                  onClick={() => {
                    const waypoints = stops.filter(s => s.type !== 'warehouse').map(s => encodeURIComponent(s.address)).join('|')
                    const start = encodeURIComponent(stops[0]?.address || '')
                    const end = encodeURIComponent(stops[stops.length - 1]?.address || '')
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}&waypoints=${waypoints}`, '_blank')
                  }}
                  className="absolute top-3 right-3 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-colors z-10"
                >
                  <Navigation className="w-4 h-4" />
                  Full Route
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <LinearGauge value={routeStats.completedCount} max={routeStats.stopsCount || 1} label="Route Progress" icon={Target} color="green" />
                  <LinearGauge value={Math.round(routeStats.fuelAfterRoute)} max={100} label="Fuel After Route" icon={Fuel} color="orange" warning={30} danger={15} />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-orange-400">{routeStats.stopsCount}</p>
                    <p className="text-xs text-slate-400">Stops</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{routeStats.totalMiles}</p>
                    <p className="text-xs text-slate-400">Miles</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-400">{routeStats.estimatedFuel}</p>
                    <p className="text-xs text-slate-400">Gal Est</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-400">${routeStats.deliveryValue.toFixed(0)}</p>
                    <p className="text-xs text-slate-400">Value</p>
                  </div>
                </div>

                {routeStats.gasStopsNeeded > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-yellow-200">Consider refueling - estimated fuel needed exceeds current tank</p>
                  </div>
                )}

                {!routeStarted ? (
                  <button
                    onClick={startRoute}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all"
                  >
                    <Play className="w-6 h-6" />
                    Start Route
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={pauseRoute}
                      className="flex-1 py-3 bg-yellow-600/20 text-yellow-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-yellow-600/30 transition-all"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                    <button
                      onClick={() => openNavigation(stops[currentStopIndex]?.address || '')}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
                    >
                      <Navigation className="w-5 h-5" />
                      Navigate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Draggable Route Stops */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                  <Route className="w-4 h-4 text-orange-400" />
                  Route Stops
                </h3>
                <p className="text-xs text-slate-500">Drag to reorder</p>
              </div>

              {stops.map((stop, index) => (
                <DraggableStop
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isExpanded={expandedStop === stop.id}
                  isCurrent={index === currentStopIndex && routeStarted}
                  onToggle={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onNavigate={openNavigation}
                  onCall={callCustomer}
                  onArrive={arriveAtStop}
                  onComplete={(s) => { setSelectedStop(s); setDeliveryConfirmModal(true) }}
                  onSkip={skipStop}
                />
              ))}
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {!salesMode ? (
              <>
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl p-4 border border-purple-500/30">
                  <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Today's Sales
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-800/30 rounded-xl p-3 text-center">
                      <p className="text-3xl font-bold text-purple-300">{dailyStats.totalSales}</p>
                      <p className="text-sm text-purple-400">Transactions</p>
                    </div>
                    <div className="bg-purple-800/30 rounded-xl p-3 text-center">
                      <p className="text-3xl font-bold text-green-400">${dailyStats.salesAmount.toFixed(2)}</p>
                      <p className="text-sm text-purple-400">Revenue</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSalesMode(true)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all"
                >
                  <ShoppingCart className="w-6 h-6" />
                  New On-the-Spot Sale
                </button>

                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-slate-300">Recent Sales</h3>
                  <div className="text-center text-slate-500 py-8">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No sales recorded yet today</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                    New Sale
                  </h2>
                  <button onClick={() => { setSalesMode(false); setSalesCart([]); setSalesCustomer('') }} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-800 rounded-xl p-4 mb-4">
                  <label className="text-sm text-slate-400 mb-2 block">Customer / Store Name</label>
                  <input
                    type="text"
                    value={salesCustomer}
                    onChange={(e) => setSalesCustomer(e.target.value)}
                    placeholder="Enter customer name..."
                    className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {filteredInventory.slice(0, 8).map(item => {
                    const inCart = salesCart.find(c => c.item.id === item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => addToSalesCart(item)}
                        disabled={item.quantity === 0}
                        className={`p-3 rounded-xl text-left transition-all ${
                          inCart ? 'bg-purple-600/30 border-2 border-purple-500' : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                        } ${item.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          {inCart && <span className="px-2 py-0.5 bg-purple-600 rounded text-xs font-bold">{inCart.qty}</span>}
                        </div>
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-green-400 font-semibold">${item.price.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">{item.quantity} avail</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {salesCart.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-slate-300">Cart ({salesCart.length} items)</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {salesCart.map(({ item, qty }) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <span className="flex-1 text-sm truncate">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromSalesCart(item.id)} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-medium">{qty}</span>
                            <button onClick={() => addToSalesCart(item)} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Plus className="w-4 h-4" /></button>
                          </div>
                          <span className="text-green-400 font-medium w-20 text-right">${(item.price * qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-green-400">${salesTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={completeSale}
                      disabled={!salesCustomer}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Receipt className="w-5 h-5" />
                      Complete Sale
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* WAREHOUSE TAB */}
        {activeTab === 'warehouse' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl p-4 border border-blue-500/30">
              <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Truck Inventory
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-800/30 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold">{truckInventory.length}</p>
                  <p className="text-xs text-blue-300">Products</p>
                </div>
                <div className="bg-blue-800/30 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold">{truckInventory.reduce((s, i) => s + i.quantity, 0)}</p>
                  <p className="text-xs text-blue-300">Total Units</p>
                </div>
                <div className="bg-yellow-800/30 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-yellow-400">{truckInventory.filter(i => i.lowStock).length}</p>
                  <p className="text-xs text-yellow-300">Low Stock</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search inventory..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredInventory.map(item => (
                <div key={item.id} className={`bg-slate-800 rounded-xl p-4 flex items-center gap-4 ${item.lowStock ? 'border border-yellow-500/30' : ''}`}>
                  <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover" />
                    ) : (
                      <Package className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.sku}</p>
                    {item.lowStock && <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1"><AlertTriangle className="w-3 h-3" />Low stock</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.quantity}</p>
                    <p className="text-xs text-slate-500">units</p>
                  </div>
                  <button onClick={() => setRestockRequest(item)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Message Warehouse
              </h3>
              <div className="flex gap-2">
                <select value={messageRecipient} onChange={(e) => setMessageRecipient(e.target.value)} className="px-3 py-2 bg-slate-700 rounded-lg text-white">
                  <option value="Isabel">Isabel</option>
                  <option value="Santiago">Santiago</option>
                </select>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRUCK TAB */}
        {activeTab === 'truck' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl p-6 border border-slate-700">
              <h2 className="font-semibold text-lg mb-6 text-center flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-orange-400" />
                Vehicle Status
              </h2>

              <div className="flex justify-around mb-8">
                <CircularGauge value={Math.round(truckStatus.fuelLevel)} max={100} label="FUEL" unit="%" color="green" size="lg" warning={30} danger={15} />
                <CircularGauge value={Math.round(truckStatus.oilLife)} max={100} label="OIL LIFE" unit="%" color="blue" size="lg" warning={30} danger={15} />
                <CircularGauge value={truckStatus.engineTemp} max={250} label="ENGINE" unit="°F" color="orange" size="lg" warning={220} danger={240} />
              </div>

              <div className="bg-slate-900 rounded-xl p-4 mb-6 text-center border border-slate-600">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Odometer</p>
                <p className="text-4xl font-mono font-bold text-green-400">{truckStatus.mileage.toLocaleString()}</p>
                <p className="text-xs text-slate-500">miles</p>
              </div>

              <div className="space-y-4">
                <LinearGauge value={truckStatus.batteryLevel} max={100} label="Battery" icon={Battery} color="green" warning={30} danger={15} />
              </div>

              <div className="mt-6">
                <p className="text-sm text-slate-400 mb-3 text-center">Tire Pressure (PSI)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Front Left', value: truckStatus.tirePressure.fl },
                    { label: 'Front Right', value: truckStatus.tirePressure.fr },
                    { label: 'Rear Left', value: truckStatus.tirePressure.rl },
                    { label: 'Rear Right', value: truckStatus.tirePressure.rr }
                  ].map(tire => (
                    <div key={tire.label} className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">{tire.label}</p>
                      <p className={`text-2xl font-bold ${tire.value < 32 ? 'text-yellow-400' : 'text-green-400'}`}>{tire.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-orange-400" />
                Update Mileage
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={mileageInput}
                  onChange={(e) => setMileageInput(e.target.value)}
                  placeholder="Enter current mileage..."
                  className="flex-1 px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button onClick={updateMileage} disabled={!mileageInput || parseInt(mileageInput) <= truckStatus.mileage} className="px-6 py-3 bg-orange-600 rounded-lg font-semibold disabled:opacity-50 hover:bg-orange-700 transition-colors">
                  Update
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                Maintenance Schedule
              </h3>
              <div className="space-y-3">
                {maintenance.map(item => (
                  <div key={item.id} className={`p-4 rounded-xl border ${
                    item.status === 'overdue' ? 'bg-red-500/10 border-red-500/30' :
                    item.status === 'due' ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-slate-400" />
                          {item.description}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {item.dueMileage && ` or ${item.dueMileage.toLocaleString()} miles`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        item.status === 'due' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    {item.status !== 'completed' && (
                      <button onClick={() => markMaintenanceComplete(item.id)} className="mt-3 w-full py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors">
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Warehouse Chat
                </h2>
                <select value={messageRecipient} onChange={(e) => setMessageRecipient(e.target.value)} className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm">
                  <option value="Isabel">Isabel</option>
                  <option value="Santiago">Santiago</option>
                </select>
              </div>

              <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                {messages
                  .filter(m => m.from === messageRecipient || m.to === messageRecipient)
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map(msg => {
                    const isFromDriver = msg.from === 'driver'
                    return (
                      <div key={msg.id} className={`flex ${isFromDriver ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${isFromDriver ? 'bg-blue-600 rounded-br-sm' : 'bg-slate-700 rounded-bl-sm'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isFromDriver ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${messageRecipient}...`}
                    className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} disabled={!newMessage.trim()} className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 px-1">Quick Messages</h3>
              <div className="flex flex-wrap gap-2">
                {['Running low on inventory', 'Need pickup at current stop', 'Delivery delayed 30 min', 'Customer not available', 'Route completed early'].map(msg => (
                  <button key={msg} onClick={() => setNewMessage(msg)} className="px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {deliveryConfirmModal && selectedStop && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Confirm Delivery</h2>
              <button onClick={() => { setDeliveryConfirmModal(false); setSelectedStop(null) }} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold">{selectedStop.customerName}</h3>
                <p className="text-slate-400">{selectedStop.items.length} items • ${selectedStop.total.toFixed(2)}</p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Verify Items</h4>
                <div className="space-y-2">
                  {selectedStop.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-700 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="flex-1 text-sm">{item.name}</span>
                      <span className="font-medium">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center gap-2 hover:border-slate-500 transition-colors">
                <Camera className="w-8 h-8 text-slate-400" />
                <span className="text-slate-400">Take delivery photo (optional)</span>
              </button>

              <button onClick={() => completeDelivery(selectedStop)} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-600/30">
                <CheckCircle2 className="w-6 h-6" />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {restockRequest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request Restock</h2>
              <button onClick={() => setRestockRequest(null)} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="font-semibold">{restockRequest.name}</h3>
                <p className="text-sm text-slate-400">{restockRequest.sku}</p>
                <p className="text-lg mt-2">Current: <span className="font-bold">{restockRequest.quantity}</span> units</p>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Quantity Needed</label>
                <input type="number" defaultValue={10} className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <button onClick={() => requestRestock(restockRequest, 10)} className="w-full py-4 bg-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Send Request to Isabel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
