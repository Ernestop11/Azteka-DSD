import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import { Loader2, AlertCircle, Package } from 'lucide-react';

// Simple product type that matches API response
interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  margin?: number;
  imageUrl?: string;
  inStock: boolean;
  stock: number;
  minStock: number;
  supplier?: string;
  featured: boolean;
  unitType: string;
  unitsPerCase: number;
  minOrderQty: number;
  backgroundColor?: string;
  categoryId?: string;
  brandId?: string;
  subcategoryId?: string;

  // Add these for ProductCard compatibility
  image_url?: string;
  background_color?: string;
  in_stock?: boolean;
  units_per_case?: number;
  unit_type?: string;
  brand_id?: string;
  category_id?: string;
  subcategory_id?: string;
}

export default function AppMinimal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching products from /api/products...');

      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Products received:', data);

      if (!Array.isArray(data)) {
        throw new Error('API did not return an array');
      }

      // Transform products to match both camelCase and snake_case expectations
      const transformedProducts = data.map((p: any) => ({
        ...p,
        // Add snake_case versions for ProductCard compatibility
        image_url: p.imageUrl || p.image_url || '',
        background_color: p.backgroundColor || p.background_color || '#f3f4f6',
        in_stock: p.inStock !== undefined ? p.inStock : p.in_stock !== undefined ? p.in_stock : true,
        units_per_case: p.unitsPerCase || p.units_per_case || 1,
        unit_type: p.unitType || p.unit_type || 'case',
        brand_id: p.brandId || p.brand_id,
        category_id: p.categoryId || p.category_id,
        subcategory_id: p.subcategoryId || p.subcategory_id,
      }));

      setProducts(transformedProducts);
      console.log(`Successfully loaded ${transformedProducts.length} products`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching products:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product: Product) {
    console.log('Added to cart:', product.name);
    // Simple alert for now - you can add cart functionality later
    alert(`Added ${product.name} to cart!`);
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Catalog...</h2>
          <p className="text-gray-600">Fetching products from database</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-lg"
          >
            Try Again
          </button>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm text-gray-600 font-mono">
              <strong>Troubleshooting:</strong><br />
              • API Endpoint: /api/products<br />
              • Check browser console for details<br />
              • Verify backend is running<br />
              • Check network tab in DevTools
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">The catalog is currently empty</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-lg"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Success state - show catalog
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                🏪 Azteka DSD Catalog
              </h1>
              <p className="text-gray-600">
                Showing <span className="font-bold text-emerald-600">{products.length}</span> products
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${(index % 20) * 50}ms` }}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          <p>✅ Minimal Working Catalog • {products.length} Products Loaded</p>
        </div>
      </footer>
    </div>
  );
}
