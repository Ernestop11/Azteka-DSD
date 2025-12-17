import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Package, ShoppingCart, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discount_percentage: number;
  image_url?: string;
}

interface AddToCartModalProps {
  product: Product;
  bundles?: Bundle[];
  onClose: () => void;
  onConfirm: (items: Array<{ product: Product; quantity: number }>) => void;
}

export default function AddToCartModal({ product, bundles = [], onClose, onConfirm }: AddToCartModalProps) {
  const [unitMode, setUnitMode] = useState<'cases' | 'pieces'>('cases');
  const [mainQuantity, setMainQuantity] = useState(1);
  const [bundleQuantities, setBundleQuantities] = useState<Record<string, number>>({});
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const piecesPerCase = product.units_per_case || 1;
  const actualQuantity = unitMode === 'cases' ? mainQuantity : Math.ceil(mainQuantity / piecesPerCase);
  const displayQuantity = unitMode === 'cases' ? mainQuantity : mainQuantity;

  const handleIncrement = () => {
    if (unitMode === 'cases') {
      setMainQuantity(mainQuantity + 1);
    } else {
      setMainQuantity(mainQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (mainQuantity > 1) {
      setMainQuantity(mainQuantity - 1);
    }
  };

  const handleBundleToggle = (bundleId: string) => {
    const newAdded = new Set(addedItems);
    if (newAdded.has(bundleId)) {
      newAdded.delete(bundleId);
      const newQuantities = { ...bundleQuantities };
      delete newQuantities[bundleId];
      setBundleQuantities(newQuantities);
    } else {
      newAdded.add(bundleId);
      setBundleQuantities({ ...bundleQuantities, [bundleId]: 1 });
    }
    setAddedItems(newAdded);
  };

  const handleBundleQuantityChange = (bundleId: string, delta: number) => {
    const current = bundleQuantities[bundleId] || 1;
    const newQty = Math.max(1, current + delta);
    setBundleQuantities({ ...bundleQuantities, [bundleId]: newQty });
  };

  const handleAddAll = () => {
    const newAdded = new Set(addedItems);
    const newQuantities = { ...bundleQuantities };

    bundles.forEach((bundle) => {
      if (!newAdded.has(bundle.id)) {
        newAdded.add(bundle.id);
        newQuantities[bundle.id] = 1;
      }
    });

    setAddedItems(newAdded);
    setBundleQuantities(newQuantities);
  };

  const handleConfirm = () => {
    const items: Array<{ product: Product; quantity: number }> = [
      { product, quantity: actualQuantity }
    ];

    // Add selected bundles
    bundles.forEach((bundle) => {
      if (addedItems.has(bundle.id)) {
        bundle.products.forEach((bundleProduct) => {
          items.push({
            product: bundleProduct,
            quantity: bundleQuantities[bundle.id] || 1
          });
        });
      }
    });

    onConfirm(items);
    onClose();
  };

  const totalPrice = (Number(product.price) || 0) * actualQuantity;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">Add to Cart</h2>
            <p className="text-emerald-50">Wholesale Direct-Store Delivery</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Main Product */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Package size={16} />
                    <span>{piecesPerCase} units per case</span>
                  </div>

                  {/* Unit Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setUnitMode('cases')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        unitMode === 'cases'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Cases
                    </button>
                    <button
                      onClick={() => setUnitMode('pieces')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        unitMode === 'pieces'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pieces
                    </button>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm">
                      <button
                        onClick={handleDecrement}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 font-bold text-lg">{displayQuantity}</span>
                      <button
                        onClick={handleIncrement}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {unitMode === 'cases' ? `${mainQuantity} cases` : `${mainQuantity} pieces = ${actualQuantity} case(s)`}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600">
                        ${totalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        (${(Number(product.price) || 0).toFixed(2)} per case)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Bundles */}
            {bundles.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Recommended Bundles</h3>
                  </div>
                  <button
                    onClick={handleAddAll}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Add All Bundles
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bundles.map((bundle) => {
                    const isAdded = addedItems.has(bundle.id);
                    const bundleQty = bundleQuantities[bundle.id] || 1;

                    return (
                      <motion.div
                        key={bundle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl p-4 border-2 transition-all ${
                          isAdded
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Bundle Image */}
                          {bundle.image_url && (
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={bundle.image_url}
                                alt={bundle.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Bundle Details */}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{bundle.name}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{bundle.description}</p>

                            {bundle.discount_percentage > 0 && (
                              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-2">
                                {bundle.discount_percentage}% OFF
                              </span>
                            )}

                            {/* Add/Quantity Controls */}
                            {isAdded ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white border border-emerald-500 rounded-lg">
                                  <button
                                    onClick={() => handleBundleQuantityChange(bundle.id, -1)}
                                    className="p-1 hover:bg-gray-100 rounded-l-lg"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="px-3 font-bold text-sm">{bundleQty}</span>
                                  <button
                                    onClick={() => handleBundleQuantityChange(bundle.id, 1)}
                                    className="p-1 hover:bg-gray-100 rounded-r-lg"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleBundleToggle(bundle.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleBundleToggle(bundle.id)}
                                className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                              >
                                Add Bundle
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-black text-gray-900">
                  {1 + Array.from(addedItems).length} {1 + Array.from(addedItems).length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
