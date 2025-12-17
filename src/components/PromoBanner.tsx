import { Zap, TrendingUp, Sparkles, Gift } from 'lucide-react';

interface PromoBannerProps {
  variant?: 'gradient' | 'split' | 'minimal';
}

export default function PromoBanner({ variant = 'gradient' }: PromoBannerProps) {
  if (variant === 'split') {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Top Seller</span>
            </div>
            <h3 className="text-3xl font-black">Free Shipping</h3>
            <p className="text-lg text-white/90 font-semibold">On orders over $500</p>
            <button className="px-6 py-3 bg-white text-emerald-600 font-black rounded-xl hover:bg-yellow-300 transition-all">
              Shop Now →
            </button>
          </div>
        </div>

        {/* Right Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-bold">Limited Time</span>
            </div>
            <h3 className="text-3xl font-black">Bundle & Save</h3>
            <p className="text-lg text-white/90 font-semibold">Up to 25% off on bundles</p>
            <button className="px-6 py-3 bg-white text-purple-600 font-black rounded-xl hover:bg-yellow-300 transition-all">
              View Bundles →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-black">New Arrivals Every Week!</h3>
              <p className="text-sm font-semibold text-white/90">Fresh products added regularly</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-white text-orange-600 font-black rounded-xl hover:bg-gray-100 transition-all whitespace-nowrap">
            Explore →
          </button>
        </div>
      </div>
    );
  }

  // Default: Full gradient banner
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 text-white">
      {/* Animated orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold">Flash Sale</span>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Limited Time Offer!
            </h2>
            <p className="text-xl text-white/90 font-semibold">
              Get up to 30% off on selected items
            </p>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-purple-600 font-black text-lg rounded-2xl hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-2xl">
              Shop Sale →
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-black text-lg rounded-2xl hover:bg-white/30 transition-all">
              Learn More
            </button>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-48 h-48 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30">
              <div className="text-center">
                <p className="text-7xl font-black">30%</p>
                <p className="text-2xl font-black">OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
