import { Product } from '../types';
import { Sparkles, TrendingUp, Zap, Star } from 'lucide-react';

interface ProductBillboard2Props {
  products: Product[];
  title: string;
  subtitle?: string;
  variant?: 'default' | 'large' | 'grid';
}

export default function ProductBillboard2({ products, title, subtitle, variant = 'default' }: ProductBillboard2Props) {
  if (products.length === 0) return null;

  // Large billboard style - one huge product
  if (variant === 'large' && products.length > 0) {
    const product = products[0];
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Product Info */}
          <div className="space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Star className="w-4 h-4 fill-white" />
              <span className="text-sm font-bold">Featured Product</span>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xl text-white/90 font-semibold">{subtitle}</p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-black">{product.name}</h3>
              <p className="text-lg text-white/80">{product.description}</p>

              <div className="flex items-end gap-4">
                <div>
                  <p className="text-sm text-white/70">Only</p>
                  <p className="text-5xl font-black">${product.price.toFixed(2)}</p>
                </div>
                <button className="px-8 py-4 bg-white text-purple-600 font-black rounded-2xl hover:bg-yellow-300 hover:text-purple-900 transition-all transform hover:scale-105 shadow-2xl">
                  Shop Now →
                </button>
              </div>
            </div>
          </div>

          {/* Right: Giant Product Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl" />
            <img
              src={product.imageUrl || '/placeholder-product.png'}
              alt={product.name}
              className="relative w-full h-auto object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid variant - 2x2 grid
  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 font-semibold">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product, idx) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-6 hover:scale-105 transition-all cursor-pointer"
              style={{
                background: idx === 0 ? 'linear-gradient(135deg, #FF6B6B, #FF8B94)' :
                           idx === 1 ? 'linear-gradient(135deg, #4ECDC4, #95E1D3)' :
                           idx === 2 ? 'linear-gradient(135deg, #FFE66D, #FFD6A5)' :
                           'linear-gradient(135deg, #AA96DA, #FCBAD3)'
              }}
            >
              <div className="aspect-square bg-white/90 rounded-xl mb-4 p-4 flex items-center justify-center">
                <img
                  src={product.imageUrl || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{product.name}</h3>
              <p className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Horizontal scroll
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            {title}
          </h2>
          {subtitle && <p className="text-lg text-gray-600 font-semibold mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-6 min-w-max">
          {products.slice(0, 8).map((product, idx) => (
            <div
              key={product.id}
              className="group relative w-64 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 p-6 hover:scale-105 transition-all cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#95E1D3', '#F38181', '#AA96DA'][idx % 8]}dd, ${['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#95E1D3', '#F38181', '#AA96DA'][idx % 8]}88)`
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="aspect-square bg-white/90 rounded-xl mb-4 p-4 flex items-center justify-center">
                  <img
                    src={product.imageUrl || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-800/80 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-black text-gray-900">${product.price.toFixed(2)}</p>
                  <button className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
