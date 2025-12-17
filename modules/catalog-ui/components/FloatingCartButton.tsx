import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface FloatingCartButtonProps {
  items: CartItem[];
  onViewCart: () => void;
  isVisible?: boolean;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  items,
  onViewCart,
  isVisible = true,
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Trigger animation when cart items change
  useEffect(() => {
    if (totalItems > 0) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (!isVisible || totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <motion.button
          onClick={onViewCart}
          animate={shouldAnimate ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-4 min-w-[280px]"
        >
          {/* Cart Icon with Badge */}
          <div className="relative">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            
            {/* Item Count Badge */}
            <AnimatePresence>
              <motion.div
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
              >
                {totalItems}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </div>
            <div className="text-xs opacity-90">Tap to view cart</div>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
          </div>
        </motion.button>

        {/* Mini Cart Preview (Optional - appears on hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-2xl p-4 max-h-64 overflow-y-auto hidden md:block"
        >
          <h3 className="font-bold text-gray-900 mb-3">Your Cart</h3>
          <div className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <div className="text-center text-gray-500 text-xs pt-2 border-t">
                +{items.length - 5} more items
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
