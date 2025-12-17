import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  createVignetteOverlay,
  getAiAssetUrl,
  gradients,
  neonColors,
  shadows,
} from '../theme/catalogVisuals';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  ctaText?: string;
  ctaAction?: () => void;
  height?: 'small' | 'medium' | 'large';
  animated?: boolean;
  useCanvaImage?: boolean; // New: use Canva-generated hero
  canvaImageId?: string; // New: ID for Canva asset
  parallax?: boolean; // New: enable parallax effect
  textOverlay?: { position?: 'left' | 'center' | 'right'; color?: string }; // New: text overlay config
  showLoadingSkeleton?: boolean; // New: show loading state while image loads
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  imageUrl,
  gradientFrom = '#667eea',
  gradientTo = '#764ba2',
  ctaText,
  ctaAction,
  height = 'medium',
  animated = true,
  useCanvaImage = true,
  canvaImageId,
  parallax = true,
  textOverlay = { position: 'left', color: 'white' },
  showLoadingSkeleton = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect for background
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  
  const heightClasses = {
    small: 'h-48',
    medium: 'h-72',
    large: 'h-96',
  };
  
  // Get Canva-generated hero image
  const heroImage = useCanvaImage && canvaImageId
    ? getAiAssetUrl('heroes', canvaImageId, imageUrl)
    : imageUrl;
  
  const textPositionClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <motion.div
      className={`relative ${heightClasses[height]} rounded-3xl overflow-hidden mb-8 group`}
      style={{
        boxShadow: shadows.strongLarge,
      }}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Loading skeleton */}
      {showLoadingSkeleton && !imageLoaded && heroImage && !imageError && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-gray-400 border-t-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Parallax background */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: parallax ? backgroundY : 0,
          opacity: imageLoaded || !heroImage ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          background: heroImage && !imageError
            ? 'transparent'
            : `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
      >
        {heroImage && !imageError && (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </motion.div>
      
      {/* Vignette overlay for product focus */}
      <div style={createVignetteOverlay('medium')} />
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      
      {/* Neon glow border on hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          border: `2px solid ${neonColors.brandOrange}`,
          boxShadow: `0 0 30px ${neonColors.brandOrange}, inset 0 0 30px ${neonColors.brandOrange}20`,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content with text overlay */}
      <div className={`relative h-full flex flex-col justify-center px-8 md:px-12 ${textPositionClasses[textOverlay.position || 'left']}`}>
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl"
          style={{
            color: textOverlay.color || 'white',
            textShadow: `0 0 40px ${neonColors.brandOrange}40, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
          initial={animated ? { opacity: 0, x: -30 } : {}}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            className="text-xl md:text-3xl font-light mb-6 drop-shadow-xl max-w-3xl"
            style={{
              color: textOverlay.color || 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
            initial={animated ? { opacity: 0, x: -30 } : {}}
            animate={animated ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {ctaText && ctaAction && (
          <motion.button
            onClick={ctaAction}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-4 rounded-full font-bold shadow-2xl w-fit relative overflow-hidden group"
            style={{
              boxShadow: `0 0 30px ${neonColors.brandOrange}60, 0 8px 24px rgba(0,0,0,0.3)`,
            }}
            initial={animated ? { opacity: 0, scale: 0.9 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <span className="relative z-10">{ctaText}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
