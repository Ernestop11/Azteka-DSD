'use client'

import { Suspense } from 'react'
import MultiStoreOrder from '@/components/sales/MultiStoreOrder'
import { useState } from 'react'

function MultiStoreOrderPage() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <MultiStoreOrder isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading multi-store order...</p>
        </div>
      </div>
    }>
      <MultiStoreOrderPage />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'

