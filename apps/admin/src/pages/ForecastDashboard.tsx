import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://aztekafoods.com";

export default function ForecastDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/forecast`).then((r) => {
      setData(r.data);
      setLoading(false);
    });
  }, []);

  const handleAutoPO = async (sku: string, qty: number) => {
    setCreating(true);
    await axios.post(`${API_BASE}/api/po/auto`, { sku, quantity: qty });
    alert(`✅ Auto PO created for ${sku}`);
    setCreating(false);
  };

  if (loading) return <div className="p-6 text-gray-500">Loading forecast…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📈 Forecast & Auto-PO</h1>
      <table className="w-full border text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="p-2 text-left">Product</th>
            <th>SKU</th>
            <th>Avg Sales</th>
            <th>Recommended</th>
            <th>Shortage</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.sku} className="odd:bg-white even:bg-gray-50">
              <td className="p-2">{p.name}</td>
              <td className="text-center">{p.sku}</td>
              <td className="text-center">{p.avgSales}</td>
              <td className="text-center">{p.recommended}</td>
              <td className="text-center text-red-600">{p.shortage}</td>
              <td className="text-center">
                {p.shortage > 0 && (
                  <button
                    onClick={() => handleAutoPO(p.sku, p.shortage)}
                    disabled={creating}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Auto-PO
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
