import { Percent } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Stock Your Store
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-200 to-pink-200 bg-clip-text text-transparent">
                With Bestsellers
              </span>
            </h1>

            <p className="text-xl text-white/90 font-bold">
              Authentic Mexican products your customers crave!
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl blur-2xl opacity-50" />
              <img
                src="https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Premium Products"
                className="relative rounded-3xl shadow-2xl border-4 border-white/20"
              />
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <p className="text-3xl font-black text-white">15</p>
                  <Percent size={20} className="text-white" />
                </div>
                <p className="text-xs font-black text-white">OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  );
}
