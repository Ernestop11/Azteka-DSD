import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

interface FilterSidebarProps {
  brands: Brand[];
  categories: Category[];
  selectedBrands: string[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onBrandToggle: (brandId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onSubcategoryToggle: (subcategoryId: string) => void;
  onClearAll: () => void;
}

export default function FilterSidebar({
  brands,
  categories,
  selectedBrands,
  selectedCategories,
  selectedSubcategories,
  onBrandToggle,
  onCategoryToggle,
  onSubcategoryToggle,
  onClearAll,
}: FilterSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showBrands, setShowBrands] = useState(true);
  const [showCategories, setShowCategories] = useState(true);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const activeFiltersCount = selectedBrands.length + selectedCategories.length + selectedSubcategories.length;

  return (
    <div className="glass-panel h-full w-full overflow-y-auto border-r border-white/10 bg-slate-900/40 text-white tablet:w-80">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/70 px-5 py-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Filters</h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-sm font-bold text-rose-200 hover:text-rose-100"
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <p className="text-sm text-white/70">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </p>
        )}
      </div>

      <div className="space-y-6 p-5">
        <div>
          <button
            onClick={() => setShowBrands(!showBrands)}
            className="group mb-3 flex w-full items-center justify-between"
          >
            <h3 className="text-lg font-black text-white">Brands</h3>
            {showBrands ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showBrands && (
            <div className="space-y-2">
              {brands.map(brand => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => onBrandToggle(brand.id)}
                    className="h-5 w-5 rounded border-white/40 text-emerald-300 focus:ring-emerald-200"
                  />
                  <span className="text-sm font-semibold text-white/90">{brand.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="group mb-3 flex w-full items-center justify-between"
          >
            <h3 className="text-lg font-black text-white">Categories</h3>
            {showCategories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showCategories && (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition-all hover:border-white/20 hover:bg-white/10">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => onCategoryToggle(category.id)}
                        className="h-5 w-5 rounded border-white/40 text-emerald-300 focus:ring-emerald-200"
                      />
                      <span className="text-sm font-bold text-white">{category.name}</span>
                    </label>

                    {category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="rounded-lg p-2 text-white/80 hover:bg-white/10"
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    )}
                  </div>

                  {expandedCategories.includes(category.id) && category.subcategories.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {category.subcategories.map(subcategory => (
                        <label
                          key={subcategory.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm transition-all hover:border-white/20 hover:bg-white/10"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onChange={() => onSubcategoryToggle(subcategory.id)}
                            className="h-4 w-4 rounded border-white/40 text-emerald-300 focus:ring-emerald-200"
                          />
                          <span className="text-white/80">{subcategory.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
