import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

function ProductMesh() {
  const meshRef = useRef(null);
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Float floatIntensity={1} speed={2}>
      <mesh ref={meshRef} scale={1.4}>
        <boxGeometry args={[1.6, 1, 1]} />
        <meshStandardMaterial color="#10b981" metalness={0.2} roughness={0.25} />
      </mesh>
    </Float>
  );
}

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
          <div className="relative h-80">
            <Canvas camera={{ position: [2.5, 1.5, 3.5] }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <ProductMesh />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
            </Canvas>
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
