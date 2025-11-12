import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl?: string | null;
}

export default function RewardsPage() {
  const { token } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loyalty, setLoyalty] = useState<{ points: number; tier: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : undefined;

  const load = async () => {
    const [rewardsRes, pointsRes] = await Promise.all([
      fetch(`${API_BASE}/api/loyalty/rewards`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
      fetch(`${API_BASE}/api/loyalty/points`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
    ]);
    if (rewardsRes.ok) {
      const data = await rewardsRes.json();
      setRewards(data.rewards || []);
    }
    if (pointsRes.ok) setLoyalty(await pointsRes.json());
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!token) return;
  }, [token]);

  const handleRedeem = async (rewardId: string) => {
    const res = await fetch(`${API_BASE}/api/loyalty/redeem`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rewardId }),
    });
    if (res.ok) {
      const data = await res.json();
      setToast(`🎉 Enjoy your ${data.reward.title}!`);
      setTimeout(() => setToast(null), 4000);
      load();
    } else {
      const body = await res.json().catch(() => ({}));
      setToast(body.message || 'Unable to redeem reward');
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <header className="bg-white/80 border-b border-emerald-100 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Rewards</p>
            <h1 className="text-3xl font-black text-gray-900">Redeem Your Points</h1>
            {loyalty && (
              <p className="text-gray-600 text-sm">
                {loyalty.points} pts • {loyalty.tier} Tier
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {toast && <div className="bg-white border-l-4 border-emerald-500 rounded-2xl p-4 shadow text-emerald-700">{toast}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              {reward.imageUrl && (
                <img src={reward.imageUrl} alt={reward.title} className="w-full h-40 object-cover rounded-2xl" />
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">{reward.cost} pts</p>
                <h3 className="text-xl font-black text-gray-900">{reward.title}</h3>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
              <button
                onClick={() => handleRedeem(reward.id)}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow hover:shadow-xl transition"
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
