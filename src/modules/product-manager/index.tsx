import React, { useState, useEffect } from 'react';
import { Product, Category, Brand, Section } from './types';
import { productsApi } from './api/products';
import { categoriesApi } from './api/categories';
import { brandsApi } from './api/brands';
import { sectionsApi } from './api/sections';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { CategoryManager } from './components/CategoryManager';
import { BrandManager } from './components/BrandManager';
import { LayoutEditor } from './components/LayoutEditor';
import { LayoutPreview } from './components/LayoutPreview';
import { ToastContainer, ToastType } from './components/Toast';
import { SettingsPage } from './components/SettingsPage';
import { AIControlCenter } from './components/AIControlCenter';
import { AIStatusDrawer } from './components/AIStatusDrawer';
import { Plus, Package, Layout, Tag, Award, Eye, Settings, Sparkles } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'layout' | 'settings' | 'ai-center'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
  const [currentSummaryId, setCurrentSummaryId] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleOpenStatusDrawer = (summaryId: string) => {
    setCurrentSummaryId(summaryId);
    setStatusDrawerOpen(true);
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, brandsData, layoutData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        brandsApi.getAll(),
        sectionsApi.getLayout().catch(() => ({ sections: [] })),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setSections(layoutData.sections || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Product operations
  const handleCreateProduct = async (data: FormData) => {
    try {
      const newProduct = await productsApi.create(data);
      setProducts([...products, newProduct]);
      setIsCreating(false);
      showToast('Product created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create product:', error);
      showToast('Failed to create product. Please try again.', 'error');
      throw error;
    }
  };

  const handleUpdateProduct = async (data: FormData) => {
    if (!editingProduct) return;

    try {
      const updatedProduct = await productsApi.update(editingProduct.id, data);
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setEditingProduct(null);
      showToast('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast('Failed to update product. Please try again.', 'error');
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Failed to delete product. Please try again.', 'error');
    }
  };

  const handleImportCSV = async (file: File) => {
    try {
      const result = await productsApi.importCSV(file);
      showToast(`Successfully imported ${result.imported} products!`, 'success');
      // Reload products to show newly imported ones
      loadData();
    } catch (error) {
      console.error('Failed to import CSV:', error);
      showToast('Failed to import CSV. Please check the file format.', 'error');
      throw error;
    }
  };

  // Category operations
  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      const newCategory = await categoriesApi.create(data);
      setCategories([...categories, newCategory]);
      showToast('Category created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create category:', error);
      showToast('Failed to create category. Please try again.', 'error');
      throw error;
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    try {
      const updatedCategory = await categoriesApi.update(id, data);
      setCategories(categories.map((c) => (c.id === id ? updatedCategory : c)));
      showToast('Category updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update category:', error);
      showToast('Failed to update category. Please try again.', 'error');
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      showToast('Category deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category. Please try again.', 'error');
    }
  };

  // Brand operations
  const handleCreateBrand = async (data: Partial<Brand>) => {
    try {
      const newBrand = await brandsApi.create(data);
      setBrands([...brands, newBrand]);
      showToast('Brand created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create brand:', error);
      showToast('Failed to create brand. Please try again.', 'error');
      throw error;
    }
  };

  const handleUpdateBrand = async (id: string, data: Partial<Brand>) => {
    try {
      const updatedBrand = await brandsApi.update(id, data);
      setBrands(brands.map((b) => (b.id === id ? updatedBrand : b)));
      showToast('Brand updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update brand:', error);
      showToast('Failed to update brand. Please try again.', 'error');
      throw error;
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await brandsApi.delete(id);
      setBrands(brands.filter((b) => b.id !== id));
      showToast('Brand deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete brand:', error);
      showToast('Failed to delete brand. Please try again.', 'error');
    }
  };

  // Layout operations
  const handleSaveLayout = async (updatedSections: Section[]) => {
    try {
      const layoutId = 'default'; // You can make this dynamic
      await sectionsApi.updateLayout(layoutId, { sections: updatedSections });
      setSections(updatedSections);
      showToast('Layout saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save layout:', error);
      showToast('Failed to save layout. Please try again.', 'error');
      throw error;
    }
  };

  // Settings operations
  const handleSaveSettings = async (settings: any) => {
    try {
      // Store settings in localStorage for now (backend can implement later)
      localStorage.setItem('productManagerSettings', JSON.stringify(settings));
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings. Please try again.', 'error');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">Product Manager</h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-t">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package size={20} />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Tag size={20} />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'brands'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award size={20} />
              <span>Brands</span>
            </button>

            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'layout'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layout size={20} />
              <span>Front Page Layout</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-center')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'ai-center'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles size={20} />
              <span>AI Control Center</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <div className="space-y-6">
            {!isCreating && !editingProduct && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  <span>Add Product</span>
                </button>
              </div>
            )}

            {isCreating || editingProduct ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <ProductForm
                  product={editingProduct || undefined}
                  categories={categories}
                  brands={brands}
                  onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                  onShowToast={showToast}
                />
              </div>
            ) : (
              <ProductList
                products={products}
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
                onImportCSV={handleImportCSV}
              />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryManager
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrandManager
              brands={brands}
              onCreateBrand={handleCreateBrand}
              onUpdateBrand={handleUpdateBrand}
              onDeleteBrand={handleDeleteBrand}
            />
          </div>
        )}

        {activeTab === 'layout' && (
          <LayoutEditor
            sections={sections}
            products={products}
            categories={categories}
            brands={brands}
            onSave={handleSaveLayout}
            onPreview={() => setShowPreview(true)}
          />
        )}

        {activeTab === 'ai-center' && (
          <AIControlCenter
            onShowToast={showToast}
            onOpenStatusDrawer={handleOpenStatusDrawer}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            categories={categories}
            brands={brands}
            onSave={handleSaveSettings}
            initialSettings={
              localStorage.getItem('productManagerSettings')
                ? JSON.parse(localStorage.getItem('productManagerSettings')!)
                : undefined
            }
          />
        )}
      </div>

      {/* AI Status Drawer */}
      <AIStatusDrawer
        summaryId={currentSummaryId}
        isOpen={statusDrawerOpen}
        onClose={() => setStatusDrawerOpen(false)}
        onShowToast={showToast}
      />

      {/* Preview Modal */}
      {showPreview && (
        <LayoutPreview
          sections={sections}
          products={products}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ProductManager;
