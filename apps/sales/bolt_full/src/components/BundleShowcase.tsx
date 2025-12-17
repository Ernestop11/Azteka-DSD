import { Package, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  description: string;
  image_url: string;
  badge_text: string;
  badge_color: string;
  discount_percent: number;
}

interface BundleShowcaseProps {
  bundles: Bundle[];
  onSelectBundle: (bundle: Bundle) => void;
}

export default function BundleShowcase({ bundles, onSelectBundle }: BundleShowcaseProps) {
  if (bundles.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Package className="text-emerald-600" size={36} />
            Product Bundles
          </h2>
          <p className="text-gray-600 text-lg">Save big with our curated product collections</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bundles.map((bundle, index) => (
          <div
            key={bundle.id}
            onClick={() => onSelectBundle(bundle)}
            className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="aspect-[4/3] relative">
              <img
                src={bundle.image_url}
                alt={bundle.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="absolute top-4 right-4">
                <div
                  className="px-4 py-2 rounded-full font-black text-white shadow-lg flex items-center gap-2"
                  style={{ backgroundColor: bundle.badge_color }}
                >
                  <Sparkles size={16} />
                  {bundle.badge_text}
                </div>
              </div>

              {bundle.discount_percent > 0 && (
                <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white leading-none">{bundle.discount_percent}%</p>
                    <p className="text-xs font-bold text-white">OFF</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white drop-shadow-lg">
                  {bundle.name}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {bundle.description}
                </p>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group/btn">
                  <span>View Bundle</span>
                  <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
