/**
 * Multi-Store Order Component
 *
 * Features:
 * - Vertical store list on left
 * - Active store highlighted
 * - Cart preview per store
 * - "Copy order" functionality
 * - Bundle recommendations per store
 * - One-click "Create 9 orders" with progress
 * - Animated progress bar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface Store {
  id: number;
  name: string;
  address: string;
  contact: string;
  lastOrderDate?: string;
  totalSpend?: number;
}

interface CartItem {
  product_id: number;
  sku: string;
  name: string;
  quantity: number;
  price_case: number;
}

interface StoreCart {
  store_id: number;
  items: CartItem[];
  subtotal: number;
}

interface BundleRecommendation {
  bundleId: string;
  title: string;
  products: Array<{ id: number; name: string; price: number }>;
  savings: number;
}

interface OrderProgress {
  storeId: number;
  storeName: string;
  status: 'pending' | 'creating' | 'completed' | 'error';
  orderId?: number;
  error?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MultiStoreOrder() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [carts, setCarts] = useState<Record<number, StoreCart>>({});
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [orderProgress, setOrderProgress] = useState<OrderProgress[]>([]);

  // Mock data - replace with real data
  const stores: Store[] = [
    {
      id: 1,
      name: 'La Tiendita Express',
      address: '123 Main St, Los Angeles',
      contact: '(555) 123-4567',
      lastOrderDate: '2025-11-15',
      totalSpend: 1250.5,
    },
    {
      id: 2,
      name: 'Mercadito Central',
      address: '456 Oak Ave, Los Angeles',
      contact: '(555) 234-5678',
      lastOrderDate: '2025-11-14',
      totalSpend: 980.25,
    },
    {
      id: 3,
      name: 'Supermercado Del Valle',
      address: '789 Pine Blvd, Los Angeles',
      contact: '(555) 345-6789',
      lastOrderDate: '2025-11-13',
      totalSpend: 2100.0,
    },
    // Add more stores...
  ];

  const mockBundles: BundleRecommendation[] = [
    {
      bundleId: 'takis-variety',
      title: 'Takis Flavor Explosion',
      products: [
        { id: 1, name: 'Takis Fuego', price: 24.99 },
        { id: 2, name: 'Takis Nitro', price: 24.99 },
      ],
      savings: 7.5,
    },
  ];

  const selectedStore = stores.find((s) => s.id === selectedStoreId);
  const storeCart = selectedStoreId ? carts[selectedStoreId] : undefined;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCopyOrder = (fromStoreId: number, toStoreId: number) => {
    const sourceCart = carts[fromStoreId];
    if (sourceCart) {
      setCarts((prev) => ({
        ...prev,
        [toStoreId]: {
          store_id: toStoreId,
          items: [...sourceCart.items],
          subtotal: sourceCart.subtotal,
        },
      }));
    }
  };

  const handleCreateAllOrders = async () => {
    setIsCreatingOrders(true);

    const storesToOrder = stores.filter((s) => carts[s.id]?.items.length > 0);

    const progress: OrderProgress[] = storesToOrder.map((s) => ({
      storeId: s.id,
      storeName: s.name,
      status: 'pending',
    }));

    setOrderProgress(progress);

    // Simulate order creation
    for (let i = 0; i < storesToOrder.length; i++) {
      const store = storesToOrder[i];

      setOrderProgress((prev) =>
        prev.map((p) => (p.storeId === store.id ? { ...p, status: 'creating' } : p))
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const success = Math.random() > 0.1;

      if (success) {
        setOrderProgress((prev) =>
          prev.map((p) =>
            p.storeId === store.id
              ? { ...p, status: 'completed', orderId: Math.floor(Math.random() * 10000) }
              : p
          )
        );
      } else {
        setOrderProgress((prev) =>
          prev.map((p) =>
            p.storeId === store.id
              ? { ...p, status: 'error', error: 'Failed to create order' }
              : p
          )
        );
      }
    }

    setIsCreatingOrders(false);
  };

  const completedCount = orderProgress.filter((p) => p.status === 'completed').length;
  const progressPercentage =
    orderProgress.length > 0 ? (completedCount / orderProgress.length) * 100 : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Store List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Stores ({stores.length})</h2>
          <p className="text-sm text-gray-500 mt-1">Select a store to manage its order</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stores.map((store) => {
            const cart = carts[store.id];
            const isActive = selectedStoreId === store.id;
            const hasItems = cart && cart.items.length > 0;

            return (
              <motion.button
                key={store.id}
                onClick={() => setSelectedStoreId(store.id)}
                className={`w-full text-left p-4 border-b border-gray-100 transition-all ${
                  isActive
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{store.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{store.address}</div>
                    {store.lastOrderDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        Last order: {store.lastOrderDate}
                      </div>
                    )}
                  </div>

                  {hasItems && (
                    <div className="ml-2 flex flex-col items-end">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cart.items.length} items
                      </span>
                      <span className="text-xs text-gray-600 mt-1">
                        ${cart.subtotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Create All Orders Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCreateAllOrders}
            disabled={
              isCreatingOrders || Object.values(carts).every((c) => c.items.length === 0)
            }
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isCreatingOrders ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Orders...
              </span>
            ) : (
              `Create ${Object.values(carts).filter((c) => c.items.length > 0).length} Orders`
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Progress Bar */}
        <AnimatePresence>
          {isCreatingOrders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-600 overflow-hidden"
            >
              <div className="relative h-2">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-blue-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="px-6 py-3 text-white text-sm font-medium">
                Creating orders: {completedCount} of {orderProgress.length} completed
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedStore ? (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
              {/* Store Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{selectedStore.address}</p>
                    <p className="text-sm text-gray-500">{selectedStore.contact}</p>
                  </div>

                  {/* Copy Order Dropdown */}
                  <div className="relative">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Order From...
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase">Cart Items</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {storeCart?.items.length || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase">Subtotal</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      ${storeCart?.subtotal.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase">Last Order</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {selectedStore.lastOrderDate || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bundle Recommendations */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recommended for {selectedStore.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockBundles.map((bundle) => (
                    <motion.div
                      key={bundle.bundleId}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{bundle.title}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {bundle.products.length} products
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Save ${bundle.savings.toFixed(2)}
                        </span>
                      </div>

                      <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Add Bundle to Cart
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cart Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Cart</h3>

                {storeCart && storeCart.items.length > 0 ? (
                  <div className="space-y-3">
                    {storeCart.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {item.quantity} × ${item.price_case.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${(item.quantity * item.price_case).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Subtotal</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${storeCart.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <p className="mt-4">No items in cart</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="mt-4 text-lg">Select a store to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Progress Modal */}
        <AnimatePresence>
          {isCreatingOrders && orderProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Creating Orders</h3>

                <div className="space-y-3">
                  {orderProgress.map((progress) => (
                    <div key={progress.storeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          {progress.status === 'pending' && (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                          {progress.status === 'creating' && (
                            <svg
                              className="animate-spin h-5 w-5 text-blue-600"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          )}
                          {progress.status === 'completed' && (
                            <svg
                              className="h-5 w-5 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {progress.status === 'error' && (
                            <svg
                              className="h-5 w-5 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{progress.storeName}</div>
                          {progress.status === 'completed' && (
                            <div className="text-sm text-green-600">
                              Order #{progress.orderId} created
                            </div>
                          )}
                          {progress.status === 'error' && (
                            <div className="text-sm text-red-600">{progress.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
