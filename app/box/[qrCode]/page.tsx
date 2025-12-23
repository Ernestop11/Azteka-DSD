'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Package, CheckCircle2, Truck, Clock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BoxItem {
  name: string
  quantity: number
  imageUrl?: string
}

interface BoxData {
  qrCode: string
  orderId: string
  orderNumber?: string
  customer?: string
  status: 'PACKING' | 'SEALED' | 'IN_TRANSIT' | 'DELIVERED'
  items: BoxItem[]
  sealedAt?: string
}

const statusConfig = {
  PACKING: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Being Packed' },
  SEALED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Ready for Delivery' },
  IN_TRANSIT: { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Out for Delivery' },
  DELIVERED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Delivered' },
}

export default function BoxViewPage() {
  const params = useParams()
  const qrCode = params.qrCode as string

  const [box, setBox] = useState<BoxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBox() {
      try {
        const res = await fetch(`/api/boxes?qrCode=${qrCode}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Box not found')
        }

        setBox(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load box')
      } finally {
        setLoading(false)
      }
    }

    if (qrCode) {
      fetchBox()
    }
  }, [qrCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading box contents...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Box Not Found</h1>
          <p className="text-slate-600">{error || 'This box code is not valid or has expired.'}</p>
          <p className="text-sm text-slate-400 mt-4">Code: {qrCode}</p>
        </motion.div>
      </div>
    )
  }

  const StatusIcon = statusConfig[box.status].icon
  const totalItems = box.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="font-bold text-slate-800">AZTEKA</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">Order</p>
            <p className="font-bold text-slate-800">#{box.orderNumber || box.orderId.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${statusConfig[box.status].bg} rounded-2xl p-6`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center ${statusConfig[box.status].color}`}>
              <StatusIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Box Status</p>
              <p className={`text-xl font-bold ${statusConfig[box.status].color}`}>
                {statusConfig[box.status].label}
              </p>
            </div>
          </div>
          {box.customer && (
            <p className="mt-4 text-slate-600">
              Delivery to: <span className="font-semibold text-slate-800">{box.customer}</span>
            </p>
          )}
        </motion.div>

        {/* Box Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Box Contents</h2>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              {totalItems} items
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {box.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-emerald-600">{item.quantity}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Box ID Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Box ID</p>
          <p className="font-mono text-sm text-slate-600">{box.qrCode}</p>
        </div>
      </main>
    </div>
  )
}
