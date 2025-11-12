import { motion } from 'framer-motion';
import { Package, Zap, Gift, ShoppingBag, Coffee, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  count?: number;
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All Products',
    icon: <ShoppingBag className="w-8 h-8" />,
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    count: 156,
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: <Coffee className="w-8 h-8" />,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    count: 42,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: <Package className="w-8 h-8" />,
    color: '#EF4444',
    gradient: 'from-red-500 to-pink-600',
    count: 38,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: <Sparkles className="w-8 h-8" />,
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-600',
    count: 45,
  },
  {
    id: 'bundles',
    name: 'Rack Bundles',
    icon: <Gift className="w-8 h-8" />,
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
    count: 8,
  },
  {
    id: 'specials',
    name: 'Weekly Specials',
    icon: <Zap className="w-8 h-8" />,
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    count: 12,
  },
];

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryGrid({ selectedCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category.id;

        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectCategory(category.id)}
            className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
              isSelected
                ? 'ring-4 ring-offset-2 ring-offset-gray-50 shadow-2xl scale-105'
                : 'hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                : 'white',
              ringColor: isSelected ? category.color : undefined,
            }}
          >
            <div className={`flex flex-col items-center gap-3 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              <div
                className={`p-3 rounded-xl ${
                  isSelected ? 'bg-white/20' : `bg-gradient-to-br ${category.gradient}`
                }`}
              >
                <div className={isSelected ? 'text-white' : 'text-white'}>
                  {category.icon}
                </div>
              </div>

              <div className="text-center">
                <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {category.name}
                </div>
                {category.count && (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.count} items
                  </div>
                )}
              </div>
            </div>

            {isSelected && (
              <motion.div
                layoutId="categoryIndicator"
                className="absolute inset-0 border-4 border-white rounded-2xl pointer-events-none"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
