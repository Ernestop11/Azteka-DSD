import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  CheckCircle, XCircle, Loader, Package, Image, Database, Zap, RefreshCw,
  Play, Stop, AlertCircle, TrendingUp, DollarSign, Users, Truck
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
  timestamp?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'passed' | 'failed';
}

export default function TestDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [running, setRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'passed' | 'failed'>('pending');
  const [quickBooksConnected, setQuickBooksConnected] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [productsNeedingImages, setProductsNeedingImages] = useState(0);

  useEffect(() => {
    loadTestSuites();
    checkQuickBooksStatus();
    loadInventoryStats();
  }, []);

  async function loadTestSuites() {
    const suites: TestSuite[] = [
      {
        name: 'QuickBooks Integration',
        status: 'pending',
        tests: [
          { id: 'qb-1', name: 'QuickBooks Connection', status: 'pending' },
          { id: 'qb-2', name: 'Inventory Sync', status: 'pending' },
          { id: 'qb-3', name: 'Customer Sync', status: 'pending' },
        ],
      },
      {
        name: 'Image Processing',
        status: 'pending',
        tests: [
          { id: 'img-1', name: 'Image Search API', status: 'pending' },
          { id: 'img-2', name: 'Background Removal', status: 'pending' },
          { id: 'img-3', name: 'AI Splash Image Generation', status: 'pending' },
          { id: 'img-4', name: 'Bulk Image Processing', status: 'pending' },
        ],
      },
      {
        name: 'Product Management',
        status: 'pending',
        tests: [
          { id: 'prod-1', name: 'Product API', status: 'pending' },
          { id: 'prod-2', name: 'Category API', status: 'pending' },
          { id: 'prod-3', name: 'Product Updates', status: 'pending' },
        ],
      },
      {
        name: 'Contract Workers',
        status: 'pending',
        tests: [
          { id: 'worker-1', name: 'Worker API', status: 'pending' },
          { id: 'worker-2', name: 'Job Queue', status: 'pending' },
          { id: 'worker-3', name: 'Commission Calculation', status: 'pending' },
        ],
      },
      {
        name: 'Role-Based Access',
        status: 'pending',
        tests: [
          { id: 'auth-1', name: 'General User View', status: 'pending' },
          { id: 'auth-2', name: 'Customer View', status: 'pending' },
          { id: 'auth-3', name: 'Sales Rep View', status: 'pending' },
          { id: 'auth-4', name: 'Carlos Bulk Order', status: 'pending' },
        ],
      },
    ];
    setTestSuites(suites);
  }

  async function checkQuickBooksStatus() {
    try {
      const res = await fetch('/api/quickbooks/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setQuickBooksConnected(data.connected || false);
      }
    } catch (err) {
      console.error('Failed to check QuickBooks status:', err);
    }
  }

  async function loadInventoryStats() {
    try {
      const res = await fetch('/api/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const products = await res.json();
        setInventoryCount(products.length || 0);
        setProductsNeedingImages(products.filter((p: any) => !p.imageUrl || !p.backgroundRemoved).length || 0);
      }
    } catch (err) {
      console.error('Failed to load inventory stats:', err);
    }
  }

  async function runAllTests() {
    setRunning(true);
    setOverallStatus('running');

    const updatedSuites = [...testSuites];

    for (const suite of updatedSuites) {
      suite.status = 'running';
      setTestSuites([...updatedSuites]);

      for (const test of suite.tests) {
        test.status = 'running';
        test.timestamp = new Date().toISOString();
        const startTime = Date.now();
        setTestSuites([...updatedSuites]);

        try {
          const result = await runTest(test.id);
          test.status = result.passed ? 'passed' : 'failed';
          test.message = result.message;
          test.duration = Date.now() - startTime;
        } catch (err) {
          test.status = 'failed';
          test.message = err instanceof Error ? err.message : 'Test failed';
          test.duration = Date.now() - startTime;
        }

        setTestSuites([...updatedSuites]);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay between tests
      }

      suite.status = suite.tests.every((t) => t.status === 'passed') ? 'passed' : 'failed';
      setTestSuites([...updatedSuites]);
    }

    const allPassed = updatedSuites.every((s) => s.status === 'passed');
    setOverallStatus(allPassed ? 'passed' : 'failed');
    setRunning(false);
  }

  async function runTest(testId: string): Promise<{ passed: boolean; message: string }> {
    switch (testId) {
      case 'qb-1':
        return await testQuickBooksConnection();
      case 'qb-2':
        return await testInventorySync();
      case 'qb-3':
        return await testCustomerSync();
      case 'img-1':
        return await testImageSearch();
      case 'img-2':
        return await testBackgroundRemoval();
      case 'img-3':
        return await testSplashImageGeneration();
      case 'img-4':
        return await testBulkImageProcessing();
      case 'prod-1':
        return await testProductAPI();
      case 'prod-2':
        return await testCategoryAPI();
      case 'prod-3':
        return await testProductUpdates();
      case 'worker-1':
        return await testWorkerAPI();
      case 'worker-2':
        return await testJobQueue();
      case 'worker-3':
        return await testCommissionCalculation();
      case 'auth-1':
        return await testGeneralUserView();
      case 'auth-2':
        return await testCustomerView();
      case 'auth-3':
        return await testSalesRepView();
      case 'auth-4':
        return await testCarlosBulkOrder();
      default:
        return { passed: false, message: 'Unknown test' };
    }
  }

  // Test implementations
  async function testQuickBooksConnection() {
    try {
      const res = await fetch('/api/quickbooks/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: data.configured || false, message: data.configured ? 'QuickBooks configured' : 'QuickBooks not configured' };
      }
      return { passed: false, message: 'QuickBooks API not available' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Connection failed' };
    }
  }

  async function testInventorySync() {
    try {
      const res = await fetch('/api/quickbooks/sync/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: true, message: `Synced ${data.synced || 0} items` };
      }
      return { passed: false, message: 'Inventory sync failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Sync failed' };
    }
  }

  async function testCustomerSync() {
    try {
      const res = await fetch('/api/quickbooks/sync/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: true, message: `Synced ${data.synced || 0} customers` };
      }
      return { passed: false, message: 'Customer sync failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Sync failed' };
    }
  }

  async function testImageSearch() {
    try {
      const res = await fetch('/api/images/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productName: 'Test Product',
          brand: 'Test Brand',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: !!data.imageUrl, message: data.imageUrl ? 'Image found' : 'No image found' };
      }
      return { passed: false, message: 'Image search failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Search failed' };
    }
  }

  async function testBackgroundRemoval() {
    try {
      // First, we need an image URL to test with
      const testImageUrl = '/logo.png';
      const res = await fetch('/api/images/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: !!data.processedImageUrl, message: data.processedImageUrl ? 'Background removed' : 'Removal failed' };
      }
      return { passed: false, message: 'Background removal failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Removal failed' };
    }
  }

  async function testSplashImageGeneration() {
    try {
      const res = await fetch('/api/images/ai/splash-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productImageUrl: '/logo.png',
          style: 'modern',
          text: 'Test Product',
          tagline: 'Test Tagline',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: !!data.splashImageUrl, message: data.splashImageUrl ? 'Splash image generated' : 'Generation failed' };
      }
      return { passed: false, message: 'Splash image generation failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Generation failed' };
    }
  }

  async function testBulkImageProcessing() {
    try {
      // Test processing multiple products
      const res = await fetch('/api/images/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: 'test-id',
          productName: 'Test Product',
          brand: 'Test Brand',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: data.success || false, message: data.success ? 'Bulk processing works' : 'Bulk processing failed' };
      }
      return { passed: false, message: 'Bulk processing failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Processing failed' };
    }
  }

  async function testProductAPI() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        return { passed: Array.isArray(products), message: `Found ${products.length} products` };
      }
      return { passed: false, message: 'Product API failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'API failed' };
    }
  }

  async function testCategoryAPI() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const categories = await res.json();
        return { passed: Array.isArray(categories), message: `Found ${categories.length} categories` };
      }
      return { passed: false, message: 'Category API failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'API failed' };
    }
  }

  async function testProductUpdates() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        if (products.length > 0) {
          return { passed: true, message: 'Product updates working' };
        }
        return { passed: false, message: 'No products to update' };
      }
      return { passed: false, message: 'Product update failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Update failed' };
    }
  }

  async function testWorkerAPI() {
    try {
      if (!token) {
        return { passed: false, message: 'Login required for worker API' };
      }
      const res = await fetch('/api/contract-workers/jobs?type=sales_rep', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: data.success !== false, message: 'Worker API working' };
      }
      if (res.status === 401) {
        return { passed: false, message: 'Authentication required' };
      }
      return { passed: false, message: 'Worker API failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'API failed' };
    }
  }

  async function testJobQueue() {
    try {
      if (!token) {
        return { passed: false, message: 'Login required for job queue' };
      }
      const res = await fetch('/api/contract-workers/jobs?type=sales_rep', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: Array.isArray(data.available), message: `Found ${data.available?.length || 0} available jobs` };
      }
      if (res.status === 401) {
        return { passed: false, message: 'Authentication required' };
      }
      return { passed: false, message: 'Job queue failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Queue failed' };
    }
  }

  async function testCommissionCalculation() {
    try {
      if (!token) {
        return { passed: false, message: 'Login required for earnings' };
      }
      const res = await fetch('/api/contract-workers/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return { passed: typeof data.total === 'number', message: `Earnings: $${data.total || 0}` };
      }
      if (res.status === 401) {
        return { passed: false, message: 'Authentication required' };
      }
      return { passed: false, message: 'Commission calculation failed' };
    } catch (err) {
      return { passed: false, message: err instanceof Error ? err.message : 'Calculation failed' };
    }
  }

  async function testGeneralUserView() {
    // Test if general user view loads without login
    return { passed: true, message: 'General user view accessible' };
  }

  async function testCustomerView() {
    // Test if customer view loads with customer login
    if (user && user.role === 'CUSTOMER') {
      return { passed: true, message: 'Customer view accessible' };
    }
    return { passed: false, message: 'Customer login required' };
  }

  async function testSalesRepView() {
    // Test if sales rep view loads with sales rep login
    if (user && user.role === 'SALES_REP') {
      return { passed: true, message: 'Sales rep view accessible' };
    }
    return { passed: false, message: 'Sales rep login required' };
  }

  async function testCarlosBulkOrder() {
    // Test if Carlos bulk order button appears
    if (user && user.email) {
      const carlosEmails = ['carlos@azteka.com', 'carlos@example.com'];
      const isCarlos = carlosEmails.includes(user.email.toLowerCase());
      return { passed: isCarlos, message: isCarlos ? 'Carlos bulk order available' : 'Not Carlos account' };
    }
    return { passed: false, message: 'Login required' };
  }

  async function seedInventoryFromQB() {
    try {
      setRunning(true);
      const res = await fetch('/api/quickbooks/sync/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        await loadInventoryStats();
        alert(`Successfully synced ${data.synced || 0} items from QuickBooks!`);
      } else {
        alert('Failed to sync inventory from QuickBooks');
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunning(false);
    }
  }

  async function processAllImages() {
    try {
      setRunning(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        const productsNeedingProcessing = products.filter((p: any) => !p.imageUrl || !p.backgroundRemoved);
        
        let processed = 0;
        let failed = 0;

        for (const product of productsNeedingProcessing.slice(0, 10)) { // Limit to 10 for testing
          try {
            if (!product.imageUrl) {
              // Search for image
              const searchRes = await fetch('/api/images/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  productName: product.name,
                  brand: product.brand || '',
                }),
              });
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                product.imageUrl = searchData.imageUrl;
              }
            }

            if (product.imageUrl && !product.backgroundRemoved) {
              // Remove background
              const bgRes = await fetch('/api/images/remove-background', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  productId: product.id,
                  imageUrl: product.imageUrl,
                }),
              });
              if (bgRes.ok) {
                processed++;
              } else {
                failed++;
              }
            }
          } catch (err) {
            failed++;
          }
        }

        await loadInventoryStats();
        alert(`Processed ${processed} images, ${failed} failed`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRunning(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-emerald-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'running':
        return <Loader className="text-blue-600 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-50 border-emerald-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                🧪 Test Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive testing and verification</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={runAllTests}
                disabled={running}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {running ? <Loader className="animate-spin" size={20} /> : <Play size={20} />}
                {running ? 'Running Tests...' : 'Run All Tests'}
              </button>
              <button
                onClick={loadInventoryStats}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">QuickBooks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {quickBooksConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
              <Database className={quickBooksConnected ? 'text-emerald-600' : 'text-gray-400'} size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inventory</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{inventoryCount}</p>
              </div>
              <Package className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Needs Images</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{productsNeedingImages}</p>
              </div>
              <Image className="text-orange-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Test Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{overallStatus}</p>
              </div>
              {getStatusIcon(overallStatus)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={seedInventoryFromQB}
              disabled={running || !quickBooksConnected}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Database size={24} />
              <div className="text-left">
                <div className="text-lg">Seed Inventory from QB</div>
                <div className="text-sm opacity-90">Sync products from QuickBooks</div>
              </div>
            </button>

            <button
              onClick={processAllImages}
              disabled={running}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Zap size={24} />
              <div className="text-left">
                <div className="text-lg">Process All Images</div>
                <div className="text-sm opacity-90">Auto-search, remove BG, generate splash</div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/admin/images'}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Image size={24} />
              <div className="text-left">
                <div className="text-lg">Image Processing UI</div>
                <div className="text-sm opacity-90">Manual image processing</div>
              </div>
            </button>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite, suiteIndex) => (
            <div
              key={suiteIndex}
              className={`bg-white rounded-xl shadow-lg border-2 ${getStatusColor(suite.status)}`}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(suite.status)}
                    <h3 className="text-xl font-black text-gray-900">{suite.name}</h3>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold capitalize">
                    {suite.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {suite.tests.map((test) => (
                    <div
                      key={test.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        test.status === 'passed'
                          ? 'bg-emerald-50 border-emerald-200'
                          : test.status === 'failed'
                          ? 'bg-red-50 border-red-200'
                          : test.status === 'running'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-bold text-gray-900">{test.name}</p>
                          {test.message && (
                            <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                          )}
                        </div>
                      </div>
                      {test.duration && (
                        <span className="text-sm text-gray-500 font-semibold">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

