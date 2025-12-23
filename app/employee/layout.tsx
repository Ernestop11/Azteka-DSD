'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  ClipboardList,
  Truck,
  LayoutDashboard,
  LogOut,
  Warehouse,
  Menu,
  X
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

const ALLOWED_ROLES = ['WAREHOUSE', 'DRIVER', 'ADMIN', 'SUPER_ADMIN']

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')

        if (!res.ok) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        const data = await res.json()

        if (!data.user) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        // Check role requirements
        if (!ALLOWED_ROLES.includes(data.user.role)) {
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
  }, [router, pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isWarehouse = user.role === 'WAREHOUSE' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const isDriver = user.role === 'DRIVER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

  const navItems = [
    {
      href: '/employee',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      href: '/employee/inventory',
      label: 'Inventory',
      icon: Package,
      show: isWarehouse
    },
    {
      href: '/employee/orders',
      label: 'Order Picking',
      icon: ClipboardList,
      show: isWarehouse
    },
    {
      href: '/employee/delivery',
      label: 'Delivery',
      icon: Truck,
      show: isDriver
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 text-white
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl
        `}
        style={{
          backgroundColor: '#065f46',
          backgroundImage: 'none',
          opacity: 1
        }}
      >
        <div className="p-4 border-b border-emerald-600 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Azteka DSD</h1>
            <p className="text-sm text-emerald-200">Employee Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-emerald-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-100 hover:bg-emerald-600/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-600">
          <div className="mb-3 px-4">
            <p className="text-sm text-emerald-200">{user.email}</p>
            <p className="text-xs text-emerald-300 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-emerald-100 hover:bg-emerald-600/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 relative z-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg z-20 relative"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-semibold text-gray-900">Azteka Employee</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <div className="p-4 lg:p-6 relative z-0">
          {children}
        </div>
      </main>
    </div>
  )
}
