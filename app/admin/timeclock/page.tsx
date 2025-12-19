'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Users,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string
  pin: string
  email?: string
  role: 'WAREHOUSE' | 'DRIVER' | 'OFFICE' | 'MANAGER'
  hourlyRate: string
  active: boolean
  isClockedIn?: boolean
}

interface TimeEntry {
  id: string
  employeeId: string
  clockIn: string
  clockOut?: string
  clockInPhoto?: string
  clockOutPhoto?: string
  hoursWorked?: string
  notes?: string
  status: 'ACTIVE' | 'COMPLETED' | 'ADJUSTED'
  employee: {
    firstName: string
    lastName: string
    hourlyRate: string
  }
}

interface PayrollSummary {
  employeeId: string
  firstName: string
  lastName: string
  hourlyRate: number
  totalHours: number
  totalPay: number
  entries: number
}

export default function AdminTimeclockPage() {
  const [activeTab, setActiveTab] = useState<'timesheet' | 'employees'>('timesheet')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary[]>([])
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date()
    today.setDate(today.getDate() - today.getDay()) // Go to Sunday
    return today.toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'WAREHOUSE' as const,
    hourlyRate: '15.00'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchTimeEntries()
  }, [selectedWeek])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees')
      const data = await res.json()
      if (data.employees) setEmployees(data.employees)
    } catch (err) {
      console.error('Fetch employees error:', err)
    }
  }

  const fetchTimeEntries = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/timeclock?weekOf=${selectedWeek}`)
      const data = await res.json()
      if (data.entries) setTimeEntries(data.entries)
      if (data.summary) setPayrollSummary(data.summary)
    } catch (err) {
      console.error('Fetch time entries error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(selectedWeek)
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedWeek(current.toISOString().split('T')[0])
  }

  const formatWeekRange = () => {
    const start = new Date(selectedWeek)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const handleSaveEmployee = async () => {
    try {
      const method = editingEmployee ? 'PUT' : 'POST'
      const body = editingEmployee
        ? { ...employeeForm, id: editingEmployee.id }
        : employeeForm

      const res = await fetch('/api/admin/employees', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        fetchEmployees()
        setShowEmployeeModal(false)
        setEditingEmployee(null)
        setEmployeeForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          role: 'WAREHOUSE',
          hourlyRate: '15.00'
        })
      }
    } catch (err) {
      console.error('Save employee error:', err)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return

    try {
      await fetch(`/api/admin/employees?id=${id}`, { method: 'DELETE' })
      fetchEmployees()
    } catch (err) {
      console.error('Delete employee error:', err)
    }
  }

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setEmployeeForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      phone: emp.phone,
      email: emp.email || '',
      role: emp.role,
      hourlyRate: emp.hourlyRate
    })
    setShowEmployeeModal(true)
  }

  const totalPayroll = payrollSummary.reduce((sum, emp) => sum + emp.totalPay, 0)
  const totalHours = payrollSummary.reduce((sum, emp) => sum + emp.totalHours, 0)

  const printPayroll = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="w-7 h-7 text-blue-600" />
                Time Clock Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">Track employee hours and calculate payroll</p>
            </div>
            <a
              href="/kiosk"
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Kiosk
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('timesheet')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'timesheet'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Timesheet & Payroll
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'employees'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Employees
          </button>
        </div>

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="space-y-6">
            {/* Week Navigator */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Week of {formatWeekRange()}
                </h2>
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">${totalPayroll.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{payrollSummary.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 print:hidden">
              <button
                onClick={printPayroll}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Payroll
              </button>
            </div>

            {/* Payroll Summary Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-900">Payroll Summary</h3>
              </div>
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : payrollSummary.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  No time entries for this week
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hours</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payrollSummary.map(emp => (
                      <tr key={emp.employeeId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          ${emp.hourlyRate.toFixed(2)}/hr
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {emp.totalHours.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          ${emp.totalPay.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Total</td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {totalHours.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-lg text-green-600">
                        ${totalPayroll.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Detailed Time Entries */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden print:break-before-page">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-900">Time Entry Details</h3>
              </div>
              {timeEntries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No entries to show
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hours</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {timeEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {entry.employee.firstName} {entry.employee.lastName}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(entry.clockIn).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(entry.clockIn).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {entry.clockOut
                              ? new Date(entry.clockOut).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            {entry.hoursWorked ? parseFloat(entry.hoursWorked).toFixed(2) : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : entry.status === 'ADJUSTED'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {entry.status === 'ACTIVE' ? 'Working' : entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingEmployee(null)
                  setEmployeeForm({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    role: 'WAREHOUSE',
                    hourlyRate: '15.00'
                  })
                  setShowEmployeeModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map(emp => (
                    <tr key={emp.id} className={`hover:bg-gray-50 ${!emp.active ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {emp.pin}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emp.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                          emp.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' :
                          emp.role === 'OFFICE' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        ${parseFloat(emp.hourlyRate).toFixed(2)}/hr
                      </td>
                      <td className="px-6 py-4 text-center">
                        {emp.isClockedIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Working
                          </span>
                        ) : emp.active ? (
                          <span className="text-gray-500 text-sm">Off</span>
                        ) : (
                          <span className="text-red-500 text-sm">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 hover:bg-gray-100 rounded-lg mr-1"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        {emp.active && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {employees.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  No employees yet. Add your first employee to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.firstName}
                    onChange={e => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.lastName}
                    onChange={e => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={employeeForm.phone}
                  onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  placeholder="Last 4 digits will be PIN"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={employeeForm.role}
                    onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value as Employee['role'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="DRIVER">Driver</option>
                    <option value="OFFICE">Office</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={employeeForm.hourlyRate}
                    onChange={e => setEmployeeForm({ ...employeeForm, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingEmployee ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          table, th, td {
            visibility: visible !important;
          }
          table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
