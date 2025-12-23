'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Drawer from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import Textarea from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Upload, Download } from 'lucide-react'

interface BulkPriceModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function BulkPriceModal({
  isOpen,
  onClose,
  onComplete,
}: BulkPriceModalProps) {
  const { toast } = useToast()
  const [operation, setOperation] = useState<
    'SET_FIXED_PRICE' | 'SET_DISCOUNT_PERCENT' | 'SET_DISCOUNT_AMOUNT'
  >('SET_FIXED_PRICE')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch customers and products
  const { data: customersData } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/customers')
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const customers = customersData?.data || []
  const products = productsData?.data || []

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/price-overrides/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation,
          customerIds: selectedCustomers,
          productIds: selectedProducts,
          value: parseFloat(value),
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to process bulk operation')
      }

      return res.json()
    },
    onSuccess: (data) => {
      toast(
        `Bulk operation complete: ${data.data.successful} successful, ${data.data.failed} failed`,
        'success'
      )
      onComplete()
    },
    onError: (error: Error) => {
      toast(error.message || 'Failed to process bulk operation', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCustomers.length === 0) {
      toast('Please select at least one customer', 'error')
      return
    }

    if (selectedProducts.length === 0) {
      toast('Please select at least one product', 'error')
      return
    }

    if (!value) {
      toast('Please enter a value', 'error')
      return
    }

    bulkMutation.mutate()
  }

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    )
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllCustomers = () => {
    setSelectedCustomers(customers.map((c: any) => c.id))
  }

  const deselectAllCustomers = () => {
    setSelectedCustomers([])
  }

  const selectAllProducts = () => {
    setSelectedProducts(products.map((p: any) => p.id))
  }

  const deselectAllProducts = () => {
    setSelectedProducts([])
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Price Management"
      side="bottom"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Operation Type *
          </label>
          <Select
            value={operation}
            onChange={(e) =>
              setOperation(e.target.value as any)
            }
            required
            className="text-gray-900 bg-white"
          >
            <option value="SET_FIXED_PRICE">Set Fixed Price</option>
            <option value="SET_DISCOUNT_PERCENT">Set Discount Percentage</option>
            <option value="SET_DISCOUNT_AMOUNT">Set Discount Amount</option>
          </Select>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {operation === 'SET_FIXED_PRICE'
              ? 'Fixed Price *'
              : operation === 'SET_DISCOUNT_PERCENT'
                ? 'Discount Percentage *'
                : 'Discount Amount *'}
          </label>
          <Input
            type="number"
            step={operation === 'SET_DISCOUNT_PERCENT' ? '0.1' : '0.01'}
            min="0"
            max={operation === 'SET_DISCOUNT_PERCENT' ? '100' : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            placeholder={
              operation === 'SET_FIXED_PRICE'
                ? '22.99'
                : operation === 'SET_DISCOUNT_PERCENT'
                  ? '10'
                  : '2.00'
            }
          />
          {operation === 'SET_DISCOUNT_PERCENT' && (
            <p className="mt-1 text-sm text-gray-500">
              Enter percentage (e.g., 10 for 10% off)
            </p>
          )}
        </div>

        {/* Customer Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Customers * ({selectedCustomers.length} selected)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllCustomers}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAllCustomers}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            {customers.map((customer: any) => (
              <label
                key={customer.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => toggleCustomer(customer.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  {customer.businessName} ({customer.email})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Products * ({selectedProducts.length} selected)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllProducts}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAllProducts}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            {products.map((product: any) => (
              <label
                key={product.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  {product.name} ({product.sku}) - ${Number(product.price).toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes (Optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this bulk operation..."
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              Operation: <span className="font-medium">{operation.replace(/_/g, ' ')}</span>
            </div>
            <div>
              Customers: <span className="font-medium">{selectedCustomers.length}</span>
            </div>
            <div>
              Products: <span className="font-medium">{selectedProducts.length}</span>
            </div>
            <div>
              Total Overrides: <span className="font-medium">{selectedCustomers.length * selectedProducts.length}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={bulkMutation.isPending}
            className="min-w-[120px]"
          >
            {bulkMutation.isPending
              ? 'Processing...'
              : `Apply to ${selectedCustomers.length * selectedProducts.length} Overrides`}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}




