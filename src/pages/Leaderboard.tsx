import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface LeaderEntry {
  userId: string;
  name: string;
  points: number;
  totalSales: number;
  totalOrders: number;
  badges: Array<{
    id: string;
    name: string;
    iconUrl?: string | null;
  }>;
}

interface LeaderboardResponse {
  sales: LeaderEntry[];
  drivers: LeaderEntry[];
}

export default function Leaderboard() {
  const { token } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/gamification/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          throw new Error('Failed to load leaderboard');
        }
        const json = (await res.json()) as LeaderboardResponse;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const renderSection = (title: string, entries: LeaderEntry[] = []) => (
    <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-900 mb-4">{title}</h2>
      {entries.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                {index + 1}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{entry.name}</p>
                <p className="text-sm text-gray-500">{entry.totalOrders} orders • {entry.points} pts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {entry.badges?.slice(0, 3).map((badge) => (
                <span
                  key={badge.id}
                  className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700"
                >
                  {badge.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Gamification</p>
            <h1 className="text-3xl font-black text-gray-900">Leaderboard</h1>
            <p className="text-gray-500 text-sm">Track top performers across sales and delivery teams.</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {loading && <p className="text-gray-500">Loading leaderboard…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data && (
          <>
            {renderSection('Sales Leaders', data.sales)}
            {renderSection('Driver Leaders', data.drivers)}
          </>
        )}
      </main>
    </div>
  );
}
