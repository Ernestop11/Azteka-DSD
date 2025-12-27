'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface CustomerData {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
  priceTier: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  parentCustomerId: string | null
  salesRep: { id: string; name: string } | null
  subStores: { id: string; businessName: string; contactName: string }[]
}

interface SessionData {
  valid: boolean
  session: {
    id: string
    type: 'MAGIC_LINK' | 'PIN_LOGIN' | 'DELEGATED'
    expiresAt: string
    createdById: string | null
  }
  customer: CustomerData
}

export default function CustomerEntryPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'valid' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<CustomerData | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Invalid link')
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/customer/session?token=${token}`)
      const data: SessionData = await res.json()

      if (!res.ok || !data.valid) {
        setStatus('error')
        setError(data.error || 'Invalid or expired link')
        return
      }

      setCustomer(data.customer)
      setStatus('valid')

      // Store session in localStorage for the customer portal
      localStorage.setItem('customerSession', JSON.stringify({
        token,
        customerId: data.customer.id,
        businessName: data.customer.businessName,
        role: data.customer.role,
        expiresAt: data.session.expiresAt,
      }))

      // Redirect to customer dashboard after brief delay
      setTimeout(() => {
        router.push('/customer/dashboard')
      }, 1500)

    } catch (err) {
      console.error('Token validation error:', err)
      setStatus('error')
      setError('Failed to validate link')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying your link...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center border border-red-500/30">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Invalid</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <p className="text-slate-400 text-sm mb-6">
            This link may have expired or already been used. Please contact your sales rep for a new link.
          </p>
          <a
            href="/customer/login"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
          >
            Login Instead
          </a>
        </div>
      </div>
    )
  }

  // Valid - show welcome screen before redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center border border-emerald-500/30">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {customer?.businessName}!
        </h1>
        <p className="text-emerald-400 mb-6">
          Taking you to your dashboard...
        </p>
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
