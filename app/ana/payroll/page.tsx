'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Calendar,
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  HelpCircle,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Gift,
  TrendingUp,
  MinusCircle
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  hourlyRate: number
  role: string
  payType?: 'HOURLY' | 'SALARY' | 'COMMISSION'
  salary?: number
  commissionRate?: number
  bonusEligible?: boolean
}

interface TimeEntry {
  id: string
  employeeId: string
  employee: Employee
  clockIn: string
  clockOut: string | null
  hoursWorked: number | null
  status: string
}

interface PayrollAdjustment {
  id: string
  employeeId: string
  type: 'BONUS' | 'COMMISSION' | 'DEDUCTION' | 'REIMBURSEMENT' | 'TIP' | 'OTHER'
  amount: number
  description: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  periodStart: string
  periodEnd: string
}

interface PayrollSummary {
  employeeId: string
  employee: Employee
  totalHours: number
  regularHours: number
  overtimeHours: number
  grossPay: number
  entries: TimeEntry[]
  adjustments?: PayrollAdjustment[]
}

interface ClockedInEmployee {
  id: string
  employeeId: string
  employee: Employee
  clockIn: string
  duration: string
  hoursWorked: string
}

export default function PayrollPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [payrollSummaries, setPayrollSummaries] = useState<PayrollSummary[]>([])
  const [clockedIn, setClockedIn] = useState<ClockedInEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // Edit modal states
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [editClockIn, setEditClockIn] = useState('')
  const [editClockOut, setEditClockOut] = useState('')
  const [saving, setSaving] = useState(false)

  // Adjustment modal states
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentEmployee, setAdjustmentEmployee] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<PayrollAdjustment['type']>('BONUS')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')

  // Calculate week dates
  const getWeekDates = (offset: number) => {
    const now = new Date()
    const currentDay = now.getDay()
    const diff = currentDay === 0 ? 6 : currentDay - 1 // Monday = start of week
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff + (offset * 7))
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    return { start: monday, end: sunday }
  }

  const weekDates = getWeekDates(weekOffset)

  useEffect(() => {
    fetchPayrollData()
  }, [weekOffset])

  const fetchPayrollData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ana/payroll?start=${weekDates.start.toISOString()}&end=${weekDates.end.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees || [])
        setTimeEntries(data.timeEntries || [])
        setPayrollSummaries(data.summaries || [])
        setClockedIn(data.clockedIn || [])
      }
    } catch (error) {
      console.error('Error al cargar nómina:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Translate role to Spanish
  const translateRole = (role: string) => {
    const roles: Record<string, string> = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrador',
      'SALES_REP': 'Vendedor',
      'WAREHOUSE': 'Bodega',
      'DRIVER': 'Chofer',
      'MANAGER': 'Gerente',
      'OFFICE': 'Oficina'
    }
    return roles[role] || role
  }

  const translateAdjustmentType = (type: PayrollAdjustment['type']) => {
    const types: Record<string, string> = {
      'BONUS': 'Bono',
      'COMMISSION': 'Comisión',
      'DEDUCTION': 'Deducción',
      'REIMBURSEMENT': 'Reembolso',
      'TIP': 'Propina',
      'OTHER': 'Otro'
    }
    return types[type] || type
  }

  const getAdjustmentIcon = (type: PayrollAdjustment['type']) => {
    switch (type) {
      case 'BONUS': return <Gift className="w-4 h-4" />
      case 'COMMISSION': return <TrendingUp className="w-4 h-4" />
      case 'DEDUCTION': return <MinusCircle className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const getAdjustmentColor = (type: PayrollAdjustment['type']) => {
    switch (type) {
      case 'BONUS': return 'bg-purple-100 text-purple-700'
      case 'COMMISSION': return 'bg-blue-100 text-blue-700'
      case 'DEDUCTION': return 'bg-red-100 text-red-700'
      case 'REIMBURSEMENT': return 'bg-green-100 text-green-700'
      case 'TIP': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Open edit modal
  const openEditModal = (entry: TimeEntry) => {
    setEditingEntry(entry)
    // Format for datetime-local input
    const clockInDate = new Date(entry.clockIn)
    setEditClockIn(clockInDate.toISOString().slice(0, 16))
    if (entry.clockOut) {
      const clockOutDate = new Date(entry.clockOut)
      setEditClockOut(clockOutDate.toISOString().slice(0, 16))
    } else {
      setEditClockOut('')
    }
  }

  // Save time entry edits
  const saveTimeEntry = async () => {
    if (!editingEntry) return
    setSaving(true)
    try {
      const res = await fetch(`/api/ana/time-entries/${editingEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockIn: new Date(editClockIn).toISOString(),
          clockOut: editClockOut ? new Date(editClockOut).toISOString() : null
        })
      })
      if (res.ok) {
        setEditingEntry(null)
        fetchPayrollData()
      } else {
        alert('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Delete time entry
  const deleteTimeEntry = async (entryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return
    try {
      const res = await fetch(`/api/ana/time-entries/${entryId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPayrollData()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Open adjustment modal
  const openAdjustmentModal = (employeeId: string) => {
    setAdjustmentEmployee(employeeId)
    setAdjustmentType('BONUS')
    setAdjustmentAmount('')
    setAdjustmentDescription('')
    setShowAdjustmentModal(true)
  }

  // Save adjustment
  const saveAdjustment = async () => {
    if (!adjustmentEmployee || !adjustmentAmount) return
    setSaving(true)
    try {
      const res = await fetch('/api/ana/payroll-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: adjustmentEmployee,
          type: adjustmentType,
          amount: parseFloat(adjustmentAmount),
          description: adjustmentDescription || null,
          periodStart: weekDates.start.toISOString(),
          periodEnd: weekDates.end.toISOString()
        })
      })
      if (res.ok) {
        setShowAdjustmentModal(false)
        fetchPayrollData()
      } else {
        alert('Error al guardar ajuste')
      }
    } catch (error) {
      console.error('Error saving adjustment:', error)
      alert('Error al guardar ajuste')
    } finally {
      setSaving(false)
    }
  }

  // Delete adjustment
  const deleteAdjustment = async (adjustmentId: string) => {
    if (!confirm('¿Eliminar este ajuste?')) return
    try {
      const res = await fetch(`/api/ana/payroll-adjustments/${adjustmentId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPayrollData()
      }
    } catch (error) {
      console.error('Error deleting adjustment:', error)
    }
  }

  // Calculate totals including adjustments
  const calculateTotalWithAdjustments = (summary: PayrollSummary) => {
    const adjustmentsTotal = (summary.adjustments || [])
      .filter(a => a.status !== 'REJECTED')
      .reduce((sum, adj) => {
        if (adj.type === 'DEDUCTION') {
          return sum - adj.amount
        }
        return sum + adj.amount
      }, 0)
    return summary.grossPay + adjustmentsTotal
  }

  // Calculate totals
  const totalHours = payrollSummaries.reduce((sum, s) => sum + s.totalHours, 0)
  const totalGrossPay = payrollSummaries.reduce((sum, s) => sum + calculateTotalWithAdjustments(s), 0)
  const totalOT = payrollSummaries.reduce((sum, s) => sum + s.overtimeHours, 0)

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-rose-600 mb-4">¿Cómo Usar Nómina?</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1</span>
                </div>
                <p>Usa las flechas para navegar entre semanas</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2</span>
                </div>
                <p>Toca "Detalles" para ver y editar las entradas de cada empleado</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3</span>
                </div>
                <p>Usa el botón "+" para agregar bonos, comisiones o deducciones</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">4</span>
                </div>
                <p>Las horas extras (OT) se calculan después de 40 horas semanales</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Edit Time Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingEntry(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Entrada</h2>
              <button onClick={() => setEditingEntry(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                <p className="text-gray-900 font-medium">
                  {editingEntry.employee.firstName} {editingEntry.employee.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
                <input
                  type="datetime-local"
                  value={editClockIn}
                  onChange={(e) => setEditClockIn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                <input
                  type="datetime-local"
                  value={editClockOut}
                  onChange={(e) => setEditClockOut(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                {!editClockOut && (
                  <p className="text-sm text-amber-600 mt-1">Sin salida = Aún trabajando</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveTimeEntry}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdjustmentModal(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Agregar Ajuste</h2>
              <button onClick={() => setShowAdjustmentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                <p className="text-gray-900 font-medium">
                  {payrollSummaries.find(s => s.employeeId === adjustmentEmployee)?.employee.firstName}{' '}
                  {payrollSummaries.find(s => s.employeeId === adjustmentEmployee)?.employee.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BONUS', 'COMMISSION', 'DEDUCTION'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAdjustmentType(type)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        adjustmentType === type
                          ? type === 'DEDUCTION'
                            ? 'bg-red-500 text-white'
                            : 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {translateAdjustmentType(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ($)
                  {adjustmentType === 'DEDUCTION' && <span className="text-red-500 ml-1">(se restará)</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={adjustmentDescription}
                  onChange={(e) => setAdjustmentDescription(e.target.value)}
                  placeholder="Ej: Comisión por venta especial"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveAdjustment}
                disabled={saving || !adjustmentAmount}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Agregar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Nómina y Horas</h1>
          <p className="text-gray-500">Controla las horas trabajadas y calcula el pago</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors font-medium"
          >
            <HelpCircle className="w-5 h-5" />
            Ayuda
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium">
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all font-medium">
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-3 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-rose-500" />
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-gray-800">
              <Calendar className="w-6 h-6 text-rose-500" />
              <span className="text-xl font-bold">
                {formatDate(weekDates.start)} - {formatDate(weekDates.end)}
              </span>
            </div>
            <p className="text-gray-500 mt-1 font-medium">
              {weekOffset === 0 ? 'Semana Actual' : weekOffset === -1 ? 'Semana Pasada' : `Hace ${Math.abs(weekOffset)} semanas`}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 0}
            className="p-3 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6 text-rose-500" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <User className="w-4 h-4" />
            Empleados
          </div>
          <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            Total Horas
          </div>
          <p className="text-3xl font-bold text-gray-800">{Number(totalHours).toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-2">
            <AlertCircle className="w-4 h-4" />
            Tiempo Extra
          </div>
          <p className="text-3xl font-bold text-orange-600">{Number(totalOT).toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100">
          <div className="flex items-center gap-2 text-rose-600 text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4" />
            Pago Total
          </div>
          <p className="text-3xl font-bold text-rose-600">{formatCurrency(totalGrossPay)}</p>
        </div>
      </div>

      {/* Currently Working */}
      {clockedIn.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm mb-6 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-emerald-800">Trabajando Ahora</h2>
            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium">
              {clockedIn.length} {clockedIn.length === 1 ? 'persona' : 'personas'}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {clockedIn.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-emerald-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                    {entry.employee.firstName[0]}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{entry.employee.firstName} {entry.employee.lastName}</p>
                    <p className="text-xs text-gray-500">{translateRole(entry.employee.role)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 font-bold">{entry.duration}</p>
                  <p className="text-xs text-gray-500">
                    desde {new Date(entry.clockIn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Payroll Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <h2 className="text-xl font-bold text-gray-800">Horas por Empleado</h2>
          <p className="text-gray-500 text-sm">Toca "Detalles" para ver y editar entradas, o "+" para agregar bonos</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : payrollSummaries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hay registros esta semana</p>
            <p className="text-gray-400 text-sm mt-2">Los empleados aparecerán aquí cuando fichen entrada en el kiosco</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm bg-gray-50">
                  <th className="px-5 py-4 font-semibold">Empleado</th>
                  <th className="px-5 py-4 font-semibold">Puesto</th>
                  <th className="px-5 py-4 text-right font-semibold">$/Hora</th>
                  <th className="px-5 py-4 text-right font-semibold">Normal</th>
                  <th className="px-5 py-4 text-right font-semibold">OT</th>
                  <th className="px-5 py-4 text-right font-semibold">Total Hrs</th>
                  <th className="px-5 py-4 text-right font-semibold">Ajustes</th>
                  <th className="px-5 py-4 text-right font-semibold">Pago Total</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {payrollSummaries.map(summary => {
                  const adjustmentsTotal = (summary.adjustments || [])
                    .filter(a => a.status !== 'REJECTED')
                    .reduce((sum, adj) => adj.type === 'DEDUCTION' ? sum - adj.amount : sum + adj.amount, 0)

                  return (
                    <tr
                      key={summary.employeeId}
                      className="border-t border-gray-100 hover:bg-rose-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                            {summary.employee.firstName[0]}
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">
                              {summary.employee.firstName} {summary.employee.lastName}
                            </span>
                            {summary.employee.bonusEligible && (
                              <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded font-medium">
                                Bonos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{translateRole(summary.employee.role)}</td>
                      <td className="px-5 py-4 text-right text-gray-600 font-medium">
                        {formatCurrency(summary.employee.hourlyRate)}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-800 font-medium">{Number(summary.regularHours).toFixed(1)}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={Number(summary.overtimeHours) > 0 ? 'text-orange-500 font-bold' : 'text-gray-400'}>
                          {Number(summary.overtimeHours).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-gray-800 font-bold">{Number(summary.totalHours).toFixed(1)}</td>
                      <td className="px-5 py-4 text-right">
                        {adjustmentsTotal !== 0 && (
                          <span className={adjustmentsTotal > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {adjustmentsTotal > 0 ? '+' : ''}{formatCurrency(adjustmentsTotal)}
                          </span>
                        )}
                        {(summary.adjustments?.length || 0) > 0 && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({summary.adjustments?.length})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-rose-600 font-bold text-lg">
                        {formatCurrency(calculateTotalWithAdjustments(summary))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAdjustmentModal(summary.employeeId)}
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Agregar bono/comisión"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedEmployee(selectedEmployee === summary.employeeId ? null : summary.employeeId)}
                            className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg font-medium hover:bg-rose-200 transition-colors"
                          >
                            {selectedEmployee === summary.employeeId ? 'Cerrar' : 'Detalles'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
                  <td colSpan={5} className="px-5 py-4 text-gray-800 font-bold text-lg">TOTAL</td>
                  <td className="px-5 py-4 text-right text-gray-800 font-bold text-lg">{Number(totalHours).toFixed(1)}</td>
                  <td className="px-5 py-4"></td>
                  <td className="px-5 py-4 text-right text-rose-600 font-bold text-xl">{formatCurrency(totalGrossPay)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Time Entry Details (when employee selected) */}
      {selectedEmployee && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Entradas y Salidas - {payrollSummaries.find(s => s.employeeId === selectedEmployee)?.employee.firstName}
              </h3>
              <p className="text-gray-500 text-sm">Toca el lápiz para editar cada entrada</p>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Adjustments for this employee */}
          {(() => {
            const summary = payrollSummaries.find(s => s.employeeId === selectedEmployee)
            const adjustments = summary?.adjustments || []

            if (adjustments.length > 0) {
              return (
                <div className="p-4 bg-purple-50 border-b border-purple-100">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">Ajustes de Nómina</h4>
                  <div className="space-y-2">
                    {adjustments.map(adj => (
                      <div key={adj.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getAdjustmentColor(adj.type)}`}>
                            {getAdjustmentIcon(adj.type)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">{translateAdjustmentType(adj.type)}</span>
                            {adj.description && (
                              <p className="text-sm text-gray-500">{adj.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${adj.type === 'DEDUCTION' ? 'text-red-600' : 'text-green-600'}`}>
                            {adj.type === 'DEDUCTION' ? '-' : '+'}{formatCurrency(adj.amount)}
                          </span>
                          <button
                            onClick={() => deleteAdjustment(adj.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })()}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm bg-gray-50">
                  <th className="px-5 py-4 font-semibold">Día</th>
                  <th className="px-5 py-4 font-semibold">Entrada</th>
                  <th className="px-5 py-4 font-semibold">Salida</th>
                  <th className="px-5 py-4 text-right font-semibold">Horas</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {payrollSummaries
                  .find(s => s.employeeId === selectedEmployee)
                  ?.entries.map(entry => (
                    <tr key={entry.id} className="border-t border-gray-100">
                      <td className="px-5 py-4 text-gray-800 font-medium">
                        {new Date(entry.clockIn).toLocaleDateString('es-MX', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                          {formatTime(entry.clockIn)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {entry.clockOut ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">
                            {formatTime(entry.clockOut)}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-800 font-bold">
                        {entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {entry.status === 'ACTIVE' ? (
                          <span className="flex items-center gap-2 text-emerald-600 font-medium">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Trabajando
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-gray-500">
                            <CheckCircle className="w-4 h-4" />
                            Completado
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
