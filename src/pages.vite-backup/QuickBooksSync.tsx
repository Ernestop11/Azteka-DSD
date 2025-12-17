import { useState, useEffect } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, AlertCircle, Link as LinkIcon,
  Unlink, Package, Users, Clock, TrendingUp, Database, Zap,
  ChevronRight, ExternalLink, Download, Upload, Settings
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface SyncResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  customersAdded: number;
  customersUpdated: number;
  customersSkipped: number;
  errors: string[];
  timestamp: string;
}

interface SyncHistory {
  id: string;
  sync_type: 'inventory' | 'customers' | 'all';
  status: 'success' | 'error' | 'in_progress';
  products_added: number;
  products_updated: number;
  customers_added: number;
  customers_updated: number;
  error_message?: string;
  created_at: string;
}

interface ConnectionStatus {
  connected: boolean;
  companyName?: string;
  lastSync?: string;
  realmId?: string;
}

export default function QuickBooksSync() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState<'inventory' | 'customers' | 'all' | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnectionStatus();
    fetchSyncHistory();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/qb/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Failed to check QuickBooks connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/qb/sync/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setSyncHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
    }
  };

  const connectToQuickBooks = () => {
    // Redirect to OAuth flow
    window.location.href = `${API_BASE}/api/qb/auth`;
  };

  const disconnectFromQuickBooks = async () => {
    if (!confirm('Are you sure you want to disconnect from QuickBooks?')) return;

    try {
      await fetch(`${API_BASE}/api/qb/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConnectionStatus({ connected: false });
      setSyncHistory([]);
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect from QuickBooks');
    }
  };

  const syncData = async (type: 'inventory' | 'customers' | 'all') => {
    setSyncing(true);
    setSyncType(type);
    setSyncResult(null);

    try {
      const endpoint = type === 'all'
        ? `${API_BASE}/api/qb/sync/all`
        : `${API_BASE}/api/qb/sync/${type}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncResult({
        success: true,
        productsAdded: data.productsAdded || 0,
        productsUpdated: data.productsUpdated || 0,
        productsSkipped: data.productsSkipped || 0,
        customersAdded: data.customersAdded || 0,
        customersUpdated: data.customersUpdated || 0,
        customersSkipped: data.customersSkipped || 0,
        errors: data.errors || [],
        timestamp: new Date().toISOString()
      });

      // Refresh history
      await fetchSyncHistory();
      await checkConnectionStatus();
    } catch (error: any) {
      setSyncResult({
        success: false,
        productsAdded: 0,
        productsUpdated: 0,
        productsSkipped: 0,
        customersAdded: 0,
        customersUpdated: 0,
        customersSkipped: 0,
        errors: [error.message || 'Sync failed'],
        timestamp: new Date().toISOString()
      });
    } finally {
      setSyncing(false);
      setSyncType(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-semibold">Loading QuickBooks status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                <Database className="inline-block mr-3 text-blue-600" size={40} />
                QuickBooks Sync
              </h1>
              <p className="text-gray-600 mt-2">
                Sync inventory and customers from QuickBooks to your database
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Connection Status Card */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 ${
          connectionStatus.connected
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
            : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {connectionStatus.connected ? (
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
                  <CheckCircle className="text-white" size={32} />
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl">
                  <XCircle className="text-white" size={32} />
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {connectionStatus.connected ? 'Connected to QuickBooks' : 'Not Connected'}
                </h2>
                {connectionStatus.connected && connectionStatus.companyName && (
                  <p className="text-gray-600 mt-1">
                    Company: <span className="font-semibold">{connectionStatus.companyName}</span>
                  </p>
                )}
                {connectionStatus.connected && connectionStatus.lastSync && (
                  <p className="text-gray-500 text-sm mt-1">
                    Last sync: {formatDate(connectionStatus.lastSync)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {connectionStatus.connected ? (
                <button
                  onClick={disconnectFromQuickBooks}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  <Unlink size={20} />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectToQuickBooks}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  <LinkIcon size={20} />
                  Connect to QuickBooks
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Actions */}
        {connectionStatus.connected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Sync Inventory */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 inline-flex">
                <Package className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Inventory</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Import products from QuickBooks inventory items
              </p>
              <button
                onClick={() => syncData('inventory')}
                disabled={syncing}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  syncing && syncType === 'inventory'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {syncing && syncType === 'inventory' ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Sync Now
                  </>
                )}
              </button>
            </div>

            {/* Sync Customers */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:border-purple-300 transition-all">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 inline-flex">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Customers</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Import customers from QuickBooks customer list
              </p>
              <button
                onClick={() => syncData('customers')}
                disabled={syncing}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  syncing && syncType === 'customers'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {syncing && syncType === 'customers' ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Sync Now
                  </>
                )}
              </button>
            </div>

            {/* Sync All */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 inline-flex">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sync All</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Import both inventory and customers in one sync
              </p>
              <button
                onClick={() => syncData('all')}
                disabled={syncing}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  syncing && syncType === 'all'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {syncing && syncType === 'all' ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Sync All
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sync Result */}
        {syncResult && (
          <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 ${
            syncResult.success
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              {syncResult.success ? (
                <CheckCircle className="text-emerald-600" size={32} />
              ) : (
                <XCircle className="text-red-600" size={32} />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {syncResult.success ? 'Sync Completed Successfully' : 'Sync Failed'}
                </h3>
                <p className="text-gray-600 text-sm">{formatDate(syncResult.timestamp)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Products Stats */}
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Products Added</p>
                <p className="text-3xl font-bold text-blue-600">{syncResult.productsAdded}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-cyan-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Products Updated</p>
                <p className="text-3xl font-bold text-cyan-600">{syncResult.productsUpdated}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Products Skipped</p>
                <p className="text-3xl font-bold text-gray-600">{syncResult.productsSkipped}</p>
              </div>

              {/* Customers Stats */}
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Customers Added</p>
                <p className="text-3xl font-bold text-purple-600">{syncResult.customersAdded}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-pink-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Customers Updated</p>
                <p className="text-3xl font-bold text-pink-600">{syncResult.customersUpdated}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Customers Skipped</p>
                <p className="text-3xl font-bold text-gray-600">{syncResult.customersSkipped}</p>
              </div>
            </div>

            {/* Errors */}
            {syncResult.errors.length > 0 && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-red-600" size={20} />
                  <h4 className="font-bold text-red-900">Errors ({syncResult.errors.length})</h4>
                </div>
                <ul className="space-y-2">
                  {syncResult.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                      <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sync History */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-gray-600" size={28} />
            <h3 className="text-2xl font-bold text-gray-900">Sync History</h3>
          </div>

          {syncHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="font-semibold">No sync history yet</p>
              <p className="text-sm">Start your first sync to see history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                    sync.status === 'success'
                      ? 'border-emerald-200 bg-emerald-50'
                      : sync.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {sync.status === 'success' ? (
                        <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
                      ) : sync.status === 'error' ? (
                        <XCircle className="text-red-600 flex-shrink-0" size={24} />
                      ) : (
                        <RefreshCw className="text-yellow-600 flex-shrink-0 animate-spin" size={24} />
                      )}

                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-gray-900 capitalize">
                            {sync.sync_type === 'all' ? 'Full Sync' : `${sync.sync_type} Sync`}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sync.status === 'success'
                              ? 'bg-emerald-200 text-emerald-900'
                              : sync.status === 'error'
                              ? 'bg-red-200 text-red-900'
                              : 'bg-yellow-200 text-yellow-900'
                          }`}>
                            {sync.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(sync.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      {(sync.products_added > 0 || sync.products_updated > 0) && (
                        <div className="text-right">
                          <p className="text-gray-600 font-medium">Products</p>
                          <p className="font-bold text-blue-600">
                            +{sync.products_added} / ~{sync.products_updated}
                          </p>
                        </div>
                      )}
                      {(sync.customers_added > 0 || sync.customers_updated > 0) && (
                        <div className="text-right">
                          <p className="text-gray-600 font-medium">Customers</p>
                          <p className="font-bold text-purple-600">
                            +{sync.customers_added} / ~{sync.customers_updated}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {sync.error_message && (
                    <div className="mt-4 bg-white border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{sync.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {!connectionStatus.connected && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">How to Connect QuickBooks</h4>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Click "Connect to QuickBooks" button above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Sign in to your QuickBooks account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Authorize Azteka DSD to access your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>You'll be redirected back here to start syncing</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
