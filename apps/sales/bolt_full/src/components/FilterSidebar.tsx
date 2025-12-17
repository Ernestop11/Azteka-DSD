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
    <div className="w-72 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-gray-900">Filters</h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <p className="text-sm text-gray-600">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </p>
        )}
      </div>

      <div className="p-4 space-y-6">
        <div>
          <button
            onClick={() => setShowBrands(!showBrands)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-lg font-black text-gray-900">Brands</h3>
            {showBrands ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showBrands && (
            <div className="space-y-2">
              {brands.map(brand => (
                <label
                  key={brand.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => onBrandToggle(brand.id)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">{brand.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-lg font-black text-gray-900">Categories</h3>
            {showCategories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showCategories && (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => onCategoryToggle(category.id)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-gray-900">{category.name}</span>
                    </label>

                    {category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
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
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onChange={() => onSubcategoryToggle(subcategory.id)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{subcategory.name}</span>
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
