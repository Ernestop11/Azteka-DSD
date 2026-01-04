'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function StaffLoginPage() {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/employee/me')
      if (res.ok) {
        const data = await res.json()
        if (data.employee) {
          redirectByRole(data.employee.role)
        }
      }
    } catch {
      // Not logged in, stay on page
    }
  }

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        router.push('/ana')
        break
      case 'SALES_REP':
      case 'DRIVER':
        router.push('/xeki')
        break
      default:
        router.push('/employee')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Check if PIN reset is needed
      if (data.needsPinReset) {
        router.push('/staff/reset-pin')
        return
      }

      // Redirect based on role
      redirectByRole(data.employee.role)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handlePinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Portal</h1>
          <p className="text-slate-400 mt-1">Sign in to your Azteka account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@azteka.com"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
              autoComplete="email"
            />
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-slate-400 text-sm font-medium mb-2">
              PIN (Last 4 digits of phone)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={handlePinInput}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                required
                autoComplete="one-time-code"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Help Text */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Use your @azteka.com email and your 4-digit PIN
          </p>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <a href="/kiosk" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors">
            Go to Clock-In Kiosk →
          </a>
        </div>
      </div>
    </div>
  )
}
