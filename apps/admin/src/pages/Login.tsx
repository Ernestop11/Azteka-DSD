import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://aztekafoods.com";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      login(res.data.token, res.data.user);
      setMsg("✅ Logged in");
      nav("/dashboard");
    } catch (err: any) {
      setMsg("❌ " + (err.response?.data?.error || "Login failed"));
    }
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-80 space-y-3">
        <h1 className="text-xl font-bold text-center">Azteka Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border w-full p-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border w-full p-2 rounded"
        />
        <button className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700">
          Login
        </button>
        <p className="text-sm text-center min-h-[1.25rem]">{msg}</p>
      </form>
    </main>
  );
}
