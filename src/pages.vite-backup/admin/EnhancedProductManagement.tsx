import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  CheckSquare,
  Square,
  X,
  Save,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../context/AuthContext';

interface Product {
  id: string;
  name: string;
  sku: string;
  priceCase: number;
  category?: string;
  brand?: string;
  description?: string;
  unitsPerCase?: number;
  stock?: number;
  imageUrl?: string | null;
  inStock: boolean;
  isActive: boolean;
  minOrderQty?: number;
}

interface EditFormData {
  name: string;
  sku: string;
  priceCase: string;
  category: string;
  brand: string;
  description: string;
  unitsPerCase: string;
  stock: string;
  minOrderQty: string;
  isActive: boolean;
}

export default function EnhancedProductManagement() {
  const { token } = useAuth();

  // Product list state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [imageFilter, setImageFilter] = useState<'all' | 'with-image' | 'no-image'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk edit state
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkBrand, setBulkBrand] = useState('');
  const [bulkActive, setBulkActive] = useState<boolean | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env?.VITE_API_URL || 'http://localhost:4000'}/api/products`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and brands
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const brands = useMemo(() => {
    const brds = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brds.add(p.brand);
    });
    return Array.from(brds).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter((p) => p.inStock);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter((p) => !p.inStock);
    }

    // Image filter
    if (imageFilter === 'with-image') {
      filtered = filtered.filter((p) => p.imageUrl);
    } else if (imageFilter === 'no-image') {
      filtered = filtered.filter((p) => !p.imageUrl);
    }

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter((p) => p.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((p) => !p.isActive);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedBrand, stockFilter, imageFilter, activeFilter]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
      setSelectAll(true);
    }
  };

  // Handle individual selection
  const handleSelectProduct = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
    setSelectAll(newSelection.size === paginatedProducts.length);
  };

  // Open edit modal
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      sku: product.sku,
      priceCase: product.priceCase.toString(),
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      unitsPerCase: product.unitsPerCase?.toString() || '',
      stock: product.stock?.toString() || '',
      minOrderQty: product.minOrderQty?.toString() || '1',
      isActive: product.isActive,
    });
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditForm(null);
  };

  // Save product edit
  const handleSaveEdit = async () => {
    if (!editingProduct || !editForm || !token) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env?.VITE_API_URL || 'http://localhost:4000'}/api/products/${editingProduct.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editForm.name,
            sku: editForm.sku,
            priceCase: parseFloat(editForm.priceCase),
            category: editForm.category || null,
            brand: editForm.brand || null,
            description: editForm.description || null,
            unitsPerCase: editForm.unitsPerCase ? parseInt(editForm.unitsPerCase) : null,
            stock: editForm.stock ? parseInt(editForm.stock) : null,
            minOrderQty: editForm.minOrderQty ? parseInt(editForm.minOrderQty) : 1,
            isActive: editForm.isActive,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Refresh products
      await fetchProducts();
      handleCloseEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (!confirm(`Delete ${selectedProducts.size} product(s)? This cannot be undone.`)) {
      return;
    }

    try {
      const promises = Array.from(selectedProducts).map((id) =>
        fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:4000'}/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(promises);
      setSelectedProducts(new Set());
      setSelectAll(false);
      await fetchProducts();
    } catch (err) {
      alert('Failed to delete products');
    }
  };

  // Handle bulk edit
  const handleBulkEdit = async () => {
    if (selectedProducts.size === 0) return;

    try {
      const updates: any = {};
      if (bulkCategory) updates.category = bulkCategory;
      if (bulkBrand) updates.brand = bulkBrand;
      if (bulkActive !== null) updates.isActive = bulkActive;

      const promises = Array.from(selectedProducts).map((id) =>
        fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:4000'}/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        })
      );

      await Promise.all(promises);
      setSelectedProducts(new Set());
      setSelectAll(false);
      setBulkEditMode(false);
      setBulkCategory('');
      setBulkBrand('');
      setBulkActive(null);
      await fetchProducts();
    } catch (err) {
      alert('Failed to update products');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Price', 'Category', 'Brand', 'Stock', 'Image', 'Active'];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.sku,
      p.priceCase.toFixed(2),
      p.category || '',
      p.brand || '',
      p.stock || 0,
      p.imageUrl ? 'Yes' : 'No',
      p.isActive ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setStockFilter('all');
    setImageFilter('all');
    setActiveFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    stockFilter !== 'all' ||
    imageFilter !== 'all' ||
    activeFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">
              Manage {products.length} products with advanced search and bulk editing
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Download size={20} />
              Export CSV
            </button>

            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter((p) => p.inStock).length}
                </p>
              </div>
              <CheckSquare className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter((p) => !p.inStock).length}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Images</p>
                <p className="text-2xl font-bold text-blue-600">
                  {products.filter((p) => p.imageUrl).length}
                </p>
              </div>
              <ImageIcon className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-purple-600">
                  {products.filter((p) => p.isActive).length}
                </p>
              </div>
              <Eye className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-gray-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Search & Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, SKU, brand, or category..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              value={imageFilter}
              onChange={(e) => {
                setImageFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Images</option>
              <option value="with-image">With Image</option>
              <option value="no-image">No Image</option>
            </select>

            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
            {hasActiveFilters && ` (filtered from ${products.length} total)`}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="text-emerald-600" size={24} />
                <span className="font-bold text-emerald-900">
                  {selectedProducts.size} product(s) selected
                </span>
              </div>

              <div className="flex gap-3">
                {!bulkEditMode ? (
                  <>
                    <button
                      onClick={() => setBulkEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      <Edit size={16} />
                      Bulk Edit
                    </button>

                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="">Change Category...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={bulkBrand}
                      onChange={(e) => setBulkBrand(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="">Change Brand...</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>

                    <select
                      value={bulkActive === null ? '' : bulkActive.toString()}
                      onChange={(e) =>
                        setBulkActive(e.target.value === '' ? null : e.target.value === 'true')
                      }
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="">Change Status...</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>

                    <button
                      onClick={handleBulkEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
                    >
                      <Save size={16} />
                      Apply
                    </button>

                    <button
                      onClick={() => setBulkEditMode(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <p className="text-red-600 font-semibold mb-2">Error Loading Products</p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600 font-semibold mb-2">No products found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="text-gray-400" size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-4 py-3">
                        {product.category && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            <Tag size={12} />
                            {product.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.brand && (
                          <span className="text-sm font-medium text-gray-700">{product.brand}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                          <DollarSign size={14} />
                          {product.priceCase.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.inStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <CheckSquare size={12} />
                            {product.stock || 'In Stock'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            <AlertCircle size={12} />
                            Out
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            <Eye size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            <EyeOff size={12} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={handleCloseEdit}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SKU *</label>
                <input
                  type="text"
                  value={editForm.sku}
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price per Case *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.priceCase}
                  onChange={(e) => setEditForm({ ...editForm, priceCase: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Units & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Units/Case</label>
                  <input
                    type="number"
                    value={editForm.unitsPerCase}
                    onChange={(e) => setEditForm({ ...editForm, unitsPerCase: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Min Order Qty</label>
                  <input
                    type="number"
                    value={editForm.minOrderQty}
                    onChange={(e) => setEditForm({ ...editForm, minOrderQty: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">Active (visible to customers)</span>
                </label>
              </div>

              {/* Current Image */}
              {editingProduct.imageUrl && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Image</label>
                  <img
                    src={editingProduct.imageUrl}
                    alt={editingProduct.name}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseEdit}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
