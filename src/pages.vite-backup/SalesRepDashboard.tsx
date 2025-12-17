import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';
const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL ?? 'http://localhost:4000';

interface LeaderEntry {
  userId: string;
  name: string;
  points: number;
  totalSales: number;
  totalOrders: number;
  badges: Array<{ id: string; name: string }>;
}

interface LeaderboardResponse {
  sales: LeaderEntry[];
}

export default function SalesRepDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<LeaderEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/gamification/leaderboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as LeaderboardResponse;
        const current = data.sales.find((entry) => entry.userId === user?.id) || null;
        setStats(current);
      }
    };
    if (user) load();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on('gamification:badge', (payload: { userId: string; badge: { name: string } }) => {
      if (payload.userId === user.id) {
        setToast(`🏅 You unlocked the ${payload.badge.name} badge!`);
        setTimeout(() => setToast(null), 4000);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Sales Rep</p>
            <h1 className="text-3xl font-black text-gray-900">Performance Center</h1>
            <p className="text-gray-500 text-sm">Track your points, badges, and upcoming incentives.</p>
          </div>
          <Link to="/" className="text-emerald-600 font-semibold">
            ← Back to Catalog
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {toast && (
          <div className="bg-white border-l-4 border-emerald-500 rounded-2xl p-4 shadow text-emerald-700">
            {toast}
          </div>
        )}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Points</p>
            <p className="text-4xl font-black text-gray-900">{stats?.points ?? 0}</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Lifetime Sales</p>
            <p className="text-4xl font-black text-gray-900">
              ${stats ? stats.totalSales.toFixed(0) : '0'}
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Orders</p>
            <p className="text-4xl font-black text-gray-900">{stats?.totalOrders ?? 0}</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {stats?.badges?.length ? (
              stats.badges.map((badge) => (
                <span key={badge.id} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold">
                  {badge.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No badges yet. Keep selling to unlock rewards!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
