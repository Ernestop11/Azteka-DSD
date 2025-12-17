import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, RefreshCw } from 'lucide-react';
import type { Product } from '../lib/api';
import {
  glowPresets,
  neonColors,
  shadows,
  createGlossyOverlay,
  createReflectionOverlay,
  getCategoryGlow,
  getAiAssetUrl,
  getNeonBorderStyle,
} from '../theme/catalogVisuals';

// Map API Product to display-friendly format
interface ProductDisplay extends Product {
  brandName: string;
}

interface ProductGridProps {
  products: ProductDisplay[];
  columns?: 1 | 2 | 3 | 4;
  onAddToCart: (productId: string, quantity: number) => void;
  onProductClick?: (productId: string) => void;
  showQuantitySelector?: boolean;
  animated?: boolean;
  glossyCards?: boolean; // New: enable glossy variant
  useAiImages?: boolean; // New: use AI-generated images when available
  showImageStatus?: boolean; // New: show processing/missing image indicators
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 2,
  onAddToCart,
  onProductClick,
  showQuantitySelector = true,
  animated = true,
  glossyCards = true,
  useAiImages = true,
  showImageStatus = false,
}) => {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [hoveredProduct, setHoveredProduct] = React.useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta),
    }));
  };

  const handleAddToCart = (productId: string) => {
    const qty = quantities[productId] || 1;
    onAddToCart(productId, qty);
    setQuantities((prev) => ({ ...prev, [productId]: 0 }));
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product, index) => {
        const qty = quantities[product.id] || 0;
        const isHovered = hoveredProduct === product.id;
        
        // Get AI-generated image if available
        const productImage = useAiImages && product.categoryId
          ? getAiAssetUrl('products', `${product.id}.webp`, product.imageUrl || undefined)
          : product.imageUrl;
        
        // Check if image is missing or failed to load
        const hasValidImage = productImage && !imageErrors[product.id];
        const isProcessing = product.status === 'draft' && !productImage;
        
        // Get category-specific glow
        const categoryGlow = getCategoryGlow(product.categoryId || undefined);
        
        const CardComponent = animated ? motion.div : 'div';
        const cardProps = animated
          ? {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: index * 0.05, duration: 0.3 },
              whileHover: { scale: 1.02, y: -8 },
            }
          : {};

        return (
          <CardComponent
            key={product.id}
            {...cardProps}
            className="relative bg-white rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              boxShadow: isHovered
                ? `${categoryGlow.boxShadow}, ${shadows.strongLarge}`
                : glossyCards
                ? shadows.mediumLarge
                : shadows.soft,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isHovered ? `2px solid ${neonColors.brandOrange}` : '2px solid transparent',
            }}
            onClick={() => onProductClick?.(product.id)}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Glossy overlay effect */}
            {glossyCards && (
              <div style={createGlossyOverlay()} />
            )}

            {/* Product Image with glow */}
            <div
              className="relative h-48 flex items-center justify-center p-6 overflow-hidden"
              style={{
                background: product.backgroundGradient || product.backgroundColor || 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              }}
            >
              {/* Reflection overlay */}
              {glossyCards && (
                <div style={createReflectionOverlay()} />
              )}
              
              {hasValidImage ? (
                <motion.img
                  src={productImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain relative z-10"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 20px ${neonColors.brandOrange}) drop-shadow(0 8px 16px rgba(0,0,0,0.3))`
                      : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                    transition: 'filter 0.3s ease',
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [product.id]: true }));
                  }}
                />
              ) : isProcessing ? (
                // Processing state - animated pulse
                <motion.div
                  className="flex flex-col items-center justify-center gap-3 z-10"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw className="w-12 h-12 text-purple-500" />
                  </motion.div>
                  <span className="text-sm font-medium text-purple-600">
                    AI Generating...
                  </span>
                </motion.div>
              ) : (
                // Missing image fallback
                <div className="flex flex-col items-center justify-center gap-2 z-10 text-gray-400">
                  <ImageOff className="w-16 h-16" />
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}
              
              {/* Image status badge (optional) */}
              {showImageStatus && !hasValidImage && (
                <div className="absolute top-3 left-3 z-20">
                  {isProcessing ? (
                    <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-500 shadow-lg flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Processing
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500 shadow-lg flex items-center gap-1">
                      <ImageOff className="w-3 h-3" />
                      Missing
                    </div>
                  )}
                </div>
              )}
              
              {product.isNew && (
                <motion.div
                  className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-20"
                  style={{
                    boxShadow: `0 0 20px ${neonColors.brandOrange}, 0 4px 12px rgba(0,0,0,0.3)`,
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.9, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  NEW
                </motion.div>
              )}

              {!product.inStock && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
                  <span className="text-white font-bold text-lg px-4 py-2 bg-red-600 rounded-lg shadow-xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5 relative z-10 bg-gradient-to-b from-white to-gray-50">
              {product.brandName && (
                <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">
                  {product.brandName}
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-2.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
                {product.unitType && (
                  <span className="text-xs text-gray-500">
                    / {product.unitType}
                    {product.unitsPerCase && product.unitsPerCase > 1 && (
                      <> ({product.unitsPerCase} units)</>
                    )}
                  </span>
                )}
              </div>

              {/* Quantity Selector with enhanced styling */}
              {showQuantitySelector && product.inStock && (
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm group-hover:border-orange-400 transition-colors">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="px-4 py-2.5 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 font-bold text-gray-700 transition-all active:scale-95"
                      disabled={qty === 0}
                    >
                      −
                    </button>
                    <span className="px-6 py-2.5 font-bold text-gray-900 min-w-[70px] text-center bg-white">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="px-4 py-2.5 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 font-bold text-gray-700 transition-all active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <motion.button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={qty === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    whileHover={{ scale: qty > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: qty > 0 ? 0.95 : 1 }}
                    style={{
                      boxShadow: qty > 0 && isHovered
                        ? `0 0 20px ${neonColors.brandOrange}, 0 8px 24px rgba(255, 107, 53, 0.4)`
                        : '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    {isHovered && qty > 0 && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                      />
                    )}
                    <span className="relative z-10">Add to Cart</span>
                  </motion.button>
                </div>
              )}
            </div>
          </CardComponent>
        );
      })}
    </div>
  );
};
