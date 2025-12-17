import { useState } from 'react';
import { Minus, Plus, Trash2, Heart, Package } from 'lucide-react';

interface CartItemProps {
  item: {
    productId: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    quantity: number;
    price: number;
    pricePerUnit?: number;
    unitsPerCase?: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSaveForLater?: (productId: string) => void;
  showUnitToggle?: boolean;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  showUnitToggle = true,
}: CartItemProps) {
  const [isByCase, setIsByCase] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const displayQuantity = isByCase ? item.quantity : item.quantity * (item.unitsPerCase || 24);
  const displayPrice = isByCase ? item.price : item.pricePerUnit || item.price / (item.unitsPerCase || 24);
  const lineTotal = item.quantity * item.price;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    const finalQuantity = isByCase ? newQuantity : Math.ceil(newQuantity / (item.unitsPerCase || 24));
    onUpdateQuantity(item.productId, finalQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
    }, 300);
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 ${
        isRemoving ? 'opacity-0 translate-x-full' : 'opacity-100'
      }`}
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.imageUrl || '/product-placeholder.svg'}
            alt={item.name}
            className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
            onError={(e) => {
              e.currentTarget.src = '/product-placeholder.svg';
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
              {item.brand && <p className="text-sm text-gray-600">{item.brand}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900">
                ${lineTotal.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                ${displayPrice.toFixed(2)} per {isByCase ? 'case' : 'unit'}
              </div>
            </div>
          </div>

          {/* Case/Unit Toggle */}
          {showUnitToggle && item.unitsPerCase && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsByCase(true)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                  isByCase
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                By Case
              </button>
              <button
                onClick={() => setIsByCase(false)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                  !isByCase
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                By Unit
              </button>
              <span className="text-xs text-gray-500">
                ({item.unitsPerCase} units/case)
              </span>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleQuantityChange(displayQuantity - 1)}
                className="px-3 py-2 hover:bg-gray-100 transition"
                disabled={displayQuantity <= 1}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={displayQuantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-16 text-center font-semibold outline-none"
                min="1"
              />
              <button
                onClick={() => handleQuantityChange(displayQuantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onSaveForLater && (
                <button
                  onClick={() => onSaveForLater(item.productId)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition flex items-center gap-2"
                >
                  <Heart size={16} />
                  Save for Later
                </button>
              )}
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
