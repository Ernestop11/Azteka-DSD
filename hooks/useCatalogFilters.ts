'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface CatalogFilters {
  search: string
  categories: string[]
  brands: string[]
  minPrice: number | null
  maxPrice: number | null
  page: number
}

export function useCatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    search: searchParams.get('search') || '',
    categories: searchParams.get('category')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null,
    page: parseInt(searchParams.get('page') || '1'),
  }))

  const updateFilters = useCallback((updates: Partial<CatalogFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updates }
      
      // Build URL params
      const params = new URLSearchParams()
      
      if (newFilters.search) {
        params.set('search', newFilters.search)
      }
      
      if (newFilters.categories.length > 0) {
        params.set('category', newFilters.categories.join(','))
      }
      
      if (newFilters.brands.length > 0) {
        params.set('brand', newFilters.brands.join(','))
      }
      
      if (newFilters.minPrice !== null) {
        params.set('minPrice', newFilters.minPrice.toString())
      }
      
      if (newFilters.maxPrice !== null) {
        params.set('maxPrice', newFilters.maxPrice.toString())
      }
      
      if (newFilters.page > 1) {
        params.set('page', newFilters.page.toString())
      }
      
      // Update URL without navigation
      router.replace(`/catalog?${params.toString()}`, { scroll: false })
      
      return newFilters
    })
  }, [router])

  const toggleCategory = useCallback((categoryId: string) => {
    setFilters((prev) => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId]
      
      updateFilters({ categories: newCategories, page: 1 })
      return { ...prev, categories: newCategories, page: 1 }
    })
  }, [updateFilters])

  const toggleBrand = useCallback((brandId: string) => {
    setFilters((prev) => {
      const newBrands = prev.brands.includes(brandId)
        ? prev.brands.filter((id) => id !== brandId)
        : [...prev.brands, brandId]
      
      updateFilters({ brands: newBrands, page: 1 })
      return { ...prev, brands: newBrands, page: 1 }
    })
  }, [updateFilters])

  const setPriceRange = useCallback((min: number | null, max: number | null) => {
    updateFilters({ minPrice: min, maxPrice: max, page: 1 })
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }))
  }, [updateFilters])

  const setSearch = useCallback((search: string) => {
    updateFilters({ search, page: 1 })
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }, [updateFilters])

  const clearFilters = useCallback(() => {
    const cleared = {
      search: '',
      categories: [],
      brands: [],
      minPrice: null,
      maxPrice: null,
      page: 1,
    }
    updateFilters(cleared)
    setFilters(cleared)
    router.replace('/catalog', { scroll: false })
  }, [updateFilters, router])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categories.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.minPrice !== null || filters.maxPrice !== null) count++
    return count
  }, [filters])

  return {
    filters,
    updateFilters,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setSearch,
    clearFilters,
    activeFilterCount,
  }
}

