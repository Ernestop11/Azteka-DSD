'use client'

import { useState } from 'react'
import { CartItem } from '@/store/cart'
import { Trash2 } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface CartItemRowProps {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  onSetQuantity?: (quantity: number) => void
}

export default function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onSetQuantity,
}: CartItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleQuantityClick = () => {
    if (onSetQuantity) {
      setInputValue(String(item.quantity))
      setIsEditing(true)
    }
  }

  const handleQuantitySubmit = () => {
    const newQty = parseInt(inputValue) || 0
    if (onSetQuantity) {
      onSetQuantity(newQty)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      {/* Image */}
      <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded overflow-hidden">
        <img
          src={getPublicImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="10"%3EProduct%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm md:text-base text-gray-900 truncate">
          {item.name}
        </h4>
        <p className="text-sm text-gray-600">
          ${(item.price || 0).toFixed(2)} per case
        </p>
        {(item as any).unitsPerCase && (
          <p className="text-xs text-gray-500">
            {item.quantity} case{item.quantity !== 1 ? 's' : ''} • {(item.quantity * ((item as any).unitsPerCase || 1))} units
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border border-gray-300 rounded-md">
          <button
            onClick={onDecrement}
            className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
            aria-label="Decrease quantity"
          >
            −
          </button>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleQuantitySubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuantitySubmit()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              autoFocus
              className="w-12 px-1 py-1 text-sm font-medium text-center border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <button
              onClick={handleQuantityClick}
              className="px-2 py-1 text-sm font-medium min-w-[2ch] text-center hover:bg-gray-100 transition-colors cursor-text"
              title="Click to edit quantity"
            >
              {item.quantity}
            </button>
          )}
          <button
            onClick={onIncrement}
            className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

