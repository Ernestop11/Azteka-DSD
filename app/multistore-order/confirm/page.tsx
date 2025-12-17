'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { CheckCircle, ArrowLeft, Package, Printer } from 'lucide-react'
import Link from 'next/link'
import { triggerPrintMultiple } from '@/lib/print/triggerPrint'
import ErrorBoundary from '@/components/ErrorBoundary'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIds = searchParams.get('orders')?.split(',') || []
  const storeCount = orderIds.length
  const [printStatus, setPrintStatus] = useState<{ success: number; failed: number } | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // Trigger print jobs after component mounts
  useEffect(() => {
    if (orderIds.length > 0 && !isPrinting) {
      setIsPrinting(true)
      triggerPrintMultiple(orderIds, {
        onSuccess: (orderId) => {
          console.log(`[Print] Successfully queued print for order ${orderId}`)
        },
        onFailure: (orderId, error) => {
          console.error(`[Print] Failed to queue print for order ${orderId}:`, error)
        },
      }).then(status => {
        setPrintStatus(status)
        setIsPrinting(false)
      })
    }
  }, [orderIds.length]) // Only run once when orderIds are available

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Submitted Successfully!</h1>
          <p className="text-gray-600">
            {storeCount} {storeCount === 1 ? 'order' : 'orders'} have been placed
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Package className="w-5 h-5" />
              <span className="font-semibold">Order IDs:</span>
            </div>
            <div className="space-y-1">
              {orderIds.map((orderId, index) => (
                <div key={orderId} className="text-sm text-gray-600 font-mono">
                  {index + 1}. {orderId}
                </div>
              ))}
            </div>
          </div>

          {/* Print Status */}
          {isPrinting && (
            <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
              <Printer className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="text-sm text-blue-700">Queuing print jobs...</span>
            </div>
          )}

          {printStatus && (
            <div className={`rounded-lg p-4 flex items-center gap-3 ${
              printStatus.failed === 0 ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <Printer className={`w-5 h-5 ${
                printStatus.failed === 0 ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <span className={`text-sm ${
                printStatus.failed === 0 ? 'text-green-700' : 'text-yellow-700'
              }`}>
                Print jobs: {printStatus.success} queued
                {printStatus.failed > 0 && `, ${printStatus.failed} failed`}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/catalog"
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Return to Catalog
          </Link>
          <button
            onClick={() => router.push('/multistore-order')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'

