import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface Order {
  id: string;
  customerName: string;
  status: string;
  updatedAt: string;
}

export default function FulfillmentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [connected, setConnected] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://77.243.85.8:3000';

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dev/orders`);
      const data = await response.json();
      setOrders(data);
      console.log('📦 Fetched orders:', data);
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setConnected(false);
    });

    socket.on('orders-updated', () => {
      console.log('🔔 Orders updated event received');
      fetchOrders();
    });

    // Initial fetch
    fetchOrders();

    return () => {
      socket.disconnect();
    };
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const pickingOrders = orders.filter(o => o.status === 'PICKING');
  const loadedOrders = orders.filter(o => o.status === 'LOADED');

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📦 Fulfillment Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <p className="text-gray-600 mb-8">
        Manage live orders, update inventory, and confirm deliveries in real time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Active Orders ({pendingOrders.length})</h2>
          <p className="text-sm text-gray-500 mb-4">Real-time view of current dispatches.</p>
          {pendingOrders.map(order => (
            <div key={order.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-2">
              <div className="font-medium">{order.customerName}</div>
              <div className="text-sm text-gray-600">{order.id}</div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Pending Pickups ({pickingOrders.length})</h2>
          <p className="text-sm text-gray-500 mb-4">Track warehouse-to-driver transfers.</p>
          {pickingOrders.map(order => (
            <div key={order.id} className="p-3 bg-blue-50 border border-blue-200 rounded mb-2">
              <div className="font-medium">{order.customerName}</div>
              <div className="text-sm text-gray-600">{order.id}</div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Delivery Status ({loadedOrders.length})</h2>
          <p className="text-sm text-gray-500 mb-4">Monitor in-transit and completed orders.</p>
          {loadedOrders.map(order => (
            <div key={order.id} className="p-3 bg-green-50 border border-green-200 rounded mb-2">
              <div className="font-medium">{order.customerName}</div>
              <div className="text-sm text-gray-600">{order.id}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
