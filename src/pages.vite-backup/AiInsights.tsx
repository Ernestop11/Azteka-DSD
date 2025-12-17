import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

Chart.register(...registerables);

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface Forecast {
  productId: string;
  name: string;
  stock: number;
  minStock: number;
  totals: {
    d30: number;
    d60: number;
    d90: number;
  };
  projectedRunwayDays: number | null;
  recommendedAction: string;
}

interface ForecastResponse {
  forecasts: Forecast[];
  aiSummary: string;
}

export default function AiInsights() {
  const { token } = useAuth();
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poMessage, setPoMessage] = useState<string | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const refreshForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/forecast`, { headers });
      if (!res.ok) {
        throw new Error('Failed to load forecasts');
      }
      const result = (await res.json()) as ForecastResponse;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const topProducts = useMemo(() => {
    if (!data?.forecasts) return [];
    return [...data.forecasts].sort((a, b) => b.totals.d30 - a.totals.d30).slice(0, 5);
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!topProducts.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = topProducts.map((item) => item.name);
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '30-Day Units',
            data: topProducts.map((item) => item.totals.d30),
            backgroundColor: 'rgba(34,197,94,0.6)',
          },
          {
            label: '60-Day Units',
            data: topProducts.map((item) => item.totals.d60),
            backgroundColor: 'rgba(59,130,246,0.5)',
          },
          {
            label: '90-Day Units',
            data: topProducts.map((item) => item.totals.d90),
            backgroundColor: 'rgba(139,92,246,0.5)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false,
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [topProducts]);

  const handleReorderPlan = async () => {
    setPoMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/po/create`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to generate reorder plan');
      }
      setPoMessage('Reorder plan generated. Check Purchase Orders.');
    } catch (err) {
      setPoMessage(err instanceof Error ? err.message : 'Unable to generate reorder plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin</p>
            <h1 className="text-3xl font-black text-gray-900">AI Insights & Forecasts</h1>
            <p className="text-gray-500 text-sm">
              GPT-driven purchasing recommendations, projected demand, and dynamic reorder planning.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/po"
              className="px-4 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold hover:border-emerald-500 transition"
            >
              Purchase Orders
            </Link>
            <Link
              to="/admin/invoices"
              className="px-4 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold hover:border-emerald-500 transition"
            >
              Invoice Upload
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold hover:border-emerald-500 transition"
            >
              ← Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Automated procurement via AI</p>
            <h2 className="text-2xl font-black text-gray-900">Instant Reorder Plan</h2>
            <p className="text-gray-600 text-sm">
              Generate purchase orders for products projected to run out within the next 2 weeks.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <button
              onClick={handleReorderPlan}
              className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl transition"
            >
              Auto-generate Reorder Plan
            </button>
            {poMessage && <p className="text-sm text-gray-600">{poMessage}</p>}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Forecast</p>
              <h3 className="text-xl font-black text-gray-900">Top Movers (30/60/90 day units)</h3>
            </div>
            <button
              onClick={refreshForecast}
              className="px-4 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold hover:border-emerald-500 transition"
            >
              Refresh
            </button>
          </div>

          {loading && <p className="text-gray-500">Loading analytics…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && topProducts.length === 0 && (
            <p className="text-gray-500">No recent sales. Come back after orders flow in.</p>
          )}
          {!loading && !error && topProducts.length > 0 && (
            <div className="w-full overflow-x-auto">
              <canvas ref={canvasRef} height={180} />
            </div>
          )}
        </section>

        {data?.aiSummary && (
          <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold mb-2">GPT Summary</p>
            <p className="text-gray-800 whitespace-pre-line">{data.aiSummary}</p>
          </section>
        )}

        {data?.forecasts && data.forecasts.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold mb-4">Runway & Actions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.forecasts.slice(0, 10).map((item) => (
                <div key={item.productId} className="border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="text-lg font-bold text-gray-900">{item.name}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        item.projectedRunwayDays !== null && item.projectedRunwayDays < 14
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.projectedRunwayDays !== null ? `${item.projectedRunwayDays} days` : 'No data'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    30d: {item.totals.d30 || 0} • 60d: {item.totals.d60 || 0} • 90d: {item.totals.d90 || 0}
                  </p>
                  <p className="text-sm text-gray-600">Stock: {item.stock ?? 0} units</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">{item.recommendedAction}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
