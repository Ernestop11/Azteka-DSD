'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow
} from '@react-google-maps/api'
import { Loader2, Navigation, MapPin, Warehouse, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

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
}

interface RouteMapProps {
  stops: RouteStop[]
  warehouseAddress: string
  currentStopIndex: number
  isNavigating: boolean
  onStopClick?: (stopId: string) => void
  onNavigateToStop?: (stopId: string) => void
  height?: string
  className?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// Default center (Dallas, TX area)
const defaultCenter = {
  lat: 32.7767,
  lng: -96.7970
}

// Map styling for a cleaner look
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
]

export default function RouteMap({
  stops,
  warehouseAddress,
  currentStopIndex,
  isNavigating,
  onStopClick,
  onNavigateToStop,
  height = '400px',
  className = ''
}: RouteMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null)
  const [geocodedStops, setGeocodedStops] = useState<Map<string, { lat: number; lng: number }>>(new Map())
  const [loadingDirections, setLoadingDirections] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  // Geocode addresses that don't have lat/lng
  useEffect(() => {
    if (!isLoaded || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    const newGeocodedStops = new Map(geocodedStops)
    let hasChanges = false

    const geocodeAddress = async (stop: RouteStop) => {
      if (stop.lat && stop.lng) {
        newGeocodedStops.set(stop.id, { lat: stop.lat, lng: stop.lng })
        hasChanges = true
        return
      }

      if (geocodedStops.has(stop.id)) return

      try {
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: stop.address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        if (result[0]?.geometry?.location) {
          newGeocodedStops.set(stop.id, {
            lat: result[0].geometry.location.lat(),
            lng: result[0].geometry.location.lng()
          })
          hasChanges = true
        }
      } catch (e) {
        console.warn(`Failed to geocode: ${stop.address}`, e)
      }
    }

    // Geocode all stops
    const geocodeAll = async () => {
      for (const stop of stops) {
        await geocodeAddress(stop)
      }
      if (hasChanges) {
        setGeocodedStops(new Map(newGeocodedStops))
      }
    }

    geocodeAll()
  }, [isLoaded, stops])

  // Calculate directions when stops change
  useEffect(() => {
    if (!isLoaded || !window.google || stops.length < 2) return
    if (geocodedStops.size < stops.length) return // Wait for geocoding

    setLoadingDirections(true)
    setError(null)

    const directionsService = new window.google.maps.DirectionsService()

    // Build waypoints from stops (excluding first and last which are origin/destination)
    const waypoints: google.maps.DirectionsWaypoint[] = []
    const deliveryStops = stops.filter(s => s.type !== 'warehouse')

    for (const stop of deliveryStops) {
      const coords = geocodedStops.get(stop.id)
      if (coords) {
        waypoints.push({
          location: new window.google.maps.LatLng(coords.lat, coords.lng),
          stopover: true
        })
      }
    }

    // Find warehouse stops for origin/destination
    const warehouseStart = stops.find(s => s.id === 'warehouse-start')
    const warehouseEnd = stops.find(s => s.id === 'warehouse-end')

    const originCoords = warehouseStart ? geocodedStops.get(warehouseStart.id) : null
    const destCoords = warehouseEnd ? geocodedStops.get(warehouseEnd.id) : null

    if (!originCoords || waypoints.length === 0) {
      setLoadingDirections(false)
      return
    }

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
        destination: destCoords
          ? new window.google.maps.LatLng(destCoords.lat, destCoords.lng)
          : new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
        waypoints: waypoints,
        optimizeWaypoints: false, // Keep order as specified
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        setLoadingDirections(false)
        if (status === 'OK' && result) {
          setDirections(result)
        } else {
          setError(`Could not calculate route: ${status}`)
          console.error('Directions request failed:', status)
        }
      }
    )
  }, [isLoaded, stops, geocodedStops])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // Re-center map on warehouse when geocoded
  useEffect(() => {
    if (!map || !isLoaded) return
    const warehouseCoords = geocodedStops.get('warehouse-start')
    if (warehouseCoords) {
      map.setCenter(warehouseCoords)
      map.setZoom(12)
    }
  }, [map, isLoaded, geocodedStops])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Get marker icon based on stop type and status
  const getMarkerIcon = (stop: RouteStop, index: number) => {
    if (stop.type === 'warehouse') {
      return {
        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
        scale: 12,
        fillColor: '#3b82f6', // blue
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      }
    }

    let fillColor = '#f59e0b' // orange (pending)
    if (stop.status === 'completed') {
      fillColor = '#22c55e' // green
    } else if (stop.status === 'in_transit' || stop.status === 'arrived') {
      fillColor = '#8b5cf6' // purple
    } else if (stop.status === 'skipped') {
      fillColor = '#ef4444' // red
    }

    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      scale: 10,
      fillColor,
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2
    }
  }

  // Create numbered label for delivery stops
  const getMarkerLabel = (stop: RouteStop, index: number): google.maps.MarkerLabel | undefined => {
    if (stop.type === 'warehouse') {
      return {
        text: 'W',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    }

    // Find the index among non-warehouse stops
    const deliveryIndex = stops
      .filter(s => s.type !== 'warehouse')
      .findIndex(s => s.id === stop.id) + 1

    return {
      text: String(deliveryIndex),
      color: '#fff',
      fontSize: '11px',
      fontWeight: 'bold'
    }
  }

  // Get status icon for info window
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'in_transit':
      case 'arrived':
        return <Navigation className="w-4 h-4 text-purple-500" />
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-orange-500" />
    }
  }

  if (loadError) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p>Failed to load Google Maps</p>
          <p className="text-sm">Check your API key configuration</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`} style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {/* Render directions route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // We'll add custom markers
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            }}
          />
        )}

        {/* Render markers for each stop */}
        {stops.map((stop, index) => {
          const coords = geocodedStops.get(stop.id)
          if (!coords) return null

          return (
            <Marker
              key={stop.id}
              position={coords}
              icon={getMarkerIcon(stop, index)}
              label={getMarkerLabel(stop, index)}
              onClick={() => {
                setSelectedStop(stop)
                onStopClick?.(stop.id)
              }}
              animation={
                index === currentStopIndex && isNavigating
                  ? window.google?.maps?.Animation?.BOUNCE
                  : undefined
              }
            />
          )
        })}

        {/* Info window for selected stop */}
        {selectedStop && geocodedStops.get(selectedStop.id) && (
          <InfoWindow
            position={geocodedStops.get(selectedStop.id)!}
            onCloseClick={() => setSelectedStop(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                {selectedStop.type === 'warehouse' ? (
                  <Warehouse className="w-4 h-4 text-blue-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-orange-500" />
                )}
                <h3 className="font-semibold text-gray-900">{selectedStop.customerName}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{selectedStop.address}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  {getStatusIcon(selectedStop.status)}
                  <span className="capitalize">{selectedStop.status.replace('_', ' ')}</span>
                </div>
                {selectedStop.total && selectedStop.total > 0 && (
                  <span className="text-sm font-semibold text-green-600">
                    ${selectedStop.total.toFixed(2)}
                  </span>
                )}
              </div>
              {selectedStop.eta && selectedStop.status === 'pending' && (
                <p className="text-xs text-gray-500 mt-1">ETA: {selectedStop.eta}</p>
              )}
              {selectedStop.type !== 'warehouse' && onNavigateToStop && (
                <button
                  onClick={() => onNavigateToStop(selectedStop.id)}
                  className="mt-3 w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Loading overlay */}
      {loadingDirections && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Calculating route...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Legend</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Warehouse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
