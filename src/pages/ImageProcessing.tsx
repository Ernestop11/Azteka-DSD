import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Image, Search, Wand2, Trash2, RefreshCw, Sparkles,
  CheckCircle, AlertCircle, Loader, Eye, Download, Zap
} from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface Product {
  id: string;
  name: string;
  image_url?: string;
  splash_image_url?: string;
  brand?: string;
  category?: string;
  featured?: boolean;
  special?: boolean;
  background_removed?: boolean;
}

interface ProcessingStatus {
  productId: string;
  status: 'idle' | 'searching' | 'removing-bg' | 'generating-splash' | 'complete' | 'error';
  message?: string;
  imageUrl?: string;
  splashImageUrl?: string;
}

type ProcessingFilter = 'all' | 'no-image' | 'needs-bg-removal' | 'special-products';

export default function ImageProcessing() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProcessingFilter>('all');
  const [processing, setProcessing] = useState<Map<string, ProcessingStatus>>(new Map());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Splash Image Generator State
  const [showSplashGenerator, setShowSplashGenerator] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [splashStyle, setSplashStyle] = useState<'modern' | 'classic' | 'bold' | 'elegant'>('modern');
  const [splashText, setSplashText] = useState('');
  const [splashTagline, setSplashTagline] = useState('');
  const [generatingSplash, setGeneratingSplash] = useState(false);
  const [splashPreview, setSplashPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'no-image') return !product.image_url;
    if (filter === 'needs-bg-removal') return product.image_url && !product.background_removed;
    if (filter === 'special-products') return product.special === true;
    return true;
  });

  const processImage = async (productId: string, productName: string, brand?: string) => {
    const status: ProcessingStatus = { productId, status: 'searching', message: 'Searching for image...' };
    setProcessing(new Map(processing.set(productId, status)));

    try {
      // Step 1: Search for image
      const searchRes = await fetch(`${API_BASE}/api/images/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productName,
          brand: brand || '',
        }),
      });

      if (!searchRes.ok) throw new Error('Image search failed');

      const searchData = await searchRes.json();
      status.imageUrl = searchData.imageUrl;
      status.status = 'removing-bg';
      status.message = 'Removing background...';
      setProcessing(new Map(processing.set(productId, { ...status })));

      // Step 2: Remove background
      const bgRes = await fetch(`${API_BASE}/api/images/remove-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId,
          imageUrl: searchData.imageUrl,
        }),
      });

      if (!bgRes.ok) throw new Error('Background removal failed');

      const bgData = await bgRes.json();
      status.imageUrl = bgData.processedImageUrl;
      status.status = 'complete';
      status.message = 'Image processed successfully!';
      setProcessing(new Map(processing.set(productId, { ...status })));

      // Refresh products
      await fetchProducts();
    } catch (err) {
      status.status = 'error';
      status.message = err instanceof Error ? err.message : 'Processing failed';
      setProcessing(new Map(processing.set(productId, { ...status })));
    }
  };

  const removeBackground = async (productId: string, imageUrl: string) => {
    const status: ProcessingStatus = { productId, status: 'removing-bg', message: 'Removing background...' };
    setProcessing(new Map(processing.set(productId, status)));

    try {
      const res = await fetch(`${API_BASE}/api/images/remove-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId, imageUrl }),
      });

      if (!res.ok) throw new Error('Background removal failed');

      const data = await res.json();
      status.imageUrl = data.processedImageUrl;
      status.status = 'complete';
      status.message = 'Background removed successfully!';
      setProcessing(new Map(processing.set(productId, { ...status })));

      await fetchProducts();
    } catch (err) {
      status.status = 'error';
      status.message = err instanceof Error ? err.message : 'Processing failed';
      setProcessing(new Map(processing.set(productId, { ...status })));
    }
  };

  const generateSplashImage = async (product: Product) => {
    if (!product.image_url) {
      alert('Product needs an image first!');
      return;
    }

    setSelectedProduct(product);
    setSplashText(product.name);
    setSplashTagline('Premium Quality Product');
    setShowSplashGenerator(true);
  };

  const handleGenerateSplash = async () => {
    if (!selectedProduct) return;

    setGeneratingSplash(true);

    try {
      const res = await fetch(`${API_BASE}/api/images/ai/splash-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productImageUrl: selectedProduct.image_url,
          style: splashStyle,
          text: splashText,
          tagline: splashTagline,
        }),
      });

      if (!res.ok) throw new Error('Splash image generation failed');

      const data = await res.json();
      setSplashPreview(data.splashImageUrl);

      // Refresh products
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGeneratingSplash(false);
    }
  };

  const bulkProcess = async () => {
    if (selectedProducts.size === 0) {
      alert('Select products to process');
      return;
    }

    setBulkProcessing(true);

    for (const productId of selectedProducts) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        await processImage(productId, product.name, product.brand);
      }
    }

    setBulkProcessing(false);
    setSelectedProducts(new Set());
  };

  const toggleSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAll = () => {
    setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin • Image Processing</p>
            <h1 className="text-3xl font-black text-gray-900">AI Image Processing</h1>
            <p className="text-gray-600 text-sm">Auto-search, background removal, and AI splash images</p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black transition shadow-lg"
          >
            ← Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Image className="text-blue-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Total Products</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-600" size={24} />
              <p className="text-sm font-bold text-gray-600">No Image</p>
            </div>
            <p className="text-3xl font-black text-red-900">
              {products.filter((p) => !p.image_url).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <Wand2 className="text-orange-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Needs BG Removal</p>
            </div>
            <p className="text-3xl font-black text-orange-900">
              {products.filter((p) => p.image_url && !p.background_removed).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-purple-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Special Products</p>
            </div>
            <p className="text-3xl font-black text-purple-900">
              {products.filter((p) => p.special).length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setFilter('no-image')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filter === 'no-image'
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No Image ({products.filter((p) => !p.image_url).length})
              </button>
              <button
                onClick={() => setFilter('needs-bg-removal')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filter === 'needs-bg-removal'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Needs BG Removal ({products.filter((p) => p.image_url && !p.background_removed).length})
              </button>
              <button
                onClick={() => setFilter('special-products')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filter === 'special-products'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Special Products ({products.filter((p) => p.special).length})
              </button>
            </div>

            {selectedProducts.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={bulkProcess}
                  disabled={bulkProcessing}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkProcessing ? <Loader className="animate-spin" size={16} /> : <Zap size={16} />}
                  Process Selected ({selectedProducts.size})
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                >
                  Deselect All
                </button>
              </div>
            )}

            {selectedProducts.size === 0 && filteredProducts.length > 0 && (
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
              >
                Select All
              </button>
            )}
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto border-2 border-gray-200 rounded-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={() => (selectedProducts.size === filteredProducts.length ? deselectAll() : selectAll())}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                    Current Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product) => {
                  const status = processing.get(product.id);
                  const isSelected = selectedProducts.has(product.id);

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(product.id)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand || 'No brand'}</p>
                          {product.special && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                              SPECIAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.image_url ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                            />
                            {product.background_removed && (
                              <CheckCircle className="text-emerald-600" size={20} />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm font-semibold">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {status ? (
                          <div className="flex items-center gap-2">
                            {status.status === 'error' && <AlertCircle className="text-red-600" size={16} />}
                            {status.status === 'complete' && <CheckCircle className="text-emerald-600" size={16} />}
                            {(status.status === 'searching' || status.status === 'removing-bg' || status.status === 'generating-splash') && (
                              <Loader className="text-blue-600 animate-spin" size={16} />
                            )}
                            <span className={`text-sm font-semibold ${
                              status.status === 'error' ? 'text-red-600' :
                              status.status === 'complete' ? 'text-emerald-600' :
                              'text-blue-600'
                            }`}>
                              {status.message}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Ready</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!product.image_url && (
                            <button
                              onClick={() => processImage(product.id, product.name, product.brand)}
                              disabled={status?.status === 'searching' || status?.status === 'removing-bg'}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <Search size={16} />
                              Find & Process
                            </button>
                          )}
                          {product.image_url && !product.background_removed && (
                            <button
                              onClick={() => removeBackground(product.id, product.image_url!)}
                              disabled={status?.status === 'removing-bg'}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <Wand2 size={16} />
                              Remove BG
                            </button>
                          )}
                          {product.image_url && product.background_removed && (
                            <button
                              onClick={() => generateSplashImage(product)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                            >
                              <Sparkles size={16} />
                              Generate Splash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* AI Splash Image Generator Modal */}
      {showSplashGenerator && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={28} />
                  <h3 className="text-2xl font-black">AI Splash Image Generator</h3>
                </div>
                <button
                  onClick={() => setShowSplashGenerator(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-4">Product</h4>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      {selectedProduct.image_url && (
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-300"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{selectedProduct.name}</p>
                        <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['modern', 'classic', 'bold', 'elegant'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setSplashStyle(style)}
                          className={`px-4 py-3 rounded-xl font-bold transition-all ${
                            splashStyle === style
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Main Text</label>
                    <input
                      type="text"
                      value={splashText}
                      onChange={(e) => setSplashText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-purple-500"
                      placeholder="Product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={splashTagline}
                      onChange={(e) => setSplashTagline(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-purple-500"
                      placeholder="Optional tagline"
                    />
                  </div>

                  <button
                    onClick={handleGenerateSplash}
                    disabled={generatingSplash}
                    className={`w-full py-4 font-black text-lg rounded-2xl transition-all ${
                      generatingSplash
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-2xl transform hover:scale-105'
                    }`}
                  >
                    {generatingSplash ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="animate-spin" size={20} />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Wand2 size={20} />
                        Generate Splash Image
                      </span>
                    )}
                  </button>
                </div>

                {/* Preview */}
                <div>
                  <h4 className="text-lg font-black text-gray-900 mb-4">Preview</h4>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                    {splashPreview ? (
                      <img
                        src={splashPreview}
                        alt="Splash preview"
                        className="max-w-full max-h-[400px] rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Eye size={48} className="mx-auto mb-4" />
                        <p className="font-semibold">Preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
