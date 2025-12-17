import { Category } from '../lib/supabase';
import { ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  category: Category;
  onSelect: (category: Category) => void;
  productCount: number;
}

export default function CategorySection({ category, onSelect, productCount }: CategorySectionProps) {
  return (
    <div
      onClick={() => onSelect(category)}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
    >
      <div className="aspect-[21/9] relative">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white drop-shadow-2xl">
            {category.name}
          </h2>
          <p className="text-lg text-white/90 max-w-md leading-relaxed drop-shadow-lg">
            {category.description}
          </p>
          <p className="text-sm text-white/80 font-semibold pt-2">
            {productCount} Products Available
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-2xl group-hover:bg-white/30 transition-all duration-300">
          <span className="text-white font-bold text-lg">Shop Now</span>
          <ChevronRight className="text-white transform group-hover:translate-x-2 transition-transform duration-300" size={24} />
        </div>
      </div>
    </div>
  );
}
