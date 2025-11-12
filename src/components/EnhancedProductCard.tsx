import { motion } from 'framer-motion';
import { ShoppingCart, Package, TrendingUp, Star } from 'lucide-react';
import { Product } from '../types';

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  discount?: number;
  badge?: string;
}

export default function EnhancedProductCard({ product, onAddToCart, discount, badge }: EnhancedProductCardProps) {
  const finalPrice = discount ? product.price * (1 - discount / 100) : product.price;
  const hasDiscount = Boolean(discount && discount > 0);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
    >
      {badge && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg rotate-3">
          {badge}
        </div>
      )}

      {product.featured && !badge && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          HOT
        </div>
      )}

      <div
        className="relative h-56 overflow-hidden"
        style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
      >
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {product.supplier}
            </span>
            {product.inStock ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="text-xs font-semibold text-red-600">Out of Stock</span>
            )}
          </div>

          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <Package className="w-4 h-4" />
          <span className="font-medium">
            {product.unitsPerCase} units/case • Min {product.minOrderQty}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <div className="space-y-1">
                <div className="text-sm text-gray-500 line-through font-medium">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                  ${finalPrice.toFixed(2)}
                  <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded-full">
                    -{discount}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-3xl font-black text-gray-900">
                ${product.price.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-gray-500 font-medium mt-1">per case</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
              product.inStock
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </motion.button>
        </div>

        {product.margin && product.margin > 25 && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700">
              High Margin: {product.margin}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
