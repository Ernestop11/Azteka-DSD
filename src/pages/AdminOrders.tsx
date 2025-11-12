import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import OrdersService, { OrderResponse } from '../lib/orders';
import { printOrder } from '../lib/print';

const formatCurrency = (value: string | number | undefined) => {
  const amount = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  const safeAmount = Number.isNaN(amount) ? 0 : amount;
  return `$${safeAmount.toFixed(2)}`;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await OrdersService.fetchOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const statuses = useMemo(() => {
    const unique = Array.from(new Set(orders.map((order) => order.status || 'pending')));
    return ['all', ...unique];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (dateFilter) {
        const orderDate = new Date(order.createdAt);
        const filterDate = new Date(dateFilter);
        if (orderDate < filterDate) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-500 font-bold">Azteka Super Admin</p>
            <h1 className="text-3xl font-black text-gray-900">Orders Dashboard</h1>
          </div>
          <Link
            to="/"
            className="px-5 py-2 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-emerald-500 transition"
          >
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Created After</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">Total Orders</p>
              <p className="text-3xl font-black text-gray-900">{filteredOrders.length}</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                )}

                {error && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No orders match the selected filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.id.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            printOrder({
                              customerName: order.customerName,
                              createdAt: order.createdAt,
                              total: parseFloat(order.total ?? '0'),
                              items: order.items.map((item) => ({
                                name: item.product?.name || 'Product',
                                quantity: item.quantity,
                                price: parseFloat(item.price ?? '0'),
                              })),
                            })
                          }
                          className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow hover:shadow-lg transition"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
