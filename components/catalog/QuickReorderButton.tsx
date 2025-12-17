'use client'

import { useState, useEffect } from 'react'
import { History, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '@/hooks/useCart'

interface QuickReorderButtonProps {
  productId: string
  productName: string
}

interface LastOrder {
  quantity: number
  orderDate: string
  orderId: string
}

export default function QuickReorderButton({
  productId,
  productName,
}: QuickReorderButtonProps) {
  const { add } = useCart()
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null)

  // Fetch last order for this product
  const { data: orderData } = useQuery<LastOrder | null>({
    queryKey: ['last-order', productId],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API endpoint
        const res = await fetch(`/api/orders/last?productId=${productId}`)
        if (!res.ok) return null
        const data = await res.json()
        return data
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (orderData) {
      setLastOrder(orderData)
    }
  }, [orderData])

  const handleReorder = () => {
    if (lastOrder) {
      // Add product to cart with last ordered quantity
      add({
        id: productId,
        name: productName,
        price: 0, // Will be fetched from product data
        quantity: lastOrder.quantity,
        imageUrl: undefined,
      })
    }
  }

  if (!lastOrder) return null

  return (
    <button
      onClick={handleReorder}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm transition-colors"
      title={`Reorder ${lastOrder.quantity} units from last order`}
    >
      <History className="w-4 h-4" />
      <span>Reorder ({lastOrder.quantity})</span>
    </button>
  )
}

