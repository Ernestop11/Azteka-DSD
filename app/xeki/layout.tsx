'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Truck,
  Package,
  MapPin,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Bell,
  Users
} from 'lucide-react'

interface EmployeeSession {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function XekiLayout({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/employee/me')
      if (res.ok) {
        const data = await res.json()
        // Allow SUPER_ADMIN, SALES_REP, or DRIVER
        if (data.employee && ['SUPER_ADMIN', 'SALES_REP', 'DRIVER'].includes(data.employee.role)) {
          setEmployee(data.employee)
        } else {
          router.push('/staff/login')
        }
      } else {
        router.push('/staff/login')
      }
    } catch {
      router.push('/staff/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/employee/logout', { method: 'POST' })
    router.push('/staff/login')
  }

  const navItems = [
    { href: '/xeki', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/xeki/truck', icon: Truck, label: 'My Truck' },
    { href: '/xeki/deliveries', icon: MapPin, label: 'Deliveries' },
    { href: '/xeki/restock', icon: Package, label: 'Restock' },
    { href: '/xeki/orders', icon: ShoppingCart, label: 'Quick Order' },
    { href: '/xeki/customers', icon: Users, label: 'Customers' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!employee) return null

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header - with safe area for iPhone notch */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-blue-400">Sales Mobile</h1>
          <button className="text-slate-400 relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 h-full bg-slate-800 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-400">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map(item => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 mt-8 text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-blue-400">Sales Mobile</h1>
          <p className="text-sm text-slate-500 mt-1">Driver Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <p className="text-white font-medium">{employee.firstName}</p>
              <p className="text-xs text-slate-500">{employee.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
