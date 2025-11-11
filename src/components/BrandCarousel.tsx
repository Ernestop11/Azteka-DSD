import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { brands, rackBundles } from '../lib/brandData';

interface BrandCarouselProps {
  onAddBundle: (bundleId: string) => void;
}

export default function BrandCarousel({ onAddBundle }: BrandCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rackBundles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % rackBundles.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + rackBundles.length) % rackBundles.length);

  const currentBundle = rackBundles[currentIndex];
  const currentBrand = brands[currentBundle.brandId as keyof typeof brands];

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-3xl shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${currentBrand.color} 0%, ${currentBrand.secondaryColor} 100%)`,
          }}
        >
          <div className="grid md:grid-cols-2 gap-8 p-12 h-full items-center">
            <div className="text-white space-y-6">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                🎁 FREE DISPLAY RACK INCLUDED
              </div>

              <h2 className="text-5xl font-black leading-tight">
                {currentBrand.name}
                <br />
                <span className="text-white/90">Premium Bundle</span>
              </h2>

              <p className="text-xl text-white/90 font-medium">
                {currentBundle.description}
              </p>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="text-sm text-white/80">Regular Price</div>
                  <div className="text-2xl font-bold line-through text-white/60">
                    ${currentBundle.totalValue}
                  </div>
                </div>
                <div className="bg-yellow-400 text-gray-900 rounded-2xl px-6 py-4">
                  <div className="text-sm font-bold">Bundle Price</div>
                  <div className="text-3xl font-black">
                    ${currentBundle.discountedPrice}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  What's Included:
                </div>
                {currentBundle.includes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/90">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onAddBundle(currentBundle.id)}
                className="w-full bg-white text-gray-900 font-bold py-4 px-8 rounded-2xl hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                Add Bundle to Cart - Save ${currentBundle.savings}
              </button>
            </div>

            <div className="relative h-full">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                src={currentBundle.rackImage}
                alt={currentBundle.name}
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 font-black text-2xl px-6 py-3 rounded-full rotate-12 shadow-xl">
                SAVE ${currentBundle.savings}!
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {rackBundles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
