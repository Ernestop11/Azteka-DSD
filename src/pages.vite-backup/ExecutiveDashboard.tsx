import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';

Chart.register(...registerables);

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface Summary {
  kpi: {
    totalSales: number;
    avgMargin: number;
    inventoryValue: number;
    purchaseOrders: number;
    invoices: number;
    loyaltyPoints: number;
    activeCustomers: number;
    totalRewards: number;
  };
  topRoutes: Record<string, number>;
}

export default function ExecutiveDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/summary`, { headers });
      if (!res.ok) {
        throw new Error('Failed to load analytics summary');
      }
      const json = (await res.json()) as Summary;
      setSummary(json);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [token]);

  useEffect(() => {
    if (!summary || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const labels = Object.keys(summary.topRoutes || {});
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Deliveries',
            data: labels.map((key) => summary.topRoutes[key]),
            backgroundColor: 'rgba(59,130,246,0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [summary]);

  const handleReport = async () => {
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/report`, { headers });
      if (!res.ok) {
        throw new Error('Failed to generate report');
      }
      const json = await res.json();
      setMessage(`Report saved to ${json.path}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to generate report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Executive</p>
            <h1 className="text-3xl font-black text-gray-900">Unified Analytics</h1>
            <p className="text-gray-500 text-sm">Sales, inventory, loyalty, and AI forecasts in one view.</p>
          </div>
          <button
            onClick={handleReport}
            className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl transition"
          >
            Generate AI Report
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {message && <p className="text-sm text-gray-600">{message}</p>}

        {loading ? (
          <p className="text-gray-500">Loading analytics…</p>
        ) : summary ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total Sales</p>
                <p className="text-3xl font-black text-gray-900">${summary.kpi.totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Avg Margin</p>
                <p className="text-3xl font-black text-gray-900">${summary.kpi.avgMargin.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Inventory Value</p>
                <p className="text-3xl font-black text-gray-900">${summary.kpi.inventoryValue.toFixed(2)}</p>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Purchase Orders</p>
                <p className="text-2xl font-black text-gray-900">{summary.kpi.purchaseOrders}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Invoices Processed</p>
                <p className="text-2xl font-black text-gray-900">{summary.kpi.invoices}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Loyalty Points Outstanding</p>
                <p className="text-2xl font-black text-gray-900">{summary.kpi.loyaltyPoints}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Active Customers</p>
                <p className="text-2xl font-black text-gray-900">{summary.kpi.activeCustomers}</p>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Top Routes</p>
              <canvas ref={canvasRef} height={140} />
            </section>
          </>
        ) : (
          <p className="text-red-600">Unable to load analytics.</p>
        )}
      </main>
    </div>
  );
}
