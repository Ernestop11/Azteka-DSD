'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Upload,
  Download,
  Filter,
  DollarSign,
  Building2,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import PriceOverrideEditor from './PriceOverrideEditor'
import BulkPriceModal from './BulkPriceModal'

interface PriceOverride {
  id: string
  customerId: string
  productId: string
  overrideType: 'FIXED_PRICE' | 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'TIERED'
  fixedPrice?: number | null
  discountPercent?: number | null
  discountAmount?: number | null
  minQuantity?: number | null
  maxQuantity?: number | null
  contractNumber?: string | null
  notes?: string | null
  startDate?: string | null
  endDate?: string | null
  active: boolean
  customer: {
    id: string
    businessName: string
    priceTier: string
    email: string
  }
  product: {
    id: string
    name: string
    sku: string
    price: number
  }
  createdAt: string
  updatedAt: string
}

export default function PricingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingOverride, setEditingOverride] = useState<PriceOverride | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [filterCustomer, setFilterCustomer] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 50

  // Fetch price overrides
  const { data: overridesData, isLoading } = useQuery({
    queryKey: ['admin-price-overrides', page, filterActive, filterCustomer],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      if (filterActive !== 'all') {
        params.append('active', filterActive)
      }
      if (filterCustomer !== 'all') {
        params.append('customerId', filterCustomer)
      }

      const res = await fetch(`/api/admin/price-overrides?${params}`)
      if (!res.ok) throw new Error('Failed to fetch price overrides')
      return res.json()
    },
  })

  // Fetch customers for filter
  const { data: customersData } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  const overrides = overridesData?.data || []
  const totalPages = overridesData?.meta?.totalPages || 1
  const customers = customersData?.data || []

  // Filter overrides by search term
  const filteredOverrides = useMemo(() => {
    if (!searchTerm.trim()) return overrides

    const searchLower = searchTerm.toLowerCase()
    return overrides.filter(
      (override: PriceOverride) =>
        override.customer.businessName.toLowerCase().includes(searchLower) ||
        override.product.name.toLowerCase().includes(searchLower) ||
        override.product.sku.toLowerCase().includes(searchLower) ||
        override.contractNumber?.toLowerCase().includes(searchLower) ||
        ''
    )
  }, [overrides, searchTerm])

  const handleEdit = (override: PriceOverride) => {
    setEditingOverride(override)
    setIsEditorOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this price override?')) {
      try {
        const res = await fetch(`/api/admin/price-overrides/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to delete')
        toast('Price override deleted successfully', 'success')
        queryClient.invalidateQueries({ queryKey: ['admin-price-overrides'] })
      } catch (error) {
        toast('Failed to delete price override', 'error')
      }
    }
  }

  const handleNew = () => {
    setEditingOverride(null)
    setIsEditorOpen(true)
  }

  const handleClose = () => {
    setIsEditorOpen(false)
    setEditingOverride(null)
  }

  const handleSaveComplete = () => {
    handleClose()
    queryClient.invalidateQueries({ queryKey: ['admin-price-overrides'] })
    toast('Price override saved successfully', 'success')
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '—'
    return `$${price.toFixed(2)}`
  }

  const getOverrideDisplay = (override: PriceOverride) => {
    switch (override.overrideType) {
      case 'FIXED_PRICE':
        return formatPrice(override.fixedPrice)
      case 'PERCENTAGE_DISCOUNT':
        return `${override.discountPercent}% off`
      case 'FIXED_DISCOUNT':
        return `$${override.discountAmount?.toFixed(2)} off`
      case 'TIERED':
        return `Tier: ${override.minQuantity || 0}+ cases`
      default:
        return '—'
    }
  }

  const calculateFinalPrice = (override: PriceOverride) => {
    const basePrice = Number(override.product.price)
    switch (override.overrideType) {
      case 'FIXED_PRICE':
        return override.fixedPrice || basePrice
      case 'PERCENTAGE_DISCOUNT':
        return basePrice * (1 - (override.discountPercent || 0) / 100)
      case 'FIXED_DISCOUNT':
        return basePrice - (override.discountAmount || 0)
      case 'TIERED':
        return override.fixedPrice || basePrice
      default:
        return basePrice
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
                <p className="text-sm text-gray-600">
                  Manage customer-specific pricing and overrides
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push('/admin/pricing/las-superior-import')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Las Superior Import
              </Button>
              <Button
                onClick={() => setIsBulkModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Bulk Import
              </Button>
              <Button onClick={handleNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Override
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by customer, product, SKU, or contract..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <select
              value={filterCustomer}
              onChange={(e) => {
                setFilterCustomer(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Customers</option>
              {customers.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.businessName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading price overrides...</p>
          </div>
        ) : filteredOverrides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No price overrides found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first price override
            </p>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Price Override
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Override Type</TableHead>
                    <TableHead>Override Value</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Quantity Range</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOverrides.map((override: PriceOverride) => {
                    const finalPrice = calculateFinalPrice(override)
                    const basePrice = Number(override.product.price)
                    const discount = basePrice - finalPrice
                    const discountPercent = (discount / basePrice) * 100

                    return (
                      <TableRow key={override.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {override.customer.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {override.customer.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              Tier: {override.customer.priceTier}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {override.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {override.product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatPrice(basePrice)}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            {override.overrideType.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">
                          {getOverrideDisplay(override)}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-semibold text-green-600">
                            {formatPrice(finalPrice)}
                          </div>
                          {discount > 0 && (
                            <div className="text-xs text-green-600">
                              Save {formatPrice(discount)} ({discountPercent.toFixed(1)}%)
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {override.minQuantity || override.maxQuantity ? (
                            <div className="text-sm">
                              {override.minQuantity || 0}
                              {override.maxQuantity
                                ? ` - ${override.maxQuantity}`
                                : '+'}{' '}
                              cases
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {override.contractNumber ? (
                            <div>
                              <div className="text-sm font-medium">
                                {override.contractNumber}
                              </div>
                              {override.notes && (
                                <div className="text-xs text-gray-500">
                                  {override.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              override.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {override.active ? 'Active' : 'Inactive'}
                          </span>
                          {override.endDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Expires: {new Date(override.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(override)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(override.id)}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <PriceOverrideEditor
          isOpen={isEditorOpen}
          onClose={handleClose}
          onSave={handleSaveComplete}
          override={editingOverride}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <BulkPriceModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onComplete={() => {
            setIsBulkModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['admin-price-overrides'] })
            toast('Bulk import completed', 'success')
          }}
        />
      )}
    </div>
  )
}

