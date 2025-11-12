import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface Badge {
  id: string;
  name: string;
  points: number;
  description: string;
}

interface Incentive {
  id: string;
  title: string;
  description: string;
  threshold: number;
  reward: string;
}

export default function IncentivesPage() {
  const { token } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [userId, setUserId] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [incentiveId, setIncentiveId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : undefined;

  const loadData = async () => {
    const res = await fetch(`${API_BASE}/api/gamification/badges`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      setBadges(data.badges || []);
      setIncentives(data.incentives || []);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/gamification/award`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          badgeId: badgeId || undefined,
          incentiveId: incentiveId || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Award failed');
      }

      const body = await res.json();
      setMessage('Award processed successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Award failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin</p>
            <h1 className="text-3xl font-black text-gray-900">Incentives & Badges</h1>
            <p className="text-gray-500 text-sm">Reward top performers, manage thresholds, and send instant recognition.</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-4">Award Badge / Incentive</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="Paste user UUID"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                >
                  <option value="">Select badge</option>
                  {badges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name} (+{badge.points} pts)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Incentive</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl"
                  value={incentiveId}
                  onChange={(e) => setIncentiveId(e.target.value)}
                >
                  <option value="">Select incentive</option>
                  {incentives.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title} (threshold {inc.threshold})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl transition"
            >
              Award Now
            </button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-3">Badges</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {badges.map((badge) => (
                <div key={badge.id} className="border border-gray-100 rounded-2xl p-3 shadow-sm">
                  <p className="font-semibold text-gray-900">{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                  <p className="text-xs text-emerald-600 mt-1">+{badge.points} pts</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-3">Incentives</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {incentives.map((inc) => (
                <div key={inc.id} className="border border-gray-100 rounded-2xl p-3 shadow-sm">
                  <p className="font-semibold text-gray-900">{inc.title}</p>
                  <p className="text-xs text-gray-500">{inc.description}</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Threshold: {inc.threshold} orders • Reward: ${Number(inc.reward).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
