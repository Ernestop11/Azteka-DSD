import { Package, ShoppingCart, Tag, Percent } from 'lucide-react';

interface BundleItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCase?: number | null;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  discountPercent: number | string;
  badgeText?: string | null;
  badgeColor?: string | null;
  items: BundleItem[];
  brand?: {
    name: string;
    logoUrl?: string | null;
  } | null;
  category?: {
    name: string;
  } | null;
}

interface BundleCardProps {
  bundle: Bundle;
  onAddToCart: (bundle: Bundle) => void;
  onViewDetails?: (bundle: Bundle) => void;
}

export default function BundleCard({ bundle, onAddToCart, onViewDetails }: BundleCardProps) {
  const price = typeof bundle.price === 'string' ? parseFloat(bundle.price) : bundle.price;
  const discountPercent = typeof bundle.discountPercent === 'string'
    ? parseFloat(bundle.discountPercent)
    : bundle.discountPercent;

  // Calculate total individual price
  const totalIndividualPrice = bundle.items.reduce((sum, item) => {
    const itemPrice = item.product.priceCase || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Calculate actual savings
  const savings = totalIndividualPrice - price;
  const actualDiscountPercent = totalIndividualPrice > 0
    ? ((savings / totalIndividualPrice) * 100).toFixed(0)
    : discountPercent.toFixed(0);

  const itemCount = bundle.items.length;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(bundle);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(bundle);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-emerald-500 group"
    >
      {/* Bundle Image with Badge */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden">
        {bundle.imageUrl ? (
          <img
            src={bundle.imageUrl}
            alt={bundle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={64} className="text-emerald-400" />
          </div>
        )}

        {/* Discount Badge (Top Right) */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
            <Percent size={14} />
            <span>{actualDiscountPercent}% OFF</span>
          </div>
        )}

        {/* Custom Badge (Top Left) */}
        {bundle.badgeText && (
          <div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full font-bold text-sm text-white shadow-lg"
            style={{ backgroundColor: bundle.badgeColor || '#10b981' }}
          >
            {bundle.badgeText}
          </div>
        )}

        {/* Item Count Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold text-sm text-gray-700 shadow-md flex items-center gap-1.5">
          <Package size={14} className="text-emerald-600" />
          <span>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
        </div>
      </div>

      {/* Bundle Details */}
      <div className="p-4">
        {/* Brand */}
        {bundle.brand && (
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            {bundle.brand.name}
          </div>
        )}

        {/* Bundle Name */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {bundle.name}
        </h3>

        {/* Description */}
        {bundle.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {bundle.description}
          </p>
        )}

        {/* Category */}
        {bundle.category && (
          <div className="text-xs text-gray-500 mb-3">
            {bundle.category.name}
          </div>
        )}

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-emerald-600">
              ${price.toFixed(2)}
            </span>
            {savings > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ${totalIndividualPrice.toFixed(2)}
              </span>
            )}
          </div>

          {savings > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Tag size={14} className="text-emerald-600" />
              <span className="text-emerald-700 font-semibold">
                Save ${savings.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <ShoppingCart size={18} />
          <span>Add Bundle to Cart</span>
        </button>

        {/* View Details Link */}
        {onViewDetails && (
          <button
            onClick={handleCardClick}
            className="w-full mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            View Bundle Details →
          </button>
        )}
      </div>
    </div>
  );
}
