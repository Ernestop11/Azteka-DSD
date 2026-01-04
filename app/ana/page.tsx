'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Clock,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Truck,
  FileText,
  Printer,
  Mail,
  Sparkles,
  ArrowRight,
  Warehouse,
  ChevronRight,
  Lightbulb,
  Calendar,
  Star
} from 'lucide-react'

interface DashboardStats {
  clockedInToday: number
  totalHoursThisWeek: number
  pendingPOs: number
  pendingDeposits: number
  ordersToday: number
  deliveriesToday: number
}

interface ClockedInEmployee {
  id: string
  firstName: string
  lastName: string
  clockIn: string
  role: string
  duration?: string
  hoursWorked?: string
}

interface RecentPO {
  id: string
  poNumber: string
  vendor: string
  status: string
  total: number
  itemCount: number
  createdAt: string
  expectedDate: string | null
}

interface RecentActivity {
  id: string
  type: string
  description: string
  time: string
  employee?: string
}

export default function AnaDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    clockedInToday: 0,
    totalHoursThisWeek: 0,
    pendingPOs: 0,
    pendingDeposits: 0,
    ordersToday: 0,
    deliveriesToday: 0
  })
  const [clockedIn, setClockedIn] = useState<ClockedInEmployee[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [recentPOs, setRecentPOs] = useState<RecentPO[]>([])
  const [loading, setLoading] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)

  // Tips for Ana in Spanish
  const tips = [
    {
      icon: '💡',
      title: 'Tip del Día',
      text: 'Puedes ver las horas de los empleados en "Nómina y Horas". ¡Los registros del reloj aparecen automáticamente!'
    },
    {
      icon: '📦',
      title: '¿Sabías que...',
      text: 'En "Inventario" puedes ver qué productos están bajos y hacer una orden rápida a Sabritas u otro proveedor.'
    },
    {
      icon: '🧾',
      title: 'Recordatorio',
      text: 'Usa el botón "Las Superior Cobranzas" para generar el reporte de facturas abiertas de las 9 tiendas.'
    },
    {
      icon: '⭐',
      title: 'Novedad',
      text: 'El sistema ahora sugiere órdenes de compra basadas en lo que se está vendiendo. ¡Mira las sugerencias!'
    }
  ]

  useEffect(() => {
    fetchDashboard()
    // Rotate tips every 10 seconds
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length)
    }, 10000)
    return () => clearInterval(tipTimer)
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/ana/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || stats)
        setClockedIn(data.clockedIn || [])
        setActivities(data.activities || [])
        setRecentPOs(data.recentPOs || [])
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Trabajando Ahora',
      value: stats.clockedInToday,
      icon: Users,
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      href: '/ana/payroll'
    },
    {
      title: 'Horas Esta Semana',
      value: stats.totalHoursThisWeek.toFixed(1),
      icon: Clock,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-50',
      href: '/ana/payroll'
    },
    {
      title: 'Órdenes Pendientes',
      value: stats.pendingPOs,
      icon: Package,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50',
      href: '/ana/po',
      alert: stats.pendingPOs > 0
    },
    {
      title: 'Pedidos Hoy',
      value: stats.ordersToday,
      icon: TrendingUp,
      color: 'from-rose-400 to-pink-500',
      bgColor: 'bg-rose-50',
      href: '/ana/deliveries'
    },
    {
      title: 'Entregas Hoy',
      value: stats.deliveriesToday,
      icon: Truck,
      color: 'from-purple-400 to-violet-500',
      bgColor: 'bg-purple-50',
      href: '/ana/deliveries'
    },
    {
      title: 'Depósitos Pendientes',
      value: stats.pendingDeposits,
      icon: DollarSign,
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-yellow-50',
      href: '/ana/deposits'
    }
  ]

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días, Ana!'
    if (hour < 18) return '¡Buenas tardes, Ana!'
    return '¡Buenas noches, Ana!'
  }

  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Capitalize first letter
  const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1)

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{getGreeting()}</h1>
        <p className="text-gray-500 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {capitalizedDate}
        </p>
      </div>

      {/* Tip Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{tips[tipIndex].icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-700 mb-1">{tips[tipIndex].title}</h3>
            <p className="text-gray-700">{tips[tipIndex].text}</p>
          </div>
          <div className="flex gap-1">
            {tips.map((_, i) => (
              <button
                key={i}
                onClick={() => setTipIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === tipIndex ? 'bg-purple-500 w-4' : 'bg-purple-300'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action - Las Superior Cobranzas */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Acción Rápida
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => {
              // TODO: Generate report
              alert('Generando reporte de Las Superior...')
            }}
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
          >
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold">Las Superior Cobranzas</h3>
              <p className="text-white/80 text-sm">Reporte bi-semanal de facturas abiertas (9 tiendas)</p>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Printer className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            href="/ana/inventory"
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
          >
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold">Hacer Orden a Proveedor</h3>
              <p className="text-white/80 text-sm">Sabritas, Bimbo, y más...</p>
            </div>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          Resumen del Día
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, i) => (
            <Link
              key={i}
              href={stat.href}
              className={`${stat.bgColor} rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02] group relative overflow-hidden`}
            >
              {stat.alert && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-800 group-hover:text-rose-600 transition-colors">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/ana/payroll"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-rose-500" />
            </div>
            <p className="text-gray-800 font-semibold">Ver Nómina</p>
            <p className="text-xs text-gray-400 mt-1">Horas y pagos</p>
          </Link>
          <Link
            href="/ana/po/new"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Package className="w-7 h-7 text-orange-500" />
            </div>
            <p className="text-gray-800 font-semibold">Nueva Orden</p>
            <p className="text-xs text-gray-400 mt-1">A proveedores</p>
          </Link>
          <Link
            href="/ana/deposits/new"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <DollarSign className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-gray-800 font-semibold">Registrar Depósito</p>
            <p className="text-xs text-gray-400 mt-1">Del día</p>
          </Link>
          <Link
            href="/ana/employees"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-gray-800 font-semibold">Empleados</p>
            <p className="text-xs text-gray-400 mt-1">Ver equipo</p>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Who's Clocked In */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              ¿Quién Está Trabajando?
            </h2>
            <Link href="/ana/payroll" className="text-rose-500 text-sm font-medium hover:underline flex items-center gap-1">
              Ver Todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : clockedIn.length > 0 ? (
            <div className="space-y-3">
              {clockedIn.map((emp, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <span className="text-gray-800 font-medium">{emp.firstName} {emp.lastName}</span>
                      <p className="text-xs text-gray-500">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 text-sm font-bold">
                      {emp.duration || '0h 0m'}
                    </span>
                    <p className="text-xs text-gray-500">
                      desde {new Date(emp.clockIn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nadie está fichado ahora</p>
              <p className="text-gray-400 text-sm mt-1">Los empleados aparecerán aquí cuando fichen entrada</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Actividad Reciente
          </h2>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">¡Todo al día!</p>
                <p className="text-gray-400 text-sm mt-1">No hay actividad reciente</p>
              </div>
            ) : (
              activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{activity.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {activity.employee && `${activity.employee} • `}
                      {new Date(activity.time).toLocaleString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      {recentPOs.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Órdenes de Compra Recientes
            </h2>
            <Link href="/ana/po" className="text-rose-500 text-sm font-medium hover:underline flex items-center gap-1">
              Ver Todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPOs.map((po, i) => {
              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
                IN_TRANSIT: 'bg-purple-100 text-purple-700 border-purple-200',
                RECEIVING: 'bg-orange-100 text-orange-700 border-orange-200',
                RECEIVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                STOCKED: 'bg-gray-100 text-gray-700 border-gray-200'
              }
              const statusLabels: Record<string, string> = {
                PENDING: 'Pendiente',
                CONFIRMED: 'Confirmada',
                IN_TRANSIT: 'En Tránsito',
                RECEIVING: 'Recibiendo',
                RECEIVED: 'Recibida',
                STOCKED: 'En Inventario'
              }
              return (
                <Link
                  key={i}
                  href={`/ana/po/${po.id}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold">#{po.poNumber}</p>
                      <p className="text-sm text-gray-500">{po.vendor} • {po.itemCount} productos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">${po.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[po.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[po.status] || po.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Suggestions Banner */}
      <div className="mt-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Sugerencias Inteligentes</h3>
            <p className="text-white/80">
              Basado en las ventas de esta semana, te recomendamos ordenar más Takis y Sabritas.
              <Link href="/ana/po/suggestions" className="underline ml-1 font-medium hover:text-white">
                Ver sugerencias →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="text-rose-700 font-bold mb-1">Nota Importante</h3>
            <p className="text-gray-600 text-sm">
              Si tienes preguntas, toca el botón de ayuda (?) en la esquina.
              Estamos mejorando el sistema todos los días para hacerlo más fácil para ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
