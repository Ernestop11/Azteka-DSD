'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ProductTable from './ProductTable'
import ProductEditor from './ProductEditor'
import Button from '@/components/ui/button'
import { Plus, ArrowLeft, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

interface Product {
  id: string
  name: string
  sku: string
  price: number | string
  unitsPerCase: number
  imageUrl?: string | null
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  inStock?: boolean | null
}

export default function ProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterBrand, setFilterBrand] = useState<string>('all')

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  // Fetch brands for filter
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setIsCreating(true)
  }

  const handleClose = () => {
    setEditingProduct(null)
    setIsCreating(false)
  }

  const handleSaveComplete = () => {
    handleClose()
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast('Product saved successfully', 'success')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to delete')

      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast('Product deleted successfully', 'success')
    } catch (error) {
      toast('Failed to delete product', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-sm text-gray-600">Manage your product catalog</p>
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Brands</option>
              {brands.map((brand: any) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            {(filterCategory !== 'all' || filterBrand !== 'all') && (
              <button
                onClick={() => {
                  setFilterCategory('all')
                  setFilterBrand('all')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {(editingProduct || isCreating) ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ProductEditor
              product={editingProduct ? { ...editingProduct, inStock: editingProduct.inStock ?? true } : undefined}
              onSave={handleSaveComplete}
              onCancel={handleClose}
            />
          </div>
        ) : (
          <ProductTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            filterCategory={filterCategory}
            filterBrand={filterBrand}
          />
        )}
      </div>
    </div>
  )
}
