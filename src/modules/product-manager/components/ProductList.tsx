import React, { useState } from 'react';
import { Product } from '../types';
import { Edit, Trash2, Package, DollarSign, Search, Upload, Download, X, Sparkles, AlertTriangle, FileText } from 'lucide-react';

type AIFilter = 'ALL' | 'DRAFT' | 'AI_GENERATED' | 'PO_EXTRACTED';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onImportCSV?: (file: File) => Promise<void>;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onImportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [aiFilter, setAiFilter] = useState<AIFilter>('ALL');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.categoryId === filterCategory || product.category_id === filterCategory;

    // AI filter logic
    const matchesAI = (() => {
      switch (aiFilter) {
        case 'DRAFT':
          return product.isDraft || product.is_draft;
        case 'AI_GENERATED':
          return product.aiGenerated || product.ai_generated;
        case 'PO_EXTRACTED':
          return product.poExtracted || product.po_extracted;
        case 'ALL':
        default:
          return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesAI;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!csvFile || !onImportCSV) return;

    setIsImporting(true);
    try {
      await onImportCSV(csvFile);
      setShowImportModal(false);
      setCsvFile(null);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,sku,description,price,cost,stock,categoryId,brandId,inStock,featured\nExample Product,SKU001,Product description,99.99,50.00,100,cat-id,brand-id,true,false`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {onImportCSV && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Upload size={20} />
              <span>Import CSV</span>
            </button>
          )}
        </div>

        {/* AI Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">AI Filters:</span>
          <button
            onClick={() => setAiFilter('ALL')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              aiFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setAiFilter('DRAFT')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition ${
              aiFilter === 'DRAFT'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={14} />
            <span>Drafts</span>
          </button>
          <button
            onClick={() => setAiFilter('AI_GENERATED')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition ${
              aiFilter === 'AI_GENERATED'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Generated</span>
          </button>
          <button
            onClick={() => setAiFilter('PO_EXTRACTED')}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition ${
              aiFilter === 'PO_EXTRACTED'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload size={14} />
            <span>PO Extracted</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            {/* Product Image */}
            <div
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundColor: product.backgroundColor || '#f3f4f6',
                backgroundImage: product.imageUrl
                  ? `url(${product.imageUrl})`
                  : undefined,
              }}
            >
              {!product.imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="text-gray-300" size={48} />
                </div>
              )}

              {/* Top-right badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                {product.featured && (
                  <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                )}
                {(product.isDraft || product.is_draft) && (
                  <div className="flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    <FileText size={12} />
                    <span>Draft</span>
                  </div>
                )}
                {(product.aiGenerated || product.ai_generated) && (
                  <div className="flex items-center space-x-1 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    <Sparkles size={12} />
                    <span>AI</span>
                  </div>
                )}
                {(product.poExtracted || product.po_extracted) && (
                  <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    <Upload size={12} />
                    <span>PO</span>
                  </div>
                )}
                {(product.hasWarnings || product.has_warnings) && (
                  <div className="flex items-center space-x-1 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    <AlertTriangle size={12} />
                    <span>Warning</span>
                  </div>
                )}
              </div>

              {/* Top-left badges */}
              {!product.inStock && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="font-bold text-lg text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {product.stock}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  <Edit size={16} />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(`Are you sure you want to delete "${product.name}"?`)
                    ) {
                      onDelete(product.id);
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-300" size={64} />
          <p className="text-gray-500 mt-4">No products found</p>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Products from CSV</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file with your product data. Need a template?
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Download size={16} />
                  <span>Download CSV Template</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!csvFile || isImporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isImporting ? 'Importing...' : 'Import Products'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
