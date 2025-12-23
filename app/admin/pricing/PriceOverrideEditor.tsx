'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Drawer from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface PriceOverride {
  id?: string
  customerId: string
  productId: string
  overrideType: 'FIXED_PRICE' | 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'TIERED'
  fixedPrice?: number | null
  discountPercent?: number | null
  discountAmount?: number | null
  minQuantity?: number | null
  maxQuantity?: number | null
  contractNumber?: string | null
  notes?: string | null
  startDate?: string | null
  endDate?: string | null
  active: boolean
  customer?: {
    id: string
    businessName: string
  }
  product?: {
    id: string
    name: string
    sku: string
    price: number
  }
}

interface PriceOverrideEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  override?: PriceOverride | null
}

export default function PriceOverrideEditor({
  isOpen,
  onClose,
  onSave,
  override,
}: PriceOverrideEditorProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<PriceOverride>>({
    customerId: '',
    productId: '',
    overrideType: 'FIXED_PRICE',
    fixedPrice: null,
    discountPercent: null,
    discountAmount: null,
    minQuantity: null,
    maxQuantity: null,
    contractNumber: '',
    notes: '',
    startDate: '',
    endDate: '',
    active: true,
  })

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

  // Load override data when editing
  useEffect(() => {
    if (override) {
      setFormData({
        customerId: override.customerId,
        productId: override.productId,
        overrideType: override.overrideType,
        fixedPrice: override.fixedPrice || null,
        discountPercent: override.discountPercent || null,
        discountAmount: override.discountAmount || null,
        minQuantity: override.minQuantity || null,
        maxQuantity: override.maxQuantity || null,
        contractNumber: override.contractNumber || '',
        notes: override.notes || '',
        startDate: override.startDate
          ? new Date(override.startDate).toISOString().split('T')[0]
          : '',
        endDate: override.endDate
          ? new Date(override.endDate).toISOString().split('T')[0]
          : '',
        active: override.active,
      })
    } else {
      // Reset form for new override
      setFormData({
        customerId: '',
        productId: '',
        overrideType: 'FIXED_PRICE',
        fixedPrice: null,
        discountPercent: null,
        discountAmount: null,
        minQuantity: null,
        maxQuantity: null,
        contractNumber: '',
        notes: '',
        startDate: '',
        endDate: '',
        active: true,
      })
    }
  }, [override, isOpen])

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PriceOverride>) => {
      const url = override?.id
        ? `/api/admin/price-overrides/${override.id}`
        : '/api/admin/price-overrides'
      const method = override?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save price override')
      }

      return res.json()
    },
    onSuccess: () => {
      toast('Price override saved successfully', 'success')
      onSave()
    },
    onError: (error: Error) => {
      toast(error.message || 'Failed to save price override', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.customerId || !formData.productId) {
      toast('Please select a customer and product', 'error')
      return
    }

    if (formData.overrideType === 'FIXED_PRICE' && !formData.fixedPrice) {
      toast('Fixed price is required for FIXED_PRICE override', 'error')
      return
    }

    if (
      formData.overrideType === 'PERCENTAGE_DISCOUNT' &&
      !formData.discountPercent
    ) {
      toast(
        'Discount percentage is required for PERCENTAGE_DISCOUNT override',
        'error'
      )
      return
    }

    if (
      formData.overrideType === 'FIXED_DISCOUNT' &&
      !formData.discountAmount
    ) {
      toast(
        'Discount amount is required for FIXED_DISCOUNT override',
        'error'
      )
      return
    }

    const submitData = {
      ...formData,
      fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice.toString()) : null,
      discountPercent: formData.discountPercent
        ? parseFloat(formData.discountPercent.toString())
        : null,
      discountAmount: formData.discountAmount
        ? parseFloat(formData.discountAmount.toString())
        : null,
      minQuantity: formData.minQuantity
        ? parseInt(formData.minQuantity.toString())
        : null,
      maxQuantity: formData.maxQuantity
        ? parseInt(formData.maxQuantity.toString())
        : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    }

    saveMutation.mutate(submitData)
  }

  const selectedProduct = products.find((p: any) => p.id === formData.productId)
  const basePrice = selectedProduct ? Number(selectedProduct.price) : 0

  // Calculate preview price
  const getPreviewPrice = () => {
    if (!basePrice) return null

    switch (formData.overrideType) {
      case 'FIXED_PRICE':
        return formData.fixedPrice || basePrice
      case 'PERCENTAGE_DISCOUNT':
        return (
          basePrice *
          (1 - (formData.discountPercent || 0) / 100)
        )
      case 'FIXED_DISCOUNT':
        return basePrice - (formData.discountAmount || 0)
      case 'TIERED':
        return formData.fixedPrice || basePrice
      default:
        return basePrice
    }
  }

  const previewPrice = getPreviewPrice()
  const discount = previewPrice ? basePrice - previewPrice : 0
  const discountPercent = previewPrice ? (discount / basePrice) * 100 : 0

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Price Override Editor">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Customer *
          </label>
          <Select
            value={formData.customerId || ''}
            onChange={(e) =>
              setFormData({ ...formData, customerId: e.target.value })
            }
            required
            className="text-gray-900 bg-white"
          >
            <option value="">Select a customer</option>
            {customers.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.businessName} ({customer.email})
              </option>
            ))}
          </Select>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Product *
          </label>
          <Select
            value={formData.productId || ''}
            onChange={(e) =>
              setFormData({ ...formData, productId: e.target.value })
            }
            required
            className="text-gray-900 bg-white"
          >
            <option value="">Select a product</option>
            {products.map((product: any) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) - ${Number(product.price).toFixed(2)}
              </option>
            ))}
          </Select>
          {selectedProduct && (
            <p className="mt-1 text-sm text-gray-500">
              Base price: ${basePrice.toFixed(2)}
            </p>
          )}
        </div>

        {/* Override Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Override Type *
          </label>
          <Select
            value={formData.overrideType || 'FIXED_PRICE'}
            onChange={(e) =>
              setFormData({
                ...formData,
                overrideType: e.target.value as any,
              })
            }
            required
            className="text-gray-900 bg-white"
          >
            <option value="FIXED_PRICE">Fixed Price</option>
            <option value="PERCENTAGE_DISCOUNT">Percentage Discount</option>
            <option value="FIXED_DISCOUNT">Fixed Discount Amount</option>
            <option value="TIERED">Tiered Pricing (Volume)</option>
          </Select>
        </div>

        {/* Override Value Fields */}
        {formData.overrideType === 'FIXED_PRICE' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fixed Price *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.fixedPrice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fixedPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              required
              placeholder="22.99"
            />
          </div>
        )}

        {formData.overrideType === 'PERCENTAGE_DISCOUNT' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Discount Percentage *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.discountPercent || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountPercent: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              required
              placeholder="10"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter percentage (e.g., 10 for 10% off)
            </p>
          </div>
        )}

        {formData.overrideType === 'FIXED_DISCOUNT' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Discount Amount *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.discountAmount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              required
              placeholder="2.00"
            />
          </div>
        )}

        {formData.overrideType === 'TIERED' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Fixed Price for Tier *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.fixedPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fixedPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                required
                placeholder="22.99"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Min Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minQuantity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minQuantity: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.maxQuantity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxQuantity: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </>
        )}

        {/* Quantity Range (for non-tiered) */}
        {formData.overrideType !== 'TIERED' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum Quantity (Optional)
            </label>
            <Input
              type="number"
              min="0"
              value={formData.minQuantity || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minQuantity: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              placeholder="Leave empty for all quantities"
            />
            <p className="mt-1 text-sm text-gray-500">
              This override will only apply if customer orders at least this
              quantity
            </p>
          </div>
        )}

        {/* Contract Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Contract Number
          </label>
          <Input
            type="text"
            value={formData.contractNumber || ''}
            onChange={(e) =>
              setFormData({ ...formData, contractNumber: e.target.value })
            }
            placeholder="CONTRACT-123"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes
          </label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes about this price override..."
            rows={3}
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Start Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              End Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) =>
              setFormData({ ...formData, active: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-900">
            Active (override is currently in effect)
          </label>
        </div>

        {/* Price Preview */}
        {selectedProduct && previewPrice !== null && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Price Preview
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-mono">${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Price:</span>
                <span className="font-mono font-semibold text-green-600">
                  ${previewPrice.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-mono text-green-600">
                    -${discount.toFixed(2)} ({discountPercent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="min-w-[100px]"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}




