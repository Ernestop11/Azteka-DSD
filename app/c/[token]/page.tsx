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
    linkPurpose: 'HANDOFF' | 'INSTALL' | 'CATALOG_SHARE' | 'MVP_DASHBOARD' | null
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
  const [linkPurpose, setLinkPurpose] = useState<'HANDOFF' | 'INSTALL' | 'CATALOG_SHARE' | 'MVP_DASHBOARD' | null>(null)

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
      setLinkPurpose(data.session.linkPurpose)
      setStatus('valid')

      // Store session in localStorage for the customer portal
      localStorage.setItem('customerSession', JSON.stringify({
        token,
        customerId: data.customer.id,
        businessName: data.customer.businessName,
        role: data.customer.role,
        expiresAt: data.session.expiresAt,
        linkPurpose: data.session.linkPurpose,
        sessionId: data.session.id,
      }))

      // Route based on link purpose
      setTimeout(() => {
        switch (data.session.linkPurpose) {
          case 'HANDOFF':
            // Open catalog in handoff mode - favorites accessible via hamburger menu
            router.push(`/catalog?customer=${data.customer.id}&mode=handoff`)
            break
          case 'INSTALL':
            // Go to onboarding flow for app install + PIN setup
            router.push(`/c/${token}/onboard`)
            break
          case 'CATALOG_SHARE':
            // Direct to catalog with customer context
            router.push(`/catalog?customer=${data.customer.id}&mode=customer`)
            break
          case 'MVP_DASHBOARD':
            // Direct to customer login page for PWA install - they can add to home screen
            router.push('/customer/login')
            break
          default:
            // Legacy links without purpose - go to customer dashboard
            router.push('/customer/dashboard')
        }
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

  // Get welcome message based on link purpose
  const getWelcomeMessage = () => {
    switch (linkPurpose) {
      case 'HANDOFF':
        return 'Opening catalog for you...'
      case 'INSTALL':
        return 'Setting up your account...'
      case 'CATALOG_SHARE':
        return 'Taking you to the catalog...'
      case 'MVP_DASHBOARD':
        return 'Setting up your app...'
      default:
        return 'Taking you to your dashboard...'
    }
  }

  const getEmoji = () => {
    switch (linkPurpose) {
      case 'HANDOFF':
        return '🛒'
      case 'INSTALL':
        return '📱'
      case 'CATALOG_SHARE':
        return '📦'
      case 'MVP_DASHBOARD':
        return '📲'
      default:
        return '👋'
    }
  }

  // Valid - show welcome screen before redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center border border-emerald-500/30">
        <div className="text-6xl mb-4">{getEmoji()}</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {customer?.businessName}!
        </h1>
        <p className="text-emerald-400 mb-6">
          {getWelcomeMessage()}
        </p>
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
