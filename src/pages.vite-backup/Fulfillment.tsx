"use client";

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '@/lib/apiClient';
import socket from '@/lib/socket';

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await fetchFromAPI<any>('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('❌ Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    if (socket) socket.on('orders-updated', loadOrders);
    return () => socket?.off('orders-updated', loadOrders);
  }, []);

  if (loading) return <main className="p-6 text-gray-500">Loading orders…</main>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📦 Fulfillment Dashboard</h1>
        <button
          onClick={loadOrders}
          className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Refresh
        </button>
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-500">No active orders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold">Order #{o.id}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  {o.status || 'PENDING'}
                </span>
              </div>
              <p className="text-sm text-gray-600">Customer: {o.customer_name ?? o.customerName ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-1">
                Updated: {new Date(o.updatedAt || o.updated_at || Date.now()).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
