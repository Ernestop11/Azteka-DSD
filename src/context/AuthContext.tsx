import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockUser } from '../lib/mockData';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'aztekaAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setToken(parsed.token ?? null);
      }
    } catch (error) {
      console.warn('Failed to hydrate auth state', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    const mockToken = 'mock-jwt-token-' + Date.now();
    const userData = { ...mockUser, email };

    setToken(mockToken);
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: mockToken, user: userData }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
