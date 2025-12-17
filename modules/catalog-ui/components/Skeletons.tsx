import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'shimmer 2s infinite',
      }}
    />
  );
};

// Hero Banner Skeleton
export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative h-96 bg-gray-200 overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="relative h-full flex flex-col justify-center items-start px-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-3/4 rounded-lg mb-4" />
        <Skeleton className="h-6 w-1/2 rounded-lg mb-8" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-24 rounded mb-2" />
        <Skeleton className="h-6 w-full rounded mb-2" />
        <Skeleton className="h-8 w-32 rounded mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  columns?: 1 | 2 | 3 | 4;
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  columns = 2,
  count = 6,
}) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Brand Card Skeleton
export const BrandCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md" style={{ minWidth: '140px' }}>
      <Skeleton className="w-16 h-16 rounded-full mb-3" />
      <Skeleton className="h-4 w-20 rounded mb-2" />
      <Skeleton className="h-3 w-16 rounded" />
    </div>
  );
};

// Brand Row Skeleton
interface BrandRowSkeletonProps {
  count?: number;
}

export const BrandRowSkeleton: React.FC<BrandRowSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 rounded mb-4" />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {Array.from({ length: count }).map((_, i) => (
          <BrandCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Bundle Card Skeleton
export const BundleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 rounded mb-2" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
        <Skeleton className="w-20 h-20 rounded-lg ml-4" />
      </div>
      
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-lg flex-shrink-0" />
        ))}
      </div>
      
      <div className="flex items-end justify-between mb-4">
        <div>
          <Skeleton className="h-8 w-32 rounded mb-2" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
      
      <Skeleton className="h-6 w-48 rounded-full" />
    </div>
  );
};

// Bundle Section Skeleton
interface BundleSectionSkeletonProps {
  count?: number;
}

export const BundleSectionSkeleton: React.FC<BundleSectionSkeletonProps> = ({ count = 2 }) => {
  return (
    <div className="mb-12">
      <Skeleton className="h-8 w-56 rounded mb-2" />
      <Skeleton className="h-5 w-64 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <BundleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Search Bar Skeleton
export const SearchBarSkeleton: React.FC = () => {
  return (
    <div className="mb-6">
      <Skeleton className="w-full h-16 rounded-full" />
    </div>
  );
};

// Category Tabs Skeleton
export const CategoryTabsSkeleton: React.FC = () => {
  return (
    <div className="mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
        ))}
      </div>
    </div>
  );
};

// Full Page Skeleton (Sales Rep)
export const SalesRepSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchBarSkeleton />
        <CategoryTabsSkeleton />
        <BrandRowSkeleton count={8} />
        <BundleSectionSkeleton count={2} />
        <div className="mb-12">
          <Skeleton className="h-8 w-64 rounded mb-6" />
          <ProductGridSkeleton columns={2} count={6} />
        </div>
      </div>
    </div>
  );
};

// Full Page Skeleton (Customer)
export const CustomerSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-4 py-6 shadow-lg">
        <Skeleton className="h-8 w-48 rounded mb-2" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      
      <div className="sticky top-0 bg-white shadow-md px-4 py-4 z-40">
        <Skeleton className="w-full h-12 rounded-full mb-3" />
        <Skeleton className="w-full h-10 rounded-full" />
      </div>
      
      <div className="px-4 py-6">
        <Skeleton className="h-6 w-40 rounded mb-4" />
        <ProductGridSkeleton columns={1} count={4} />
      </div>
    </div>
  );
};

// Add shimmer animation to global CSS
export const SkeletonStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;
