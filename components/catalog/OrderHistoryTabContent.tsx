'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Package, ChevronRight, X, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface OrderItem {
  id: string
  productId: string
  name: string
  sku: string
  imageUrl: string | null
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  total: number
  itemCount: number
  items?: OrderItem[]
}

interface OrderHistoryTabContentProps {
  customerId: string
}

const STATUS_CONFIG: Record<string, { label: string; labelEs: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', labelEs: 'Pendiente', color: 'text-amber-400 bg-amber-500/20', icon: Clock },
  processing: { label: 'Processing', labelEs: 'Procesando', color: 'text-blue-400 bg-blue-500/20', icon: Package },
  shipped: { label: 'Shipped', labelEs: 'Enviado', color: 'text-purple-400 bg-purple-500/20', icon: Truck },
  delivered: { label: 'Delivered', labelEs: 'Entregado', color: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle },
  completed: { label: 'Completed', labelEs: 'Completado', color: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', labelEs: 'Cancelado', color: 'text-red-400 bg-red-500/20', icon: AlertCircle },
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`)
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
        }
      } catch (error) {
        console.error('Failed to load order details:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrderDetail()
  }, [order.id])

  const statusConfig = STATUS_CONFIG[order.status.toLowerCase()] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-slate-700/50 bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">Order #{order.orderNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.labelEs}
              </span>
              <span className="text-slate-500 text-xs">
                {new Date(order.createdAt).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Items */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No items found</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
                  <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={getPublicImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-slate-500 text-xs">{item.sku}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-slate-700/50 bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total</span>
            <span className="text-xl font-bold text-white">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function OrderHistoryTabContent({ customerId }: OrderHistoryTabContentProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!customerId) return

    const loadOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders/history/${customerId}`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Failed to load order history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading order history...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <ShoppingBag className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Orders Yet</h2>
        <p className="text-slate-400 text-center">
          This customer hasn't placed any orders yet.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm font-medium">{orders.length} orders</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {orders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status.toLowerCase()] || STATUS_CONFIG.pending
          const StatusIcon = statusConfig.icon

          return (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full bg-slate-800/60 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">#{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.labelEs}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {new Date(order.createdAt).toLocaleDateString('es-MX', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">${order.total.toFixed(2)}</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
