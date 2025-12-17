import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import type { Product } from '../types';

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discount_percentage: number;
  image_url?: string;
}

interface CatalogGridProps {
  products?: Product[];
  brands: Brand[];
  categories: Category[];
  bundles?: Bundle[];
  onAddToCart: (product: Product) => void;
  onAddMultiple?: (items: Array<{ product: Product; quantity: number }>) => void;
}

export default function CatalogGrid({ products, brands, categories, bundles = [], onAddToCart, onAddMultiple }: CatalogGridProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = (import.meta.env?.VITE_API_URL as string | undefined) || '/api';

  interface ApiProduct {
    id: string;
    name: string;
    price: number;
    sku: string;
    image_url?: string;
    description?: string;
    category?: string;
    in_stock?: boolean;
  }

  const normalizeProduct = (item: ApiProduct): Product => ({
    id: item.id,
    category_id: item.category ?? '',
    brand_id: '',
    subcategory_id: '',
    name: item.name ?? 'Untitled Product',
    slug: item.sku?.toLowerCase() ?? item.id,
    description: item.description ?? '',
    sku: item.sku ?? '',
    image_url: item.image_url || '/product-placeholder.svg',
    background_color: '#f3f4f6',
    background_gradient: undefined,
    price: Number(item.price) || 0,
    unit_type: 'case',
    units_per_case: 1,
    min_order_quantity: 1,
    in_stock: item.in_stock ?? true,
    featured: false,
  });

  useEffect(() => {
    if (products && products.length > 0) {
      setCatalogProducts(products);
    }
  }, [products]);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/products`);
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status})`);
        }
        const data: ApiProduct[] = await response.json();
        if (!ignore) {
          setCatalogProducts(data.map(normalizeProduct));
        }
      } catch (err) {
        console.error('Failed to fetch products from API', err);
        if (!ignore) {
          setError('Unable to load products. Please try again.');
          if (!products || products.length === 0) {
            setCatalogProducts([]);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategoryId) ? prev.filter(id => id !== subcategoryId) : [...prev, subcategoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSearchQuery('');
  };

  const filteredProducts = catalogProducts.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand_id || '')) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) {
      return false;
    }
    if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory_id || '')) {
      return false;
    }
    return true;
  });

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  return (
    <div className="flex h-full bg-gray-50">
      {showFilters && (
        <FilterSidebar
          brands={brands}
          categories={categories}
          selectedBrands={selectedBrands}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          onBrandToggle={toggleBrand}
          onCategoryToggle={toggleCategory}
          onSubcategoryToggle={toggleSubcategory}
          onClearAll={clearAllFilters}
        />
      )}

      <div className="catalog-scroll flex-1 overflow-y-auto smooth-scroll">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`tablet-hit-target flex items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all ${
                  showFilters
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-300 pl-12 pr-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="tablet-hit-target rounded-xl border-2 border-gray-300 px-4 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="featured">Featured</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-3 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-3 transition-all ${
                    viewMode === 'list'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600 tablet:text-base">
                Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> of{' '}
                <span className="font-bold text-gray-900">{catalogProducts.length}</span> products
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 tablet:py-12">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-semibold">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-16 text-center text-lg font-semibold text-gray-600">Loading products…</div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-gray-600 font-bold mb-4">No products found</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 tablet:grid-cols-2 tabletWide:gap-7 laptop:grid-cols-3 desktop:grid-cols-4'
                  : 'space-y-5'
              }
            >
              {sortedProducts.map((product, index) => {
                // Filter bundles for this product's brand (La Molienda, Barcel, Marinela)
                const productBundles = bundles.filter(bundle => 
                  bundle.products.some(p => 
                    p.brand_id === product.brand_id || 
                    product.name.toLowerCase().includes('molienda') ||
                    product.name.toLowerCase().includes('barcel') ||
                    product.name.toLowerCase().includes('marinela')
                  )
                );
                
                return (
                  <div
                    key={product.id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${(index % 20) * 50}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onAddMultiple={onAddMultiple}
                      bundles={productBundles}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
