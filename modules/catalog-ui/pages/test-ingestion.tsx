import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Image as ImageIcon,
  RefreshCw,
  Filter,
  Sparkles,
  FileQuestion,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { getAiAssetUrl, neonColors, glowPresets, glassmorphism } from '../theme/catalogVisuals';
import type { Product } from '../lib/api';

interface FilterState {
  missingImages: boolean;
  aiGenerated: boolean;
  drafts: boolean;
}

interface ImageStatusProps {
  hasImage: boolean;
  isAiGenerated: boolean;
  isDraft: boolean;
  isProcessing?: boolean;
}

const ImageStatusBadge: React.FC<ImageStatusProps> = ({ 
  hasImage, 
  isAiGenerated, 
  isDraft,
  isProcessing = false 
}) => {
  if (isProcessing) {
    return (
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: `linear-gradient(135deg, ${neonColors.purple}20, ${neonColors.pink}20)`,
          border: `1px solid ${neonColors.purple}40`,
        }}
      >
        <RefreshCw className="w-3 h-3 animate-spin" />
        Processing
      </motion.div>
    );
  }

  if (!hasImage) {
    return (
      <div 
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-600"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <XCircle className="w-3 h-3" />
        Missing
      </div>
    );
  }

  if (isAiGenerated) {
    return (
      <div 
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: `linear-gradient(135deg, ${neonColors.cyan}20, ${neonColors.blue}20)`,
          border: `1px solid ${neonColors.cyan}40`,
          color: neonColors.cyan,
        }}
      >
        <Sparkles className="w-3 h-3" />
        AI Generated
      </div>
    );
  }

  if (isDraft) {
    return (
      <div 
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: `linear-gradient(135deg, ${neonColors.yellow}20, ${neonColors.orange}20)`,
          border: `1px solid ${neonColors.yellow}40`,
          color: neonColors.orange,
        }}
      >
        <AlertCircle className="w-3 h-3" />
        Draft
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-600"
      style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}
    >
      <CheckCircle className="w-3 h-3" />
      OK
    </div>
  );
};

export const TestIngestionPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    missingImages: false,
    aiGenerated: false,
    drafts: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!confirm('Regenerate ALL product images? This will trigger AI generation for all products.')) {
      return;
    }

    try {
      setRegenerating(true);
      setError(null);
      const response = await fetch('/api/products/force-regenerate-all', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate images');
      }

      const result = await response.json();
      alert(`Success! ${result.message || 'Image regeneration started'}`);
      
      // Refresh products after a delay
      setTimeout(() => {
        fetchProducts();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate images');
    } finally {
      setRegenerating(false);
    }
  };

  const toggleFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  const filteredProducts = products.filter(product => {
    // If no filters are active, show all
    const hasActiveFilters = Object.values(filters).some(v => v);
    if (!hasActiveFilters) return true;

    const hasImage = !!product.imageUrl;
    const isAiGenerated = product.imageUrl?.includes('/ai-generated/') || product.imageUrl?.includes('/canva-assets/');
    const isDraft = product.status === 'draft';

    if (filters.missingImages && !hasImage) return true;
    if (filters.aiGenerated && isAiGenerated) return true;
    if (filters.drafts && isDraft) return true;

    return false;
  });

  const stats = {
    total: products.length,
    missing: products.filter(p => !p.imageUrl).length,
    aiGenerated: products.filter(p => 
      p.imageUrl?.includes('/ai-generated/') || p.imageUrl?.includes('/canva-assets/')
    ).length,
    drafts: products.filter(p => p.status === 'draft').length,
    active: products.filter(p => p.status === 'active').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Catalog Ingestion Testing
          </h1>
          <p className="text-gray-600">
            View all products, AI-generated images, and test bulk regeneration
          </p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl"
            style={{
              ...glassmorphism.medium,
              boxShadow: glowPresets.soft.boxShadow,
            }}
          >
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl"
            style={{
              ...glassmorphism.medium,
              boxShadow: `0 0 20px rgba(239, 68, 68, 0.4)`,
            }}
          >
            <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
            <div className="text-sm text-gray-600">Missing Images</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl"
            style={{
              ...glassmorphism.medium,
              boxShadow: `0 0 20px ${neonColors.cyan}40`,
            }}
          >
            <div className="text-2xl font-bold" style={{ color: neonColors.cyan }}>
              {stats.aiGenerated}
            </div>
            <div className="text-sm text-gray-600">AI Generated</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl"
            style={{
              ...glassmorphism.medium,
              boxShadow: `0 0 20px ${neonColors.orange}40`,
            }}
          >
            <div className="text-2xl font-bold" style={{ color: neonColors.orange }}>
              {stats.drafts}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl"
            style={{
              ...glassmorphism.medium,
              boxShadow: `0 0 20px ${neonColors.lime}40`,
            }}
          >
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegenerateAll}
            disabled={regenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${neonColors.purple}, ${neonColors.pink})`,
              boxShadow: glowPresets.neonPink.boxShadow,
            }}
          >
            {regenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Regenerate All Product Images
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchProducts}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
            style={{
              ...glassmorphism.medium,
              border: `1px solid ${neonColors.cyan}40`,
            }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium ml-auto"
            style={{
              ...glassmorphism.medium,
              border: `1px solid ${showFilters ? neonColors.orange : neonColors.cyan}40`,
              background: showFilters ? `${neonColors.orange}10` : 'transparent',
            }}
          >
            {showFilters ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </motion.button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl"
              style={{
                ...glassmorphism.light,
                border: `1px solid ${neonColors.cyan}20`,
              }}
            >
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters:</span>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter('missingImages')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.missingImages 
                      ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Missing Images
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter('aiGenerated')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.aiGenerated 
                      ? 'border-2' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                  style={filters.aiGenerated ? {
                    background: `${neonColors.cyan}20`,
                    color: neonColors.cyan,
                    borderColor: neonColors.cyan,
                  } : {}}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Generated
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter('drafts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.drafts 
                      ? 'border-2' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                  style={filters.drafts ? {
                    background: `${neonColors.orange}20`,
                    color: neonColors.orange,
                    borderColor: neonColors.orange,
                  } : {}}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Drafts Only
                  </div>
                </motion.button>

                {Object.values(filters).some(v => v) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFilters({ missingImages: false, aiGenerated: false, drafts: false })}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300"
                  >
                    Clear Filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => {
              const hasImage = !!product.imageUrl;
              const isAiGenerated = product.imageUrl?.includes('/ai-generated/') || product.imageUrl?.includes('/canva-assets/');
              const isDraft = product.status === 'draft';
              const imageUrl = hasImage 
                ? getAiAssetUrl('products', product.id, product.imageUrl || undefined)
                : '/placeholder-product.png';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    ...glassmorphism.medium,
                    boxShadow: glowPresets.soft.boxShadow,
                  }}
                >
                  {/* Image Section */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.png';
                      }}
                    />
                    
                    {!hasImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <FileQuestion className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <ImageStatusBadge
                        hasImage={hasImage}
                        isAiGenerated={isAiGenerated || false}
                        isDraft={isDraft}
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {product.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <span className={`font-medium ${
                        product.status === 'active' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {(product.status || 'active').toUpperCase()}
                      </span>
                    </div>

                    {product.imageUrl && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                        {product.imageUrl}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No products match your filters
            </h3>
            <p className="text-gray-500">
              Try adjusting your filter settings or clear all filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestIngestionPage;
