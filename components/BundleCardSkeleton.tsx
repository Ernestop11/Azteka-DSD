export default function BundleCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-[180px] md:h-[200px] bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

