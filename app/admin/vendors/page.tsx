'use client'

/**
 * Vendor Management Page
 *
 * Manage vendors and their SKU mappings
 */

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import {
  ArrowLeft,
  Plus,
  Search,
  Edit3,
  Trash2,
  Building2,
  Package,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  code: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  paymentTerms: string | null
  leadTimeDays: number
  active: boolean
  notes: string | null
  _count?: {
    products: number
    purchaseOrders: number
    skuMappings: number
  }
}

interface SkuMapping {
  id: string
  vendorSku: string
  internalSku: string
  verified: boolean
  product?: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
    price: number
  } | null
}

export default function VendorsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    paymentTerms: '',
    leadTimeDays: 7,
    notes: ''
  })

  // Fetch vendors
  const { data: vendorsData, refetch: refetchVendors } = useQuery({
    queryKey: ['admin-vendors', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/vendors?${params}`)
      if (!res.ok) throw new Error('Failed to fetch vendors')
      return res.json()
    }
  })

  // Fetch SKU mappings for selected vendor
  const { data: mappingsData } = useQuery({
    queryKey: ['vendor-mappings', selectedVendor],
    queryFn: async () => {
      if (!selectedVendor) return { data: [] }
      const res = await fetch(`/api/admin/vendors/sku-mapping?vendorId=${selectedVendor}`)
      if (!res.ok) throw new Error('Failed to fetch mappings')
      return res.json()
    },
    enabled: !!selectedVendor
  })

  const vendors: Vendor[] = vendorsData?.data || []
  const mappings: SkuMapping[] = mappingsData?.data || []
  const selectedVendorData = vendors.find(v => v.id === selectedVendor)

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      paymentTerms: '',
      leadTimeDays: 7,
      notes: ''
    })
  }

  // Start editing
  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      code: vendor.code || '',
      contactName: vendor.contactName || '',
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
      address: vendor.address || '',
      paymentTerms: vendor.paymentTerms || '',
      leadTimeDays: vendor.leadTimeDays,
      notes: vendor.notes || ''
    })
    setIsCreating(false)
  }

  // Start creating
  const handleCreate = () => {
    setEditingVendor(null)
    resetForm()
    setIsCreating(true)
  }

  // Close form
  const handleClose = () => {
    setEditingVendor(null)
    setIsCreating(false)
    resetForm()
  }

  // Save vendor
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast('Vendor name is required', 'error')
      return
    }

    setIsSaving(true)
    try {
      const method = editingVendor ? 'PUT' : 'POST'
      const url = editingVendor
        ? `/api/admin/vendors/${editingVendor.id}`
        : '/api/admin/vendors'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code || null,
          contactName: formData.contactName || null,
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null,
          address: formData.address || null,
          paymentTerms: formData.paymentTerms || null,
          notes: formData.notes || null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save vendor')
      }

      toast(editingVendor ? 'Vendor updated' : 'Vendor created', 'success')
      handleClose()
      refetchVendors()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to save vendor', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete vendor
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this vendor?')) return

    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete vendor')
      }

      toast('Vendor deactivated', 'success')
      refetchVendors()
      if (selectedVendor === id) {
        setSelectedVendor(null)
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete vendor', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/po')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                <p className="text-sm text-gray-600">Manage suppliers and SKU mappings</p>
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor List */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Vendor Cards */}
            <div className="space-y-3">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
                    selectedVendor === vendor.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!vendor.active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        vendor.active ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Building2 className={`w-5 h-5 ${
                          vendor.active ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        {vendor.code && (
                          <span className="text-xs font-mono text-gray-500">{vendor.code}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedVendor === vendor.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{vendor._count?.products || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{vendor._count?.purchaseOrders || 0} POs</span>
                    </div>
                  </div>
                </div>
              ))}

              {vendors.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No vendors found</p>
                  <Button variant="outline" size="sm" onClick={handleCreate} className="mt-4">
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Vendor
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Details / Form */}
          <div className="lg:col-span-2">
            {(isCreating || editingVendor) ? (
              /* Edit/Create Form */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingVendor ? 'Edit Vendor' : 'New Vendor'}
                  </h2>
                  <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sabritas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., SAB"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Sales rep name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="vendor@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select terms</option>
                      <option value="COD">COD (Cash on Delivery)</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Prepaid">Prepaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Time (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.leadTimeDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, leadTimeDays: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State 12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingVendor ? 'Update' : 'Create'} Vendor
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : selectedVendor && selectedVendorData ? (
              /* Vendor Details View */
              <div className="space-y-6">
                {/* Vendor Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedVendorData.name}</h2>
                        {selectedVendorData.code && (
                          <span className="font-mono text-gray-500">{selectedVendorData.code}</span>
                        )}
                        {!selectedVendorData.active && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(selectedVendorData)}>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedVendorData.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVendorData.contactName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedVendorData.contactName}</span>
                      </div>
                    )}
                    {selectedVendorData.contactPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedVendorData.contactPhone}</span>
                      </div>
                    )}
                    {selectedVendorData.contactEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedVendorData.contactEmail}</span>
                      </div>
                    )}
                    {selectedVendorData.paymentTerms && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedVendorData.paymentTerms}</span>
                      </div>
                    )}
                  </div>

                  {selectedVendorData.address && (
                    <div className="flex items-start gap-2 mt-4 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm">{selectedVendorData.address}</span>
                    </div>
                  )}
                </div>

                {/* SKU Mappings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      SKU Mappings ({mappings.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {mappings.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p>No SKU mappings yet</p>
                        <p className="text-sm mt-1">Mappings are auto-created when processing POs</p>
                      </div>
                    ) : (
                      mappings.map(mapping => (
                        <div key={mapping.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {mapping.product?.imageUrl ? (
                                <img
                                  src={mapping.product.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-gray-900">
                                  {mapping.vendorSku}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm text-blue-600">
                                  {mapping.internalSku}
                                </span>
                              </div>
                              {mapping.product && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {mapping.product.name}
                                </p>
                              )}
                            </div>
                          </div>
                          {mapping.verified && (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <Check className="w-4 h-4" />
                              Verified
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* No Selection */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Vendor</h3>
                <p className="text-gray-500">
                  Choose a vendor from the list to view details and SKU mappings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
