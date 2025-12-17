import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingDown, AlertTriangle, CheckCircle, XCircle, Loader, Clock,
  DollarSign, Truck, Star, Zap, FileText, Eye, ThumbsUp, ThumbsDown,
  BarChart3, Package, RefreshCw, Bell, Calendar, ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

interface POSuggestion {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  vendor_id: string;
  vendor_name: string;
  suggested_cost: number;
  total_cost: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sales_velocity: number; // units per day
  lead_time_days: number;
  estimated_delivery: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  vendor_comparison?: VendorComparison[];
}

interface VendorComparison {
  vendor_id: string;
  vendor_name: string;
  price: number;
  delivery_time_days: number;
  quality_score: number;
  payment_terms: string;
  is_recommended: boolean;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortBy = 'urgency' | 'cost' | 'created_at';

export default function POSuggestions() {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState<POSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [sortBy, setSortBy] = useState<SortBy>('urgency');
  const [generating, setGenerating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/automation/po-suggestions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/automation/po-suggestions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await fetchSuggestions();
        alert('PO suggestions generated successfully!');
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const approveSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/automation/po-suggestions/${suggestionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await fetchSuggestions();
      }
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/automation/po-suggestions/${suggestionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await fetchSuggestions();
      }
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const bulkApprove = async () => {
    for (const suggestionId of selectedSuggestions) {
      await approveSuggestion(suggestionId);
    }
    setSelectedSuggestions(new Set());
  };

  const bulkReject = async () => {
    for (const suggestionId of selectedSuggestions) {
      await rejectSuggestion(suggestionId);
    }
    setSelectedSuggestions(new Set());
  };

  const toggleSelection = (suggestionId: string) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(suggestionId)) {
      newSelection.delete(suggestionId);
    } else {
      newSelection.add(suggestionId);
    }
    setSelectedSuggestions(newSelection);
  };

  const filteredSuggestions = suggestions
    .filter((s) => filter === 'all' || s.status === filter)
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      if (sortBy === 'cost') {
        return b.total_cost - a.total_cost;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      critical: 'from-red-500 to-pink-600',
      high: 'from-orange-500 to-red-600',
      medium: 'from-yellow-500 to-orange-600',
      low: 'from-blue-500 to-cyan-600',
    };
    return colors[urgency as keyof typeof colors] || colors.low;
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'critical') return <AlertTriangle className="text-red-600" size={20} />;
    if (urgency === 'high') return <TrendingDown className="text-orange-600" size={20} />;
    return <Clock className="text-blue-600" size={20} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Admin • AI Automation</p>
            <h1 className="text-3xl font-black text-gray-900">AI PO Suggestions</h1>
            <p className="text-gray-600 text-sm">Automated purchase order recommendations based on inventory and sales</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateSuggestions}
              disabled={generating}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                generating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              {generating ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
              {generating ? 'Generating...' : 'Generate Now'}
            </button>
            <Link
              to="/admin"
              className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black transition shadow-lg"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="text-blue-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Total Suggestions</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{suggestions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-yellow-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Pending</p>
            </div>
            <p className="text-3xl font-black text-yellow-900">
              {suggestions.filter((s) => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-emerald-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Approved</p>
            </div>
            <p className="text-3xl font-black text-emerald-900">
              {suggestions.filter((s) => s.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-red-600" size={24} />
              <p className="text-sm font-bold text-gray-600">Critical Items</p>
            </div>
            <p className="text-3xl font-black text-red-900">
              {suggestions.filter((s) => s.urgency === 'critical').length}
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm font-bold text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="urgency">Urgency</option>
                <option value="cost">Total Cost</option>
                <option value="created_at">Date Created</option>
              </select>
            </div>
          </div>

          {selectedSuggestions.size > 0 && (
            <div className="flex gap-4 mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <p className="text-sm font-bold text-blue-900">
                {selectedSuggestions.size} suggestion(s) selected
              </p>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={bulkApprove}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <ThumbsUp size={16} />
                  Approve All
                </button>
                <button
                  onClick={bulkReject}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <ThumbsDown size={16} />
                  Reject All
                </button>
              </div>
            </div>
          )}

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No suggestions found</p>
                <p className="text-sm text-gray-500 mt-2">Click "Generate Now" to create AI-powered PO suggestions</p>
              </div>
            ) : (
              filteredSuggestions.map((suggestion) => {
                const isExpanded = expandedSuggestion === suggestion.id;
                const isSelected = selectedSuggestions.has(suggestion.id);

                return (
                  <div
                    key={suggestion.id}
                    className={`border-2 rounded-2xl overflow-hidden transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        {suggestion.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(suggestion.id)}
                            className="w-5 h-5 rounded border-gray-300 mt-1"
                          />
                        )}

                        {/* Product Image */}
                        {suggestion.product_image_url && (
                          <img
                            src={suggestion.product_image_url}
                            alt={suggestion.product_name}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                          />
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-black text-gray-900 mb-1">
                                {suggestion.product_name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black text-white shadow-md bg-gradient-to-r ${getUrgencyColor(suggestion.urgency)}`}
                                >
                                  {getUrgencyIcon(suggestion.urgency)}
                                  {suggestion.urgency.toUpperCase()}
                                </span>
                                {suggestion.status !== 'pending' && (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-black ${
                                      suggestion.status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {suggestion.status.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-600 font-semibold">Total Cost</p>
                              <p className="text-3xl font-black text-gray-900">
                                ${suggestion.total_cost.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-600 font-semibold mb-1">Current Stock</p>
                              <p className="text-lg font-black text-gray-900">{suggestion.current_stock}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-600 font-semibold mb-1">Suggested Qty</p>
                              <p className="text-lg font-black text-emerald-600">{suggestion.suggested_quantity}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-600 font-semibold mb-1">Sales Velocity</p>
                              <p className="text-lg font-black text-blue-600">{suggestion.sales_velocity}/day</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-600 font-semibold mb-1">Lead Time</p>
                              <p className="text-lg font-black text-orange-600">{suggestion.lead_time_days} days</p>
                            </div>
                          </div>

                          {/* AI Reasoning */}
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="text-purple-600" size={16} />
                              <p className="text-sm font-black text-purple-900">AI Analysis</p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{suggestion.reasoning}</p>
                          </div>

                          {/* Vendor Info */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Truck className="text-gray-600" size={16} />
                              <span className="text-sm font-semibold text-gray-700">
                                Vendor: <span className="text-gray-900">{suggestion.vendor_name}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="text-gray-600" size={16} />
                              <span className="text-sm font-semibold text-gray-700">
                                Est. Delivery:{' '}
                                <span className="text-gray-900">
                                  {new Date(suggestion.estimated_delivery).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {suggestion.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveSuggestion(suggestion.id)}
                                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                  <ThumbsUp size={16} />
                                  Approve & Create PO
                                </button>
                                <button
                                  onClick={() => rejectSuggestion(suggestion.id)}
                                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                                >
                                  <ThumbsDown size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                              className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                            >
                              <Eye size={16} />
                              {isExpanded ? 'Hide' : 'View'} Details
                            </button>
                          </div>

                          {/* Vendor Comparison (Expanded) */}
                          {isExpanded && suggestion.vendor_comparison && (
                            <div className="mt-4 pt-4 border-t-2 border-gray-200">
                              <h4 className="text-lg font-black text-gray-900 mb-4">Vendor Comparison</h4>
                              <div className="grid md:grid-cols-3 gap-4">
                                {suggestion.vendor_comparison.map((vendor) => (
                                  <div
                                    key={vendor.vendor_id}
                                    className={`p-4 rounded-xl border-2 ${
                                      vendor.is_recommended
                                        ? 'bg-emerald-50 border-emerald-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="font-black text-gray-900">{vendor.vendor_name}</h5>
                                      {vendor.is_recommended && (
                                        <Star className="text-emerald-600 fill-emerald-600" size={20} />
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Price:</span>
                                        <span className="text-sm font-bold text-gray-900">${vendor.price.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Delivery:</span>
                                        <span className="text-sm font-bold text-gray-900">{vendor.delivery_time_days} days</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Quality:</span>
                                        <span className="text-sm font-bold text-gray-900">{vendor.quality_score}/10</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Terms:</span>
                                        <span className="text-sm font-bold text-gray-900">{vendor.payment_terms}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
