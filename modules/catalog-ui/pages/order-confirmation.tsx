import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getAiAssetUrl,
  neonColors,
  shadows,
  createVignetteOverlay,
} from '../theme/catalogVisuals';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  unitType?: string;
}

interface StoreOrder {
  storeId: string;
  storeName: string;
  items: OrderItem[];
  total: number;
}

interface OrderConfirmationData {
  orderIds: string[];
  items?: OrderItem[];
  storeOrders?: StoreOrder[];
  totalAmount: number;
  isMultiStore: boolean;
  orderDate?: string;
  customerName?: string;
  categoryId?: string; // New: for Canva banner selection
}

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; xOffset: number }> = ({ delay, xOffset }) => {
  const colors = [neonColors.cyan, neonColors.magenta, neonColors.yellow, neonColors.lime, neonColors.orange, neonColors.pink];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{
        backgroundColor: color,
        left: `${50 + xOffset}%`,
        top: '-10%',
        boxShadow: `0 0 10px ${color}`,
      }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: '110vh',
        x: Math.random() * 200 - 100,
        opacity: [1, 1, 0],
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'easeIn',
      }}
    />
  );
};

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as OrderConfirmationData | null;
  const [showConfetti, setShowConfetti] = React.useState(true);

  // Redirect if no order data
  React.useEffect(() => {
    if (!orderData) {
      navigate('/catalog', { replace: true });
    }
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatOrderId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };
  
  // Get Canva-generated banner based on category
  const celebrationBanner = orderData.categoryId
    ? getAiAssetUrl('banners', `success-${orderData.categoryId}.webp`)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-8 px-4 relative overflow-hidden">
      {/* Confetti animation layer */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.05}
                xOffset={(i % 10 - 5) * 5}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Canva-generated celebration banner (if available) */}
      {celebrationBanner && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-64 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${celebrationBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
        />
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Success Animation with glow */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.7, bounce: 0.5 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center relative"
            style={{
              boxShadow: `0 0 60px ${neonColors.lime}80, ${shadows.strongLarge}`,
            }}
            animate={{
              boxShadow: [
                `0 0 60px ${neonColors.lime}80, ${shadows.strongLarge}`,
                `0 0 80px ${neonColors.lime}FF, ${shadows.strongLarge}`,
                `0 0 60px ${neonColors.lime}80, ${shadows.strongLarge}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeInOut' }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Header with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 40px ${neonColors.lime}40`,
            }}
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Order Confirmed!
          </motion.h1>
          <p className="text-gray-700 text-xl">
            Thank you for your order. We'll process it right away.
          </p>
        </motion.div>

        {/* Order Details Card with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl overflow-hidden mb-8 relative"
          style={{
            boxShadow: `0 0 40px ${neonColors.brandOrange}20, ${shadows.strongLarge}`,
          }}
        >
          {/* Order Header with gradient and glow */}
          <div
            className="relative px-8 py-6 text-white"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF4444 100%)',
              boxShadow: `inset 0 0 40px ${neonColors.brandOrange}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Order ID{orderData.orderIds.length > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold">
                  {orderData.orderIds.length === 1
                    ? `#${formatOrderId(orderData.orderIds[0])}`
                    : `${orderData.orderIds.length} Orders Created`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Date</p>
                <p className="text-lg font-bold">
                  {orderData.orderDate
                    ? new Date(orderData.orderDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Content */}
          <div className="p-6">
            {orderData.isMultiStore && orderData.storeOrders ? (
              // Multi-Store Orders
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Store Breakdown
                </h3>
                {orderData.storeOrders.map((storeOrder, index) => (
                  <div
                    key={storeOrder.storeId}
                    className="border-2 border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{storeOrder.storeName}</h4>
                          <p className="text-sm text-gray-600">
                            Order #{formatOrderId(orderData.orderIds[index])}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${storeOrder.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {storeOrder.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between py-2 border-t border-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single Store Order
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Order Items
                </h3>
                {orderData.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                        {item.unitType && ` / ${item.unitType}`}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Total Summary */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${orderData.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Estimated Tax (8%)</span>
                <span className="font-semibold text-gray-900">
                  ${(orderData.totalAmount * 0.08).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold text-gray-900 mt-4">
                <span>Total</span>
                <span className="text-green-600">
                  ${(orderData.totalAmount * 1.08).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What's Next?
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Your order will be processed within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>You can track your order status in your dashboard</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <button
            onClick={() => navigate('/catalog')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
