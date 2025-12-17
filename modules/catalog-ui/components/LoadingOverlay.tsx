import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Download, Upload, RefreshCw } from 'lucide-react';
import { neonColors, glowPresets, glassmorphism } from '../theme/catalogVisuals';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  type?: 'regenerating' | 'ingesting' | 'processing' | 'default';
  progress?: number; // 0-100
  details?: string; // Additional details below main message
}

const LoadingIcon: React.FC<{ type: LoadingOverlayProps['type'] }> = ({ type }) => {
  const iconProps = {
    className: "w-16 h-16",
    strokeWidth: 2,
  };

  switch (type) {
    case 'regenerating':
      return <RefreshCw {...iconProps} />;
    case 'ingesting':
      return <Download {...iconProps} />;
    case 'processing':
      return <Sparkles {...iconProps} />;
    default:
      return <Loader2 {...iconProps} />;
  }
};

const getMessageByType = (type: LoadingOverlayProps['type']): string => {
  switch (type) {
    case 'regenerating':
      return 'AI is regenerating your product images...';
    case 'ingesting':
      return 'Auto-ingesting Purchase Order...';
    case 'processing':
      return 'AI is building your catalog...';
    default:
      return 'Loading...';
  }
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message,
  type = 'default',
  progress,
  details,
}) => {
  const displayMessage = message || getMessageByType(type);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Central loading card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="relative p-8 rounded-3xl max-w-md w-full mx-4"
            style={{
              ...glassmorphism.strong,
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `0 0 60px ${neonColors.purple}60, ${glowPresets.strong.boxShadow}`,
              border: `2px solid ${neonColors.purple}40`,
            }}
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              animate={{
                background: [
                  `linear-gradient(0deg, ${neonColors.purple}, ${neonColors.pink})`,
                  `linear-gradient(360deg, ${neonColors.purple}, ${neonColors.pink})`,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                padding: '2px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Animated icon */}
              <motion.div
                animate={{
                  rotate: type === 'regenerating' || type === 'default' ? 360 : 0,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                className="mb-6"
                style={{
                  color: neonColors.purple,
                  filter: `drop-shadow(0 0 20px ${neonColors.purple})`,
                }}
              >
                <LoadingIcon type={type} />
              </motion.div>

              {/* Main message */}
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {displayMessage}
              </h2>

              {/* Details */}
              {details && (
                <p className="text-gray-600 text-sm mb-4">{details}</p>
              )}

              {/* Progress bar */}
              {progress !== undefined && (
                <div className="w-full mt-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        background: `linear-gradient(90deg, ${neonColors.purple}, ${neonColors.pink})`,
                        boxShadow: `0 0 10px ${neonColors.purple}`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Pulsing dots animation */}
              <div className="flex gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: neonColors.purple,
                      boxShadow: `0 0 10px ${neonColors.purple}`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Shimmer overlay effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${neonColors.purple}20, transparent)`,
                }}
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
