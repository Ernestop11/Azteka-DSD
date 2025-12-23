'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Flashlight, SwitchCamera } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
  isActive?: boolean
  className?: string
}

export default function BarcodeScanner({
  onScan,
  onError,
  isActive = true,
  className = '',
}: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [currentCamera, setCurrentCamera] = useState(0)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)

  // Debounce scans (prevent multiple rapid scans of same code)
  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      const now = Date.now()
      // Ignore if same code scanned within 2 seconds
      if (
        decodedText === lastScanRef.current &&
        now - lastScanTimeRef.current < 2000
      ) {
        return
      }

      lastScanRef.current = decodedText
      lastScanTimeRef.current = now

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }

      // Play beep sound
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 1000
        oscillator.type = 'sine'
        gainNode.gain.value = 0.3
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch {
        // Audio not supported
      }

      onScan(decodedText)
    },
    [onScan]
  )

  // Initialize scanner
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const containerId = 'barcode-scanner-container'

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map((d) => ({ id: d.id, label: d.label })))

          // Prefer back camera
          const backCameraIndex = devices.findIndex(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear')
          )
          if (backCameraIndex !== -1) {
            setCurrentCamera(backCameraIndex)
          }
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err)
        setError('Could not access camera')
        onError?.('Could not access camera')
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [isActive, onError])

  // Start/stop scanning
  useEffect(() => {
    if (!isActive || cameras.length === 0) return

    const startScanning = async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop().catch(() => {})
        }

        scannerRef.current = new Html5Qrcode('barcode-scanner-container')

        await scannerRef.current.start(
          cameras[currentCamera].id,
          {
            fps: 10,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 1.777778,
          },
          handleScanSuccess,
          () => {} // Ignore scan failures
        )

        setScanning(true)
        setError(null)

        // Check for flash support
        // @ts-expect-error - accessing internal property
        const track = scannerRef.current.getRunningTrackSettings?.()
        if (track?.torch !== undefined) {
          setHasFlash(true)
        }
      } catch (err) {
        console.error('Error starting scanner:', err)
        setError('Failed to start camera')
        setScanning(false)
      }
    }

    startScanning()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [isActive, cameras, currentCamera, handleScanSuccess])

  // Toggle flash
  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return

    try {
      // @ts-expect-error - accessing internal method
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !flashOn }],
      })
      setFlashOn(!flashOn)
    } catch (err) {
      console.error('Error toggling flash:', err)
    }
  }

  // Switch camera
  const switchCamera = () => {
    if (cameras.length <= 1) return
    setCurrentCamera((prev) => (prev + 1) % cameras.length)
  }

  if (!isActive) {
    return null
  }

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Scanner container */}
      <div
        id="barcode-scanner-container"
        ref={containerRef}
        className="w-full h-48"
      />

      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning line animation */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
        </div>

        {/* Corner markers */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50 rounded-tl" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50 rounded-tr" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50 rounded-bl" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50 rounded-br" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2 pointer-events-auto">
        {hasFlash && (
          <button
            onClick={toggleFlash}
            className={`p-2 rounded-full ${
              flashOn ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white'
            }`}
          >
            <Flashlight className="w-5 h-5" />
          </button>
        )}
        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-black/50 text-white"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 left-2">
        {scanning ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-white">Scanning...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-500/80 rounded-full">
            <CameraOff className="w-3 h-3 text-white" />
            <span className="text-xs text-white">{error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full">
            <Camera className="w-3 h-3 text-white animate-pulse" />
            <span className="text-xs text-white">Starting camera...</span>
          </div>
        )}
      </div>
    </div>
  )
}
