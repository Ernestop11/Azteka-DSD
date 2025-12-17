import { Product } from '../lib/supabase';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface ProductBillboardProps {
  products: Product[];
  title: string;
  subtitle: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductBillboard({ products, title, subtitle, onAddToCart }: ProductBillboardProps) {
  if (products.length === 0) return null;

  const featuredProduct = products[0];

  return (
    <div className="mb-16">
      <div className="mb-6">
        <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
          <Star className="text-yellow-500 fill-yellow-500" size={36} />
          {title}
        </h2>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl group cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${featuredProduct.background_color}dd 0%, ${featuredProduct.background_color}33 100%)`
          }}
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          </div>

          <div className="relative p-8 flex items-center justify-between min-h-[400px]">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-black text-sm shadow-lg flex items-center gap-2">
                  <TrendingUp size={16} />
                  FEATURED
                </div>
              </div>

              <h3 className="text-4xl font-black text-gray-900 leading-tight">
                {featuredProduct.name}
              </h3>

              <p className="text-lg text-gray-700 leading-relaxed max-w-md">
                {featuredProduct.description}
              </p>

              <div className="flex items-end gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Wholesale Price</p>
                  <p className="text-5xl font-black text-gray-900">
                    ${featuredProduct.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => onAddToCart(featuredProduct)}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-50"
                  style={{ backgroundColor: featuredProduct.background_color }}
                />
                <img
                  src={featuredProduct.image_url}
                  alt={featuredProduct.name}
                  className="relative w-80 h-80 object-cover rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-rows-3 gap-6">
          {products.slice(1, 4).map((product) => (
            <div
              key={product.id}
              onClick={() => onAddToCart(product)}
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              style={{
                background: `linear-gradient(90deg, ${product.background_color}cc 0%, ${product.background_color}44 100%)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-6 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/90 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-lg mb-1 truncate">
                    {product.name}
                  </h4>
                  <p className="text-2xl font-black text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Zap size={24} className="text-white fill-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
