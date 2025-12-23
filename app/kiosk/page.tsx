'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Clock, CheckCircle, XCircle, User, ArrowLeft, Loader2 } from 'lucide-react'

type ClockStatus = 'idle' | 'entering-pin' | 'confirming' | 'photo' | 'success' | 'error'

interface EmployeeInfo {
  id: string
  firstName: string
  lastName: string
  photoUrl?: string
  isClockedIn: boolean
  lastClockIn?: string
}

export default function KioskPage() {
  const [status, setStatus] = useState<ClockStatus>('idle')
  const [pin, setPin] = useState('')
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [businessName, setBusinessName] = useState('Employee Time Clock')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Fetch business name from settings
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.name) setBusinessName(`${data.name} Employee Time Clock`)
      })
      .catch(() => {}) // Fail silently, use default
  }, [])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Start camera when entering photo mode
  useEffect(() => {
    if (status === 'photo') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [status])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Could not access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setPhotoData(dataUrl)
      }
    }
  }, [])

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        lookupEmployee(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const lookupEmployee = async (pinCode: string) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/kiosk/lookup?pin=${pinCode}`)
      const data = await res.json()
      if (res.ok && data.employee) {
        setEmployee(data.employee)
        setStatus('confirming')
      } else {
        setError(data.error || 'Employee not found')
        setPin('')
      }
    } catch {
      setError('Connection error')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    setStatus('photo')
  }

  const handleSubmitWithPhoto = async () => {
    if (!employee || !photoData) return

    setIsLoading(true)
    try {
      const endpoint = employee.isClockedIn ? '/api/kiosk/clock-out' : '/api/kiosk/clock-in'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          photo: photoData
        })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setTimeout(resetKiosk, 3000)
      } else {
        setError(data.error || 'Failed to clock in/out')
        setStatus('error')
        setTimeout(resetKiosk, 3000)
      }
    } catch {
      setError('Connection error')
      setStatus('error')
      setTimeout(resetKiosk, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const resetKiosk = () => {
    setStatus('idle')
    setPin('')
    setEmployee(null)
    setError('')
    setPhotoData(null)
    stopCamera()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Idle screen - tap to start
  if (status === 'idle') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-8 cursor-pointer select-none"
        onClick={() => setStatus('entering-pin')}
      >
        <div className="text-center">
          <Clock className="w-24 h-24 text-blue-300 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-white mb-4">
            {formatTime(currentTime)}
          </h1>
          <p className="text-2xl text-blue-200 mb-8">
            {formatDate(currentTime)}
          </p>
          <div className="bg-white/10 backdrop-blur rounded-2xl px-12 py-6 inline-block">
            <p className="text-3xl text-white font-medium">
              Tap to Clock In / Out
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 text-blue-300/60 text-sm">
          {businessName}
        </div>
      </div>
    )
  }

  // PIN entry screen
  if (status === 'entering-pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-8 select-none">
        <button
          onClick={resetKiosk}
          className="absolute top-6 left-6 text-white/60 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          Cancel
        </button>

        <div className="text-center mb-8">
          <User className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Enter Your PIN
          </h2>
          <p className="text-blue-200">Last 4 digits of your phone number</p>
        </div>

        {/* PIN display */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-16 h-20 rounded-xl border-2 flex items-center justify-center text-4xl font-bold transition-all ${
                pin[i]
                  ? 'bg-white text-blue-900 border-white'
                  : 'bg-white/10 text-transparent border-white/30'
              }`}
            >
              {pin[i] || '0'}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-6 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 text-blue-200 mb-6">
            <Loader2 className="w-6 h-6 animate-spin" />
            Looking up employee...
          </div>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-4 max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handlePinInput(String(num))}
              disabled={isLoading}
              className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-3xl font-bold transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty cell */}
          <button
            onClick={() => handlePinInput('0')}
            disabled={isLoading}
            className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-3xl font-bold transition-all disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xl font-bold transition-all disabled:opacity-50"
          >
            ←
          </button>
        </div>

        <div className="absolute bottom-8 text-blue-300/60 text-lg">
          {formatTime(currentTime)}
        </div>
      </div>
    )
  }

  // Confirmation screen
  if (status === 'confirming' && employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-8 select-none">
        <button
          onClick={resetKiosk}
          className="absolute top-6 left-6 text-white/60 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          Cancel
        </button>

        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          {/* Employee photo or avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-6 flex items-center justify-center overflow-hidden">
            {employee.photoUrl ? (
              <img src={employee.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-white">
                {employee.firstName[0]}{employee.lastName[0]}
              </span>
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {employee.firstName} {employee.lastName}
          </h2>

          <div className={`inline-block px-4 py-2 rounded-full text-lg font-medium mb-6 ${
            employee.isClockedIn
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {employee.isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
          </div>

          {employee.lastClockIn && employee.isClockedIn && (
            <p className="text-gray-500 mb-6">
              Since {new Date(employee.lastClockIn).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          )}

          <button
            onClick={handleConfirm}
            className={`w-full py-5 rounded-2xl text-xl font-bold text-white transition-all ${
              employee.isClockedIn
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            {employee.isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>

        <div className="absolute bottom-8 text-blue-300/60 text-lg">
          {formatTime(currentTime)}
        </div>
      </div>
    )
  }

  // Photo capture screen
  if (status === 'photo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-8 select-none">
        <button
          onClick={() => setStatus('confirming')}
          className="absolute top-6 left-6 text-white/60 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="text-center mb-6">
          <Camera className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">
            {photoData ? 'Photo Captured!' : 'Take Your Photo'}
          </h2>
        </div>

        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl mb-6">
          {!photoData ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-80 h-60 object-cover"
            />
          ) : (
            <img src={photoData} alt="Captured" className="w-80 h-60 object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-6 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          {!photoData ? (
            <button
              onClick={capturePhoto}
              className="px-8 py-4 rounded-2xl bg-white text-blue-900 text-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-3"
            >
              <Camera className="w-6 h-6" />
              Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={() => setPhotoData(null)}
                className="px-6 py-4 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20 transition-all"
              >
                Retake
              </button>
              <button
                onClick={handleSubmitWithPhoto}
                disabled={isLoading}
                className={`px-8 py-4 rounded-2xl text-xl font-bold text-white transition-all flex items-center gap-3 disabled:opacity-50 ${
                  employee?.isClockedIn
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                Confirm {employee?.isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </>
          )}
        </div>

        <div className="absolute bottom-8 text-blue-300/60 text-lg">
          {formatTime(currentTime)}
        </div>
      </div>
    )
  }

  // Success screen
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 flex flex-col items-center justify-center p-8 select-none">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-white/20 mx-auto mb-8 flex items-center justify-center">
            <CheckCircle className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {employee?.isClockedIn ? 'Clocked Out!' : 'Clocked In!'}
          </h1>
          <p className="text-2xl text-green-100 mb-2">
            {employee?.firstName} {employee?.lastName}
          </p>
          <p className="text-xl text-green-200">
            {formatTime(currentTime)}
          </p>
        </div>
      </div>
    )
  }

  // Error screen
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-700 to-rose-800 flex flex-col items-center justify-center p-8 select-none">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-white/20 mx-auto mb-8 flex items-center justify-center">
            <XCircle className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Error
          </h1>
          <p className="text-xl text-red-100">
            {error || 'Something went wrong'}
          </p>
        </div>
      </div>
    )
  }

  return null
}
