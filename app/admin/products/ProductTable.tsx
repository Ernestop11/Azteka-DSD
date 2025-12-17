'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Button from '@/components/ui/button'
import { Edit2, Trash2, Search } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import Input from '@/components/ui/input'
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

interface ProductTableProps {
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  filterCategory?: string
  filterBrand?: string
}

export default function ProductTable({ onEdit, onDelete, filterCategory = 'all', filterBrand = 'all' }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: productsData, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const json = await res.json()
      // Handle both { data: [...] } and direct array responses
      return Array.isArray(json) ? { data: json } : json
    },
  })

  // Extract products array from response
  const products = productsData?.data || []

  const handleToggleStock = async (product: Product) => {
    try {
      const newStockStatus = product.inStock === false // Toggle: false -> true, true/null -> false

      const formData = new FormData()
      formData.append('id', product.id.toString())
      formData.append('inStock', String(newStockStatus))

      // Add required fields to avoid validation errors
      formData.append('name', product.name)
      formData.append('sku', product.sku)
      formData.append('price', String(product.price))
      formData.append('unitsPerCase', String(product.unitsPerCase))

      // Add optional fields if they exist
      if (product.category?.id) formData.append('categoryId', product.category.id)
      if (product.brand?.id) formData.append('brandId', product.brand.id)

      console.log('Toggling stock for product:', product.id, 'to:', newStockStatus)

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })

      if (res.ok) {
        // Invalidate all product queries
        queryClient.invalidateQueries({ queryKey: ['admin-products'] })
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })

        toast(
          newStockStatus ? 'Product is now in stock' : 'Product marked out of stock',
          'success'
        )
      } else {
        const errorText = await res.text()
        console.error('Stock toggle failed:', errorText)
        toast(errorText || 'Failed to update stock status', 'error')
      }
    } catch (error) {
      console.error('Stock toggle error:', error)
      toast('Failed to update stock status', 'error')
    }
  }

  const filteredProducts = products
    .filter((p) => {
      // Search filter
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = filterCategory === 'all' || p.category?.id === filterCategory

      // Brand filter
      const matchesBrand = filterBrand === 'all' || p.brand?.id === filterBrand

      return matchesSearch && matchesCategory && matchesBrand
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price)) || 0
      const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price)) || 0
      return priceA - priceB
    })

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price (Case)</TableHead>
              <TableHead>Units/Case</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={getPublicImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600">{product.sku}</TableCell>
                  <TableCell>{product.category?.name || '—'}</TableCell>
                  <TableCell>{product.brand?.name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.inStock !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.inStock === false ? 'Out of Stock' : 'In Stock'}
                      </span>
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          product.inStock
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {product.inStock ? 'Mark Out' : 'In Stock'}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${(typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{product.unitsPerCase}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                        aria-label="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
