'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Clock,
  User,
  Loader2,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Plus,
  Minus,
  MapPin,
  Check,
  Camera,
  Calendar,
  Tag,
  Flag,
  History,
  ListTodo,
  Home,
  ImagePlus,
  Barcode,
  Box,
  ChevronLeft,
  ChevronDown,
  ScanBarcode
} from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

type AppState = 'idle' | 'entering-pin' | 'app'
type AppTab = 'home' | 'inventory' | 'tasks' | 'timesheet'
type ScanMode = 'product' | 'sku' | 'case-sku' | null

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: string
  photoUrl?: string
  isClockedIn: boolean
  clockInTime?: string // ISO string of when clocked in
}

interface Product {
  id: string
  name: string
  sku: string
  caseSku?: string | null
  imageUrl?: string | null
  stock: number
  warehouseLocation?: string | null
  unitsPerCase: number
  expirationDate?: string | null
  minStock?: number
  inStock?: boolean
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
}

interface InventoryCount {
  id: string
  name: string
  status: string
  _count?: { items: number }
}

interface CountItem {
  id: string
  productId: string
  counterId: string
  countedCases: number
  countedPieces: number
  countedTotal: number
  warehouseLocation?: string
  needsDateCheck: boolean
  expirationDate?: string
  sku?: string
  caseSku?: string
  unitsPerCase?: number
}

interface TimeEntry {
  id: string
  clockIn: string
  clockOut?: string
  status: string
}

interface Task {
  id: string
  title: string
  description?: string
  type: string
  priority: string
  status: string
  createdAt: string
  order?: {
    id: string
    orderNumber: string
    Customer?: { storeName: string }
  }
}

const TASK_TYPE_LABELS: Record<string, string> = {
  PICKING: 'Pick Order',
  PACKING: 'Pack Order',
  RECEIVING: 'Receive Shipment',
  STOCKING: 'Stock Shelves',
  DELIVERY: 'Delivery',
  COUNTING: 'Inventory Count',
  MAPPING: 'Warehouse Mapping'
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-600',
  NORMAL: 'bg-blue-600',
  HIGH: 'bg-orange-600',
  URGENT: 'bg-red-600'
}

const EXPIRATION_PRESETS = [
  { label: '30d', days: 30, color: 'bg-red-600' },
  { label: '60d', days: 60, color: 'bg-orange-600' },
  { label: '90d', days: 90, color: 'bg-yellow-600' },
  { label: '6mo', days: 180, color: 'bg-green-600' },
  { label: '1yr', days: 365, color: 'bg-blue-600' },
]

const QUICK_CASES = [1, 5, 10, 24, 50]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// =====================
// BARCODE SCANNER COMPONENT - Copied from legacy inventory (WORKING)
// =====================
interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose: () => void
  title?: string
  subtitle?: string
}

function BarcodeScanner({ onScan, onClose, title = 'Scan Barcode', subtitle = 'Point at barcode' }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const readerRef = useRef<any>(null)
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)

  // Load ZXing dynamically
  useEffect(() => {
    let mounted = true

    const loadScanner = async () => {
      try {
        // Import ZXing from @zxing packages
        const zxingBrowser = await import('@zxing/browser')
        const zxingLibrary = await import('@zxing/library')
        const { BrowserMultiFormatReader } = zxingBrowser
        const { BarcodeFormat, DecodeHintType } = zxingLibrary

        if (!mounted) return

        // Configure hints for better barcode detection
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.QR_CODE,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_8,
          BarcodeFormat.EAN_13,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_128,
          BarcodeFormat.ITF,
          BarcodeFormat.CODABAR,
          BarcodeFormat.DATA_MATRIX
        ])
        hints.set(DecodeHintType.TRY_HARDER, true)

        const reader = new BrowserMultiFormatReader(hints)
        readerRef.current = reader

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          }
        })

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream

        // Check for torch capability
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities?.() as any
        if (capabilities?.torch) {
          setHasTorch(true)
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)

          // Start continuous scanning
          startScanning()
        }
      } catch (err: any) {
        console.error('Scanner init error:', err)
        if (mounted) {
          setError(err.message || 'Failed to access camera')
        }
      }
    }

    loadScanner()

    return () => {
      mounted = false
      cleanup()
    }
  }, [])

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (readerRef.current) {
      try {
        readerRef.current.reset?.()
      } catch {}
      readerRef.current = null
    }
  }, [])

  const startScanning = useCallback(() => {
    const scan = async () => {
      if (!videoRef.current || !readerRef.current || !canvasRef.current) {
        animationFrameRef.current = requestAnimationFrame(scan)
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scan)
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        const result = await readerRef.current.decodeFromCanvas(canvas)
        if (result) {
          const code = result.getText()
          const now = Date.now()

          // Debounce: don't scan same code within 2 seconds
          if (code !== lastScanRef.current || now - lastScanTimeRef.current > 2000) {
            lastScanRef.current = code
            lastScanTimeRef.current = now

            // Haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100])
            }

            // Play success sound
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              oscillator.frequency.value = 1200
              oscillator.type = 'sine'
              gainNode.gain.value = 0.3
              oscillator.start()
              setTimeout(() => {
                oscillator.stop()
                audioContext.close()
              }, 100)
            } catch {}

            onScan(code)
            return // Stop scanning after successful scan
          }
        }
      } catch {
        // No barcode found, continue scanning
      }

      animationFrameRef.current = requestAnimationFrame(scan)
    }

    scan()
  }, [onScan])

  const toggleTorch = async () => {
    if (!streamRef.current) return

    const track = streamRef.current.getVideoTracks()[0]
    const newTorchState = !torchOn

    try {
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as any]
      })
      setTorchOn(newTorchState)
    } catch (err) {
      console.error('Torch toggle failed:', err)
    }
  }

  // Tap to focus (iOS)
  const handleVideoTap = async (e: React.TouchEvent | React.MouseEvent) => {
    if (!streamRef.current) return

    const track = streamRef.current.getVideoTracks()[0]
    const capabilities = track.getCapabilities?.() as any

    if (!capabilities?.focusMode?.includes('manual')) return

    const video = videoRef.current
    if (!video) return

    const rect = video.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    // Normalize coordinates
    const pointOfInterestX = x / rect.width
    const pointOfInterestY = y / rect.height

    try {
      await track.applyConstraints({
        advanced: [{
          focusMode: 'manual',
          pointsOfInterest: [{ x: pointOfInterestX, y: pointOfInterestY }]
        } as any]
      })

      // Reset to auto after a moment
      setTimeout(async () => {
        try {
          await track.applyConstraints({
            advanced: [{ focusMode: 'continuous' } as any]
          })
        } catch {}
      }, 1500)
    } catch {}
  }

  const handleClose = () => {
    cleanup()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div>
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <p className="text-emerald-400 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-3 rounded-full shadow-lg ${torchOn ? 'bg-yellow-500' : 'bg-slate-700'}`}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}
          <button onClick={handleClose} className="p-3 bg-red-600 rounded-full shadow-lg">
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        onClick={handleVideoTap}
        onTouchStart={handleVideoTap}
      />

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan area overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: '280px', height: '160px' }}>
          {/* Dark overlay outside scan area */}
          <div className="absolute inset-[-1000px] bg-black/40" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, calc(50% - 140px) calc(50% - 80px), calc(50% - 140px) calc(50% + 80px), calc(50% + 140px) calc(50% + 80px), calc(50% + 140px) calc(50% - 80px), calc(50% - 140px) calc(50% - 80px))' }} />

          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-emerald-400 rounded-br-xl" />

          {/* Animated scan line */}
          <div
            className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full animate-scan-line"
          />
        </div>
      </div>

      {/* Loading/Error states */}
      {!ready && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
          <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-white text-lg font-medium">Starting camera...</p>
          <p className="text-slate-400 text-sm mt-1">Allow camera access when prompted</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 p-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white text-lg font-medium text-center">Camera Error</p>
          <p className="text-slate-400 text-sm mt-1 text-center">{error}</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 bg-slate-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {/* Bottom hint */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center z-10" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <p className="text-white text-sm font-medium">Hold steady over barcode</p>
        <p className="text-slate-400 text-xs mt-1">Tap to focus • Works with UPC, EAN, QR, Code128</p>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scanLineAnim {
          0%, 100% { top: 10%; opacity: 0.5; }
          50% { top: 90%; opacity: 1; }
        }
        .animate-scan-line {
          animation: scanLineAnim 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Helper to calculate worked time
const getWorkedTime = (clockInTime: string | undefined, currentTime: Date): { hours: number; mins: number; display: string } => {
  if (!clockInTime) return { hours: 0, mins: 0, display: '0h 0m' }

  const clockIn = new Date(clockInTime)
  const diffMs = currentTime.getTime() - clockIn.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60

  return { hours, mins, display: `${hours}h ${mins}m` }
}

// Format clock-in time for display
const formatClockInTime = (clockInTime: string | undefined): string => {
  if (!clockInTime) return '--:--'
  const date = new Date(clockInTime)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function StaffPage() {
  // Auth state
  const [appState, setAppState] = useState<AppState>('idle')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const pinRef = useRef(pin)

  // Employee & app state
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const [menuOpen, setMenuOpen] = useState(false)

  // Inventory state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
  const [recentItems, setRecentItems] = useState<CountItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [existingItem, setExistingItem] = useState<CountItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Count form state
  const [countedCases, setCountedCases] = useState(0)
  const [countedPieces, setCountedPieces] = useState(0)
  const [unitsPerCase, setUnitsPerCase] = useState(1)
  const [warehouseLocation, setWarehouseLocation] = useState('')
  const [needsDateCheck, setNeedsDateCheck] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editCaseSku, setEditCaseSku] = useState('')

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())

  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>(null)

  // New Product state
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductImage, setNewProductImage] = useState<File | null>(null)
  const [newProductPreview, setNewProductPreview] = useState<string | null>(null)
  const [creatingProduct, setCreatingProduct] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [newTask, setNewTask] = useState<Task | null>(null)
  const [showTaskAlert, setShowTaskAlert] = useState(false)
  const [lastSeenTaskIds, setLastSeenTaskIds] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timesheet state
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loadingTimesheet, setLoadingTimesheet] = useState(false)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync pin ref
  useEffect(() => { pinRef.current = pin }, [pin])

  // Check existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  // Keyboard support for PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState === 'entering-pin' || appState === 'idle') {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault()
          if (appState === 'idle') {
            setAppState('entering-pin')
            setPin(e.key)
          } else if (pinRef.current.length < 4) {
            const newPin = pinRef.current + e.key
            setPin(newPin)
            if (newPin.length === 4) {
              lookupEmployee(newPin)
            }
          }
        } else if (e.key === 'Backspace') {
          e.preventDefault()
          setPin(prev => prev.slice(0, -1))
        } else if (e.key === 'Escape') {
          resetToIdle()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appState])

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/employee/me')
      if (res.ok) {
        const data = await res.json()
        if (data.employee) {
          setEmployee({
            ...data.employee,
            isClockedIn: data.employee.isClockedIn ?? true,
            clockInTime: data.employee.clockInTime || new Date().toISOString()
          })
          setAppState('app')
          loadAppData()
        }
      }
    } catch {
      // Not logged in
    }
  }

  const resetToIdle = () => {
    setAppState('idle')
    setPin('')
    setError('')
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        lookupEmployee(newPin)
      }
    }
  }

  const lookupEmployee = async (pinCode: string) => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/kiosk/lookup?pin=${pinCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Employee not found')
        setPin('')
        return
      }

      const emp: Employee = {
        id: data.employee.id,
        firstName: data.employee.firstName,
        lastName: data.employee.lastName,
        role: data.employee.role || 'WAREHOUSE',
        photoUrl: data.employee.photoUrl,
        isClockedIn: data.employee.isClockedIn,
        clockInTime: data.employee.lastClockIn || new Date().toISOString()
      }

      // Clock in if not already clocked in
      if (!data.employee.isClockedIn) {
        await fetch('/api/kiosk/clock-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: data.employee.id })
        })
        emp.isClockedIn = true
      }

      // Create session
      await fetch('/api/staff/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinCode })
      })

      setEmployee(emp)
      setAppState('app')
      loadAppData()
    } catch {
      setError('Connection error')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!employee) return

    setIsLoading(true)
    try {
      await fetch('/api/kiosk/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id })
      })

      await fetch('/api/employee/logout', { method: 'POST' })

      setEmployee(null)
      setProducts([])
      setActiveCount(null)
      setRecentItems([])
      setTasks([])
      setTimeEntries([])
      resetToIdle()
    } catch (error) {
      console.error('Clock out failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAppData = async () => {
    setLoadingProducts(true)
    try {
      const prodRes = await fetch('/api/staff/products', { credentials: 'include' })
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.data || [])
      }

      const countRes = await fetch('/api/employee/inventory-count')
      if (countRes.ok) {
        const countData = await countRes.json()
        const openCount = countData.counts?.find((c: InventoryCount) => c.status === 'OPEN')
        setActiveCount(openCount || null)

        if (openCount) {
          await loadRecentItems(openCount.id)
        }
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoadingProducts(false)
    }

    loadTasks()
    loadTimesheet()
  }

  const loadRecentItems = async (countId: string) => {
    try {
      const res = await fetch(`/api/employee/inventory-count/${countId}/items`)
      if (res.ok) {
        const data = await res.json()
        setRecentItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    }
  }

  const loadTasks = async (showAlert = false) => {
    setLoadingTasks(true)
    try {
      const res = await fetch('/api/staff/tasks', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const fetchedTasks: Task[] = data.tasks || []
        setTasks(fetchedTasks)

        // Check for new tasks that we haven't seen before
        if (showAlert && fetchedTasks.length > 0) {
          const newTaskFound = fetchedTasks.find(t =>
            t.status === 'PENDING' &&
            !lastSeenTaskIds.has(t.id)
          )

          if (newTaskFound) {
            setNewTask(newTaskFound)
            setShowTaskAlert(true)
            playAlertSound()

            // Update seen tasks
            setLastSeenTaskIds(prev => {
              const updated = new Set(prev)
              fetchedTasks.forEach(t => updated.add(t.id))
              return updated
            })
          }
        } else {
          // Initial load - mark all as seen
          setLastSeenTaskIds(new Set(fetchedTasks.map(t => t.id)))
        }
      }
    } catch (error) {
      console.error('Tasks load error:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const playAlertSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.5

      oscillator.start()

      // Beep pattern: on-off-on-off-on
      setTimeout(() => { gainNode.gain.value = 0 }, 150)
      setTimeout(() => { gainNode.gain.value = 0.5 }, 250)
      setTimeout(() => { gainNode.gain.value = 0 }, 400)
      setTimeout(() => { gainNode.gain.value = 0.5 }, 500)
      setTimeout(() => { gainNode.gain.value = 0 }, 650)
      setTimeout(() => { oscillator.stop(); audioContext.close() }, 700)

      // Also vibrate on mobile
      if (navigator.vibrate) {
        navigator.vibrate([150, 100, 150, 100, 150])
      }
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  const acknowledgeTask = async (action: 'queue' | 'start') => {
    if (!newTask) return

    try {
      await fetch('/api/staff/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: newTask.id, action })
      })

      setShowTaskAlert(false)
      setNewTask(null)
      loadTasks() // Refresh tasks list

      if (action === 'start') {
        // Navigate to appropriate view based on task type
        if (newTask.type === 'COUNTING') {
          setActiveTab('inventory')
        } else if (newTask.type === 'MAPPING') {
          window.location.href = '/staff/mapping'
        } else {
          setActiveTab('tasks')
        }
      }
    } catch (error) {
      console.error('Task acknowledge error:', error)
    }
  }

  // Poll for new tasks every 10 seconds when app is active
  useEffect(() => {
    if (appState !== 'app' || !employee) return

    const pollInterval = setInterval(() => {
      loadTasks(true) // Check for new tasks with alert
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [appState, employee])

  const loadTimesheet = async () => {
    setLoadingTimesheet(true)
    try {
      setTimeEntries([])
    } catch {
      // Ignore
    } finally {
      setLoadingTimesheet(false)
    }
  }

  const createCountSession = async () => {
    const today = new Date()
    const name = `Count ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    try {
      const res = await fetch('/api/employee/inventory-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveCount(data.count)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.caseSku?.toLowerCase().includes(term) ||
      p.warehouseLocation?.toLowerCase().includes(term) ||
      p.brand?.name?.toLowerCase().includes(term)
    )
  })

  const getCountedItem = (productId: string) => {
    return recentItems.find(item => item.productId === productId)
  }

  const getMyCountedItems = () => {
    if (!employee) return []
    return recentItems.filter(item => item.counterId === employee.id)
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    const existing = getCountedItem(product.id)
    setExistingItem(existing || null)

    if (existing) {
      setCountedCases(existing.countedCases)
      setCountedPieces(existing.countedPieces)
      setUnitsPerCase(existing.unitsPerCase || product.unitsPerCase || 1)
      setWarehouseLocation(existing.warehouseLocation || product.warehouseLocation || '')
      setNeedsDateCheck(existing.needsDateCheck)
      setExpirationDate(existing.expirationDate?.split('T')[0] || '')
      setEditSku(existing.sku || product.sku || '')
      setEditCaseSku(existing.caseSku || product.caseSku || '')
    } else {
      setCountedCases(0)
      setCountedPieces(0)
      setUnitsPerCase(product.unitsPerCase || 1)
      setWarehouseLocation(product.warehouseLocation || '')
      setNeedsDateCheck(false)
      setExpirationDate(product.expirationDate?.split('T')[0] || '')
      setEditSku(product.sku || '')
      setEditCaseSku(product.caseSku || '')
    }
  }

  const saveCount = async () => {
    if (!activeCount || !selectedProduct || !employee) return

    setSaving(true)
    try {
      const res = await fetch(`/api/employee/inventory-count/${activeCount.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          counterId: employee.id,
          countedCases,
          countedPieces,
          unitsPerCase,
          warehouseLocation,
          needsDateCheck,
          expirationDate: expirationDate || null,
          sku: editSku,
          caseSku: editCaseSku
        })
      })

      if (res.ok) {
        await loadRecentItems(activeCount.id)
        setActiveCount(prev => prev ? {
          ...prev,
          _count: { items: (prev._count?.items || 0) + (existingItem ? 0 : 1) }
        } : null)
        setSelectedProduct(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save count')
    } finally {
      setSaving(false)
    }
  }

  // Scanner functions - using BarcodeScanner component
  const startScanner = (mode: ScanMode) => {
    setScanMode(mode)
    setScannerOpen(true)
  }

  const stopScanner = () => {
    setScannerOpen(false)
    setScanMode(null)
  }

  const handleBarcodeScan = (code: string) => {
    stopScanner()

    if (scanMode === 'sku') {
      setEditSku(code)
    } else if (scanMode === 'case-sku') {
      setEditCaseSku(code)
    } else {
      // Product scan
      const product = products.find(p => p.sku === code || p.caseSku === code)
      if (product) {
        openProductModal(product)
      } else {
        // Show new product option
        setShowNewProduct(true)
        setEditSku(code)
        setNewProductName('')
        setNewProductImage(null)
        setNewProductPreview(null)
      }
    }
  }

  const setExpirationPreset = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setExpirationDate(date.toISOString().split('T')[0])
    setNeedsDateCheck(false)
  }

  // Calendar functions
  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1)
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []

    // Add empty slots for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const selectCalendarDate = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day)
    setExpirationDate(date.toISOString().split('T')[0])
    setShowCalendar(false)
    setNeedsDateCheck(false)
  }

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(calendarYear - 1)
    } else {
      setCalendarMonth(calendarMonth - 1)
    }
  }

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(calendarYear + 1)
    } else {
      setCalendarMonth(calendarMonth + 1)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select date'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // New product image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProductImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProductPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createNewProduct = async () => {
    if (!newProductName.trim() || !editSku) return

    setCreatingProduct(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName.trim(),
          sku: editSku,
          caseSku: editCaseSku || null,
          price: 0,
          inStock: true,
          stock: 0,
          unitsPerCase: 1
        })
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create product')
        return
      }

      const { product } = await res.json()

      // Upload image if provided
      if (newProductImage) {
        const formData = new FormData()
        formData.append('file', newProductImage)
        formData.append('productId', product.id)

        await fetch('/api/admin/products/uploadImage', {
          method: 'POST',
          body: formData
        })
      }

      // Reload products
      await loadAppData()
      setShowNewProduct(false)

    } catch (error) {
      console.error('Create product failed:', error)
      alert('Failed to create product')
    } finally {
      setCreatingProduct(false)
    }
  }

  const totalUnits = countedCases * unitsPerCase + countedPieces
  const myItemsCount = getMyCountedItems().length

  // =====================
  // IDLE STATE
  // =====================
  if (appState === 'idle') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col items-center justify-center p-4"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={() => setAppState('entering-pin')}
      >
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2 font-mono tabular-nums whitespace-nowrap">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="text-3xl ml-1">{currentTime.toLocaleTimeString([], { second: '2-digit' }).slice(-2)}</span>
          </div>
          <div className="text-xl text-emerald-200 mb-8">
            {formatDate(currentTime)}
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-10 h-10 text-white" />
          </div>
          <p className="text-emerald-100 text-lg">Tap to Clock In</p>
        </div>
      </div>
    )
  }

  // =====================
  // PIN ENTRY STATE
  // =====================
  if (appState === 'entering-pin') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col items-center justify-center p-4"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-full max-w-xs">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Enter Your PIN</h2>
          <p className="text-emerald-200 text-center mb-6 text-sm">Last 4 digits of phone</p>

          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                  pin.length > i ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'
                }`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center mb-6">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                className="aspect-square bg-white/10 active:bg-emerald-600 rounded-2xl text-white text-2xl font-bold transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={resetToIdle}
              className="aspect-square bg-red-500/20 rounded-2xl text-red-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePinInput('0')}
              className="aspect-square bg-white/10 active:bg-emerald-600 rounded-2xl text-white text-2xl font-bold transition-colors"
            >
              0
            </button>
            <button
              onClick={() => setPin(pin.slice(0, -1))}
              className="aspect-square bg-white/10 rounded-2xl text-white text-lg font-medium"
            >
              ←
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =====================
  // MAIN APP STATE
  // =====================
  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header - Compact */}
      <div className="bg-emerald-800 px-3 py-2 flex items-center justify-between">
        <button onClick={() => setMenuOpen(true)} className="p-1.5 text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <p className="text-white font-bold text-sm">{employee?.firstName}</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-emerald-200 text-xs">{formatTime(currentTime)}</span>
          </div>
        </div>
        <button onClick={handleClockOut} disabled={isLoading} className="p-1.5 text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'home' && (
          <div className="p-3 space-y-3">
            <h2 className="text-lg font-bold text-white">Today's Tasks</h2>

            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Inventory Count</h3>
                    <p className="text-white/70 text-xs">
                      {activeCount ? `You: ${myItemsCount} • Total: ${activeCount._count?.items || 0}` : 'Start counting'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
            </button>

            {tasks.length === 0 && (
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No other tasks</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex flex-col h-full">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              </div>
            ) : !activeCount ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 px-4">
                <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-white mb-1">Ready to Count</h2>
                  <p className="text-slate-400 text-sm">Start today's inventory</p>
                </div>
                <button
                  onClick={createCountSession}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Start Counting
                </button>
              </div>
            ) : (
              <>
                {/* Stats bar */}
                <div className="bg-slate-800 px-3 py-2 flex items-center justify-between text-xs border-b border-slate-700">
                  <span className="text-white font-medium">{activeCount.name}</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-300 rounded-full">You: {myItemsCount}</span>
                    <span className="text-slate-400">Total: {activeCount._count?.items || 0}</span>
                  </div>
                </div>

                {/* Scan Button */}
                <div className="p-2">
                  <button
                    onClick={() => startScanner('product')}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Camera className="w-6 h-6" />
                    SCAN PRODUCT
                  </button>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setShowNewProduct(true)}
                      className="py-3 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      NEW
                    </button>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="py-3 bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-sm"
                    >
                      <Home className="w-4 h-4" />
                      HOME
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="px-2 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-auto px-2 pb-2 space-y-1.5">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No products found</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const counted = getCountedItem(product.id)
                      const needsSku = !product.sku || product.sku.startsWith('AUTO-') || product.sku.startsWith('PROD-')

                      return (
                        <button
                          key={product.id}
                          onClick={() => openProductModal(product)}
                          className={`w-full bg-slate-800 rounded-lg p-2 text-left border-2 ${
                            counted ? 'border-emerald-500' : needsSku ? 'border-orange-500/50' : 'border-slate-700'
                          }`}
                        >
                          <div className="flex gap-2">
                            <div className="w-12 h-12 rounded-lg bg-white flex-shrink-0 overflow-hidden">
                              {product.imageUrl ? (
                                <img src={getPublicImageUrl(product.imageUrl)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                  <Package className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-xs leading-tight line-clamp-2">{product.name}</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {product.brand?.name && <span className="text-[10px] text-blue-400">{product.brand.name}</span>}
                                {product.warehouseLocation && (
                                  <span className="text-[10px] text-slate-500">{product.warehouseLocation}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                              {counted ? (
                                <>
                                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-emerald-400 text-xs font-bold">{counted.countedTotal}</span>
                                </>
                              ) : (
                                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">My Tasks</h2>
              <button onClick={() => loadTasks()} className="text-sm text-emerald-400">Refresh</button>
            </div>
            {loadingTasks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No tasks assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-slate-800 rounded-xl p-3 border-l-4 border-l-emerald-500">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${PRIORITY_COLORS[task.priority] || 'bg-blue-600'}`}>
                            {task.priority}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {TASK_TYPE_LABELS[task.type] || task.type}
                          </span>
                        </div>
                        <h3 className="text-white font-medium text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{task.description}</p>
                        )}
                        {task.order && (
                          <p className="text-blue-400 text-xs mt-1">
                            Order #{task.order.orderNumber} - {task.order.Customer?.storeName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {task.status === 'PENDING' && (
                          <button
                            onClick={async () => {
                              await fetch('/api/staff/tasks', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ taskId: task.id, action: 'start' })
                              })
                              loadTasks()
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white text-xs rounded font-medium"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={async () => {
                              await fetch('/api/staff/tasks', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ taskId: task.id, action: 'complete' })
                              })
                              loadTasks()
                            }}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timesheet' && (
          <div className="p-3">
            <h2 className="text-lg font-bold text-white mb-3">Clock History</h2>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav - Compact */}
      <div className="bg-slate-800 border-t border-slate-700" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {[
            { id: 'home' as AppTab, icon: Home, label: 'Home' },
            { id: 'inventory' as AppTab, icon: Package, label: 'Count' },
            { id: 'tasks' as AppTab, icon: ListTodo, label: 'Tasks' },
            { id: 'timesheet' as AppTab, icon: Clock, label: 'Time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-slate-900 h-full flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="p-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{employee?.firstName} {employee?.lastName}</p>
                    <p className="text-slate-400 text-xs">{employee?.role?.toLowerCase()}</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Clock-in time and worked hours - subtle display */}
              <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>In: {formatClockInTime(employee?.clockInTime)}</span>
                </div>
                <div className="text-slate-400 font-mono">
                  {getWorkedTime(employee?.clockInTime, currentTime).display}
                </div>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-auto">
              {[
                { id: 'home' as AppTab, icon: Home, label: 'Home' },
                { id: 'inventory' as AppTab, icon: Package, label: 'Inventory' },
                { id: 'tasks' as AppTab, icon: ListTodo, label: 'Tasks' },
                { id: 'timesheet' as AppTab, icon: Clock, label: 'Time' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMenuOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}

              {/* Tools section */}
              <div className="pt-2 mt-2 border-t border-slate-800">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 px-3">Tools</p>
                <a
                  href="/staff/mapping"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-blue-600/20"
                >
                  <MapPin className="w-4 h-4" />
                  Map Builder
                </a>
              </div>
            </div>
            <div className="p-3 border-t border-slate-800">
              <button onClick={handleClockOut} className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 rounded-lg text-white text-sm">
                <LogOut className="w-4 h-4" />
                Clock Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal - Using BarcodeScanner Component */}
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={stopScanner}
          title={scanMode === 'sku' ? 'Scan Unit SKU' : scanMode === 'case-sku' ? 'Scan Case SKU' : 'Scan Product'}
          subtitle="Point at barcode"
        />
      )}

      {/* Product Count Modal - FULL SCREEN */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Header - Full width with close button */}
          <div className="bg-slate-800 px-3 py-2 flex items-center gap-3 border-b border-slate-700">
            <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-700 rounded-lg text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
              {selectedProduct.imageUrl ? (
                <img src={getPublicImageUrl(selectedProduct.imageUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-sm line-clamp-2">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Stock: {selectedProduct.stock}</span>
                <span className="text-slate-500 font-mono">{selectedProduct.sku}</span>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">

            <div className="p-2 space-y-2">
              {/* COUNT SECTION - Compact */}
              <div className="bg-slate-800 rounded-xl p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-xs flex items-center gap-1">
                    <Box className="w-3 h-3 text-emerald-400" /> CASES
                  </h3>
                  <div className="bg-emerald-600 rounded px-2 py-0.5">
                    <span className="text-white text-xs font-bold">Total: {totalUnits}</span>
                    {selectedProduct.stock !== totalUnits && (
                      <span className={`ml-1 text-[10px] ${totalUnits > selectedProduct.stock ? 'text-green-200' : 'text-red-200'}`}>
                        ({totalUnits > selectedProduct.stock ? '+' : ''}{totalUnits - selectedProduct.stock})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <button onClick={() => setCountedCases(Math.max(0, countedCases - 1))} className="w-11 h-11 bg-red-600 rounded-lg flex items-center justify-center active:scale-95">
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={countedCases}
                    onChange={(e) => setCountedCases(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 text-center text-2xl font-bold bg-slate-700 rounded-lg py-1.5 text-white"
                  />
                  <button onClick={() => setCountedCases(countedCases + 1)} className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center active:scale-95">
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="flex gap-1 mb-2">
                  {QUICK_CASES.map((n) => (
                    <button key={n} onClick={() => setCountedCases(countedCases + n)} className="flex-1 py-1.5 bg-slate-700 rounded text-white text-xs font-bold active:bg-slate-600">+{n}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-700/50 rounded-lg p-1.5">
                  <span className="text-slate-400 text-[10px] w-10">Pieces</span>
                  <button onClick={() => setCountedPieces(Math.max(0, countedPieces - 1))} className="w-7 h-7 bg-slate-600 rounded flex items-center justify-center">
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <input type="number" inputMode="numeric" value={countedPieces} onChange={(e) => setCountedPieces(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center text-sm font-bold bg-slate-600 rounded py-1 text-white" />
                  <button onClick={() => setCountedPieces(countedPieces + 1)} className="w-7 h-7 bg-slate-600 rounded flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-slate-500 text-[10px] ml-auto">per case:</span>
                  <input type="number" inputMode="numeric" value={unitsPerCase} onChange={(e) => setUnitsPerCase(Math.max(1, parseInt(e.target.value) || 1))} className="w-10 text-center font-bold bg-slate-600 rounded py-1 text-white text-xs" />
                </div>
              </div>

              {/* DATE & LOCATION ROW - Side by side on larger phones */}
              <div className="grid grid-cols-2 gap-2">
                {/* DATE SECTION - Compact */}
                <div className="bg-slate-800 rounded-xl p-2">
                  <h3 className="text-white font-bold text-[10px] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange-400" /> EXPIRATION
                  </h3>
                  <button
                    onClick={() => { setNeedsDateCheck(!needsDateCheck); if (!needsDateCheck) setExpirationDate('') }}
                    className={`w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 mb-1.5 ${needsDateCheck ? 'bg-red-600 text-white ring-1 ring-red-400' : 'bg-slate-700 text-slate-300'}`}
                  >
                    <Flag className="w-3 h-3" />
                    {needsDateCheck ? '🚩 FLAGGED' : 'Flag Check'}
                  </button>
                  {!needsDateCheck && (
                    <>
                      <div className="grid grid-cols-3 gap-0.5 mb-1">
                        {EXPIRATION_PRESETS.slice(0, 3).map((p) => (
                          <button key={p.label} onClick={() => setExpirationPreset(p.days)} className={`py-1 ${p.color} rounded text-white font-bold text-[9px]`}>{p.label}</button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setShowCalendar(true); setCalendarMonth(new Date().getMonth()); setCalendarYear(new Date().getFullYear()) }}
                        className="w-full px-2 py-1.5 bg-slate-700 rounded text-white text-[10px] flex items-center justify-between"
                      >
                        <span>{expirationDate ? formatDisplayDate(expirationDate) : '📅 Pick'}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </>
                  )}
                </div>

                {/* LOCATION - Compact */}
                <div className="bg-slate-800 rounded-xl p-2">
                  <h3 className="text-white font-bold text-[10px] mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" /> LOCATION
                  </h3>
                  <input
                    type="text"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value.toUpperCase())}
                    placeholder="A-12-3"
                    className="w-full px-2 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-500 font-mono text-xs"
                  />
                  <a href="/staff/mapping" className="block mt-1.5 text-center text-[9px] text-blue-400 underline">
                    Open Map
                  </a>
                </div>
              </div>

              {/* SKU SECTION - Compact inline */}
              <div className="bg-slate-800 rounded-xl p-2">
                <h3 className="text-white font-bold text-[10px] mb-1.5 flex items-center gap-1">
                  <Barcode className="w-3 h-3 text-cyan-400" /> BARCODES
                </h3>
                <div className="flex gap-1.5 mb-1.5">
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    placeholder="Unit SKU"
                    className="flex-1 px-2 py-1.5 bg-slate-700 border border-cyan-600 rounded text-white text-[10px] font-mono"
                  />
                  <button onClick={() => startScanner('sku')} className="px-2 bg-cyan-600 rounded">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editCaseSku}
                    onChange={(e) => setEditCaseSku(e.target.value)}
                    placeholder="Case SKU"
                    className="flex-1 px-2 py-1.5 bg-slate-700 border border-yellow-600 rounded text-white text-[10px] font-mono"
                  />
                  <button onClick={() => startScanner('case-sku')} className="px-2 bg-yellow-600 rounded">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* SAVE - Big prominent button */}
              <button
                onClick={saveCount}
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" />{existingItem ? 'UPDATE COUNT' : 'SAVE COUNT'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setShowCalendar(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 bg-orange-600 flex items-center justify-between">
              <button onClick={prevMonth} className="p-1"><ChevronLeft className="w-5 h-5 text-white" /></button>
              <span className="text-white font-bold">{MONTHS[calendarMonth]} {calendarYear}</span>
              <button onClick={nextMonth} className="p-1"><ChevronRight className="w-5 h-5 text-white" /></button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-slate-500 text-xs font-medium">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day && selectCalendarDate(day)}
                    disabled={!day}
                    className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center ${
                      day
                        ? expirationDate === `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                        : ''
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-slate-800">
              <button onClick={() => setShowCalendar(false)} className="w-full py-2 bg-slate-700 rounded-lg text-white text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNewProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowNewProduct(false)}>
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 bg-purple-600 flex items-center justify-between">
              <h2 className="text-white font-bold">New Product</h2>
              <button onClick={() => setShowNewProduct(false)} className="p-1 text-white/80"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 space-y-3">
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                {newProductPreview ? (
                  <img src={newProductPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <><ImagePlus className="w-8 h-8 text-slate-500 mb-1" /><p className="text-slate-400 text-xs">Add photo</p></>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
              <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Product name *" className="w-full px-3 py-2 bg-slate-800 rounded-lg text-white text-sm" />
              <div className="flex gap-2">
                <input type="text" value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="Unit SKU" className="flex-1 px-3 py-2 bg-slate-800 border-2 border-cyan-600 rounded-lg text-white text-sm font-mono" />
                <button onClick={() => startScanner('sku')} className="px-3 bg-cyan-600 rounded-lg"><Camera className="w-5 h-5 text-white" /></button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={editCaseSku} onChange={(e) => setEditCaseSku(e.target.value)} placeholder="Case SKU" className="flex-1 px-3 py-2 bg-slate-800 border-2 border-yellow-600 rounded-lg text-white text-sm font-mono" />
                <button onClick={() => startScanner('case-sku')} className="px-3 bg-yellow-600 rounded-lg"><Camera className="w-5 h-5 text-white" /></button>
              </div>
              <button onClick={createNewProduct} disabled={creatingProduct || !newProductName.trim() || !editSku} className="w-full py-3 bg-purple-600 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1">
                {creatingProduct ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" />CREATE</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK ALERT MODAL - Flashing green with sound */}
      {showTaskAlert && newTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Alert Header */}
            <div className="bg-emerald-600 p-4 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white font-bold text-xl">NEW TASK!</h2>
            </div>

            {/* Task Details */}
            <div className="p-4 space-y-3">
              <div className="text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${PRIORITY_COLORS[newTask.priority] || 'bg-blue-600'}`}>
                  {newTask.priority}
                </span>
              </div>

              <div className="bg-slate-100 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">{TASK_TYPE_LABELS[newTask.type] || newTask.type}</p>
                <h3 className="text-slate-900 font-bold text-lg">{newTask.title}</h3>
                {newTask.description && (
                  <p className="text-slate-600 text-sm mt-1">{newTask.description}</p>
                )}
                {newTask.order && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-slate-500 text-xs">Order</p>
                    <p className="text-slate-700 font-medium">
                      #{newTask.order.orderNumber} - {newTask.order.Customer?.storeName}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => acknowledgeTask('queue')}
                  className="py-3 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  QUEUE
                </button>
                <button
                  onClick={() => acknowledgeTask('start')}
                  className="py-3 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  DO NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
