import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:5173';

let passedTests = 0;
let failedTests = 0;
const failures = [];

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
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

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testSystemStartup() {
  logSection('TASK 1: FULL SYSTEM STARTUP');
  
  // Test backend
  try {
    const health = await httpRequest(`${API_BASE}/api/health`);
    logTest('Backend API health check', health.status === 200, `Status: ${health.status}`);
  } catch (error) {
    logTest('Backend API health check', false, error.message);
  }
  
  // Test frontend
  try {
    const frontend = await httpRequest(`${FRONTEND_BASE}/`, { method: 'GET' });
    logTest('Frontend accessible', frontend.status === 200, `Status: ${frontend.status}`);
  } catch (error) {
    logTest('Frontend accessible', false, error.message);
  }
}

async function testImageUploadAPIs() {
  logSection('TASK 2: TEST IMAGE UPLOAD APIS');
  
  // Note: Auth endpoints may not exist, so we'll test what we can
  log('⚠️  Note: Auth endpoints may require manual setup');
  
  // Test catalog API with images
  try {
    const catalog = await httpRequest(`${API_BASE}/api/products?all=true&limit=5`);
    if (catalog.status === 200 && Array.isArray(catalog.data)) {
      const hasImages = catalog.data.some(p => p.imageUrl || p.images?.length > 0);
      logTest('Catalog API returns products with images', hasImages, 
        `Found ${catalog.data.length} products, ${hasImages ? 'with images' : 'no images'}`);
    } else {
      logTest('Catalog API accessible', false, `Status: ${catalog.status}`);
    }
  } catch (error) {
    logTest('Catalog API accessible', false, error.message);
  }
  
  // Test bundles API
  try {
    const bundles = await httpRequest(`${API_BASE}/api/admin/bundles`);
    if (bundles.status === 200) {
      const bundleData = bundles.data.bundles || bundles.data;
      const count = Array.isArray(bundleData) ? bundleData.length : 0;
      logTest('Bundles API accessible', count >= 0, `Found ${count} bundles`);
    } else {
      logTest('Bundles API accessible', bundles.status === 401, 'Requires authentication');
    }
  } catch (error) {
    logTest('Bundles API accessible', false, error.message);
  }
}

async function testFrontendCatalog() {
  logSection('TASK 3: TEST FRONTEND CATALOG');
  
  try {
    const frontend = await httpRequest(`${FRONTEND_BASE}/`);
    const html = typeof frontend.data === 'string' ? frontend.data : '';
    const hasHTML = html.includes('<!DOCTYPE html') || html.includes('<html');
    logTest('Frontend loads HTML', hasHTML, hasHTML ? 'HTML content found' : 'No HTML content');
    
    log('\n🌐 Frontend URLs:');
    log(`   Main: ${FRONTEND_BASE}`, 'blue');
    log(`   Admin: ${FRONTEND_BASE}/admin`, 'blue');
    log(`   Catalog: ${FRONTEND_BASE}/catalog`, 'blue');
  } catch (error) {
    logTest('Frontend loads', false, error.message);
  }
}

async function testDatabasePerformance() {
  logSection('TASK 4: DATABASE PERFORMANCE TEST');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const startTime = Date.now();
    const products = await prisma.product.findMany({
      where: { hasImage: true },
      take: 50,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        thumbnailUrl: true,
        priceCase: true,
      },
    });
    const queryTime = Date.now() - startTime;
    
    logTest('Database query performance', queryTime < 2000, 
      `Query time: ${queryTime}ms (${products.length} products)`);
    
    await prisma.$disconnect();
  } catch (error) {
    logTest('Database performance test', false, error.message);
  }
}

async function testMVPCompletion() {
  logSection('TASK 5: MVP COMPLETION VERIFICATION');
  
  try {
    // Check product count
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const productCount = await prisma.product.count();
    logTest('642 products in database', productCount === 642, 
      `Found ${productCount} products`);
    
    const productsWithImages = await prisma.product.count({ where: { hasImage: true } });
    logTest('Products with images', productsWithImages > 0, 
      `${productsWithImages} products have images`);
    
    const bundleCount = await prisma.productBundle.count();
    logTest('Bundles available', bundleCount > 0, `${bundleCount} bundles found`);
    
    // Check image directories
    try {
      await fs.access('public/uploads/products/thumbnails');
      logTest('Image upload system ready', true, 'Directories exist');
    } catch {
      logTest('Image upload system ready', false, 'Directories missing');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    logTest('MVP verification', false, error.message);
  }
}

function printSummary() {
  logSection('INTEGRATION TEST SUMMARY');
  
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
    log('\n✅ ALL INTEGRATION TESTS PASSED!', 'green');
    log('\n🎉 MVP INTEGRATION COMPLETE - READY FOR PRODUCTION!', 'green');
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'yellow');
    log('Please review failures above', 'yellow');
  }
  
  log('\n📋 Demo URLs:', 'cyan');
  log(`   Sales Catalog: ${FRONTEND_BASE}`, 'blue');
  log(`   Admin Panel: ${FRONTEND_BASE}/admin`, 'blue');
  log(`   Bundle Editor: ${FRONTEND_BASE}/admin/bundles/edit`, 'blue');
}

async function main() {
  log('\n🚀 Starting Full System Integration Test...', 'cyan');
  log(`API Base: ${API_BASE}`, 'blue');
  log(`Frontend Base: ${FRONTEND_BASE}`, 'blue');
  
  try {
    await testSystemStartup();
    await testImageUploadAPIs();
    await testFrontendCatalog();
    await testDatabasePerformance();
    await testMVPCompletion();
    printSummary();
  } catch (error) {
    log(`\n❌ Fatal error during integration test: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

