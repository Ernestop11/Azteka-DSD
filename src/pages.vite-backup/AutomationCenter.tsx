import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';
const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL ?? 'http://localhost:4000';

interface AutomationLogEntry {
  type: 'success' | 'error';
  summary: string;
  timestamp: string;
  aiSummary?: string;
  lowStock?: Array<{
    name: string;
    projectedRunwayDays: number;
  }>;
}

interface LogResponse {
  logs: AutomationLogEntry[];
  schedule: string;
  nextRun: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export default function AutomationCenter() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AutomationLogEntry[]>([]);
  const [meta, setMeta] = useState<Partial<LogResponse>>({});
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/automation/logs`, { headers });
      if (!res.ok) {
        throw new Error('Failed to load automation logs');
      }
      const data = (await res.json()) as LogResponse;
      setLogs(data.logs);
      setMeta(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load logs');
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/automation/run`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        throw new Error('Manual automation run failed');
      }
      await fetchLogs();
      setMessage('Automation triggered successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Manual run failed');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // socket connected
    });

    socket.on('automation:update', (entry: AutomationLogEntry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 49)]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin</p>
            <h1 className="text-3xl font-black text-slate-900">Automation Center</h1>
            <p className="text-slate-500 text-sm">Nightly AI + PO agents, manual triggers, and live status updates.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/insights"
              className="px-4 py-2 text-sm font-semibold border-2 border-slate-200 rounded-2xl hover:border-emerald-500 transition"
            >
              AI Insights
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-semibold border-2 border-slate-200 rounded-2xl hover:border-emerald-500 transition"
            >
              ← Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Schedule</p>
            <h2 className="text-2xl font-black text-slate-900">Nightly AI Agents</h2>
            <p className="text-slate-500 text-sm">
              Cron pattern: <code className="bg-slate-100 px-2 py-1 rounded">{meta.schedule}</code> (next run: {meta.nextRun})
            </p>
            <p className="text-slate-500 text-sm">
              Email alerts: {meta.emailEnabled ? 'enabled' : 'disabled'} • SMS: {meta.smsEnabled ? 'enabled' : 'disabled'}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <button
              onClick={handleRunNow}
              disabled={running}
              className={`px-6 py-3 rounded-2xl font-bold text-white transition ${
                running ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {running ? 'Running…' : 'Run Now'}
            </button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold mb-4">Recent Events</p>
          {logs.length === 0 && <p className="text-slate-500">No automation events yet.</p>}
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {logs.map((entry) => (
              <div
                key={entry.timestamp}
                className="border border-slate-100 rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      entry.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {entry.type}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-800">{entry.summary}</p>
                {entry.lowStock && entry.lowStock.length > 0 && (
                  <p className="text-xs text-slate-500">
                    Low stock: {entry.lowStock.map((item) => `${item.name} (${item.projectedRunwayDays}d)`).join(', ')}
                  </p>
                )}
                {entry.aiSummary && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 whitespace-pre-line">
                    {entry.aiSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
