import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Product } from '../types';
import { ShoppingCart, Package, Sparkles, Zap, Award, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import AddToCartModal from './AddToCartModal';

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discount_percentage: number;
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddMultiple?: (items: Array<{ product: Product; quantity: number }>) => void;
  bundles?: Bundle[];
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

type PriceTier = 'value' | 'premium' | 'elite';

export default function ProductCard({ product, onAddToCart, onAddMultiple, bundles = [], promotion }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const PromotionIcon = promotion ? promotionIcons[promotion.icon_type] || Sparkles : null;
  const apiBase = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://77.243.85.8:3000';
  const imageSrc = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : product.image_url.startsWith('/')
        ? `${apiBase}${product.image_url}`
        : `${apiBase}/${product.image_url}`
    : '';

  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleModalConfirm = (items: Array<{ product: Product; quantity: number }>) => {
    if (onAddMultiple && items.length > 1) {
      onAddMultiple(items);
    } else if (items.length === 1) {
      // Add single item with quantity
      for (let i = 0; i < items[0].quantity; i++) {
        onAddToCart(items[0].product);
      }
    }
  };

  const priceValue = Number(product.price) || 0;
  const priceTier = useMemo<PriceTier>(() => {
    if (priceValue < 18) return 'value';
    if (priceValue < 40) return 'premium';
    return 'elite';
  }, [priceValue]);

  const priceTierLabel: Record<PriceTier, string> = {
    value: 'Value Tier',
    premium: 'Premium Tier',
    elite: 'Elite Tier',
  };

  const priceTierCopy: Record<PriceTier, string> = {
    value: 'Perfect for margin stacking & fast turns.',
    premium: 'Higher ticket favorites for curated shelves.',
    elite: 'Hero SKUs fueling flagship displays.',
  };

  const neonColor = promotion?.badge_color ?? '#16FFBD';
  const neonStyle = useMemo<CSSProperties>(() => ({ '--deal-color': neonColor } as CSSProperties), [neonColor]);
  const showDealTag = promotion || product.featured;

  return (
    <>
      {showModal && (
        <AddToCartModal
          product={product}
          bundles={bundles}
          onClose={() => setShowModal(false)}
          onConfirm={handleModalConfirm}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="group shimmer-border shadow-pulse tablet-performance-card relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/80 to-white/60 shadow-lg transition-all duration-500 hover:scale-[1.01] laptop:hover:scale-[1.02] hover:shadow-2xl"
        style={{
          background:
            product.background_gradient ||
            `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)` ||
            '#FFF',
          boxShadow: product.featured ? '0 15px 50px rgba(5, 6, 10, 0.2)' : undefined,
        }}
      >
        {showDealTag && (
          <span className="neon-deal-tag" style={neonStyle}>
            {promotion?.badge_text || 'Dealer Deal'}
          </span>
        )}
        <div className="card-gloss-overlay" aria-hidden="true" />
        <div className="sparkle-layer sparkle-layer--card" aria-hidden="true" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-48 w-48 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/25 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-44 w-44 translate-y-1/3 -translate-x-1/3 rounded-full bg-black/5 blur-2xl" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative p-6">
          <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-inner">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${product.background_color}88 0%, transparent 70%)`
              }}
          />
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="relative w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 group-hover:rotate-2 drop-shadow-2xl"
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500">
              No Image Available
            </div>
          )}
          <div className="reflection-overlay rounded-2xl" aria-hidden="true" />
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
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Wholesale Price</p>
                <p className="text-3xl font-black text-gray-900">
                  ${priceValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">per {product.unit_type}</p>
              </div>
              <div className="price-tier text-left" data-tier={priceTier}>
                <span className="text-xs uppercase tracking-wide text-slate-700">{priceTierLabel[priceTier]}</span>
                <span className="text-[0.7rem] font-semibold leading-tight text-slate-700">
                  {priceTierCopy[priceTier]}
                </span>
              </div>

              <button
                onClick={handleAddClick}
                disabled={!product.in_stock}
                className="tablet-hit-target group/btn relative px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
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

          {/* Upsell Bundles Section */}
          {bundles && bundles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-300/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500" />
                <h4 className="text-sm font-bold text-gray-900">Upsell Bundles</h4>
              </div>
              <div className="space-y-2">
                {bundles.slice(0, 3).map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddMultiple) {
                        onAddMultiple(bundle.products.map(p => ({ product: p, quantity: 1 })));
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-all group/bundle"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{bundle.name}</p>
                        {bundle.discount_percentage > 0 && (
                          <p className="text-xs text-amber-700 font-semibold">
                            {bundle.discount_percentage}% OFF
                          </p>
                        )}
                      </div>
                      <ShoppingCart size={14} className="text-amber-600 group-hover/bundle:scale-110 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </>
  );
}
