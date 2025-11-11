import { FormEvent, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn } from 'lucide-react';

const demoCredentials = [
  { email: 'admin@azteka.com', password: 'admin123', role: 'Admin', color: 'from-blue-600 to-purple-600' },
  { email: 'sales@azteka.com', password: 'sales123', role: 'Sales Rep', color: 'from-emerald-600 to-teal-600' },
  { email: 'driver@azteka.com', password: 'driver123', role: 'Driver', color: 'from-orange-600 to-red-600' },
];

export default function Login() {
  const [email, setEmail] = useState('admin@azteka.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                AZTEKA
              </h1>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                Wholesale Distribution
              </p>
              <p className="text-lg text-gray-600">
                Premium products delivered to your business
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Quick Login Options:</h3>
              {demoCredentials.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => quickLogin(cred.email, cred.password)}
                  className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r ${cred.color} text-white hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{cred.role}</div>
                      <div className="text-sm opacity-90">{cred.email}</div>
                    </div>
                    <LogIn className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Click on any quick login option above or enter credentials manually
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
