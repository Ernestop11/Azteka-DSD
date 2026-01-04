'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Shield,
  Phone,
  Mail
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
  pin: string
  role: string
  hourlyRate: number
  active: boolean
  hireDate: string
  needsPinReset: boolean
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/ana/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'ADMIN': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'SALES_REP': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'MANAGER': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'WAREHOUSE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'DRIVER': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-400">Manage staff and their access</p>
        </div>
        <button
          onClick={() => { setEditingEmployee(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            Total
          </div>
          <p className="text-2xl font-bold text-white">{employees.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            Admins
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {employees.filter(e => ['SUPER_ADMIN', 'ADMIN'].includes(e.role)).length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4 text-emerald-400" />
            Warehouse
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {employees.filter(e => e.role === 'WAREHOUSE').length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            Pending PIN
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {employees.filter(e => e.needsPinReset).length}
          </p>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {search ? 'No employees match your search' : 'No employees found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Hourly Rate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{emp.firstName} {emp.lastName}</p>
                          <p className="text-slate-500 text-sm">PIN: {emp.pin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {emp.email && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Mail className="w-3 h-3" />
                            {emp.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Phone className="w-3 h-3" />
                          {emp.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(emp.role)}`}>
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(emp.hourlyRate)}/hr
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.needsPinReset ? (
                        <span className="text-orange-400 text-sm">Needs PIN Reset</span>
                      ) : emp.active ? (
                        <span className="text-emerald-400 text-sm">Active</span>
                      ) : (
                        <span className="text-slate-500 text-sm">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingEmployee(emp); setShowModal(true) }}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <p className="text-slate-400 mb-6">
              Employee management form coming soon. For now, use the database directly.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
