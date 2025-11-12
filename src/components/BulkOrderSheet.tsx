import { useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, Copy, Upload, Download, Zap, Truck, TrendingUp, X, Plus, Minus } from 'lucide-react';

interface BulkOrderSheetProps {
  products: Product[];
  stores: Array<{ id: string; store_name: string }>;
  onSubmitOrders: (orders: Record<string, Record<string, number>>) => void;
  onClose: () => void;
}

export default function BulkOrderSheet({ products, stores, onSubmitOrders, onClose }: BulkOrderSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
  const [selectedStore, setSelectedStore] = useState<string>(stores[0]?.id || '');
  const [showValueBanner, setShowValueBanner] = useState(true);

  useEffect(() => {
    const initialQuantities: Record<string, Record<string, number>> = {};
    stores.forEach(store => {
      initialQuantities[store.id] = {};
      products.forEach(product => {
        initialQuantities[store.id][product.id] = 0;
      });
    });
    setQuantities(initialQuantities);
  }, [stores, products]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateQuantity = (storeId: string, productId: string, qty: number) => {
    setQuantities(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        [productId]: Math.max(0, qty)
      }
    }));
  };

  const copyToAllStores = (productId: string) => {
    const sourceQty = quantities[selectedStore]?.[productId] || 0;
    setQuantities(prev => {
      const updated = { ...prev };
      stores.forEach(store => {
        if (!updated[store.id]) updated[store.id] = {};
        updated[store.id][productId] = sourceQty;
      });
      return updated;
    });
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(quantities).forEach(storeQtys => {
      Object.entries(storeQtys).forEach(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        if (product) total += product.price * qty;
      });
    });
    return total;
  };

  const calculateStoreTotal = (storeId: string) => {
    let total = 0;
    Object.entries(quantities[storeId] || {}).forEach(([productId, qty]) => {
      const product = products.find(p => p.id === productId);
      if (product) total += product.price * qty;
    });
    return total;
  };

  const total = calculateTotal();
  const qualifiesExpressDelivery = total >= 2000;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-black mb-1">⚡ Lightning Fast Bulk Order</h1>
                <p className="text-white/90 text-lg font-semibold">Order for all your stores in one shot!</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-gray-900" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80">Order Total</p>
                    <p className="text-2xl font-black">${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {qualifiesExpressDelivery && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 border-2 border-yellow-300 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Truck className="text-gray-900" size={24} />
                    <div>
                      <p className="text-sm font-black text-gray-900">EXPRESS DELIVERY!</p>
                      <p className="text-xs font-bold text-gray-800">Get it by tomorrow 🚀</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <Zap className="text-yellow-300" size={24} />
                  <div>
                    <p className="text-sm font-bold text-white/80">Stores</p>
                    <p className="text-2xl font-black">{stores.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!qualifiesExpressDelivery && showValueBanner && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 relative">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck size={28} />
                <div>
                  <p className="font-black text-lg">Add ${(2000 - total).toFixed(2)} more for EXPRESS DELIVERY by tomorrow!</p>
                  <p className="text-sm text-white/90">Orders over $2,000 ship within 24 hours 🎉</p>
                </div>
              </div>
              <button onClick={() => setShowValueBanner(false)} className="text-white hover:text-white/70">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
            <div className="mb-4 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-lg font-semibold"
                />
              </div>

              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.store_name}</option>
                ))}
              </select>

              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <Upload size={20} />
                Load Template
              </button>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
              <div className="h-full overflow-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left font-black text-lg">Product</th>
                      <th className="px-6 py-4 text-center font-black">Price</th>
                      <th className="px-6 py-4 text-center font-black">Quantity</th>
                      <th className="px-6 py-4 text-center font-black">Subtotal</th>
                      <th className="px-6 py-4 text-center font-black">Copy to All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => {
                      const qty = quantities[selectedStore]?.[product.id] || 0;
                      const subtotal = product.price * qty;

                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-gray-200 hover:bg-emerald-50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: product.background_color + '33' }}
                              >
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-lg">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.units_per_case} units/case</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <p className="text-2xl font-black text-emerald-600">${product.price.toFixed(2)}</p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateQuantity(selectedStore, product.id, qty - 1)}
                                className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center font-bold shadow-md"
                              >
                                <Minus size={20} />
                              </button>
                              <input
                                type="number"
                                value={qty}
                                onChange={(e) => updateQuantity(selectedStore, product.id, parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-2 text-center text-xl font-black border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                min="0"
                              />
                              <button
                                onClick={() => updateQuantity(selectedStore, product.id, qty + 1)}
                                className="w-10 h-10 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center font-bold shadow-md"
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <p className="text-2xl font-black text-gray-900">${subtotal.toFixed(2)}</p>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => copyToAllStores(product.id)}
                              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto shadow-md"
                            >
                              <Copy size={16} />
                              Copy
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4">
                {stores.map(store => {
                  const storeTotal = calculateStoreTotal(store.id);
                  return (
                    <div
                      key={store.id}
                      className={`px-4 py-2 rounded-xl border-2 ${
                        selectedStore === store.id
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-gray-600">{store.store_name}</p>
                      <p className="text-lg font-black text-gray-900">${storeTotal.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => onSubmitOrders(quantities)}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xl font-black rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                Submit All Orders - ${total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
