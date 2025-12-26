'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RepIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem('repSession')

    if (session) {
      // Validate session exists
      try {
        const parsed = JSON.parse(session)
        if (parsed.token) {
          router.replace('/rep/dashboard')
          return
        }
      } catch {
        localStorage.removeItem('repSession')
      }
    }

    // Redirect to login
    router.replace('/rep/login')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white text-xl flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  )
}
