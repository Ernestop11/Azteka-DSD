'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Plus, X, Check, ChevronLeft, Store,
  Share2, Menu, User, Phone, Mail, Building2,
  Edit2, Trash2, ChevronRight, UserPlus, Link as LinkIcon,
  Loader2
} from 'lucide-react'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface StoreData {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
}

interface Manager {
  id: string
  name: string
  phone: string
  email?: string
  assignedStores: string[] // Store IDs
  createdAt: Date
}

export default function ManagersPage() {
  const router = useRouter()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // New manager form - now includes initial store assignment
  const [newManager, setNewManager] = useState({
    name: '',
    phone: '',
    email: '',
    assignedStores: [] as string[]
  })

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    if (parsed.role !== 'OWNER') {
      router.replace('/customer/dashboard')
      return
    }

    setSession(parsed)
    loadStores(parsed.customerId)
    loadManagers(parsed.customerId)
  }, [router])

  const loadStores = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/customer/multi-store?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    }
  }

  const loadManagers = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/customer/managers?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setManagers((data.managers || []).map((m: Manager) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })))
      }
    } catch (error) {
      console.error('Error loading managers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShortName = (businessName: string) => {
    const superiorMatch = businessName.match(/la\s*superior\s*#?(\d+)/i)
    if (superiorMatch) return `#${superiorMatch[1]}`
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  const addManager = async () => {
    if (!newManager.name || !newManager.phone || !session) return

    setSaving(true)
    try {
      const res = await fetch('/api/customer/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: session.customerId,
          name: newManager.name,
          phone: newManager.phone,
          email: newManager.email || undefined,
          assignedStores: newManager.assignedStores
        })
      })

      if (res.ok) {
        const data = await res.json()
        setManagers([...managers, {
          ...data.manager,
          createdAt: new Date(data.manager.createdAt)
        }])
        setNewManager({ name: '', phone: '', email: '', assignedStores: [] })
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Error adding manager:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteManager = async (managerId: string) => {
    if (!session) return

    try {
      const res = await fetch(`/api/customer/managers?id=${managerId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setManagers(managers.filter(m => m.id !== managerId))
      }
    } catch (error) {
      console.error('Error deleting manager:', error)
    }
  }

  const toggleStoreAssignment = async (managerId: string, storeId: string) => {
    if (!session) return

    const manager = managers.find(m => m.id === managerId)
    if (!manager) return

    const hasStore = manager.assignedStores.includes(storeId)
    const newAssignedStores = hasStore
      ? manager.assignedStores.filter(s => s !== storeId)
      : [...manager.assignedStores, storeId]

    // Optimistic update
    const updated = managers.map(m => {
      if (m.id === managerId) {
        return { ...m, assignedStores: newAssignedStores }
      }
      return m
    })
    setManagers(updated)
    setSelectedManager(updated.find(m => m.id === managerId) || null)

    // Save to API
    try {
      await fetch('/api/customer/managers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: managerId,
          assignedStores: newAssignedStores
        })
      })
    } catch (error) {
      console.error('Error updating manager:', error)
      // Rollback on error
      loadManagers(session.customerId)
    }
  }

  const toggleNewManagerStore = (storeId: string) => {
    const hasStore = newManager.assignedStores.includes(storeId)
    setNewManager({
      ...newManager,
      assignedStores: hasStore
        ? newManager.assignedStores.filter(s => s !== storeId)
        : [...newManager.assignedStores, storeId]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/customer/multi-store"
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Store Managers</h1>
              <p className="text-slate-400 text-xs">{managers.length} managers</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-400 font-medium">Manage Your Team</p>
              <p className="text-sm text-slate-400 mt-1">
                Add managers and assign them to stores. They can place orders using delegation links.
              </p>
            </div>
          </div>
        </div>

        {/* Managers List */}
        {managers.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <div className="inline-flex p-4 bg-slate-700 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-medium mb-2">No Managers Yet</h3>
            <p className="text-slate-400 text-sm mb-4">
              Add managers to help you handle orders at each store.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Manager
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {managers.map((manager) => (
              <div
                key={manager.id}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{manager.name}</p>
                      <p className="text-sm text-slate-400">{manager.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteManager(manager.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Assigned Stores */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">Assigned Stores:</p>
                  {manager.assignedStores.length === 0 ? (
                    <p className="text-sm text-amber-400">No stores assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {manager.assignedStores.map(storeId => {
                        const store = stores.find(s => s.id === storeId)
                        return store ? (
                          <span
                            key={storeId}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg"
                          >
                            {getShortName(store.businessName)}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedManager(manager)
                      setShowAssignModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Assign Stores
                  </button>
                  <button
                    onClick={() => router.push(`/customer/delegate?manager=${manager.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Generate Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Manager Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-purple-600">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-white" />
                <h2 className="font-bold text-white">Add Manager</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  placeholder="Manager name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Phone *</label>
                <input
                  type="tel"
                  value={newManager.phone}
                  onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  placeholder="manager@email.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Store Assignment during creation */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Assign to Stores</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stores.map((store) => {
                    const isSelected = newManager.assignedStores.includes(store.id)
                    return (
                      <button
                        key={store.id}
                        onClick={() => toggleNewManagerStore(store.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500/50'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{getShortName(store.businessName)}</p>
                          <p className="text-xs text-slate-400">{store.contactName}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {newManager.assignedStores.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-2">
                    {newManager.assignedStores.length} store{newManager.assignedStores.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={addManager}
                disabled={!newManager.name || !newManager.phone || saving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Manager'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Assign Stores Modal */}
      {showAssignModal && selectedManager && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowAssignModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-emerald-600">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-white" />
                <div>
                  <h2 className="font-bold text-white">Assign Stores</h2>
                  <p className="text-xs text-emerald-100">{selectedManager.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {stores.map((store) => {
                const isAssigned = selectedManager.assignedStores.includes(store.id)
                return (
                  <button
                    key={store.id}
                    onClick={() => toggleStoreAssignment(selectedManager.id, store.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                      isAssigned
                        ? 'bg-emerald-600/20 border-emerald-500/50'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isAssigned ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}>
                      {isAssigned && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{getShortName(store.businessName)}</p>
                      <p className="text-xs text-slate-400">{store.contactName}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/customer/multi-store"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Store className="w-6 h-6" />
            <span className="text-xs">Stores</span>
          </Link>

          <Link
            href="/customer/delegate"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Delegate</span>
          </Link>

          <div className="flex flex-col items-center gap-1 px-4 py-2 text-emerald-400">
            <Users className="w-6 h-6" />
            <span className="text-xs">Managers</span>
          </div>

          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
