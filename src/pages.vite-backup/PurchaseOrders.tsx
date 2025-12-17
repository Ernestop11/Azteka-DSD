import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface PurchaseOrderItem {
  id: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  cost: string;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  total: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

const formatCurrency = (value: string | number) => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
};

const withAuth = (token: string | null, headers: HeadersInit = {}) =>
  token
    ? {
        ...headers,
        Authorization: `Bearer ${token}`,
      }
    : headers;

export default function PurchaseOrders() {
  const { token } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/po`, {
        headers: withAuth(token, { Accept: 'application/json' }),
      });
      if (!res.ok) {
        throw new Error('Failed to load purchase orders');
      }
      const data = await res.json();
      setPurchaseOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshOrders();
    }
  }, [token]);

  const handleCreate = async () => {
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/po/create`, {
        method: 'POST',
        headers: withAuth(token, { 'Content-Type': 'application/json' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'No low stock products detected');
      }
      await refreshOrders();
      setActionMessage('Purchase orders created from low-stock products.');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Unable to create purchase order');
    }
  };

  const handleMarkReceived = async (id: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/po/${id}`, {
        method: 'PATCH',
        headers: withAuth(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: 'received' }),
      });
      if (!res.ok) {
        throw new Error('Failed to update purchase order');
      }
      await refreshOrders();
      setActionMessage('Purchase order marked as received.');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Unable to update purchase order');
    }
  };

  const groupedTotals = useMemo(() => {
    return purchaseOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [purchaseOrders]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-500 font-bold">Admin</p>
            <h1 className="text-3xl font-black text-slate-900">Purchase Orders</h1>
            <p className="text-slate-500 text-sm">Monitor replenishment and supplier logistics.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow hover:shadow-lg transition"
            >
              New PO (Auto)
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 border-2 border-slate-200 rounded-2xl font-semibold text-slate-700 hover:border-emerald-500 transition"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {actionMessage && (
          <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700">
            {actionMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedTotals).map(([status, count]) => (
            <div key={status} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{status}</p>
              <p className="text-3xl font-black text-slate-900">{count}</p>
            </div>
          ))}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      Loading purchase orders...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No purchase orders yet. Click “New PO (Auto)” to build one from low-stock items.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  purchaseOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{order.supplier}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                            <span className="font-semibold text-slate-700">{item.product.name}</span>
                            <span className="text-slate-500">
                              {item.quantity} × {formatCurrency(item.cost)}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'received'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {order.status !== 'received' && (
                          <button
                            onClick={() => handleMarkReceived(order.id)}
                            className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-emerald-500 hover:bg-emerald-600 transition"
                          >
                            Mark Received
                          </button>
                        )}
                        <button
                          onClick={() => setActionMessage('Invoice upload flow coming in Phase 3A.')}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:border-slate-400 transition"
                        >
                          Upload Invoice
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
