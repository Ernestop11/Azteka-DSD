'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export default function AuthGuard({ children, requiredRoles = [] }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        
        if (!res.ok) {
          // No valid session - redirect to login
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        const data = await res.json()

        if (!data.user) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        // Check role requirements
        if (requiredRoles.length > 0 && !requiredRoles.includes(data.user.role)) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}&error=unauthorized`)
          return
        }

        setUser(data.user)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }

    checkAuth()
  }, [router, pathname, requiredRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return <>{children}</>
}

