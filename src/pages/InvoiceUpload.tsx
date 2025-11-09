import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Package, TrendingUp, DollarSign, AlertCircle, Edit2, Save, X } from 'lucide-react';

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

type WorkflowStep = 'upload' | 'review' | 'receiving' | 'completed';

export default function InvoiceUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('upload');

  // Editable items state
  const [editableItems, setEditableItems] = useState<ProcessedItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Receiving state
  const [receiving, setReceiving] = useState(false);
  const [showReceiveConfirm, setShowReceiveConfirm] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState(false);

  const totals = useMemo(() => {
    const items = editableItems.length > 0 ? editableItems : result?.items || [];
    return items.reduce(
      (acc, item) => {
        if (item.type === 'new') acc.newProducts += 1;
        if (item.type === 'existing') acc.updates += 1;
        acc.totalCost += Number(item.cost) * item.quantity;
        acc.totalUnits += item.quantity;
        return acc;
      },
      { newProducts: 0, updates: 0, totalCost: 0, totalUnits: 0 }
    );
  }, [editableItems, result]);

  const handleFile = useCallback((incoming: File | null) => {
    setFile(incoming);
    setResult(null);
    setError(null);
    setWorkflowStep('upload');
    setEditableItems([]);
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
      setEditableItems([...data.items]);
      setWorkflowStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateItem = (index: number, field: keyof ProcessedItem, value: any) => {
    setEditableItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleReceive = async () => {
    if (!result) return;

    setReceiving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/invoices/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          invoiceId: result.invoice.id,
          items: editableItems,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Receiving failed');
      }

      setWorkflowStep('completed');
      setReceiveSuccess(true);
      setShowReceiveConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receiving failed');
    } finally {
      setReceiving(false);
    }
  };

  const resetWorkflow = () => {
    setFile(null);
    setResult(null);
    setEditableItems([]);
    setWorkflowStep('upload');
    setReceiveSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin • Receiving</p>
            <h1 className="text-3xl font-black text-gray-900">PO Invoice Receiving</h1>
            <p className="text-gray-600 text-sm">Upload → Review → Receive → Inventory Updated</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/po"
              className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition"
            >
              View Purchase Orders
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black transition shadow-lg"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Workflow Progress */}
      {workflowStep !== 'upload' && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${workflowStep === 'review' || workflowStep === 'completed' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <CheckCircle size={20} className={workflowStep === 'review' || workflowStep === 'completed' ? 'fill-emerald-600 text-white' : ''} />
                <span className="text-sm font-bold">1. Uploaded & Parsed</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4">
                <div className={`h-full ${workflowStep === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'} transition-all duration-500`} />
              </div>
              <div className={`flex items-center gap-2 ${workflowStep === 'completed' ? 'text-emerald-600' : workflowStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Edit2 size={20} className={workflowStep === 'review' ? 'text-blue-600' : ''} />
                <span className="text-sm font-bold">2. Review & Edit</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4">
                <div className={`h-full ${workflowStep === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'} transition-all duration-500`} />
              </div>
              <div className={`flex items-center gap-2 ${workflowStep === 'completed' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <Package size={20} className={workflowStep === 'completed' ? 'fill-emerald-600 text-white' : ''} />
                <span className="text-sm font-bold">3. Received & Inventory Updated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Upload Section */}
        {workflowStep === 'upload' && (
          <section className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Step 1: Upload Invoice</h2>
              <p className="text-gray-600">Upload a PO invoice PDF or image. AI will automatically parse products, quantities, and costs.</p>
            </div>
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              htmlFor="invoice-file"
              className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 rounded-3xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
            >
              <Package size={64} className="text-emerald-500 mb-4" />
              <span className="text-xl font-bold text-gray-800 mb-2">
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
              className={`mt-6 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-300 ${
                !file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              {uploading ? 'Analyzing Invoice…' : 'Upload & Analyze with AI'}
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}
          </section>
        )}

        {/* Review Section */}
        {workflowStep === 'review' && result && (
          <>
            <section className="bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-blue-500 font-semibold uppercase tracking-wide">Step 2: Review & Edit</p>
                  <h2 className="text-3xl font-black text-gray-900">{result.invoice.supplier}</h2>
                  <p className="text-gray-600 text-sm">
                    Invoice Date:{' '}
                    {result.invoice.invoiceDate
                      ? new Date(result.invoice.invoiceDate).toLocaleDateString()
                      : 'Not detected'}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="text-emerald-600" size={16} />
                      <p className="text-xs uppercase tracking-wide text-emerald-600 font-bold">New Products</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">{totals.newProducts}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="text-blue-600" size={16} />
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-bold">Updated SKUs</p>
                    </div>
                    <p className="text-2xl font-black text-blue-900">{totals.updates}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="text-purple-600" size={16} />
                      <p className="text-xs uppercase tracking-wide text-purple-600 font-bold">Total Units</p>
                    </div>
                    <p className="text-2xl font-black text-purple-900">{totals.totalUnits}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="text-orange-600" size={16} />
                      <p className="text-xs uppercase tracking-wide text-orange-600 font-bold">Total Cost</p>
                    </div>
                    <p className="text-2xl font-black text-orange-900">
                      ${totals.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-blue-900 mb-1">Review products before receiving</p>
                    <p className="text-sm text-blue-700">Double-check quantities and costs. Click any field to edit. When ready, click "Approve and Receive" to update inventory.</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border-2 border-gray-200 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                        Cost (per unit)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wide">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {editableItems.map((item, index) => {
                      const isEditing = editingItemId === `${item.productId}-${index}`;
                      const subtotal = Number(item.cost) * item.quantity;

                      return (
                        <tr key={`${item.productId}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                />
                              )}
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-gray-500">ID: {item.productId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {item.type === 'new' ? (
                              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
                                NEW SKU
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                                UPDATE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="font-bold text-gray-900">{item.quantity}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.cost}
                                  onChange={(e) => updateItem(index, 'cost', e.target.value)}
                                  className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-gray-900">${Number(item.cost).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-black text-gray-900">${subtotal.toFixed(2)}</span>
                              <button
                                onClick={() => setEditingItemId(isEditing ? null : `${item.productId}-${index}`)}
                                className={`p-2 rounded-lg transition-all ${
                                  isEditing
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-right text-sm font-black text-gray-900">
                        GRAND TOTAL:
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-gray-900">
                        ${totals.totalCost.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setShowReceiveConfirm(true)}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} />
                  Approve and Receive Inventory
                </button>
                <button
                  onClick={resetWorkflow}
                  className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </section>
          </>
        )}

        {/* Completed Section */}
        {workflowStep === 'completed' && receiveSuccess && (
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Receiving Complete!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Invoice has been marked as received and inventory has been updated successfully.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
                  <Package className="text-emerald-600 mx-auto mb-2" size={32} />
                  <p className="text-2xl font-black text-gray-900">{totals.totalUnits}</p>
                  <p className="text-sm text-gray-600 font-semibold">Units Received</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
                  <TrendingUp className="text-blue-600 mx-auto mb-2" size={32} />
                  <p className="text-2xl font-black text-gray-900">{totals.newProducts + totals.updates}</p>
                  <p className="text-sm text-gray-600 font-semibold">Products Updated</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
                  <DollarSign className="text-orange-600 mx-auto mb-2" size={32} />
                  <p className="text-2xl font-black text-gray-900">${totals.totalCost.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 font-semibold">Total Inventory Value</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetWorkflow}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Receive Another Invoice
                </button>
                <Link
                  to="/admin/po"
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-300 hover:border-emerald-500 transition-all"
                >
                  View All Purchase Orders
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Receive Confirmation Modal */}
      {showReceiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Confirm Receiving</h3>
                <button
                  onClick={() => setShowReceiveConfirm(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-4">
                  You are about to receive this invoice and update inventory for:
                </p>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Products:</span>
                    <span className="font-black text-gray-900">{editableItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Units:</span>
                    <span className="font-black text-gray-900">{totals.totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Cost:</span>
                    <span className="font-black text-gray-900">${totals.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-yellow-900 mb-1">This action will:</p>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Update product quantities in inventory</li>
                      <li>Update product costs to new values</li>
                      <li>Mark products as in-stock</li>
                      <li>Create inventory transaction log</li>
                      <li>Mark invoice as received</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReceive}
                  disabled={receiving}
                  className={`flex-1 py-4 font-black text-lg rounded-2xl transition-all ${
                    receiving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-2xl transform hover:scale-105'
                  }`}
                >
                  {receiving ? 'Processing...' : 'Confirm and Receive'}
                </button>
                <button
                  onClick={() => setShowReceiveConfirm(false)}
                  disabled={receiving}
                  className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
