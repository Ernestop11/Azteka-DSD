import { Product } from '../types';
import { Package, Star, TrendingUp, Zap } from 'lucide-react';

interface Brand {
  name: string;
  products: Product[];
  color: string;
  logo?: string;
}

interface BrandBundlesProps {
  brands: Brand[];
}

export default function BrandBundles({ brands }: BrandBundlesProps) {
  if (brands.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Package className="w-10 h-10 text-purple-600" />
          Brand Bundles
        </h2>
        <p className="text-xl text-gray-600 font-semibold">
          Shop by your favorite brands
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand, brandIdx) => (
          <div
            key={brandIdx}
            className="group relative overflow-hidden rounded-3xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${brand.color}dd 0%, ${brand.color}88 100%)`,
              boxShadow: `0 20px 60px -10px ${brand.color}66`,
            }}
          >
            {/* Animated glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-2xl"
              style={{ background: brand.color }}
            />

            {/* Floating orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30 blur-2xl" style={{ background: brand.color }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: brand.color }} />

            <div className="relative space-y-6">
              {/* Brand Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">{brand.name}</h3>
                  <p className="text-sm text-gray-800/70 font-semibold">{brand.products.length} Products</p>
                </div>
                <div className="p-3 bg-white/90 rounded-2xl shadow-lg">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
              </div>

              {/* Product Grid Preview */}
              <div className="grid grid-cols-3 gap-3">
                {brand.products.slice(0, 6).map((product, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-white/95 rounded-xl p-2 hover:scale-110 transition-transform"
                  >
                    <img
                      src={product.imageUrl || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Bundle Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-900">Best Seller</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-xl">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-bold text-gray-900">20% OFF</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-4 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                <span>Shop Bundle</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
