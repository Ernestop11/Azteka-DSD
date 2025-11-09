import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Package, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

export default function CustomerPortal() {
  const { token } = useAuth();
  const [loyalty, setLoyalty] = useState<{ points: number; tier: string; nextReward?: any } | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [showcases, setShowcases] = useState<any[]>([]);
  const [currentShowcase, setCurrentShowcase] = useState(0);
  const [lottieData, setLottieData] = useState<any>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    const load = async () => {
      const [pointsRes, rewardRes, showcaseRes] = await Promise.all([
        fetch(`${API_BASE}/api/loyalty/points`, { headers }),
        fetch(`${API_BASE}/api/loyalty/rewards`, { headers }),
        fetch('/showcases.json'),
      ]);
      if (pointsRes.ok) setLoyalty(await pointsRes.json());
      if (rewardRes.ok) {
        const data = await rewardRes.json();
        setRewards(data.rewards || []);
      }
      if (showcaseRes.ok) {
        const data = await showcaseRes.json();
        setShowcases(data);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (!showcases.length) return;
    const timer = setInterval(() => {
      setCurrentShowcase((prev) => (prev + 1) % showcases.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [showcases]);

  useEffect(() => {
    const loadLottie = async () => {
      const entry = showcases[currentShowcase];
      if (!entry?.lottie) return;
      try {
        const res = await fetch(entry.lottie);
        if (res.ok) {
          setLottieData(await res.json());
        }
      } catch (error) {
        console.warn('Failed to load showcase animation', error);
      }
    };
    loadLottie();
  }, [currentShowcase, showcases]);

  const highlightedReward = useMemo(() => {
    if (!rewards.length || !loyalty) return null;
    return rewards.find((reward) => reward.cost > loyalty.points) || rewards[0];
  }, [rewards, loyalty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Customer Experience</p>
            <h1 className="text-3xl font-black text-gray-900">Immersive Catalog & Loyalty Hub</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white rounded-3xl border border-emerald-100 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <p className="text-sm uppercase opacity-80">Loyalty Status</p>
            <h2 className="text-4xl font-black">{loyalty?.tier ?? 'Bronze'}</h2>
            <p className="text-lg mt-2">{loyalty ? `${loyalty.points} pts` : 'Loading points…'}</p>
            {highlightedReward && (
              <p className="mt-4 text-sm opacity-90">
                Next reward: <span className="font-semibold">{highlightedReward.title}</span> ({highlightedReward.cost} pts)
              </p>
            )}
          </div>

          {/* Beautiful 2D Product Display - Replaces 3D Canvas */}
          <div className="relative h-80 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 overflow-hidden flex items-center justify-center">
            {/* Animated background effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl animate-pulse delay-1000" />
            </div>

            {/* Product showcase */}
            <motion.div
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 transform perspective-1000">
                <div className="relative">
                  {/* Product icon/image */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 shadow-xl">
                    <Package className="w-32 h-32 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Sparkles effect */}
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity
                    }}
                    className="absolute -top-4 -right-4"
                  >
                    <Sparkles className="w-12 h-12 text-yellow-400" fill="currentColor" />
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: -360,
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity
                    }}
                    className="absolute -bottom-4 -left-4"
                  >
                    <Sparkles className="w-10 h-10 text-cyan-300" fill="currentColor" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -100, 0],
                    x: [0, Math.random() * 50 - 25, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute bottom-0 w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {showcases.map((showcase, index) => (
            <motion.div
              key={showcase.title}
              animate={{ opacity: index === currentShowcase ? 1 : 0.4, scale: index === currentShowcase ? 1 : 0.95 }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">{showcase.tagline}</p>
              <h3 className="text-xl font-black text-gray-900 mb-2">{showcase.title}</h3>
              <p className="text-sm text-gray-600">{showcase.description}</p>
            </motion.div>
          ))}
        </section>

        {lottieData && (
          <section className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            <div className="w-40 h-40">
              <Lottie animationData={lottieData} loop />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">AI Showcase</p>
              <h3 className="text-2xl font-black text-gray-900">{showcases[currentShowcase]?.title}</h3>
              <p className="text-gray-600">{showcases[currentShowcase]?.cta}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
