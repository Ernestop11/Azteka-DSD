import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-10">
      <h1 className="text-2xl font-bold">Welcome, {user?.name || "User"}</h1>
      <p className="text-slate-300">Role: {user?.role}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="bg-white/5 p-6 rounded-xl shadow-md border border-white/10">📦 Products</div>
        <div className="bg-white/5 p-6 rounded-xl shadow-md border border-white/10">🛒 Orders</div>
        <div className="bg-white/5 p-6 rounded-xl shadow-md border border-white/10">🚚 Routes</div>
      </div>
    </main>
  );
}
