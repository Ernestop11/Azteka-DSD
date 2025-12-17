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
  totalOrders: number;
  badges: Array<{ id: string; name: string }>;
}

interface LeaderboardResponse {
  drivers: LeaderEntry[];
}

export default function DriverDashboard() {
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
        const current = data.drivers.find((entry) => entry.userId === user?.id) || null;
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
        setToast(`🏅 ${payload.badge.name} badge unlocked!`);
        setTimeout(() => setToast(null), 4000);
      }
    });
    return () => socket.disconnect();
  }, [token, user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Driver</p>
            <h1 className="text-3xl font-black text-slate-900">Route Productivity</h1>
            <p className="text-slate-500 text-sm">Monitor deliveries, points, and unlock hauls-based badges.</p>
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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Points</p>
            <p className="text-4xl font-black text-slate-900">{stats?.points ?? 0}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Deliveries</p>
            <p className="text-4xl font-black text-slate-900">{stats?.totalOrders ?? 0}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">On-time Rate</p>
            <p className="text-4xl font-black text-slate-900">98%</p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {stats?.badges?.length ? (
              stats.badges.map((badge) => (
                <span key={badge.id} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold">
                  {badge.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No badges yet. Complete routes to unlock rewards!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
