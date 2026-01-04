'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Users,
  Clock,
  DollarSign,
  FileText,
  Truck,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  HelpCircle,
  Warehouse,
  ShoppingCart,
  MessageCircle,
  Ship
} from 'lucide-react'

interface EmployeeSession {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function AnaLayout({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
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
        if (data.employee && ['SUPER_ADMIN', 'ADMIN'].includes(data.employee.role)) {
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
    { href: '/ana', icon: LayoutDashboard, label: 'Inicio', labelEs: 'Inicio', exact: true },
    { href: '/ana/payroll', icon: Clock, label: 'Nómina y Horas', labelEs: 'Nómina' },
    { href: '/ana/customers', icon: ShoppingCart, label: 'Clientes', labelEs: 'Clientes' },
    { href: '/ana/messages', icon: MessageCircle, label: 'Mensajes', labelEs: 'Mensajes' },
    { href: '/ana/inventory', icon: Warehouse, label: 'Inventario', labelEs: 'Inventario' },
    { href: '/ana/po', icon: Package, label: 'Órdenes de Compra', labelEs: 'Órdenes' },
    { href: '/ana/shipping', icon: Ship, label: 'Gastos de Envío', labelEs: 'Envíos' },
    { href: '/ana/invoices', icon: FileText, label: 'Facturas y Cobranzas', labelEs: 'Facturas' },
    { href: '/ana/deposits', icon: DollarSign, label: 'Depósitos', labelEs: 'Depósitos' },
    { href: '/ana/employees', icon: Users, label: 'Empleados', labelEs: 'Empleados' },
    { href: '/ana/deliveries', icon: Truck, label: 'Entregas', labelEs: 'Entregas' },
  ]

  // Get greeting based on time of day in Spanish
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-rose-600 text-lg font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!employee) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-rose-600 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Ayuda Rápida
              </h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-rose-50 rounded-xl p-4">
                <h3 className="font-bold text-rose-700 mb-2">📋 Nómina y Horas</h3>
                <p className="text-sm">Aquí puedes ver las horas trabajadas de cada empleado y calcular el pago semanal.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-purple-700 mb-2">📦 Inventario</h3>
                <p className="text-sm">Ve lo que tienes en bodega. Toca una categoría para ver productos. ¡Puedes hacer órdenes fácilmente!</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-bold text-amber-700 mb-2">🧾 Facturas y Cobranzas</h3>
                <p className="text-sm">Genera reportes de facturas abiertas para clientes como Las Superior.</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <h3 className="font-bold text-emerald-700 mb-2">💰 Depósitos</h3>
                <p className="text-sm">Registra los depósitos del día y lleva control del efectivo.</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-rose-200 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => setSidebarOpen(true)} className="text-rose-500 p-2 -ml-2">
            <Menu className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
            Panel de Ana
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(true)} className="text-purple-500 p-2">
              <HelpCircle className="w-6 h-6" />
            </button>
            <button className="text-rose-500 p-2 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setSidebarOpen(false)}>
          <div className="w-72 h-full bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                  Menú
                </h2>
                <p className="text-sm text-gray-500">{getGreeting()}, {employee.firstName}!</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 p-2">
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
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-6 left-5 right-5">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-2xl w-full transition-colors text-lg"
              >
                <LogOut className="w-6 h-6" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white/90 backdrop-blur-lg border-r border-rose-100 flex-col shadow-xl">
        <div className="p-6 border-b border-rose-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                Panel de Ana
              </h1>
              <p className="text-sm text-gray-500">Portal de Administración</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-[1.02]'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:scale-[1.01]'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Help Button */}
        <div className="p-4 border-t border-rose-100">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-3 w-full px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>¿Necesitas ayuda?</span>
          </button>
        </div>

        <div className="p-4 border-t border-rose-100">
          <div className="flex items-center gap-3 mb-4 bg-rose-50 rounded-2xl p-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <p className="text-gray-800 font-semibold">{employee.firstName}</p>
              <p className="text-xs text-rose-500 font-medium">
                {employee.role === 'SUPER_ADMIN' ? 'Super Administrador' : 'Administrador'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 w-full py-3 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
