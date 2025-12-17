import { Package, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { CartItem } from '../types';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
  onClose: () => void;
}

export default function OrderHistory({ orders, onReorder, onClose }: OrderHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Package size={28} />
              <h2 className="text-2xl font-bold">Order History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-white/90">Quick reorder your favorite products</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Start shopping to see your order history</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {order.order_number}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-700 font-medium">
                        {item.product_name}
                      </span>
                      <span className="text-gray-600">
                        {item.quantity}x @ ${item.unit_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-gray-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const cartItems: CartItem[] = order.items.map((item) => ({
                        id: item.product_id,
                        name: item.product_name,
                        price: item.unit_price,
                        quantity: item.quantity,
                        category_id: '',
                        slug: '',
                        description: '',
                        sku: '',
                        image_url: '',
                        background_color: '#f3f4f6',
                        unit_type: 'case',
                        units_per_case: 1,
                        min_order_quantity: 1,
                        in_stock: true,
                        featured: false,
                      }));
                      onReorder(cartItems);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <RefreshCw size={18} />
                    Reorder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
