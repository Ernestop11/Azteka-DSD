'use client'

/**
 * Catalog Skeleton Components - Centralized Export
 * LAP #4: Polish - All loading and error states
 */

// ============================================================================
// HERO BANNER SKELETON
// ============================================================================

export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12">
        <div className="space-y-3 mb-6">
          <div className="h-10 md:h-12 lg:h-16 bg-gray-300/50 rounded-lg w-3/4 animate-pulse" />
          <div className="h-6 md:h-7 bg-gray-300/50 rounded-lg w-1/2 animate-pulse" />
        </div>
        <div className="h-12 md:h-14 bg-gray-300/50 rounded-lg w-40 animate-pulse" />
      </div>
    </div>
  )
}

// ============================================================================
// PROMO PANEL SKELETON
// ============================================================================

export function PromoPanelSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image skeleton */}
        <div className="relative w-full md:w-1/3 aspect-square bg-gray-200 rounded-lg animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse" />
          <div className="h-12 bg-gray-300 rounded w-1/3 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PRODUCT GRID SKELETON
// ============================================================================

export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <div className="relative aspect-square bg-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse" />
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CATEGORY ROW SKELETON
// ============================================================================

export function CategoryRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <div className="h-8 bg-gray-300 rounded w-48 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-64 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="relative aspect-square bg-gray-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// SHOPPABLE STORY SKELETON
// ============================================================================

export function ShoppableStorySkeleton({ panels = 3 }: { panels?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: panels }).map((_, index) => (
        <div key={index} className="relative min-h-screen bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="space-y-4">
              <div className="h-10 bg-gray-300/50 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-gray-300/50 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// WIDE SPOTLIGHT SKELETON
// ============================================================================

export function WideSpotlightSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Featured product (spans 2 columns) */}
      <div className="md:col-span-2 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <div className="relative aspect-square bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>
      </div>

      {/* Supporting products */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="relative aspect-square bg-gray-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-300 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ERROR STATES
// ============================================================================

export function ErrorState({
  title = 'Error loading content',
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title = 'No items found',
  message = 'There are no items to display.',
  icon,
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">
        {icon || (
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export const skeletons = {
  HeroBannerSkeleton,
  PromoPanelSkeleton,
  ProductGridSkeleton,
  CategoryRowSkeleton,
  ShoppableStorySkeleton,
  WideSpotlightSkeleton,
  ErrorState,
  EmptyState,
}

export default skeletons
