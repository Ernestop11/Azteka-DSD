import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { BrandRow } from '../components/BrandRow';
import { ProductGrid } from '../components/ProductGrid';
import { BundleSection } from '../components/BundleSection';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useCart } from '../context/CartContext';
import { fetchProducts, fetchBrands, fetchCategories, type Product, type Brand } from '../lib/api';

// Extended Product with brandName for display
interface ProductDisplay extends Product {
  brandName: string;
}

interface BrandWithCount extends Brand {
  productCount: number;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  products: Array<{ id: string; name: string; imageUrl?: string }>;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  imageUrl?: string;
}

const SalesRepCatalog: React.FC = () => {
  // Cart context
  const cart = useCart();
  
  // State management
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [brands, setBrands] = useState<BrandWithCount[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch catalog data
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [productsData, brandsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchBrands(),
          fetchCategories(),
        ]);

        // Build brand lookup map
        const brandMap = new Map(brandsData.map(b => [b.id, b.name]));
        
        // Enhance products with brandName
        const enhancedProducts: ProductDisplay[] = productsData.map(p => ({
          ...p,
          brandName: p.brandId ? (brandMap.get(p.brandId) || 'Unknown Brand') : 'Unknown Brand',
        }));
        
        // Count products per brand
        const brandCounts = new Map<string, number>();
        enhancedProducts.forEach(p => {
          if (p.brandId) {
            brandCounts.set(p.brandId, (brandCounts.get(p.brandId) || 0) + 1);
          }
        });
        
        const brandsWithCounts: BrandWithCount[] = brandsData.map(b => ({
          ...b,
          logoUrl: b.logoUrl || undefined,
          productCount: brandCounts.get(b.id) || 0,
        }));

        setProducts(enhancedProducts);
        setBrands(brandsWithCounts);
        setCategories(categoriesData.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
        
        // TODO: Fetch bundles when endpoint is ready
        setBundles([]);
      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  // Filter products based on selections and search
  const filteredProducts = products.filter((product) => {
    const matchesBrand = !selectedBrandId || product.brandId === selectedBrandId;
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesBrand && matchesCategory && matchesSearch;
  });

  // Cart handlers
  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    cart.addItem({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      unitType: product.unitType || undefined,
    });
  };

  const handleAddBundle = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;

    cart.addItem({
      productId: `bundle-${bundleId}`,
      name: bundle.title,
      quantity: 1,
      price: bundle.bundlePrice,
      imageUrl: bundle.imageUrl,
    });
  };

  const handleViewCart = () => {
    // TODO: Navigate to cart page or open cart modal
    console.log('View cart:', cart.items);
    alert(`Cart has ${cart.getTotalItems()} items totaling $${cart.getTotalPrice().toFixed(2)}`);
  };

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrandId(selectedBrandId === brandId ? null : brandId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <HeroBanner
        title="Azteka Foods Premium Catalog"
        subtitle="Authentic Mexican products for your customers"
        imageUrl="/hero-banner.jpg"
        gradientFrom="from-orange-600"
        gradientTo="to-red-600"
        ctaText="View New Arrivals"
        ctaAction={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
        height="large"
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-full border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
            />
            <svg
              className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter Row */}
        {brands.length > 0 && (
          <BrandRow
            brands={brands}
            onBrandClick={handleBrandSelect}
            selectedBrandId={selectedBrandId}
            scrollable={true}
          />
        )}

        {/* Bundle Deals Section */}
        {bundles.length > 0 && (
          <BundleSection bundles={bundles} onAddBundle={handleAddBundle} />
        )}

        {/* Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedBrandId || selectedCategory || searchQuery
                ? 'Filtered Products'
                : 'All Products'}
            </h2>
            <div className="text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              columns={2}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedBrandId(null);
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton items={cart.items} onViewCart={handleViewCart} />
    </div>
  );
};

export default SalesRepCatalog;
