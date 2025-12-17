import { Product } from '../lib/supabase';
import { ShoppingCart, Package, Sparkles, Zap, Award, Trophy } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  promotion?: {
    badge_text: string;
    badge_color: string;
    icon_type: string;
    points: number;
  };
}

const promotionIcons: Record<string, any> = {
  sparkles: Sparkles,
  zap: Zap,
  award: Award,
  trophy: Trophy,
};

export default function ProductCard({ product, onAddToCart, promotion }: ProductCardProps) {
  const PromotionIcon = promotion ? promotionIcons[promotion.icon_type] || Sparkles : null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)`
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6">
        <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm shadow-inner relative">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${product.background_color}88 0%, transparent 70%)`
            }}
          />
          <img
            src={product.image_url}
            alt={product.name}
            className="relative w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 group-hover:rotate-2 drop-shadow-2xl"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight">
              {product.name}
            </h3>
            {promotion && PromotionIcon && (
              <div
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-black text-white shadow-md flex items-center gap-1 animate-pulse"
                style={{ backgroundColor: promotion.badge_color }}
              >
                <PromotionIcon size={12} />
                {promotion.badge_text}
              </div>
            )}
            {!promotion && product.featured && (
              <span className="flex-shrink-0 px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-md">
                FEATURED
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package size={16} className="flex-shrink-0" />
            <span className="font-medium">
              {product.units_per_case} units per {product.unit_type}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-300/50">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Wholesale Price</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">per {product.unit_type}</p>
              </div>

              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.in_stock}
                className="group/btn relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span>{product.in_stock ? 'Add' : 'Out of Stock'}</span>
                </div>
              </button>
            </div>
          </div>

          {promotion && promotion.points > 0 && (
            <div className="mt-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-black rounded-lg text-center shadow-md flex items-center justify-center gap-2">
              <Trophy size={16} />
              Earn {promotion.points} Bonus Points!
            </div>
          )}

          {!product.in_stock && (
            <div className="mt-2 px-3 py-2 bg-red-100 border border-red-300 text-red-800 text-sm font-semibold rounded-lg text-center">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
