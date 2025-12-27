'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'pin'>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/customer/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Phone number not found')
        return
      }

      setCustomerName(data.businessName)

      // If customer has no PIN set, prompt to create one
      if (!data.hasPin) {
        setStep('pin')
        setError('') // Will prompt to create PIN
      } else {
        setStep('pin')
      }
    } catch (err) {
      setError('Failed to verify phone number')
    } finally {
      setLoading(false)
    }
  }

  const handlePinSubmit = async () => {
    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      const digits = phone.replace(/\D/g, '')
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid PIN')
        return
      }

      // Store session
      localStorage.setItem('customerSession', JSON.stringify({
        token: data.token,
        customerId: data.customer.id,
        businessName: data.customer.businessName,
        role: data.customer.role,
        expiresAt: data.expiresAt,
      }))

      router.push('/customer/dashboard')
    } catch (err) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setPin(digits)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-800">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-white">Customer Portal</h1>
          <p className="text-slate-400">Sign in to manage your orders</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePhoneSubmit}
              disabled={loading || phone.replace(/\D/g, '').length !== 10}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-emerald-400 font-medium">{customerName}</p>
              <p className="text-slate-400 text-sm">{phone}</p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Enter PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••"
                maxLength={6}
                className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-2xl text-center tracking-[0.5em] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <p className="text-slate-500 text-xs mt-2 text-center">4-6 digit PIN</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={loading || pin.length < 4}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <button
              onClick={() => {
                setStep('phone')
                setPin('')
                setError('')
              }}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Use a different number
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Got a link from your sales rep?
          </p>
          <p className="text-slate-400 text-sm">
            Just click the link - no login needed!
          </p>
        </div>
      </div>
    </div>
  )
}
