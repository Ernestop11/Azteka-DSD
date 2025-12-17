'use client'

/**
 * HeroBanner Skeleton Loading State
 * LAP #4: Polish - Consistent loading states
 */

export default function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 rounded-lg overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

      {/* Content placeholder */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12">
        {/* Headline skeleton */}
        <div className="space-y-3 mb-6">
          <div className="h-10 md:h-12 lg:h-16 bg-gray-300/50 rounded-lg w-3/4 animate-pulse" />
          <div className="h-6 md:h-7 bg-gray-300/50 rounded-lg w-1/2 animate-pulse" />
        </div>

        {/* CTA button skeleton */}
        <div className="h-12 md:h-14 bg-gray-300/50 rounded-lg w-40 animate-pulse" />
      </div>
    </div>
  )
}
