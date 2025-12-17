import React from 'react';
import { motion } from 'framer-motion';
import {
  getAiAssetUrl,
  getSavingsNeonColor,
  neonColors,
  shadows,
  glowPresets,
  createGlossyOverlay,
} from '../theme/catalogVisuals';

interface BundleProduct {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  products: BundleProduct[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  imageUrl?: string;
}

interface BundleSectionProps {
  bundles: Bundle[];
  onAddBundle: (bundleId: string) => void;
  useAiGraphics?: boolean; // New: use AI-generated bundle graphics
  isNew?: boolean; // New: show "New Bundle!" blink effect
}

export const BundleSection: React.FC<BundleSectionProps> = ({
  bundles,
  onAddBundle,
  useAiGraphics = true,
  isNew = false,
}) => {
  if (bundles.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Bundle Deals
        </h2>
        {isNew && (
          <motion.div
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
            animate={{
              opacity: [1, 0.7, 1],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              boxShadow: `0 0 20px ${neonColors.orange}, 0 0 40px ${neonColors.orange}60`,
            }}
          >
            ✨ New Bundles!
          </motion.div>
        )}
      </div>
      <p className="text-gray-600 mb-8 text-lg">Save more when you buy together</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bundles.map((bundle, index) => {
          const savingsPercent = Math.round((bundle.savings / bundle.originalPrice) * 100);
          const neonColor = getSavingsNeonColor(savingsPercent);
          
          // Get AI-generated bundle graphic
          const bundleImage = useAiGraphics
            ? getAiAssetUrl('bundles', `${bundle.id}.webp`, bundle.imageUrl)
            : bundle.imageUrl;

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl p-6 overflow-hidden group"
              style={{
                boxShadow: shadows.strongLarge,
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
              }}
            >
              {/* Glossy overlay */}
              <div style={createGlossyOverlay()} />
              
              {/* Neon border on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  border: `2px solid ${neonColor}`,
                  boxShadow: `0 0 30px ${neonColor}80, inset 0 0 30px ${neonColor}20`,
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Bundle Header */}
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {bundle.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{bundle.description}</p>
                </div>
                {bundleImage && (
                  <motion.img
                    src={bundleImage}
                    alt={bundle.title}
                    className="w-24 h-24 object-cover rounded-xl ml-4 shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>

              {/* Products Preview with enhanced styling */}
              <div className="flex gap-3 mb-5 overflow-x-auto scrollbar-hide relative z-10">
                {bundle.products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    className="flex-shrink-0 w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 object-contain"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </motion.div>
                ))}
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md text-purple-600 font-bold text-lg">
                  +{bundle.products.length}
                </div>
              </div>

              {/* Pricing with neon savings badge */}
              <div className="flex items-end justify-between mb-5 relative z-10">
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${bundle.bundlePrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      ${bundle.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <motion.div
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${neonColor} 0%, ${neonColor}CC 100%)`,
                      boxShadow: `0 0 20px ${neonColor}80, 0 4px 12px rgba(0,0,0,0.2)`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 20px ${neonColor}80, 0 4px 12px rgba(0,0,0,0.2)`,
                        `0 0 30px ${neonColor}FF, 0 6px 18px rgba(0,0,0,0.3)`,
                        `0 0 20px ${neonColor}80, 0 4px 12px rgba(0,0,0,0.2)`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💰 Save ${bundle.savings.toFixed(2)} ({savingsPercent}% OFF)
                  </motion.div>
                </div>

                <motion.button
                  onClick={() => onAddBundle(bundle.id)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: `0 0 20px ${neonColors.purple}60, 0 8px 24px rgba(0,0,0,0.3)`,
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  <span className="relative z-10">Add Bundle</span>
                </motion.button>
              </div>

              {/* Limited time badge with blink animation */}
              <motion.div
                className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg relative z-10"
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  boxShadow: `0 0 15px ${neonColors.orange}80`,
                }}
              >
                🔥 LIMITED TIME OFFER
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
