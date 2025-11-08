import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface ProcessedItem {
  type: 'new' | 'existing';
  productId: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  cost: string;
}

interface UploadResponse {
  invoice: {
    id: string;
    supplier: string;
    invoiceDate?: string;
    fileUrl: string;
    total: string;
  };
  items: ProcessedItem[];
}

export default function InvoiceUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const totals = useMemo(() => {
    if (!result?.items) return { newProducts: 0, updates: 0 };
    return result.items.reduce(
      (acc, item) => {
        if (item.type === 'new') acc.newProducts += 1;
        if (item.type === 'existing') acc.updates += 1;
        return acc;
      },
      { newProducts: 0, updates: 0 }
    );
  }, [result]);

  const handleFile = useCallback((incoming: File | null) => {
    setFile(incoming);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const onSubmit = async () => {
    if (!file) {
      setError('Select a PDF or image before uploading.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/invoices/upload`, {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Upload failed');
      }

      const data = (await res.json()) as UploadResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin</p>
            <h1 className="text-3xl font-black text-gray-900">Invoice Intake</h1>
            <p className="text-gray-500 text-sm">Upload distributor invoices to auto-enrich the catalog.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/po"
              className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-2xl hover:border-emerald-500 transition"
            >
              View Purchase Orders
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-2xl hover:border-emerald-500 transition"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            htmlFor="invoice-file"
            className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center cursor-pointer hover:border-emerald-400 transition"
          >
            <span className="text-lg font-semibold text-gray-800 mb-2">
              {file ? file.name : 'Drag & drop or click to upload invoice'}
            </span>
            <span className="text-sm text-gray-500">PDF, JPG, or PNG • We run OCR + AI vision automatically</span>
            <input
              id="invoice-file"
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            onClick={onSubmit}
            disabled={!file || uploading}
            className={`mt-6 w-full py-3 rounded-2xl font-bold text-white transition ${
              !file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {uploading ? 'Analyzing Invoice…' : 'Upload & Analyze'}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        {result && (
          <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-500 font-semibold">AI Parsed</p>
                <h2 className="text-2xl font-black text-gray-900">{result.invoice.supplier}</h2>
                <p className="text-gray-600 text-sm">
                  Invoice Date:{' '}
                  {result.invoice.invoiceDate
                    ? new Date(result.invoice.invoiceDate).toLocaleDateString()
                    : 'Not detected'}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">New Products</p>
                  <p className="text-2xl font-black text-gray-900">{totals.newProducts}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Updated SKUs</p>
                  <p className="text-2xl font-black text-gray-900">{totals.updates}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Invoice Total</p>
                  <p className="text-2xl font-black text-gray-900">
                    {Number(result.invoice.total).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Cost
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.items.map((item) => (
                    <tr key={`${item.productId}-${item.name}`}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                          />
                        )}
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.type === 'new' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            New SKU
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            Updated
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                        ${Number(item.cost).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          to={`/admin/products/${item.productId ?? ''}`}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          View in Catalog →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
