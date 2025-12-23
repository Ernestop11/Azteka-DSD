'use client'

/**
 * PO Upload & Management Page
 *
 * Ana uploads vendor PO PDFs here:
 * - Drag-drop PDF upload
 * - Auto-parse with vendor/product detection
 * - Review items, highlight new products
 * - Confirm to create receiving task
 */

import { useState, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import {
  Upload,
  FileText,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  X,
  Edit3,
  Save,
  Plus,
  Trash2,
  Search,
  Loader2,
  Clock,
  DollarSign,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Building2,
  Boxes,
  FileSpreadsheet,
  Eye
} from 'lucide-react'

// Types
interface ParsedItem {
  vendorSku: string
  description: string
  quantityOrdered: number
  unitCost: number
  totalCost: number
  unitsPerCase: number
  sellableUnits?: number
  matchedProduct?: { id: string; name: string; sku: string } | null
  productId?: string | null
  isNewProduct: boolean
  confidence?: number
}

interface ParsedPO {
  vendorName: string | null
  vendorId: string | null
  poNumber: string | null
  expectedDate: string | null
  subtotal: number
  shippingCost: number
  total: number
  items: ParsedItem[]
  pdfUrl: string | null
}

interface Vendor {
  id: string
  name: string
  code: string | null
  _count?: { products: number; purchaseOrders: number }
}

interface PORecord {
  id: string
  poNumber: string | null
  vendor: { id: string; name: string } | null
  status: string
  total: number
  createdAt: string
  items: Array<{ isNewProduct: boolean }>
  _count?: { items: number }
}

export default function POUploadPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [parsedPO, setParsedPO] = useState<ParsedPO | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [showPOHistory, setShowPOHistory] = useState(false)
  const [confirmedPOId, setConfirmedPOId] = useState<string | null>(null)

  // Editable fields
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState<string>('')
  const [poNumber, setPoNumber] = useState<string>('')
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [expectedDate, setExpectedDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [items, setItems] = useState<ParsedItem[]>([])

  // Fetch vendors for dropdown
  const { data: vendorsData } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const res = await fetch('/api/admin/vendors?active=true')
      if (!res.ok) throw new Error('Failed to fetch vendors')
      return res.json()
    }
  })

  // Fetch recent POs
  const { data: posData, refetch: refetchPOs } = useQuery({
    queryKey: ['admin-pos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/po')
      if (!res.ok) throw new Error('Failed to fetch POs')
      return res.json()
    }
  })

  const vendors: Vendor[] = vendorsData?.data || []
  const recentPOs: PORecord[] = posData?.data || []

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast('Please upload a PDF file', 'error')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/po', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
      })

      if (!res.ok) {
        let errorMessage = 'Upload failed'
        try {
          const error = await res.json()
          errorMessage = error.error || error.details || errorMessage
          console.error('Upload API error:', error)
        } catch (e) {
          console.error('Failed to parse error response:', e)
          errorMessage = `Server error: ${res.status} ${res.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      
      // Check if data.data exists
      if (!data.data) {
        console.error('No data in response:', data)
        throw new Error('Invalid response from server')
      }
      
      const parsed = data.data as ParsedPO

      // Validate parsed data has items
      if (!parsed.items || parsed.items.length === 0) {
        console.error('No items parsed from PO:', parsed)
        toast('PO parsed but no items found. Please check the PDF format.', 'error')
        return
      }

      // Set state from parsed data
      setParsedPO(parsed)
      setVendorId(parsed.vendorId)
      setVendorName(parsed.vendorName || '')
      setPoNumber(parsed.poNumber || '')
      setShippingCost(parsed.shippingCost || 0)
      setExpectedDate(parsed.expectedDate || '')
      setItems(parsed.items || [])
      
      // Clear any previous confirmed PO ID
      setConfirmedPOId(null)

      toast(`PO parsed successfully! Found ${parsed.items.length} items.`, 'success')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse PO'
      toast(errorMessage, 'error')
      // Reset state on error
      setParsedPO(null)
      setItems([])
      setConfirmedPOId(null)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Update item
  const updateItem = (index: number, updates: Partial<ParsedItem>) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    ))
  }

  // Remove item
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0)
  const total = subtotal + shippingCost
  // Calculate total cases for receiving
  const totalCases = items.reduce((sum, item) => {
    const cases = item.unitsPerCase > 0 ? Math.ceil(item.quantityOrdered / item.unitsPerCase) : item.quantityOrdered
    return sum + cases
  }, 0)
  const totalUnits = items.reduce((sum, item) => sum + item.quantityOrdered, 0)

  // Confirm PO
  const handleConfirm = async () => {
    if (items.length === 0) {
      toast('At least one item is required', 'error')
      return
    }

    setIsConfirming(true)
    try {
      const res = await fetch('/api/admin/po/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          vendorId,
          vendorName: vendorName || null,
          poNumber: poNumber || null,
          pdfUrl: parsedPO?.pdfUrl || null,
          items,
          shippingCost,
          subtotal,
          total,
          expectedDate: expectedDate || null,
          notes: notes || null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to confirm PO')
      }

      const data = await res.json()
      const result = data.data

      toast(
        `PO confirmed! Created ${result.stats.newProductsCreated} new products, receiving task assigned.`,
        'success'
      )

      // Store confirmed PO ID to show success state
      setConfirmedPOId(result.purchaseOrder?.id || null)

      // Reset form
      setParsedPO(null)
      setVendorId(null)
      setVendorName('')
      setPoNumber('')
      setShippingCost(0)
      setExpectedDate('')
      setNotes('')
      setItems([])

      // Refresh PO list and show history
      refetchPOs()
      setShowPOHistory(true)

    } catch (error) {
      console.error('Confirm error:', error)
      toast(error instanceof Error ? error.message : 'Failed to confirm PO', 'error')
    } finally {
      setIsConfirming(false)
    }
  }

  // Clear form
  const handleClear = () => {
    setParsedPO(null)
    setVendorId(null)
    setVendorName('')
    setPoNumber('')
    setShippingCost(0)
    setExpectedDate('')
    setNotes('')
    setItems([])
  }

  // Count new products
  const newProductCount = items.filter(i => i.isNewProduct).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                <p className="text-sm text-gray-600">Upload and manage vendor POs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPOHistory(!showPOHistory)}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {showPOHistory ? 'Hide History' : 'View History'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/vendors')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Manage Vendors
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* PO History Section */}
        {showPOHistory && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h2>
              <button onClick={() => refetchPOs()}>
                <RefreshCw className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {recentPOs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No purchase orders yet
                </div>
              ) : (
                recentPOs.map((po: PORecord) => (
                  <div key={po.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        po.status === 'RECEIVED' ? 'bg-green-500' :
                        po.status === 'RECEIVING' ? 'bg-blue-500' :
                        po.status === 'CONFIRMED' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {po.poNumber || `PO-${po.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {po.vendor?.name || 'Unknown Vendor'} • {po._count?.items || po.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${Number(po.total).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => router.push(`/admin/po/${po.id}/workflow`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Flow
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Success Message - Show after confirmation */}
        {confirmedPOId && !parsedPO && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">PO Confirmed Successfully!</h2>
            <p className="text-green-700 mb-6">
              Your purchase order has been processed and products have been seeded into the system.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => {
                  setConfirmedPOId(null)
                  setShowPOHistory(true)
                }}
                variant="outline"
              >
                View PO History
              </Button>
              <Button
                onClick={() => {
                  setConfirmedPOId(null)
                  setShowPOHistory(false)
                }}
              >
                Upload Another PO
              </Button>
            </div>
          </div>
        )}

        {/* Upload Zone - Show when no parsed PO and no confirmed PO */}
        {!parsedPO && !confirmedPOId && (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Parsing PO...</p>
                <p className="text-sm text-gray-500 mt-1">Extracting vendor and product data</p>
              </div>
            ) : (
              <>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-700 mb-2">
                  Drop your PO PDF here
                </p>
                <p className="text-gray-500 mb-6">
                  or click to browse
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}

        {/* Parsed PO Review */}
        {parsedPO && items.length > 0 && (
          <div className="space-y-6">
            {/* PO Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review Purchase Order</h2>
                <button
                  onClick={handleClear}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Vendor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  <select
                    value={vendorId || ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      setVendorId(id)
                      const v = vendors.find(v => v.id === id)
                      if (v) setVendorName(v.name)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select or Create New --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  {!vendorId && (
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="New vendor name"
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* PO Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g., INV-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Expected Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Shipping Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* New Products Alert */}
            {newProductCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    {newProductCount} New Product{newProductCount > 1 ? 's' : ''} Detected
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    These products will be auto-created and flagged for review.
                    A work order will be created for catalog setup.
                  </p>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Items ({items.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Units/Case</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr
                        key={`${item.vendorSku}-${index}`}
                        className={`${item.isNewProduct ? 'bg-amber-50' : ''} hover:bg-gray-50`}
                      >
                        <td className="px-4 py-3">
                          {item.isNewProduct ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Plus className="w-3 h-3 mr-1" />
                              NEW
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Matched
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-700">
                          {editingItem === `${index}` ? (
                            <input
                              type="text"
                              value={item.vendorSku}
                              onChange={(e) => updateItem(index, { vendorSku: e.target.value })}
                              className="w-24 px-2 py-1 border rounded text-sm"
                            />
                          ) : (
                            item.vendorSku
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingItem === `${index}` ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, { description: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          ) : (
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.description}
                              </p>
                              {item.matchedProduct && (
                                <p className="text-xs text-gray-500">
                                  → {item.matchedProduct.sku}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingItem === `${index}` ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantityOrdered}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 1
                                updateItem(index, {
                                  quantityOrdered: qty,
                                  totalCost: qty * item.unitCost
                                })
                              }}
                              className="w-16 px-2 py-1 border rounded text-sm text-center"
                            />
                          ) : (
                            <span className="font-medium">{item.quantityOrdered}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingItem === `${index}` ? (
                            <input
                              type="number"
                              min="1"
                              value={item.unitsPerCase}
                              onChange={(e) => updateItem(index, { unitsPerCase: parseInt(e.target.value) || 1 })}
                              className="w-16 px-2 py-1 border rounded text-sm text-center"
                            />
                          ) : (
                            <span className="text-gray-600">{item.unitsPerCase}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingItem === `${index}` ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) => {
                                const cost = parseFloat(e.target.value) || 0
                                updateItem(index, {
                                  unitCost: cost,
                                  totalCost: item.quantityOrdered * cost
                                })
                              }}
                              className="w-20 px-2 py-1 border rounded text-sm text-right"
                            />
                          ) : (
                            <span className="text-gray-700">${item.unitCost.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${item.totalCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {editingItem === `${index}` ? (
                              <button
                                onClick={() => setEditingItem(null)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditingItem(`${index}`)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
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

              {/* Totals & Receiving Summary */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  {/* Invoice Totals */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Invoice Totals</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="font-semibold text-lg text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Shipping:</span>
                        <span className="font-medium text-gray-900">${shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-xl text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Receiving Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-blue-600" />
                      Receiving Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Total Units:</span>
                        <span className="font-semibold text-gray-900">{totalUnits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t border-blue-300 pt-2 mt-2">
                        <span className="text-gray-900">Total Cases:</span>
                        <span className="text-blue-700 text-lg">{totalCases.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Match these totals against your invoice
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">{items.length} items</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Boxes className="w-5 h-5" />
                  <span className="font-medium">{totalCases} cases</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {newProductCount > 0 && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">{newProductCount} new products</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleClear}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming || items.length === 0}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Confirm & Create Receiving Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
