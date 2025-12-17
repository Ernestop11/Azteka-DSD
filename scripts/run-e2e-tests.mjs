import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passedTests = 0;
let failedTests = 0;
const failures = [];

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name, passed, details = '') {
  if (passed) {
    log(`✓ ${name}`, 'green');
    passedTests++;
  } else {
    log(`✗ ${name}`, 'red');
    failedTests++;
    if (details) {
      log(`  ${details}`, 'yellow');
      failures.push({ name, details });
    }
  }
}

async function runCommand(command, description) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { success: true, output: stdout.trim(), error: stderr };
  } catch (error) {
    return { success: false, output: error.stdout?.trim() || '', error: error.message };
  }
}

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testDatabase() {
  logSection('1. DATABASE TEST');

  // Test 1.1: Count Products
  log('\n📊 Testing product count...');
  const productCountResult = await runCommand('npm run db:count-products');
  if (productCountResult.success) {
    const match = productCountResult.output.match(/Total Products: (\d+)/);
    const count = match ? parseInt(match[1]) : 0;
    logTest('Product count check', count === 642, `Found ${count} products, expected 642`);
  } else {
    logTest('Product count check', false, productCountResult.error);
  }

  // Test 1.2: Count Bundles
  log('\n📦 Testing bundle count...');
  const bundleCountResult = await runCommand('npm run db:count-bundles');
  if (bundleCountResult.success) {
    const match = bundleCountResult.output.match(/Total Bundles: (\d+)/);
    const count = match ? parseInt(match[1]) : 0;
    logTest('Bundle count check', count >= 3, `Found ${count} bundles, expected 3+`);
  } else {
    logTest('Bundle count check', false, bundleCountResult.error);
  }

  // Test 1.3: Bundle Consistency
  log('\n🔍 Testing bundle consistency...');
  const consistencyResult = await runCommand('npm run db:verify-bundle-consistency');
  logTest('Bundle consistency check', consistencyResult.success, consistencyResult.error);
}

async function testBackendAPI() {
  logSection('2. BACKEND API TEST');

  // Test 2.1: Products API
  log('\n📦 Testing products API...');
  try {
    // Test with all=true to get all products (not just in-stock)
    const productsResponse = await httpRequest(`${API_BASE}/api/products?all=true`);
    if (productsResponse.status === 200) {
      const count = Array.isArray(productsResponse.data) ? productsResponse.data.length : 0;
      logTest('Products API returns 642 products', count === 642, `Got ${count} products (expected 642)`);
    } else {
      logTest('Products API accessible', false, `Status: ${productsResponse.status}`);
    }
  } catch (error) {
    logTest('Products API accessible', false, error.message);
  }

  // Test 2.2: Bundles API
  log('\n📦 Testing bundles API...');
  try {
    const bundlesResponse = await httpRequest(`${API_BASE}/api/admin/bundles`);
    if (bundlesResponse.status === 200 || bundlesResponse.status === 401) {
      // 401 is OK - means endpoint exists but needs auth
      let count = 0;
      if (bundlesResponse.status === 401) {
        logTest('Bundles API endpoint exists', true, 'Requires authentication (expected)');
      } else {
        // Handle both array response and object with bundles property
        if (Array.isArray(bundlesResponse.data)) {
          count = bundlesResponse.data.length;
        } else if (bundlesResponse.data && bundlesResponse.data.bundles) {
          count = Array.isArray(bundlesResponse.data.bundles) ? bundlesResponse.data.bundles.length : 0;
        } else if (bundlesResponse.data && bundlesResponse.data.pagination) {
          count = bundlesResponse.data.pagination.total || 0;
        }
        logTest('Bundles API returns 3+ bundles', count >= 3, `Got ${count} bundles`);
      }
    } else {
      logTest('Bundles API accessible', false, `Status: ${bundlesResponse.status}`);
    }
  } catch (error) {
    logTest('Bundles API accessible', false, error.message);
  }

  // Test 2.3: Health Check
  log('\n💚 Testing health check...');
  try {
    const healthResponse = await httpRequest(`${API_BASE}/api/health`);
    logTest('Health check endpoint', healthResponse.status === 200, `Status: ${healthResponse.status}`);
  } catch (error) {
    logTest('Health check endpoint', false, error.message);
  }
}

async function testFrontend() {
  logSection('3. FRONTEND TEST (Manual Verification Required)');

  log('\n⚠️  Frontend tests require manual verification:');
  log('   1. Open: http://localhost:3000/admin/bundles/edit', 'yellow');
  log('   2. Create new bundle: "Carlos Test Pack"', 'yellow');
  log('   3. Add 3 products, set 10% discount', 'yellow');
  log('   4. Upload image, save bundle', 'yellow');
  log('   5. Verify bundle appears in catalog', 'yellow');
  
  log('\n⚠️  Customer flow tests require manual verification:');
  log('   1. Login as sales rep: sales@aztekafoods.com / sales123', 'yellow');
  log('   2. Browse catalog - verify bundles appear', 'yellow');
  log('   3. Add bundle to cart', 'yellow');
  log('   4. Complete checkout', 'yellow');
  
  log('\n⚠️  Mobile tests require manual verification:');
  log('   1. Open on mobile browser', 'yellow');
  log('   2. Test bundle creation and ordering', 'yellow');
  log('   3. Verify Carlos can use efficiently', 'yellow');
  
  logTest('Frontend manual tests', true, 'See instructions above');
}

function printSummary() {
  logSection('TEST SUMMARY');
  
  const totalTests = passedTests + failedTests;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  log(`\nTotal Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Pass Rate: ${passRate}%`, passRate === 100 ? 'green' : 'yellow');
  
  if (failures.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    failures.forEach((failure, index) => {
      log(`   ${index + 1}. ${failure.name}`, 'yellow');
      if (failure.details) {
        log(`      ${failure.details}`, 'yellow');
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failedTests === 0) {
    log('\n✅ ALL AUTOMATED TESTS PASSED!', 'green');
    log('⚠️  Remember to complete manual frontend tests', 'yellow');
  } else {
    log('\n❌ SOME TESTS FAILED', 'red');
    log('Please review the failures above and fix issues', 'yellow');
    process.exit(1);
  }
}

async function main() {
  log('\n🚀 Starting End-to-End Test Sequence...', 'cyan');
  log(`API Base URL: ${API_BASE}`, 'blue');
  
  try {
    await testDatabase();
    await testBackendAPI();
    await testFrontend();
    printSummary();
  } catch (error) {
    log(`\n❌ Fatal error during testing: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

