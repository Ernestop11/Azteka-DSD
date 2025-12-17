'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import FilterSection from './FilterSection'
import FilterChip from './FilterChip'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { useDebounce } from '@/hooks/useDebounce'

interface FiltersSidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

export default function FiltersSidebar({ onClose, isMobile = false }: FiltersSidebarProps) {
  const { filters, toggleCategory, toggleBrand, setPriceRange, setSearch, clearFilters, activeFilterCount } = useCatalogFilters()
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debouncedSearch = useDebounce(localSearch, 300)

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearch(debouncedSearch)
    }
  }, [debouncedSearch, filters.search, setSearch])

  // Fetch filter options
  const { data: filterData, isLoading } = useQuery({
    queryKey: ['catalog-filters'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/filters')
      if (!res.ok) throw new Error('Failed to fetch filters')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  const priceRange = filterData?.data?.priceRange || { min: 0, max: 1000 }
  const categories = filterData?.data?.categories || []
  const brands = filterData?.data?.brands || []

  const [priceValues, setPriceValues] = useState({
    min: filters.minPrice ?? priceRange.min,
    max: filters.maxPrice ?? priceRange.max,
  })

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newValues = { ...priceValues, [type]: value }
    setPriceValues(newValues)
    
    // Update filters after a short delay
    setTimeout(() => {
      setPriceRange(
        newValues.min !== priceRange.min ? newValues.min : null,
        newValues.max !== priceRange.max ? newValues.max : null
      )
    }, 500)
  }

  const activeCategories = useMemo(() => {
    return categories.filter((cat: any) => filters.categories.includes(cat.id))
  }, [categories, filters.categories])

  const activeBrands = useMemo(() => {
    return brands.filter((brand: any) => filters.brands.includes(brand.id))
  }, [brands, filters.brands])

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        ${isMobile ? 'fixed inset-0 z-50 bg-white' : 'sticky top-4 h-fit'}
        ${!isMobile && 'w-64'}
        bg-white border-r border-gray-200
        ${isMobile ? 'overflow-y-auto' : 'max-h-[calc(100vh-2rem)] overflow-y-auto'}
      `}
      role="complementary"
      aria-label="Product filters"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h2>
          {isMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {(activeCategories.length > 0 || activeBrands.length > 0 || filters.minPrice !== null || filters.maxPrice !== null) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeCategories.map((cat: any) => (
              <FilterChip
                key={cat.id}
                label={cat.name}
                onRemove={() => toggleCategory(cat.id)}
              />
            ))}
            {activeBrands.map((brand: any) => (
              <FilterChip
                key={brand.id}
                label={brand.name}
                onRemove={() => toggleBrand(brand.id)}
              />
            ))}
            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <FilterChip
                label={`$${filters.minPrice ?? priceRange.min} - $${filters.maxPrice ?? priceRange.max}`}
                onRemove={() => setPriceRange(null, null)}
              />
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search products"
          />
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-1">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Categories */}
            <FilterSection title="Categories" defaultOpen={true}>
              <div className="space-y-2 max-h-64 overflow-y-auto" role="listbox" aria-label="Categories">
                {categories.map((category: any) => {
                  const isSelected = filters.categories.includes(category.id)
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      role="option"
                      aria-selected={isSelected}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label={`Filter by ${category.name}`}
                      />
                      <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                    </label>
                  )
                })}
              </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection title="Brands" defaultOpen={true}>
              <div className="space-y-2 max-h-64 overflow-y-auto" role="listbox" aria-label="Brands">
                {brands.map((brand: any) => {
                  const isSelected = filters.brands.includes(brand.id)
                  return (
                    <label
                      key={brand.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      role="option"
                      aria-selected={isSelected}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBrand(brand.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label={`Filter by ${brand.name}`}
                      />
                      <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                    </label>
                  )
                })}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" defaultOpen={true}>
              <div className="space-y-4" role="group" aria-label="Price range">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={priceValues.min}
                      onChange={(e) => handlePriceChange('min', parseFloat(e.target.value) || priceRange.min)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Minimum price"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={priceValues.max}
                      onChange={(e) => handlePriceChange('max', parseFloat(e.target.value) || priceRange.max)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Range: ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
                </div>
              </div>
            </FilterSection>
          </>
        )}
      </div>
    </motion.div>
  )
}

