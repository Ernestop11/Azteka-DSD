import ProductCardSkeleton from './ProductCardSkeleton'

export default function CategoryBlockSkeleton() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      </div>

      {/* Horizontal scroll skeleton */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10">
        <div className="flex gap-3 md:gap-5 min-w-max">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] md:w-[200px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

