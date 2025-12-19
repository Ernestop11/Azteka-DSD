'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Truck,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  User,
  Store,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'

interface BusinessSettings {
  id?: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  taxId: string
  businessHoursOpen: string
  businessHoursClose: string
  businessDays: string
  warehouseAddress: string
  warehouseCity: string
  warehouseState: string
  warehouseZipCode: string
  deliveryRadius: number
}

interface Customer {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  priceTier: 'A' | 'B' | 'C'
  active: boolean
}

export default function BusinessSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'business' | 'customers' | 'drivers'>('business')

  // Business Settings State
  const [settings, setSettings] = useState<BusinessSettings>({
    name: 'Azteka DSD',
    address: '',
    city: '',
    state: 'TX',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    businessHoursOpen: '06:00',
    businessHoursClose: '18:00',
    businessDays: 'Mon-Sat',
    warehouseAddress: '',
    warehouseCity: '',
    warehouseState: 'TX',
    warehouseZipCode: '',
    deliveryRadius: 50
  })

  // Customers State
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'TX',
    zipCode: '',
    priceTier: 'B',
    active: true
  })

  // Drivers State
  const [drivers, setDrivers] = useState<Array<{
    id: string
    name: string
    phone: string
    email: string
    truckId: string
    active: boolean
  }>>([
    { id: '1', name: 'Miguel Torres', phone: '(214) 555-1001', email: 'miguel@aztekadsd.com', truckId: 'TRUCK-01', active: true },
    { id: '2', name: 'Carlos Mendez', phone: '(214) 555-1002', email: 'carlos@aztekadsd.com', truckId: 'TRUCK-02', active: true }
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load customers from API
      const customersRes = await fetch('/api/admin/customers')
      if (customersRes.ok) {
        const data = await customersRes.json()
        if (data.data && Array.isArray(data.data)) {
          setCustomers(data.data.map((c: any) => ({
            id: c.id,
            businessName: c.businessName,
            contactName: c.contactName,
            email: c.email,
            phone: c.phone,
            address: c.address,
            city: c.city,
            state: c.state,
            zipCode: c.zipCode,
            priceTier: c.priceTier || 'B',
            active: c.active !== false
          })))
        }
      }

      // Load business settings from API (database-backed)
      const settingsRes = await fetch('/api/admin/settings')
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings({
          id: settingsData.id,
          name: settingsData.name || 'Azteka DSD',
          address: settingsData.address || '',
          city: settingsData.city || '',
          state: settingsData.state || 'TX',
          zipCode: settingsData.zipCode || '',
          phone: settingsData.phone || '',
          email: settingsData.email || '',
          website: settingsData.website || '',
          taxId: settingsData.taxId || '',
          businessHoursOpen: settingsData.businessHoursOpen || '06:00',
          businessHoursClose: settingsData.businessHoursClose || '18:00',
          businessDays: settingsData.businessDays || 'Mon-Sat',
          warehouseAddress: settingsData.warehouseAddress || '',
          warehouseCity: settingsData.warehouseCity || '',
          warehouseState: settingsData.warehouseState || 'TX',
          warehouseZipCode: settingsData.warehouseZipCode || '',
          deliveryRadius: settingsData.deliveryRadius || 50
        })
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Save to database via API
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        const updatedSettings = await res.json()
        setSettings(updatedSettings)
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      setError('Failed to save settings')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const saveCustomer = async () => {
    setSaving(true)
    try {
      const customerData = editingCustomer ? { ...editingCustomer, ...newCustomer } : newCustomer

      const res = await fetch('/api/admin/customers', {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (res.ok) {
        await loadData()
        setShowCustomerModal(false)
        setEditingCustomer(null)
        setNewCustomer({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: 'TX',
          zipCode: '',
          priceTier: 'B',
          active: true
        })
        setSuccess('Customer saved!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      setError('Failed to save customer')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadData()
        setSuccess('Customer deleted')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete customer')
      setTimeout(() => setError(''), 3000)
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.businessName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.contactName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.city.toLowerCase().includes(customerSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
                <p className="text-gray-500 text-sm">Manage your business info, customers, and drivers</p>
              </div>
            </div>

            {activeTab === 'business' && (
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Settings
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-gray-200">
            {[
              { id: 'business', label: 'Business Info', icon: Building2 },
              { id: 'customers', label: 'Customers', icon: Store },
              { id: 'drivers', label: 'Drivers', icon: Truck }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={settings.taxId}
                    onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Business Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={settings.state}
                      onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={settings.zipCode}
                      onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operations / Warehouse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Warehouse & Delivery
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Street Address</label>
                  <input
                    type="text"
                    value={settings.warehouseAddress}
                    onChange={(e) => setSettings({ ...settings, warehouseAddress: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234 Industrial Blvd"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={settings.warehouseCity}
                      onChange={(e) => setSettings({ ...settings, warehouseCity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dallas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={settings.warehouseState}
                      onChange={(e) => setSettings({ ...settings, warehouseState: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={settings.warehouseZipCode}
                      onChange={(e) => setSettings({ ...settings, warehouseZipCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="75001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (miles)</label>
                  <input
                    type="number"
                    value={settings.deliveryRadius}
                    onChange={(e) => setSettings({ ...settings, deliveryRadius: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    max={200}
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Business Hours
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opens At</label>
                    <input
                      type="time"
                      value={settings.businessHoursOpen}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessHoursOpen: e.target.value
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Closes At</label>
                    <input
                      type="time"
                      value={settings.businessHoursClose}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessHoursClose: e.target.value
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Days</label>
                  <input
                    type="text"
                    value={settings.businessDays}
                    onChange={(e) => setSettings({ ...settings, businessDays: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mon-Sat"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            {/* Customers Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  setEditingCustomer(null)
                  setNewCustomer({
                    businessName: '',
                    contactName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: 'TX',
                    zipCode: '',
                    priceTier: 'B',
                    active: true
                  })
                  setShowCustomerModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-colors ${
                    customer.active ? 'border-transparent' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.businessName}</h3>
                      <p className="text-sm text-gray-500">{customer.contactName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.priceTier === 'A' ? 'bg-green-100 text-green-700' :
                      customer.priceTier === 'B' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      Tier {customer.priceTier}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {customer.address}, {customer.city}, {customer.state}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {customer.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCustomer(customer)
                        setNewCustomer(customer)
                        setShowCustomerModal(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No customers found</p>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Add your first customer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{drivers.length} drivers configured</p>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Driver
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      driver.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {driver.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {driver.truckId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {driver.phone}
                      </span>
                    </div>
                    <button className="text-blue-600 hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  value={newCustomer.businessName || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. La Michoacana #12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={newCustomer.contactName || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contactName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={newCustomer.phone || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomer.city || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newCustomer.state || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={newCustomer.zipCode || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Tier</label>
                <select
                  value={newCustomer.priceTier || 'B'}
                  onChange={(e) => setNewCustomer({ ...newCustomer, priceTier: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">Tier A - Best Pricing</option>
                  <option value="B">Tier B - Standard Pricing</option>
                  <option value="C">Tier C - Entry Level</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customerActive"
                  checked={newCustomer.active !== false}
                  onChange={(e) => setNewCustomer({ ...newCustomer, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="customerActive" className="text-sm text-gray-700">Active customer</label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCustomerModal(false)
                  setEditingCustomer(null)
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomer}
                disabled={saving || !newCustomer.businessName || !newCustomer.email}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingCustomer ? 'Update' : 'Create'} Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
