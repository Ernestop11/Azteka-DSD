import { Suspense } from 'react'
import CatalogContent from './CatalogContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}
