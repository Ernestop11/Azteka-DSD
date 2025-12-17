import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../contexts/CustomerContext';
import CustomerNavbar from '../../components/CustomerNavbar';
import BundleCard from '../../components/customer/BundleCard';
import { fetchFromAPI } from '../../lib/apiClient';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceCase?: number;
  pricePiece?: number;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  category?: string;
  brand?: string;
  description?: string;
  inStock?: boolean;
  in_stock?: boolean;
  unitsPerCase?: number;
  featured?: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface BundleItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCase?: number | null;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  discountPercent: number | string;
  badgeText?: string | null;
  badgeColor?: string | null;
  items: BundleItem[];
  brand?: {
    name: string;
    logoUrl?: string | null;
  } | null;
  category?: {
    name: string;
  } | null;
  featured?: boolean;
}

type ApiProduct = Partial<Product>;

const normalizeProduct = (raw: ApiProduct): Product => {
  return {
    ...raw,
    id: raw.id || '',
    name: raw.name || '',
    price: raw.priceCase ?? raw.price ?? 0,
    priceCase: raw.priceCase ?? raw.price ?? 0,
    pricePiece: raw.pricePiece ?? 0,
    image: raw.image ?? raw.image_url ?? raw.imageUrl ?? '/product-placeholder.svg',
    imageUrl: raw.image ?? raw.image_url ?? raw.imageUrl ?? '/product-placeholder.svg',
    image_url: raw.image ?? raw.image_url ?? raw.imageUrl ?? '/product-placeholder.svg',
    category: raw.category ?? '',
    brand: raw.brand ?? '',
    inStock: raw.in_stock ?? raw.inStock ?? true,
    in_stock: raw.in_stock ?? raw.inStock ?? true,
    unitsPerCase: raw.unitsPerCase ?? 24,
  } as Product;
};

export default function CustomerCatalog() {
  const { token } = useAuth();
  const { profile } = useCustomer();
  const navigate = useNavigate();

  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBundles, setShowBundles] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'popular'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
    loadBundles();
    loadSavedData();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await fetchFromAPI<ApiProduct>('products');
      const normalizedProducts = (productsData ?? []).map(normalizeProduct);

      // Show ALL products (642 total) - not just in stock
      setProducts(normalizedProducts);

      // Extract unique categories and brands
      const cats = Array.from(new Set(normalizedProducts.map((p) => p.category).filter(Boolean)));
      const brds = Array.from(new Set(normalizedProducts.map((p) => p.brand).filter(Boolean)));
      setCategories(cats as string[]);
      setBrands(brds as string[]);

      const maxPrice = Math.max(...normalizedProducts.map((p) => p.priceCase || p.price));
      setPriceRange([0, Math.ceil(maxPrice / 50) * 50]);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadBundles = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/bundles');
      const data = await response.json();
      setBundles(data.bundles || []);
    } catch (error) {
      console.error('Failed to load bundles:', error);
    }
  };

  const loadSavedData = () => {
    const savedCart = localStorage.getItem('azteka_customer_cart');
    const savedFavorites = localStorage.getItem('azteka_customer_favorites');
    const savedRecent = localStorage.getItem('azteka_recently_viewed');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
    if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
  };

  useEffect(() => {
    localStorage.setItem('azteka_customer_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('azteka_customer_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('azteka_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((p) => p.category && selectedCategories.has(p.category));
    }

    // Brand filter
    if (selectedBrands.size > 0) {
      filtered = filtered.filter((p) => p.brand && selectedBrands.has(p.brand));
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = p.priceCase || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // In Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.priceCase || a.price) - (b.priceCase || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.priceCase || b.price) - (a.priceCase || a.price));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, debouncedSearch, selectedCategories, selectedBrands, priceRange, inStockOnly, sortBy]);

  // Filtered bundles
  const filteredBundles = useMemo(() => {
    if (!showBundles) return [];

    let filtered = bundles;

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.category?.name?.toLowerCase().includes(query) ||
          b.brand?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((b) => b.category?.name && selectedCategories.has(b.category.name));
    }

    // Brand filter
    if (selectedBrands.size > 0) {
      filtered = filtered.filter((b) => b.brand?.name && selectedBrands.has(b.brand.name));
    }

    // Price filter
    filtered = filtered.filter((b) => {
      const price = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Featured bundles first
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return filtered;
  }, [bundles, showBundles, debouncedSearch, selectedCategories, selectedBrands, priceRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, ITEMS_PER_PAGE]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories, selectedBrands, priceRange, sortBy]);

  // Cart functions
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity,
          price: product.priceCase || product.price,
        },
      ];
    });
  }, []);

  const addBundleToCart = useCallback((bundle: Bundle) => {
    // Add bundle as a special cart item
    const bundlePrice = typeof bundle.price === 'string' ? parseFloat(bundle.price) : bundle.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === `bundle-${bundle.id}`);
      if (existing) {
        return prev.map((item) =>
          item.productId === `bundle-${bundle.id}`
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: `bundle-${bundle.id}`,
          name: `📦 ${bundle.name}`,
          quantity: 1,
          price: bundlePrice,
        },
      ];
    });

    // Show success notification (you can replace with a toast/notification system)
    alert(`Added "${bundle.name}" bundle to cart!`);
  }, []);

  const handleViewBundleDetails = useCallback((bundle: Bundle) => {
    navigate(`/customer/bundles/${bundle.slug}`);
  }, [navigate]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const viewProductDetails = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  }, []);

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setPriceRange([0, priceRange[1]]);
    setSearchQuery('');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedBrands.size > 0 ||
    priceRange[0] > 0 ||
    searchQuery.length > 0 ||
    inStockOnly;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Recommendations based on cart
  const recommendations = useMemo(() => {
    if (cart.length === 0) return [];
    const cartProductIds = new Set(cart.map((item) => item.productId));
    const cartProducts = products.filter((p) => cartProductIds.has(p.id));
    const cartCategories = new Set(cartProducts.map((p) => p.category).filter(Boolean));

    return products
      .filter((p) => !cartProductIds.has(p.id) && p.category && cartCategories.has(p.category))
      .slice(0, 6);
  }, [cart, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      {/* Search and Filters Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand, or category..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition"
            >
              <Filter size={20} />
              <span className="hidden md:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:border-emerald-500 outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/customer/cart')}
              className="relative px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              <span className="hidden md:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {Array.from(selectedCategories).map((cat) => (
                <FilterTag
                  key={cat}
                  label={cat}
                  onRemove={() => {
                    const newSet = new Set(selectedCategories);
                    newSet.delete(cat);
                    setSelectedCategories(newSet);
                  }}
                />
              ))}
              {Array.from(selectedBrands).map((brand) => (
                <FilterTag
                  key={brand}
                  label={brand}
                  onRemove={() => {
                    const newSet = new Set(selectedBrands);
                    newSet.delete(brand);
                    setSelectedBrands(newSet);
                  }}
                />
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>

                {/* In Stock Only Toggle */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm font-semibold text-gray-900">In Stock Only</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({products.filter(p => p.inStock).length} available)
                    </span>
                  </label>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(cat)}
                          onChange={(e) => {
                            const newSet = new Set(selectedCategories);
                            if (e.target.checked) {
                              newSet.add(cat);
                            } else {
                              newSet.delete(cat);
                            }
                            setSelectedCategories(newSet);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({products.filter((p) => p.category === cat).length})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.has(brand)}
                          onChange={(e) => {
                            const newSet = new Set(selectedBrands);
                            if (e.target.checked) {
                              newSet.add(brand);
                            } else {
                              newSet.delete(brand);
                            }
                            setSelectedBrands(newSet);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredBundles.length > 0 && `${filteredBundles.length} Bundles • `}
                {filteredProducts.length} Products (Page {currentPage} of {totalPages})
              </h2>
              {debouncedSearch && (
                <span className="text-gray-600">
                  Search results for "{debouncedSearch}"
                </span>
              )}
            </div>

            {/* Bundles Section */}
            {filteredBundles.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-emerald-600" size={24} />
                    Featured Bundles
                  </h3>
                  <button
                    onClick={() => setShowBundles(!showBundles)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    {showBundles ? 'Hide Bundles' : 'Show Bundles'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredBundles.map((bundle) => (
                    <BundleCard
                      key={bundle.id}
                      bundle={bundle}
                      onAddToCart={addBundleToCart}
                      onViewDetails={handleViewBundleDetails}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 my-8 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Individual Products</h3>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onAddToCart={addToCart}
                  onQuickView={() => viewProductDetails(product)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border-2 border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition ${
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="text-yellow-500" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recommended for You
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.has(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      onAddToCart={addToCart}
                      onQuickView={() => viewProductDetails(product)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentlyViewed.slice(0, 6).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => viewProductDetails(product)}
                      className="bg-white rounded-lg p-3 hover:shadow-lg transition group"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-24 object-contain mb-2"
                      />
                      <p className="text-xs text-gray-900 font-medium line-clamp-2 group-hover:text-emerald-600">
                        {product.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          isFavorite={favorites.has(quickViewProduct.id)}
          onToggleFavorite={() => toggleFavorite(quickViewProduct.id)}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickView: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);

  const price = product.priceCase || product.price;
  const piecePrice = product.pricePiece || price / (product.unitsPerCase || 24);
  const savings = product.pricePiece
    ? ((piecePrice * (product.unitsPerCase || 24) - price) / (piecePrice * (product.unitsPerCase || 24))) * 100
    : 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-500">
      <div className="relative">
        <button onClick={onQuickView} className="block w-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/product-placeholder.svg';
            }}
          />
        </button>

        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>

        {product.featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star size={12} className="fill-current" />
            Featured
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          {product.inStock ? (
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              In Stock
            </span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <button onClick={onQuickView} className="text-left w-full">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
          )}
        </button>

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">/ case</span>
          </div>
          {product.pricePiece && (
            <div className="text-sm text-gray-600">
              ${piecePrice.toFixed(2)} per unit • {product.unitsPerCase || 24} units/case
            </div>
          )}
          {savings > 0 && (
            <div className="text-sm text-emerald-600 font-semibold">
              Save {savings.toFixed(0)}% buying by case
            </div>
          )}
        </div>

        {!showQuantity ? (
          <button
            onClick={() => setShowQuantity(true)}
            disabled={!product.inStock}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden flex-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 text-center font-semibold outline-none"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                onAddToCart(product, quantity);
                setShowQuantity(false);
                setQuantity(1);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              <Check size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-emerald-200 rounded-full p-0.5 transition"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Quick View Modal Component
function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-contain bg-gray-50 rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = '/product-placeholder.svg';
                }}
              />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h3>
                {product.brand && (
                  <p className="text-lg text-gray-600">by {product.brand}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600">(4.5 / 5.0)</span>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${(product.priceCase || product.price).toFixed(2)}
                  </span>
                  <span className="text-gray-600">per case</span>
                </div>
                {product.pricePiece && (
                  <p className="text-gray-600">
                    ${product.pricePiece.toFixed(2)} per unit • {product.unitsPerCase || 24}{' '}
                    units per case
                  </p>
                )}
              </div>

              {product.description && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-20 text-center font-semibold text-lg outline-none"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-100"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <button
                    onClick={onToggleFavorite}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                  >
                    <Heart
                      size={24}
                      className={
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={!product.inStock}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={24} />
                  Add {quantity} to Cart - $
                  {((product.priceCase || product.price) * quantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
