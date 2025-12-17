'use client'

/**
 * ProductGrid Skeleton Loading State
 * LAP #4: Polish - Consistent loading states
 */

interface ProductGridSkeletonProps {
  count?: number
  columns?: number
}

export default function ProductGridSkeleton({
  count = 8,
  columns = 4,
}: ProductGridSkeletonProps) {
  const gridClass = `grid grid-cols-2 md:grid-cols-${columns} gap-4 md:gap-6`

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
        >
          {/* Image skeleton */}
          <div className="relative aspect-square bg-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Brand */}
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />

            {/* Product name */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse" />
            </div>

            {/* Price */}
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse" />

            {/* Button */}
            <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
