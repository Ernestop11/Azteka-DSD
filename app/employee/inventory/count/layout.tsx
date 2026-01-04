'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Package, AlertTriangle, BarChart3, CheckSquare, Home, LogOut } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  role: string
}

export default function InventoryCountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/employee/me')
        if (res.ok) {
          const data = await res.json()
          if (data.employee) {
            setEmployee(data.employee)
            setIsLoading(false)
            return
          }
        }
        router.push('/staff/login')
      } catch {
        router.push('/staff/login')
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/employee/logout', { method: 'POST' })
    router.push('/staff/login')
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-900 flex items-center justify-center"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    )
  }

  const navItems = [
    { href: '/employee/inventory/count', label: 'Count', icon: Package, exact: true },
    { href: '/employee/inventory/count/checker', label: 'Verify', icon: CheckSquare },
    { href: '/employee/inventory/count/flagged', label: 'Flagged', icon: AlertTriangle },
    { href: '/employee/inventory/count/summary', label: 'Summary', icon: BarChart3 },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Header */}
      <header className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/employee/inventory" className="p-2 -ml-2 hover:bg-emerald-700 rounded-lg">
          <Home className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-semibold">Inventory Count</h1>
          <p className="text-xs text-emerald-200">
            {employee?.firstName} {employee?.lastName}
          </p>
        </div>
        <button onClick={handleLogout} className="p-2 -mr-2 hover:bg-emerald-700 rounded-lg">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-slate-800 border-t border-slate-700 px-2 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
