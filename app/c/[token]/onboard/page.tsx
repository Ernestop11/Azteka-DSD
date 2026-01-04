'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Smartphone, Download, Key, CheckCircle, ArrowRight, Share, MoreVertical } from 'lucide-react'

type Step = 'welcome' | 'install' | 'pin' | 'success'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: string
  expiresAt: string
  linkPurpose: string
  sessionId: string
}

export default function OnboardPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState<Step>('welcome')
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Load session from localStorage
    const stored = localStorage.getItem('customerSession')
    if (stored) {
      try {
        setSession(JSON.parse(stored))
      } catch {
        router.replace(`/c/${token}`)
        return
      }
    } else {
      router.replace(`/c/${token}`)
      return
    }

    // Detect platform
    const ua = navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(ua))
    setIsAndroid(/android/.test(ua))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [token, router])

  const handlePinSubmit = async () => {
    // Validate PIN
    if (pin.length < 4 || pin.length > 6) {
      setPinError('PIN must be 4-6 digits')
      return
    }

    if (!/^\d+$/.test(pin)) {
      setPinError('PIN must contain only numbers')
      return
    }

    if (pin !== confirmPin) {
      setPinError('PINs do not match')
      return
    }

    setSaving(true)
    setPinError('')

    try {
      const res = await fetch('/api/customer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          pin,
          customerId: session?.customerId
        })
      })

      if (res.ok) {
        // Update session with PIN set flag
        if (session) {
          localStorage.setItem('customerSession', JSON.stringify({
            ...session,
            pinCreated: true
          }))
        }
        setStep('success')

        // Redirect to catalog after 2 seconds
        setTimeout(() => {
          router.push(`/catalog?customer=${session?.customerId}&mode=customer`)
        }, 2000)
      } else {
        const data = await res.json()
        setPinError(data.error || 'Failed to set PIN')
      }
    } catch {
      setPinError('Failed to save PIN. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const skipToPin = () => {
    setStep('pin')
  }

  const renderWelcome = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Smartphone className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Welcome to Azteka!
      </h1>
      <p className="text-slate-400 mb-6">
        Hi <span className="text-emerald-400 font-medium">{session?.businessName}</span>,
        let's get you set up so you can order anytime.
      </p>

      <div className="space-y-3 text-left mb-8">
        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">Install the App</p>
            <p className="text-sm text-slate-400">Add to your home screen for quick access</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">Create Your PIN</p>
            <p className="text-sm text-slate-400">Stay logged in and order easily</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('install')}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )

  const renderInstall = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Download className="w-10 h-10 text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Add to Home Screen
      </h1>

      {isStandalone ? (
        <div className="p-4 bg-emerald-500/20 rounded-xl mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-400 font-medium">App already installed!</p>
        </div>
      ) : isIOS ? (
        <div className="text-left space-y-4 mb-6">
          <p className="text-slate-400 text-center mb-4">Follow these steps in Safari:</p>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">1</div>
            <div>
              <p className="text-white">Tap the Share button</p>
              <div className="flex items-center gap-2 mt-1">
                <Share className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">at the bottom of Safari</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">2</div>
            <div>
              <p className="text-white">Scroll and tap "Add to Home Screen"</p>
              <p className="text-sm text-slate-400 mt-1">Look for the + icon</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">3</div>
            <div>
              <p className="text-white">Tap "Add" to confirm</p>
              <p className="text-sm text-slate-400 mt-1">The app icon will appear on your home screen</p>
            </div>
          </div>
        </div>
      ) : isAndroid ? (
        <div className="text-left space-y-4 mb-6">
          <p className="text-slate-400 text-center mb-4">Follow these steps in Chrome:</p>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">1</div>
            <div>
              <p className="text-white">Tap the menu button</p>
              <div className="flex items-center gap-2 mt-1">
                <MoreVertical className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">three dots in the corner</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">2</div>
            <div>
              <p className="text-white">Tap "Add to Home screen"</p>
              <p className="text-sm text-slate-400 mt-1">or "Install app" if available</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">3</div>
            <div>
              <p className="text-white">Tap "Add" to confirm</p>
              <p className="text-sm text-slate-400 mt-1">The app will be added to your home screen</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 mb-6">
          Look for the install button in your browser's address bar or menu to add this app to your device.
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={() => setStep('pin')}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Continue to PIN Setup
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={skipToPin}
          className="w-full py-3 text-slate-400 hover:text-white transition-colors"
        >
          I'll install later
        </button>
      </div>
    </div>
  )

  const renderPin = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Key className="w-10 h-10 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Create Your PIN
      </h1>
      <p className="text-slate-400 mb-6">
        This 4-6 digit PIN will let you log in quickly next time.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 text-left mb-2">Enter PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setPin(val)
              setPinError('')
            }}
            placeholder="••••"
            className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 text-left mb-2">Confirm PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setConfirmPin(val)
              setPinError('')
            }}
            placeholder="••••"
            className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {pinError && (
        <p className="text-red-400 text-sm mb-4">{pinError}</p>
      )}

      <button
        onClick={handlePinSubmit}
        disabled={saving || pin.length < 4 || confirmPin.length < 4}
        className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Set PIN & Start Ordering
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        You're All Set!
      </h1>
      <p className="text-emerald-400 mb-6">
        Taking you to the catalog...
      </p>
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  // Progress indicator
  const steps: Step[] = ['welcome', 'install', 'pin', 'success']
  const currentIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Progress bar */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            {steps.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentIndex ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-800">
          {step === 'welcome' && renderWelcome()}
          {step === 'install' && renderInstall()}
          {step === 'pin' && renderPin()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  )
}
