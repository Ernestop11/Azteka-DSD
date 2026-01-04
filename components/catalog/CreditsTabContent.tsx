'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Package, ChevronDown, ChevronUp, Plus, Minus, AlertCircle, Check, X, Calculator } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCart } from '@/hooks/useCart'

interface OrderProduct {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage: string | null
  quantity: number // Cases ordered
  price: number // Price per case
  unitsPerCase: number
}

interface PastOrder {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  total: number
  items: OrderProduct[]
}

interface CreditItem {
  productId: string
  productName: string
  productSku: string
  productImage: string | null
  pricePerCase: number
  unitsPerCase: number
  pricePerUnit: number
  // Credit can be full cases OR individual pieces
  creditType: 'case' | 'piece'
  creditCases: number
  creditPieces: number // Individual pieces (not full cases)
  totalCreditAmount: number
  reason: 'damaged' | 'spoiled' | 'wrong_qty' | 'short_delivery' | 'quality' | 'other'
  orderId: string
  orderNumber: string
  maxCases: number // Original order quantity
}

const CREDIT_REASONS = [
  { value: 'damaged', label: 'Damaged', labelEs: 'Dañado' },
  { value: 'spoiled', label: 'Spoiled/Expired', labelEs: 'Echado a perder' },
  { value: 'short_delivery', label: 'Short Delivery', labelEs: 'Entrega incompleta' },
  { value: 'quality', label: 'Quality Issue', labelEs: 'Problema de calidad' },
  { value: 'wrong_qty', label: 'Wrong Quantity', labelEs: 'Cantidad incorrecta' },
  { value: 'other', label: 'Other', labelEs: 'Otro' },
] as const

interface CreditsTabContentProps {
  customerId: string
}

// Credit detail modal for piece-level selection
function CreditDetailModal({
  item,
  order,
  existingCredit,
  onSave,
  onClose,
}: {
  item: OrderProduct
  order: PastOrder
  existingCredit: CreditItem | undefined
  onSave: (credit: CreditItem) => void
  onClose: () => void
}) {
  const unitsPerCase = item.unitsPerCase || 12
  const pricePerCase = item.price
  const pricePerUnit = pricePerCase / unitsPerCase
  const maxCases = item.quantity
  const maxPieces = maxCases * unitsPerCase

  const [creditType, setCreditType] = useState<'case' | 'piece'>(existingCredit?.creditType || 'case')
  const [cases, setCases] = useState(existingCredit?.creditCases || 0)
  const [pieces, setPieces] = useState(existingCredit?.creditPieces || 0)
  const [reason, setReason] = useState<CreditItem['reason']>(existingCredit?.reason || 'damaged')

  // Calculate total credit
  const totalCases = creditType === 'case' ? cases : Math.floor(pieces / unitsPerCase)
  const remainingPieces = creditType === 'case' ? 0 : pieces % unitsPerCase
  const totalCreditAmount = creditType === 'case'
    ? cases * pricePerCase
    : pieces * pricePerUnit

  const handleSave = () => {
    const credit: CreditItem = {
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      productImage: item.productImage,
      pricePerCase,
      unitsPerCase,
      pricePerUnit,
      creditType,
      creditCases: creditType === 'case' ? cases : 0,
      creditPieces: creditType === 'piece' ? pieces : 0,
      totalCreditAmount,
      reason,
      orderId: order.id,
      orderNumber: order.orderNumber,
      maxCases,
    }
    onSave(credit)
    onClose()
  }

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
        className="relative w-full max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
              {item.productImage ? (
                <img src={getPublicImageUrl(item.productImage)} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">{item.productName}</h3>
              <p className="text-slate-400 text-xs">{item.productSku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Product Info */}
          <div className="bg-slate-800/50 rounded-xl p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ordered:</span>
              <span className="text-white font-medium">{maxCases} cases ({maxPieces} pcs)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price per case:</span>
              <span className="text-white font-medium">${pricePerCase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price per piece:</span>
              <span className="text-amber-400 font-medium">${pricePerUnit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Units per case:</span>
              <span className="text-white font-medium">{unitsPerCase}</span>
            </div>
          </div>

          {/* Credit Type Toggle */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-2 block">Return Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setCreditType('case'); setPieces(0); }}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  creditType === 'case'
                    ? 'bg-orange-500 text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Full Cases
              </button>
              <button
                onClick={() => { setCreditType('piece'); setCases(0); }}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  creditType === 'piece'
                    ? 'bg-orange-500 text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Individual Pieces
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-2 block">
              {creditType === 'case' ? 'Cases to Return' : 'Pieces to Return'}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => creditType === 'case'
                  ? setCases(Math.max(0, cases - 1))
                  : setPieces(Math.max(0, pieces - 1))
                }
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>

              <input
                type="number"
                min="0"
                max={creditType === 'case' ? maxCases : maxPieces}
                value={creditType === 'case' ? cases : pieces}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  const max = creditType === 'case' ? maxCases : maxPieces
                  creditType === 'case'
                    ? setCases(Math.min(max, Math.max(0, val)))
                    : setPieces(Math.min(max, Math.max(0, val)))
                }}
                className="flex-1 bg-slate-800 border-0 rounded-xl text-center text-2xl font-bold text-white h-12 focus:ring-2 focus:ring-orange-500"
              />

              <button
                onClick={() => creditType === 'case'
                  ? setCases(Math.min(maxCases, cases + 1))
                  : setPieces(Math.min(maxPieces, pieces + 1))
                }
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-1 text-center">
              Max: {creditType === 'case' ? `${maxCases} cases` : `${maxPieces} pieces`}
            </p>
          </div>

          {/* Quick piece buttons when in piece mode */}
          {creditType === 'piece' && (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 6, 12].filter(n => n <= maxPieces).map(n => (
                <button
                  key={n}
                  onClick={() => setPieces(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pieces === n ? 'bg-orange-500 text-slate-900' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {n} pc{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-2 block">Reason for Return</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as CreditItem['reason'])}
              className="w-full bg-slate-800 border-0 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500"
            >
              {CREDIT_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.labelEs}</option>
              ))}
            </select>
          </div>

          {/* Credit Calculation */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Credit Calculation</span>
            </div>
            {creditType === 'case' ? (
              <p className="text-white text-sm">
                {cases} case{cases !== 1 ? 's' : ''} × ${pricePerCase.toFixed(2)} =
                <span className="text-orange-400 font-bold ml-1">-${totalCreditAmount.toFixed(2)}</span>
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-white text-sm">
                  {pieces} piece{pieces !== 1 ? 's' : ''} × ${pricePerUnit.toFixed(2)} =
                  <span className="text-orange-400 font-bold ml-1">-${totalCreditAmount.toFixed(2)}</span>
                </p>
                {pieces >= unitsPerCase && (
                  <p className="text-slate-400 text-xs">
                    ({totalCases} full case{totalCases !== 1 ? 's' : ''} + {remainingPieces} piece{remainingPieces !== 1 ? 's' : ''})
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={(creditType === 'case' ? cases : pieces) === 0}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-slate-900 font-bold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Credit
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CreditsTabContent({ customerId }: CreditsTabContentProps) {
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [credits, setCredits] = useState<CreditItem[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [editingItem, setEditingItem] = useState<{ item: OrderProduct; order: PastOrder } | null>(null)

  const { add } = useCart()

  // Fetch past orders with items
  useEffect(() => {
    if (!customerId) return

    const loadPastOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/rep/customer/${customerId}/past-orders`)
        if (res.ok) {
          const data = await res.json()
          setPastOrders(data.orders || [])
          if (data.orders?.length > 0) {
            setExpandedOrder(data.orders[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to load past orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPastOrders()
  }, [customerId])

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId)
  }

  const saveCredit = useCallback((credit: CreditItem) => {
    setCredits(prev => {
      // Remove existing credit for this product/order combo
      const filtered = prev.filter(c => !(c.productId === credit.productId && c.orderId === credit.orderId))
      // Add new credit if it has value
      if (credit.totalCreditAmount > 0) {
        return [...filtered, credit]
      }
      return filtered
    })
  }, [])

  const removeCredit = useCallback((productId: string, orderId: string) => {
    setCredits(prev => prev.filter(c => !(c.productId === productId && c.orderId === orderId)))
  }, [])

  const getTotalCredit = () => {
    return credits.reduce((sum, c) => sum + c.totalCreditAmount, 0)
  }

  const getCreditForItem = (productId: string, orderId: string) => {
    return credits.find(c => c.productId === productId && c.orderId === orderId)
  }

  const applyCreditsToCart = () => {
    credits.forEach(credit => {
      const description = credit.creditType === 'case'
        ? `${credit.creditCases} case${credit.creditCases !== 1 ? 's' : ''}`
        : `${credit.creditPieces} pc${credit.creditPieces !== 1 ? 's' : ''}`

      add({
        id: `credit-${credit.productId}-${credit.orderId}-${Date.now()}`,
        name: `CREDIT: ${credit.productName} (${description})`,
        price: -credit.totalCreditAmount,
        quantity: 1,
        imageUrl: credit.productImage ? getPublicImageUrl(credit.productImage) : undefined,
      })
    })

    setCredits([])
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading order history...</p>
        </div>
      </div>
    )
  }

  if (pastOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <RotateCcw className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Past Orders</h2>
        <p className="text-slate-400 text-center">
          This customer has no previous orders to apply credits from.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-32">
      {/* Header Info */}
      <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-orange-400">
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">
            Tap a product to credit full cases or individual pieces
          </span>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Credits applied to cart!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Orders List */}
      <div className="px-4 space-y-3">
        {pastOrders.map((order) => (
          <div key={order.id} className="bg-slate-800/60 rounded-xl overflow-hidden">
            {/* Order Header */}
            <button
              onClick={() => toggleOrder(order.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">#{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    order.status.toLowerCase() === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} • {order.items.length} items • ${order.total.toFixed(2)}
                </p>
              </div>
              {expandedOrder === order.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Order Items */}
            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-700/50 pt-3">
                    {order.items.map((item) => {
                      const existingCredit = getCreditForItem(item.productId, order.id)
                      const unitsPerCase = item.unitsPerCase || 12

                      return (
                        <button
                          key={item.id}
                          onClick={() => setEditingItem({ item, order })}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                            existingCredit
                              ? 'bg-orange-500/10 border border-orange-500/30'
                              : 'bg-slate-700/30 hover:bg-slate-700/50'
                          }`}
                        >
                          {/* Product Image */}
                          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.productImage ? (
                              <img
                                src={getPublicImageUrl(item.productImage)}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-500" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-1">{item.productName}</p>
                            <p className="text-slate-500 text-xs">{item.productSku}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {item.quantity} cases ({item.quantity * unitsPerCase} pcs) @ ${item.price.toFixed(2)}/case
                            </p>
                          </div>

                          {/* Credit Badge */}
                          {existingCredit ? (
                            <div className="flex flex-col items-end">
                              <span className="text-orange-400 font-bold">
                                -${existingCredit.totalCreditAmount.toFixed(2)}
                              </span>
                              <span className="text-orange-400/60 text-xs">
                                {existingCredit.creditType === 'case'
                                  ? `${existingCredit.creditCases} case${existingCredit.creditCases !== 1 ? 's' : ''}`
                                  : `${existingCredit.creditPieces} pc${existingCredit.creditPieces !== 1 ? 's' : ''}`
                                }
                              </span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              Credit
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Credit Detail Modal */}
      <AnimatePresence>
        {editingItem && (
          <CreditDetailModal
            item={editingItem.item}
            order={editingItem.order}
            existingCredit={getCreditForItem(editingItem.item.productId, editingItem.order.id)}
            onSave={saveCredit}
            onClose={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Credits Summary - Fixed at bottom */}
      {credits.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-lg mx-auto">
            {/* Credits List */}
            <div className="mb-3 max-h-32 overflow-y-auto space-y-2">
              {credits.map((credit) => (
                <div key={`${credit.productId}-${credit.orderId}`} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-white truncate block">{credit.productName}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 text-xs">
                        {credit.creditType === 'case'
                          ? `${credit.creditCases} case${credit.creditCases !== 1 ? 's' : ''}`
                          : `${credit.creditPieces} pc${credit.creditPieces !== 1 ? 's' : ''}`
                        } • {CREDIT_REASONS.find(r => r.value === credit.reason)?.labelEs}
                      </span>
                      <button
                        onClick={() => removeCredit(credit.productId, credit.orderId)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="text-orange-400 font-semibold ml-2">
                    -${credit.totalCreditAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total and Apply Button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Total Credit</p>
                <p className="text-xl font-bold text-orange-400">-${getTotalCredit().toFixed(2)}</p>
              </div>
              <button
                onClick={applyCreditsToCart}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-slate-900 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Apply to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
