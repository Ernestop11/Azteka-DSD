'use client'

/**
 * Work Orders Page
 *
 * View and manage work orders for:
 * - New products that need catalog setup
 * - Price updates
 * - Image uploads needed
 */

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Plus,
  DollarSign,
  Image as ImageIcon,
  Tag,
  ChevronRight,
  Boxes,
  RefreshCw,
  Play,
  Check,
  X
} from 'lucide-react'

interface WorkOrder {
  id: string
  type: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  completedAt: string | null
  metadata: {
    vendorId?: string
    vendorName?: string
    poNumber?: string
    landedCost?: number
    suggestedPrice?: number
    notes?: string
  } | null
  product?: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
    price: number
    cost: number
    landedCost: number | null
    suggestedPrice: number | null
    needsReview: boolean
    category: { id: string; name: string } | null
    brand: { id: string; name: string } | null
    vendor: { id: string; name: string } | null
  } | null
  purchaseOrder?: {
    id: string
    poNumber: string | null
    vendor: { id: string; name: string } | null
  } | null
}

interface Stats {
  pending: number
  inProgress: number
  completed: number
  total: number
}

const TYPE_ICONS = {
  NEW_PRODUCT_CATALOG: Package,
  PRICE_UPDATE: DollarSign,
  IMAGE_NEEDED: ImageIcon,
  INVENTORY_COUNT: Boxes,
}

const TYPE_COLORS = {
  NEW_PRODUCT_CATALOG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PRICE_UPDATE: 'bg-green-500/20 text-green-400 border-green-500/30',
  IMAGE_NEEDED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  INVENTORY_COUNT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const STATUS_COLORS = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-gray-500/20 text-gray-400',
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING')
  const [updating, setUpdating] = useState<string | null>(null)

  // Fetch work orders
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['work-orders', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/admin/work-orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const workOrders: WorkOrder[] = data?.data || []
  const stats: Stats = data?.stats || { pending: 0, inProgress: 0, completed: 0, total: 0 }

  // Update work order status
  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/work-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast(`Work order ${status === 'COMPLETED' ? 'completed' : 'updated'}`, 'success')
      refetch()
    } catch {
      toast('Failed to update work order', 'error')
    } finally {
      setUpdating(null)
    }
  }

  // Navigate to block builder with product
  const handleAddToCatalog = (productId: string) => {
    router.push(`/admin/block-builder?productId=${productId}`)
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
                <p className="text-sm text-gray-600">Manage catalog tasks and updates</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              filter === 'PENDING' ? 'ring-2 ring-amber-500' : ''
            } bg-amber-50 border border-amber-200`}
            onClick={() => setFilter('PENDING')}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-amber-900 font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          </div>

          <div
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              filter === 'IN_PROGRESS' ? 'ring-2 ring-blue-500' : ''
            } bg-blue-50 border border-blue-200`}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
          </div>

          <div
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              filter === 'COMPLETED' ? 'ring-2 ring-emerald-500' : ''
            } bg-emerald-50 border border-emerald-200`}
            onClick={() => setFilter('COMPLETED')}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-900 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.completed}</p>
          </div>

          <div
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              filter === 'all' ? 'ring-2 ring-gray-500' : ''
            } bg-gray-50 border border-gray-200`}
            onClick={() => setFilter('all')}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">All</span>
            </div>
            <p className="text-2xl font-bold text-gray-600 mt-2">{stats.total}</p>
          </div>
        </div>

        {/* Work Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : workOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No work orders</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'PENDING' ? 'All caught up!' : 'No work orders match this filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workOrders.map(wo => {
              const TypeIcon = TYPE_ICONS[wo.type as keyof typeof TYPE_ICONS] || Package
              const typeColor = TYPE_COLORS[wo.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.NEW_PRODUCT_CATALOG
              const statusColor = STATUS_COLORS[wo.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING

              return (
                <div
                  key={wo.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`p-3 rounded-xl border ${typeColor}`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{wo.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{wo.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {wo.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Product Info */}
                      {wo.product && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {wo.product.imageUrl ? (
                              <img
                                src={wo.product.imageUrl}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{wo.product.name}</p>
                              <p className="text-sm text-gray-500 font-mono">{wo.product.sku}</p>
                            </div>
                            <div className="text-right">
                              {wo.product.suggestedPrice != null && (
                                <p className="text-sm">
                                  <span className="text-gray-500">Suggested: </span>
                                  <span className="font-medium text-green-600">
                                    ${Number(wo.product.suggestedPrice).toFixed(2)}
                                  </span>
                                </p>
                              )}
                              {wo.product.landedCost != null && (
                                <p className="text-sm text-gray-500">
                                  Cost: ${Number(wo.product.landedCost).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Missing Info Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {!wo.product.category && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                Needs Category
                              </span>
                            )}
                            {!wo.product.brand && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                Needs Brand
                              </span>
                            )}
                            {!wo.product.imageUrl && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                Needs Image
                              </span>
                            )}
                            {wo.product.sku.startsWith('NEW-') && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                Needs SKU
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PO Reference */}
                      {wo.purchaseOrder && (
                        <p className="text-sm text-gray-500 mt-2">
                          From PO: {wo.purchaseOrder.poNumber || wo.purchaseOrder.id.slice(0, 8)}
                          {wo.purchaseOrder.vendor && ` (${wo.purchaseOrder.vendor.name})`}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        {wo.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(wo.id, 'IN_PROGRESS')}
                              disabled={updating === wo.id}
                            >
                              {updating === wo.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                            {wo.product && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCatalog(wo.product!.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Catalog
                              </Button>
                            )}
                          </>
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(wo.id, 'COMPLETED')}
                              disabled={updating === wo.id}
                            >
                              {updating === wo.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                            {wo.product && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCatalog(wo.product!.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Catalog
                              </Button>
                            )}
                          </>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
