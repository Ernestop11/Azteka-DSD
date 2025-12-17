'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface CaseQuantitySelectorProps {
  product: {
    id: string
    name: string
    unitsPerCase: number
    price: number
  }
  onQuantityChange: (cases: number, totalUnits: number, totalPrice: number) => void
  initialCases?: number
}

export default function CaseQuantitySelector({
  product,
  onQuantityChange,
  initialCases = 0,
}: CaseQuantitySelectorProps) {
  const [cases, setCases] = useState(initialCases)
  const totalUnits = cases * product.unitsPerCase
  const totalPrice = cases * product.price * product.unitsPerCase

  const handleIncrement = () => {
    const newCases = cases + 1
    setCases(newCases)
    onQuantityChange(newCases, newCases * product.unitsPerCase, newCases * product.price * product.unitsPerCase)
  }

  const handleDecrement = () => {
    if (cases > 0) {
      const newCases = cases - 1
      setCases(newCases)
      onQuantityChange(newCases, newCases * product.unitsPerCase, newCases * product.price * product.unitsPerCase)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    const newCases = Math.max(0, value)
    setCases(newCases)
    onQuantityChange(newCases, newCases * product.unitsPerCase, newCases * product.price * product.unitsPerCase)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Cases
        </label>
        <span className="text-xs text-gray-500">
          {product.unitsPerCase} units/case
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={cases === 0}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease cases"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          value={cases}
          onChange={handleInputChange}
          min="0"
          className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          onClick={handleIncrement}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Increase cases"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {cases > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Units:</span>
            <span className="font-semibold">{totalUnits}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Price:</span>
            <span className="font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

