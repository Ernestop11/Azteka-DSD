import React from 'react';
import { motion } from 'framer-motion';
import {
  getAiAssetUrl,
  neonColors,
  shadows,
  cardVariants,
  createGlossyOverlay,
} from '../theme/catalogVisuals';

interface Brand {
  id: string;
  name: string;
  logoUrl?: string | null;
  productCount?: number;
}

interface BrandRowProps {
  brands: Brand[];
  onBrandClick: (brandId: string) => void;
  selectedBrandId?: string | null;
  scrollable?: boolean;
  pillShaped?: boolean; // New: use pill-shaped glossy buttons
  useCanvaLogos?: boolean; // New: use Canva-generated brand assets
}

export const BrandRow: React.FC<BrandRowProps> = ({
  brands,
  onBrandClick,
  selectedBrandId,
  scrollable = true,
  pillShaped = true,
  useCanvaLogos = true,
}) => {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
        Shop by Brand
      </h2>
      
      <div
        className={`flex gap-6 ${
          scrollable ? 'overflow-x-auto scrollbar-hide pb-6' : 'flex-wrap'
        }`}
        style={scrollable ? { scrollSnapType: 'x mandatory' } : {}}
      >
        {brands.map((brand, index) => {
          const isSelected = selectedBrandId === brand.id;
          
          // Get Canva-generated brand logo
          const brandLogo = useCanvaLogos && brand.logoUrl
            ? getAiAssetUrl('brands', `${brand.id}.webp`, brand.logoUrl)
            : brand.logoUrl;

          return (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => onBrandClick(brand.id)}
              className="relative flex-shrink-0 flex flex-col items-center justify-center p-6 transition-all overflow-hidden group"
              style={{
                scrollSnapAlign: scrollable ? 'start' : undefined,
                minWidth: '160px',
                borderRadius: pillShaped ? '9999px' : '20px',
                background: isSelected
                  ? 'linear-gradient(135deg, #FF6B35 0%, #FF4444 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                boxShadow: isSelected
                  ? `0 0 30px ${neonColors.brandOrange}80, ${shadows.strongLarge}`
                  : shadows.medium,
                border: isSelected
                  ? `2px solid ${neonColors.brandOrange}`
                  : '2px solid transparent',
              }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glossy overlay */}
              {!isSelected && <div style={createGlossyOverlay()} />}
              
              {/* Neon glow border on hover (non-selected) */}
              {!isSelected && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    borderRadius: pillShaped ? '9999px' : '20px',
                    border: `2px solid ${neonColors.cyan}`,
                    boxShadow: `0 0 20px ${neonColors.cyan}80`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Logo with drop shadow */}
              <div className="relative z-10 mb-3">
                {brandLogo ? (
                  <motion.img
                    src={brandLogo}
                    alt={brand.name}
                    className="h-20 w-20 object-contain"
                    style={{
                      filter: isSelected
                        ? 'brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        : 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                    }}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.div
                    className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold"
                    style={{
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                      color: isSelected ? 'white' : '#374151',
                      boxShadow: shadows.medium,
                    }}
                    whileHover={{ rotate: -5 }}
                  >
                    {brand.name.charAt(0)}
                  </motion.div>
                )}
              </div>
              
              {/* Brand name */}
              <span
                className="font-bold text-sm text-center relative z-10 px-2"
                style={{
                  color: isSelected ? 'white' : '#111827',
                  textShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {brand.name}
              </span>
              
              {/* Product count badge */}
              {brand.productCount !== undefined && (
                <motion.span
                  className="text-xs mt-2 px-3 py-1 rounded-full font-semibold relative z-10"
                  style={{
                    background: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : 'rgba(0, 0, 0, 0.05)',
                    color: isSelected ? 'white' : '#6b7280',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {brand.productCount} items
                </motion.span>
              )}
              
              {/* Shimmer effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
                style={{
                  borderRadius: pillShaped ? '9999px' : '20px',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
