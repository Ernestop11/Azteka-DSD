import { Category } from '../types';
import { Package, Candy, Cookie, Zap } from 'lucide-react';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  productCounts: Record<string, number>;
}

const categoryIcons: Record<string, any> = {
  beverages: Zap,
  snacks: Package,
  candy: Candy,
  'cookies-baked-goods': Cookie,
};

export default function CategoryTabs({ categories, selectedCategory, onSelectCategory, productCounts }: CategoryTabsProps) {
  return (
    <div className="sticky top-[73px] z-30 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 shadow-[0_30px_60px_rgba(5,6,10,0.35)]">
      <div className="max-w-7xl mx-auto px-4 tablet:px-6">
        <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
          <button
            onClick={() => onSelectCategory(null)}
            className={`tablet-hit-target flex-shrink-0 rounded-2xl px-6 text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-xl scale-105'
                : 'glass-bar text-slate-100 hover:bg-white/25'
            }`}
          >
            All Products
          </button>

          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || Package;
            const count = productCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`tablet-hit-target flex-shrink-0 flex items-center gap-2 rounded-2xl px-6 text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-xl scale-105'
                    : 'glass-bar text-slate-100 hover:bg-white/25 hover:scale-105'
                }`}
              >
                <Icon size={20} />
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  selectedCategory === category.id
                    ? 'bg-white/30 text-white shadow-md'
                    : 'bg-white/20 text-white'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
