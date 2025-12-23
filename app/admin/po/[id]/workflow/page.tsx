'use client'

/**
 * PO Workflow Visualization Page
 * 
 * Shows the complete flow after PO confirmation:
 * - Receiving tasks for workers
 * - Work orders for Ernesto (catalog tasks)
 * - Inventory updates
 * - Status tracking
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  FileText,
  Boxes,
  ShoppingCart,
  ChevronRight,
  RefreshCw,
  Eye,
  ClipboardList
} from 'lucide-react'
import Button from '@/components/ui/button'
import Link from 'next/link'

interface POData {
  id: string
  poNumber: string | null
  vendor: { id: string; name: string } | null
  status: string
  total: number
  createdAt: string
  expectedDate: string | null
  items: Array<{
    id: string
    vendorSku: string
    description: string
    quantityOrdered: number
    quantityReceived: number
    isNewProduct: boolean
    productId: string | null
    product: { id: string; name: string; sku: string } | null
  }>
  receivingTask: {
    id: string
    status: string
    assignee: { id: string; firstName: string; lastName: string } | null
    startedAt: string | null
    completedAt: string | null
  } | null
  workOrders: Array<{
    id: string
    type: string
    title: string
    status: string
    productId: string | null
    product: { id: string; name: string; sku: string } | null
  }>
}

export default function POWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const poId = params.id as string

  const { data: poData, isLoading } = useQuery({
    queryKey: ['po-workflow', poId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/po/${poId}`)
      if (!res.ok) throw new Error('Failed to fetch PO')
      return res.json()
    },
  })

  const po: POData | null = poData?.data || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading PO workflow...</p>
        </div>
      </div>
    )
  }

  if (!po) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PO Not Found</h2>
          <p className="text-gray-600 mb-4">The purchase order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/po')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to PO Management
          </Button>
        </div>
      </div>
    )
  }

  const newProducts = po.items.filter(item => item.isNewProduct)
  const receivedItems = po.items.filter(item => item.quantityReceived > 0)
  const pendingItems = po.items.filter(item => item.quantityReceived < item.quantityOrdered)

  const workflowSteps = [
    {
      id: 'uploaded',
      title: 'PO Uploaded & Confirmed',
      status: 'completed',
      icon: FileText,
      description: `PO ${po.poNumber || po.id} confirmed`,
      date: new Date(po.createdAt).toLocaleString(),
    },
    {
      id: 'receiving',
      title: 'Receiving Task Created',
      status: po.receivingTask ? (po.receivingTask.status === 'COMPLETED' ? 'completed' : 'in-progress') : 'pending',
      icon: Truck,
      description: po.receivingTask
        ? po.receivingTask.assignee
          ? `Assigned to ${po.receivingTask.assignee.firstName} ${po.receivingTask.assignee.lastName}`
          : 'Available for workers to claim'
        : 'Waiting for task creation',
      date: po.receivingTask?.startedAt ? new Date(po.receivingTask.startedAt).toLocaleString() : null,
      link: po.receivingTask ? `/employee/receiving?taskId=${po.receivingTask.id}` : null,
    },
    {
      id: 'work-orders',
      title: 'Catalog Work Orders',
      status: newProducts.length > 0
        ? po.workOrders.some(wo => wo.status === 'COMPLETED')
          ? 'completed'
          : po.workOrders.length > 0
            ? 'in-progress'
            : 'pending'
        : 'skipped',
      icon: ClipboardList,
      description: `${newProducts.length} new products need catalog setup`,
      date: po.workOrders[0]?.createdAt ? new Date(po.workOrders[0].createdAt).toLocaleString() : null,
      link: '/admin/work-orders',
    },
    {
      id: 'inventory',
      title: 'Inventory Updated',
      status: po.receivingTask?.status === 'COMPLETED' ? 'completed' : 'pending',
      icon: Boxes,
      description: receivedItems.length > 0
        ? `${receivedItems.length} items received and stocked`
        : 'Waiting for receiving completion',
      date: po.receivingTask?.completedAt ? new Date(po.receivingTask.completedAt).toLocaleString() : null,
    },
    {
      id: 'catalog',
      title: 'Products in Catalog',
      status: po.workOrders.every(wo => wo.status === 'COMPLETED') && newProducts.length > 0
        ? 'completed'
        : newProducts.length === 0
          ? 'skipped'
          : 'pending',
      icon: ShoppingCart,
      description: newProducts.length > 0
        ? `${newProducts.filter(item => po.workOrders.find(wo => wo.productId === item.productId && wo.status === 'COMPLETED')).length}/${newProducts.length} products added to catalog`
        : 'No new products',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
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
                <h1 className="text-2xl font-bold text-gray-900">PO Workflow</h1>
                <p className="text-sm text-gray-600">
                  PO {po.poNumber || po.id} • {po.vendor?.name || 'Unknown Vendor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  po.status === 'RECEIVED'
                    ? 'bg-green-100 text-green-800'
                    : po.status === 'RECEIVING'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {po.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Workflow Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Workflow Progress</h2>
          <div className="space-y-6">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === workflowSteps.length - 1

              return (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-full ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : step.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-600'
                            : step.status === 'skipped'
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        {step.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {step.status === 'in-progress' && (
                          <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-gray-500">{step.date}</p>
                      )}
                      {step.link && (
                        <Link
                          href={step.link}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/employee/receiving"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Receiving Tasks</h3>
            </div>
            <p className="text-sm text-gray-600">
              View and claim receiving tasks for workers
            </p>
          </Link>

          <Link
            href="/admin/work-orders"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Work Orders</h3>
            </div>
            <p className="text-sm text-gray-600">
              Catalog tasks for Ernesto to review
            </p>
          </Link>

          <Link
            href="/admin/control-tower"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Control Tower</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ana's operational overview dashboard
            </p>
          </Link>
        </div>

        {/* PO Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PO Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-lg font-semibold text-gray-900">{po.items.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">New Products</p>
              <p className="text-lg font-semibold text-blue-600">{newProducts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-lg font-semibold text-green-600">
                {receivedItems.length}/{po.items.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-lg font-semibold text-gray-900">
                ${Number(po.total).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



