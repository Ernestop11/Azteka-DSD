import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Key, Link as LinkIcon, CheckCircle, XCircle, Loader, Settings,
  Sparkles, Image as ImageIcon, Palette, Zap, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  masked: boolean;
  service: 'openai' | 'claude' | 'gemini' | 'canva' | 'bolt';
  status: 'connected' | 'disconnected' | 'testing';
}

interface OAuthConnection {
  id: string;
  name: string;
  service: 'canva' | 'bolt';
  connected: boolean;
  accountName?: string;
  lastSync?: string;
}

export default function Integrations() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [oauthConnections, setOauthConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      setLoading(true);
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations` : '/api/integrations';
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
        setOauthConnections(data.oauthConnections || []);
      } else {
        console.error('Failed to load integrations:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveApiKey(service: string, key: string) {
    try {
      setSaving(true);
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations/api-keys` : '/api/integrations/api-keys';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          service,
          key,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await loadIntegrations();
        setEditingKey(null);
        setKeyValues({});
        alert(data.message || 'API key saved successfully!');
      } else {
        const data = await res.json().catch(() => ({ error: 'Failed to save API key' }));
        alert(data.error || `Failed to save API key: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Save API key error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  }

  async function testApiKey(service: string) {
    try {
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations/test/${service}` : `/api/integrations/test/${service}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'API key is valid!');
        await loadIntegrations();
      } else {
        const data = await res.json().catch(() => ({ error: 'API key test failed' }));
        alert(data.error || `API key test failed: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Test API key error:', err);
      alert(err instanceof Error ? err.message : 'Test failed');
    }
  }

  async function connectCanva() {
    try {
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations/canva/auth` : '/api/integrations/canva/auth';
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.authUrl;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to initiate Canva connection' }));
        alert(errorData.error || 'Failed to initiate Canva connection');
      }
    } catch (err) {
      console.error('Connect Canva error:', err);
      alert(err instanceof Error ? err.message : 'Connection failed');
    }
  }

  async function connectBolt() {
    try {
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations/bolt/auth` : '/api/integrations/bolt/auth';
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.authUrl;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to initiate Bolt.new connection' }));
        alert(errorData.error || 'Failed to initiate Bolt.new connection');
      }
    } catch (err) {
      console.error('Connect Bolt error:', err);
      alert(err instanceof Error ? err.message : 'Connection failed');
    }
  }

  async function disconnectOAuth(service: string) {
    if (!confirm(`Are you sure you want to disconnect ${service}?`)) return;

    try {
      const API_BASE = import.meta.env?.VITE_API_URL || '';
      const url = API_BASE ? `${API_BASE}/api/integrations/${service}/disconnect` : `/api/integrations/${service}/disconnect`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await loadIntegrations();
        alert(`${service} disconnected successfully`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to disconnect' }));
        alert(errorData.error || 'Failed to disconnect');
      }
    } catch (err) {
      console.error('Disconnect OAuth error:', err);
      alert(err instanceof Error ? err.message : 'Disconnect failed');
    }
  }

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  const apiKeyServices = [
    { id: 'openai', name: 'OpenAI', icon: Sparkles, description: 'For AI image generation and text analysis' },
    { id: 'claude', name: 'Claude (Anthropic)', icon: Zap, description: 'For AI-powered insights and automation' },
    { id: 'gemini', name: 'Google Gemini', icon: Sparkles, description: 'For AI-powered suggestions and analysis' },
  ];

  const oauthServices = [
    { id: 'canva', name: 'Canva Pro', icon: Palette, description: 'Access Canva design tools and templates' },
    { id: 'bolt', name: 'Bolt.new', icon: ImageIcon, description: 'Access Bolt.new design tools and assets' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                <Settings className="inline-block mr-3 text-emerald-600" size={40} />
                Integrations & API Keys
              </h1>
              <p className="text-gray-600 mt-2">Connect AI services and design tools</p>
            </div>
            <button
              onClick={loadIntegrations}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Keys Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-emerald-600" size={28} />
            <h2 className="text-2xl font-black text-gray-900">API Keys</h2>
          </div>
          <p className="text-gray-600 mb-6">Configure API keys for AI services</p>

          <div className="space-y-4">
            {apiKeyServices.map((service) => {
              const Icon = service.icon;
              const existingKey = apiKeys.find((k) => k.service === service.id);
              const isEditing = editingKey === service.id;
              const showKey = showKeys[service.id] || false;

              return (
                <div
                  key={service.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <Icon className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingKey && (
                        <>
                          {existingKey.status === 'connected' && (
                            <CheckCircle className="text-emerald-600" size={20} />
                          )}
                          {existingKey.status === 'disconnected' && (
                            <XCircle className="text-red-600" size={20} />
                          )}
                          {existingKey.status === 'testing' && (
                            <Loader className="text-blue-600 animate-spin" size={20} />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={keyValues[service.id] || ''}
                          onChange={(e) =>
                            setKeyValues({ ...keyValues, [service.id]: e.target.value })
                          }
                          placeholder={`Enter ${service.name} API key`}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => setShowKeys({ ...showKeys, [service.id]: !showKey })}
                          className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveApiKey(service.id, keyValues[service.id] || '')}
                          disabled={saving || !keyValues[service.id]}
                          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setKeyValues({ ...keyValues, [service.id]: '' });
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {existingKey ? (
                          <>
                            <div className="px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                              {showKey ? existingKey.key : maskKey(existingKey.key)}
                            </div>
                            <button
                              onClick={() => setShowKeys({ ...showKeys, [service.id]: !showKey })}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                            >
                              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button
                              onClick={() => testApiKey(service.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                            >
                              Test
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">No API key configured</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingKey(service.id);
                          setKeyValues({ ...keyValues, [service.id]: existingKey?.key || '' });
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                      >
                        {existingKey ? 'Update' : 'Add'} API Key
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* OAuth Connections Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className="text-emerald-600" size={28} />
            <h2 className="text-2xl font-black text-gray-900">OAuth Connections</h2>
          </div>
          <p className="text-gray-600 mb-6">Connect to design tools and services</p>

          <div className="space-y-4">
            {oauthServices.map((service) => {
              const Icon = service.icon;
              const connection = oauthConnections.find((c) => c.service === service.id);
              const isConnected = connection?.connected || false;

              return (
                <div
                  key={service.id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    isConnected
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${isConnected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Icon className={isConnected ? 'text-emerald-600' : 'text-gray-600'} size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {isConnected && connection?.accountName && (
                          <p className="text-sm text-emerald-600 mt-1">
                            Connected as: {connection.accountName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <CheckCircle className="text-emerald-600" size={24} />
                      ) : (
                        <XCircle className="text-gray-400" size={24} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => disconnectOAuth(service.id)}
                          className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                        >
                          Disconnect
                        </button>
                        {service.id === 'canva' && (
                          <button
                            onClick={() => window.open('https://www.canva.com', '_blank')}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                          >
                            Open Canva
                          </button>
                        )}
                        {service.id === 'bolt' && (
                          <button
                            onClick={() => window.open('https://bolt.new', '_blank')}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                          >
                            Open Bolt.new
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (service.id === 'canva') connectCanva();
                          if (service.id === 'bolt') connectBolt();
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                      >
                        Connect {service.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
          <h3 className="text-xl font-black text-gray-900 mb-4">Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-emerald-600" size={20} />
                <span className="font-bold text-gray-900">AI Services</span>
              </div>
              <p className="text-sm text-gray-600">
                {apiKeys.filter((k) => k.status === 'connected').length} / {apiKeyServices.length} connected
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="text-blue-600" size={20} />
                <span className="font-bold text-gray-900">Design Tools</span>
              </div>
              <p className="text-sm text-gray-600">
                {oauthConnections.filter((c) => c.connected).length} / {oauthServices.length} connected
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-purple-600" size={20} />
                <span className="font-bold text-gray-900">Ready</span>
              </div>
              <p className="text-sm text-gray-600">
                {apiKeys.filter((k) => k.status === 'connected').length + oauthConnections.filter((c) => c.connected).length} / {apiKeyServices.length + oauthServices.length} total
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

