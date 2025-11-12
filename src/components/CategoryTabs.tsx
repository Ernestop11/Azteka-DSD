import { Category } from '../lib/supabase';
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
    <div className="sticky top-[73px] z-30 bg-white border-b-2 border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <Icon size={20} />
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  selectedCategory === category.id
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-200 text-gray-700'
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
