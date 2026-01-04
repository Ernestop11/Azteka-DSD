'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  GripVertical,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Fuel,
  Route,
  Play,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Home,
  Coffee,
  AlertCircle,
  Check,
  Loader2,
  Map,
  List,
  Timer,
  Car
} from 'lucide-react'

// Dynamically import RouteMap to avoid SSR issues
const RouteMap = dynamic(() => import('@/components/driver/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-800 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
})

interface Customer {
  id: string
  businessName: string
  contactName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
  lastVisitDate: string | null
  nextScheduledVisit: string | null
  visitFrequency: string | null
  priceTier: string
}

interface RouteStop {
  id: string
  type: 'delivery' | 'pickup' | 'warehouse' | 'sale'
  customerName: string
  address: string
  status: 'pending' | 'in_transit' | 'arrived' | 'completed' | 'skipped'
  lat?: number
  lng?: number
  total?: number
  eta?: string
  phone?: string
  customerId?: string
  lastVisitDate?: string | null
  priority?: 'normal' | 'high' | 'overdue'
}

interface RouteStats {
  totalMiles: number
  estimatedMinutes: number
  etaToFirst: number
  fuelGallons: number
  gasStopNeeded: boolean
  stopsCount: number
}

interface RouteBuilderProps {
  customers: Customer[]
  onStartRoute?: (stops: RouteStop[]) => void
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function RouteBuilder({ customers, onStartRoute }: RouteBuilderProps) {
  const [selectedDay, setSelectedDay] = useState<string>('today')
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([])
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [routeStats, setRouteStats] = useState<RouteStats>({
    totalMiles: 0,
    estimatedMinutes: 0,
    etaToFirst: 0,
    fuelGallons: 0,
    gasStopNeeded: false,
    stopsCount: 0
  })

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          // Default to a central location if geolocation fails
        }
      )
    }
  }, [])

  // Filter customers for selected day
  useEffect(() => {
    const today = new Date()
    const dayOfWeek = DAYS_OF_WEEK[today.getDay()].toLowerCase()

    let scheduledCustomers: Customer[] = []
    let unscheduledCustomers: Customer[] = []

    customers.forEach(customer => {
      const isScheduledToday = selectedDay === 'today' && (
        // Check if nextScheduledVisit is today
        (customer.nextScheduledVisit &&
          new Date(customer.nextScheduledVisit).toDateString() === today.toDateString()) ||
        // Check if overdue
        isOverdueForVisit(customer)
      )

      if (isScheduledToday) {
        scheduledCustomers.push(customer)
      } else {
        unscheduledCustomers.push(customer)
      }
    })

    // Convert scheduled customers to route stops
    const stops: RouteStop[] = scheduledCustomers.map(customer => ({
      id: customer.id,
      type: 'sale' as const,
      customerName: customer.businessName,
      address: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`,
      status: 'pending' as const,
      lat: customer.latitude,
      lng: customer.longitude,
      phone: customer.phone,
      customerId: customer.id,
      lastVisitDate: customer.lastVisitDate,
      priority: getPriority(customer)
    }))

    setRouteStops(stops)
    setAvailableCustomers(unscheduledCustomers)
  }, [customers, selectedDay])

  // Calculate route stats when stops change
  useEffect(() => {
    // Rough estimation: 2 miles per stop average, 3 minutes per mile
    const stopsCount = routeStops.length
    const estimatedMiles = stopsCount * 5 // Assume 5 miles between stops on average
    const estimatedMinutes = estimatedMiles * 2 + (stopsCount * 15) // 2 min/mile + 15 min per stop
    const fuelGallons = estimatedMiles / 12 // 12 MPG average

    setRouteStats({
      totalMiles: estimatedMiles,
      estimatedMinutes,
      etaToFirst: stopsCount > 0 ? 15 : 0, // 15 min to first stop estimate
      fuelGallons,
      gasStopNeeded: fuelGallons > 15, // If more than 15 gallons needed
      stopsCount
    })
  }, [routeStops])

  const isOverdueForVisit = (customer: Customer): boolean => {
    if (!customer.lastVisitDate) return true
    const lastVisit = new Date(customer.lastVisitDate)
    const daysSinceVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    const frequencyDays = parseInt(customer.visitFrequency || '14')
    return daysSinceVisit >= frequencyDays
  }

  const getPriority = (customer: Customer): 'normal' | 'high' | 'overdue' => {
    if (!customer.lastVisitDate) return 'overdue'
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    const frequencyDays = parseInt(customer.visitFrequency || '14')
    if (daysSinceVisit >= frequencyDays) return 'overdue'
    if (daysSinceVisit >= frequencyDays - 2) return 'high'
    return 'normal'
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

    const newStops = [...routeStops]
    const [draggedItem] = newStops.splice(draggedIndex, 1)
    newStops.splice(dropIndex, 0, draggedItem)
    setRouteStops(newStops)
    setDraggedIndex(null)
  }

  const removeStop = (index: number) => {
    const removedStop = routeStops[index]
    setRouteStops(routeStops.filter((_, i) => i !== index))

    // Add back to available customers
    const customer = customers.find(c => c.id === removedStop.customerId)
    if (customer) {
      setAvailableCustomers([...availableCustomers, customer])
    }
  }

  const addStop = (customer: Customer) => {
    const newStop: RouteStop = {
      id: customer.id,
      type: 'sale',
      customerName: customer.businessName,
      address: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`,
      status: 'pending',
      lat: customer.latitude,
      lng: customer.longitude,
      phone: customer.phone,
      customerId: customer.id,
      lastVisitDate: customer.lastVisitDate,
      priority: getPriority(customer)
    }
    setRouteStops([...routeStops, newStop])
    setAvailableCustomers(availableCustomers.filter(c => c.id !== customer.id))
    setShowAddCustomer(false)
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

  const startRoute = () => {
    if (routeStops.length === 0) return
    setIsNavigating(true)
    setCurrentStopIndex(0)
    onStartRoute?.(routeStops)
  }

  const markArrived = (stopId: string) => {
    setRouteStops(stops =>
      stops.map(s => s.id === stopId ? { ...s, status: 'arrived' as const } : s)
    )
  }

  const markCompleted = (stopId: string) => {
    setRouteStops(stops =>
      stops.map(s => s.id === stopId ? { ...s, status: 'completed' as const } : s)
    )
    // Advance to next stop
    if (currentStopIndex < routeStops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1)
    }
  }

  const endRoute = () => {
    setIsNavigating(false)
    setCurrentStopIndex(0)
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-500'
      case 'high': return 'bg-amber-500'
      default: return 'bg-green-500'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  // Build stops array for RouteMap (including start/end points)
  const mapStops: RouteStop[] = [
    // Start point (current location or home)
    {
      id: 'warehouse-start',
      type: 'warehouse',
      customerName: 'Start Location',
      address: currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : 'Current Location',
      status: 'completed',
      lat: currentLocation?.lat,
      lng: currentLocation?.lng
    },
    // All route stops
    ...routeStops,
    // End point (back to start)
    {
      id: 'warehouse-end',
      type: 'warehouse',
      customerName: 'Return Home',
      address: currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : 'Current Location',
      status: 'pending',
      lat: currentLocation?.lat,
      lng: currentLocation?.lng
    }
  ]

  // Navigation Mode View
  if (isNavigating) {
    const currentStop = routeStops[currentStopIndex]
    const completedCount = routeStops.filter(s => s.status === 'completed').length

    return (
      <div className="h-full flex flex-col bg-slate-950">
        {/* Navigation Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Route Active</h2>
                <p className="text-sm text-slate-400">
                  Stop {currentStopIndex + 1} of {routeStops.length}
                </p>
              </div>
            </div>
            <button
              onClick={endRoute}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium"
            >
              End Route
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(completedCount / routeStops.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <RouteMap
            stops={mapStops}
            warehouseAddress=""
            currentStopIndex={currentStopIndex + 1}
            isNavigating={true}
            height="100%"
          />
        </div>

        {/* Current Stop Card */}
        {currentStop && (
          <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(currentStop.priority)}`} />
                  <h3 className="font-bold text-lg text-white truncate">
                    {currentStop.customerName}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 truncate">{currentStop.address}</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">
                #{currentStopIndex + 1}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openNavigation(currentStop.address)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Navigate
              </button>
              {currentStop.phone && (
                <a
                  href={`tel:${currentStop.phone}`}
                  className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-center"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>

            <div className="flex gap-2">
              {currentStop.status === 'pending' && (
                <button
                  onClick={() => markArrived(currentStop.id)}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  I've Arrived
                </button>
              )}
              {currentStop.status === 'arrived' && (
                <button
                  onClick={() => markCompleted(currentStop.id)}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Complete Stop
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Route Builder View
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Stats Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3">
          <div className="bg-slate-800 rounded-lg px-3 py-2 flex-shrink-0 min-w-[70px]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Route className="w-3 h-3" />
              <span>Stops</span>
            </div>
            <div className="text-lg font-bold text-white">{routeStats.stopsCount}</div>
          </div>
          <div className="bg-slate-800 rounded-lg px-3 py-2 flex-shrink-0 min-w-[80px]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Timer className="w-3 h-3" />
              <span>Total ETA</span>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {formatDuration(routeStats.estimatedMinutes)}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg px-3 py-2 flex-shrink-0 min-w-[80px]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Clock className="w-3 h-3" />
              <span>To 1st Stop</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {formatDuration(routeStats.etaToFirst)}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg px-3 py-2 flex-shrink-0 min-w-[80px]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Car className="w-3 h-3" />
              <span>Miles</span>
            </div>
            <div className="text-lg font-bold text-white">~{routeStats.totalMiles}</div>
          </div>
          <div className="bg-slate-800 rounded-lg px-3 py-2 flex-shrink-0 min-w-[80px]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Fuel className="w-3 h-3" />
              <span>Fuel Est.</span>
            </div>
            <div className={`text-lg font-bold ${routeStats.gasStopNeeded ? 'text-amber-400' : 'text-white'}`}>
              {routeStats.fuelGallons.toFixed(1)}gal
            </div>
          </div>
          {routeStats.gasStopNeeded && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] mb-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>Gas Stop</span>
              </div>
              <div className="text-sm font-bold text-amber-400">Recommended</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="md:hidden flex border-b border-slate-800">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium text-sm ${
            mobileView === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400'
          }`}
        >
          <List className="w-4 h-4" />
          List
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium text-sm ${
            mobileView === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Map className="w-4 h-4" />
          Map
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stops List */}
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[40%] border-r border-slate-800 bg-slate-950`}>
          {/* Day Selector */}
          <div className="p-3 border-b border-slate-800">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today's Scheduled</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
            </select>
          </div>

          {/* Stops */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {routeStops.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No stops scheduled</p>
                <p className="text-xs mt-1">Add customers to build your route</p>
              </div>
            ) : (
              routeStops.map((stop, index) => (
                <div
                  key={stop.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-slate-800 rounded-xl p-3 border border-slate-700 cursor-grab active:cursor-grabbing transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stop.status === 'completed'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {stop.status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(stop.priority)}`} />
                        <h4 className="font-semibold text-sm truncate text-white">
                          {stop.customerName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {stop.address}
                      </p>
                    </div>
                    <button
                      onClick={() => removeStop(index)}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Stop Button */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => setShowAddCustomer(true)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-xl text-slate-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Stop
            </button>
          </div>
        </div>

        {/* Map */}
        <div className={`${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-slate-900`}>
          <RouteMap
            stops={mapStops}
            warehouseAddress=""
            currentStopIndex={0}
            isNavigating={false}
            height="100%"
          />
        </div>
      </div>

      {/* Start Route Button */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <button
          onClick={startRoute}
          disabled={routeStops.length === 0}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors"
        >
          <Play className="w-6 h-6" />
          Start Route ({routeStops.length} stops)
        </button>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center">
          <div className="bg-slate-900 w-full md:w-[500px] md:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="sticky top-0 bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Add Stop</h2>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">All customers are already on your route</p>
                </div>
              ) : (
                availableCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => addStop(customer)}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(getPriority(customer))}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate">
                          {customer.businessName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {customer.city}, {customer.state}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
