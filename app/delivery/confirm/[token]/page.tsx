'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Send,
  Loader2,
  PartyPopper,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderItem {
  id: string
  productName: string
  productImage?: string
  quantity: number
  confirmed: boolean
  issue?: string
}

interface DeliveryData {
  orderId: string
  orderNumber?: string
  customer?: string
  items: OrderItem[]
  driverName?: string
  deliveryTime?: string
}

type Step = 'loading' | 'verify' | 'signature' | 'complete' | 'error'

export default function DeliveryConfirmationPage() {
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState<Step>('loading')
  const [delivery, setDelivery] = useState<DeliveryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    async function fetchDelivery() {
      try {
        const res = await fetch(`/api/delivery/confirm/${token}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Delivery not found')
        }

        setDelivery(json.data)
        setItems(
          json.data.items.map((item: OrderItem) => ({
            ...item,
            confirmed: false,
            issue: undefined,
          }))
        )
        setStep('verify')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load delivery')
        setStep('error')
      }
    }

    if (token) {
      fetchDelivery()
    }
  }, [token])

  // Signature drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    setHasSignature(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1f2937'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed, issue: undefined } : item
      )
    )
  }

  const reportIssue = (id: string, issue: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: false, issue } : item
      )
    )
  }

  const allConfirmed = items.every((item) => item.confirmed)
  const hasIssues = items.some((item) => item.issue)

  const proceedToSignature = () => {
    setStep('signature')
  }

  const submitConfirmation = async () => {
    setSubmitting(true)

    try {
      const canvas = canvasRef.current
      const signature = canvas?.toDataURL('image/png') || null

      const res = await fetch(`/api/delivery/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedItems: items.map((item) => ({
            id: item.id,
            confirmed: item.confirmed,
            issue: item.issue,
          })),
          customerSignature: signature,
          customerName,
          notes,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit confirmation')
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading delivery...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Delivery Not Found</h1>
          <p className="text-slate-600">{error || 'This confirmation link is not valid or has expired.'}</p>
        </motion.div>
      </div>
    )
  }

  // Complete state
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <PartyPopper className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h1>
          <p className="text-slate-600 mb-4">
            Your delivery has been confirmed successfully.
          </p>
          <p className="text-sm text-slate-500">
            Order #{delivery?.orderNumber || delivery?.orderId?.slice(-8).toUpperCase()}
          </p>
          <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
            <p className="text-sm text-emerald-800">
              A confirmation has been sent to the driver and warehouse.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="font-bold text-slate-800">AZTEKA</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">Delivery Confirmation</p>
            <p className="font-bold text-emerald-600">#{delivery?.orderNumber || delivery?.orderId?.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <AnimatePresence mode="wait">
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Instructions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-2">
                  Verify Your Delivery
                </h2>
                <p className="text-slate-600 text-sm">
                  Tap each item to confirm you received it. Report any issues by tapping the warning icon.
                </p>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border-b border-slate-100 last:border-0 ${
                      item.confirmed
                        ? 'bg-emerald-50'
                        : item.issue
                        ? 'bg-amber-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        {item.issue && (
                          <p className="text-xs text-amber-600 mt-1">{item.issue}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            reportIssue(
                              item.id,
                              item.issue ? undefined! : 'Issue reported'
                            )
                          }
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            item.issue
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-500'
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            item.confirmed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500'
                          }`}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Confirmed Items</span>
                  <span className="font-bold text-slate-800">
                    {items.filter((i) => i.confirmed).length} / {items.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(items.filter((i) => i.confirmed).length / items.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={proceedToSignature}
                disabled={!allConfirmed && !hasIssues}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  allConfirmed || hasIssues
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {allConfirmed
                  ? 'Continue to Signature'
                  : hasIssues
                  ? 'Continue with Issues'
                  : 'Confirm All Items First'}
              </button>
            </motion.div>
          )}

          {step === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Signature Pad */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Sign to Confirm
                </h2>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
                    className="w-full h-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-slate-400">Draw your signature here</p>
                    </div>
                  )}
                </div>
                {hasSignature && (
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear signature
                  </button>
                )}
              </div>

              {/* Customer Name */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any comments about this delivery?"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitConfirmation}
                disabled={!hasSignature || submitting}
                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                  hasSignature && !submitting
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Confirm Delivery
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                onClick={() => setStep('verify')}
                className="w-full py-3 text-slate-600 hover:text-slate-800"
              >
                Back to Items
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
