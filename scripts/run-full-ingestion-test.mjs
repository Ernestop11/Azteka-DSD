#!/usr/bin/env node
/**
 * Full Ingestion Test Harness
 * Runs end-to-end test of the auto-ingestion pipeline
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load environment
dotenv.config({ path: join(ROOT_DIR, '.env.production') });
dotenv.config({ path: join(ROOT_DIR, '.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN || 'test-token'; // In production, use real token

// Test configuration
const TEST_CONFIG = {
  apiBase: API_BASE,
  token: ADMIN_TOKEN,
  logDir: join(ROOT_DIR, 'logs', 'testing'),
  poSamplesDir: join(ROOT_DIR, 'tests', 'po-samples'),
};

// Ensure log directory exists
mkdirSync(TEST_CONFIG.logDir, { recursive: true });

// Logger
const logFile = join(TEST_CONFIG.logDir, `${new Date().toISOString().split('T')[0]}.log`);
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  console.log(`[TEST] ${message}`);
  writeFileSync(logFile, logLine, { flag: 'a' });
}

// API helper
async function apiCall(endpoint, options = {}) {
  const url = `${TEST_CONFIG.apiBase}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${TEST_CONFIG.token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      const errorText = isJson ? await response.json() : await response.text();
      throw new Error(`API Error ${response.status}: ${JSON.stringify(errorText)}`);
    }

    return isJson ? await response.json() : await response.text();
  } catch (error) {
    log(`API call failed: ${endpoint}`, { error: error.message });
    throw error;
  }
}

// Test results
const results = {
  startTime: new Date().toISOString(),
  poFiles: [],
  productsParsed: 0,
  productsProcessed: 0,
  productsUpdated: 0,
  productsCreated: 0,
  imagesGenerated: 0,
  designAssetsGenerated: 0,
  draftItems: [],
  errors: [],
  endTime: null,
};

/**
 * Step 1: Upload and parse PO file
 */
async function testPOParsing(filePath, fileName) {
  log(`\n=== Testing PO Parsing: ${fileName} ===`);

  try {
    const fileContent = readFileSync(filePath);
    const formData = new FormData();
    formData.append('file', fileContent, { filename: fileName });
    formData.append('autoProcess', 'false'); // Parse only, don't auto-process

    const response = await apiCall('/api/auto/ingest-po', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(), // FormData headers
    });

    log(`Parsed ${response.count || response.products?.length || 0} products from ${fileName}`);
    results.productsParsed += response.count || response.products?.length || 0;
    results.poFiles.push({
      fileName,
      products: response.products || [],
    });

    return response.products || [];
  } catch (error) {
    log(`PO parsing failed for ${fileName}`, { error: error.message });
    results.errors.push({ step: 'po_parsing', file: fileName, error: error.message });
    return [];
  }
}

/**
 * Step 2: Process single product through full pipeline
 */
async function processProduct(product) {
  log(`\n--- Processing: ${product.product_name || product.sku} ---`);

  const productResult = {
    product,
    imageUrl: null,
    designAssetUrl: null,
    matched: false,
    updated: false,
    created: false,
    errors: [],
  };

  try {
    // 2a: Search for image
    log(`  Searching for image...`);
    try {
      const imageSearchResult = await apiCall('/api/auto/search-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.product_name,
          sku: product.sku,
          brand: product.brand,
          size: product.size,
          category: product.category,
        }),
      });

      if (imageSearchResult.imageUrl) {
        productResult.imageUrl = imageSearchResult.imageUrl;
        log(`  Found image: ${imageSearchResult.imageUrl}`);
        results.imagesGenerated++;
      } else {
        productResult.errors.push('No image found');
        log(`  No image found`);
      }
    } catch (error) {
      productResult.errors.push(`Image search failed: ${error.message}`);
      log(`  Image search failed: ${error.message}`);
    }

    // 2b: Match product
    log(`  Matching product...`);
    try {
      const matchResult = await apiCall('/api/auto/match-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.product_name,
          sku: product.sku,
          vendor_code: product.vendor_code,
          brand: product.brand,
          size: product.size,
          category: product.category,
        }),
      });

      if (matchResult.success && matchResult.match) {
        productResult.matched = true;
        productResult.matchId = matchResult.match.id;
        log(`  Matched to existing product: ${matchResult.match.name} (confidence: ${matchResult.confidence})`);
      } else {
        log(`  No match found (confidence: ${matchResult.confidence || 0})`);
      }
    } catch (error) {
      productResult.errors.push(`Matching failed: ${error.message}`);
      log(`  Matching failed: ${error.message}`);
    }

    // 2c: Generate design asset (if Canva configured)
    if (process.env.CANVA_API_KEY && productResult.imageUrl) {
      log(`  Generating design asset...`);
      try {
        const designResult = await apiCall('/api/design/render-product-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: productResult.matchId,
            name: product.product_name,
            price: product.price,
            imageUrl: productResult.imageUrl,
            brandName: product.brand,
            categoryName: product.category,
          }),
        });

        if (designResult.imageUrl) {
          productResult.designAssetUrl = designResult.imageUrl;
          results.designAssetsGenerated++;
          log(`  Generated design asset: ${designResult.imageUrl}`);
        }
      } catch (error) {
        productResult.errors.push(`Design generation failed: ${error.message}`);
        log(`  Design generation failed: ${error.message}`);
      }
    }

    // 2d: Process through batch ingestion if image found
    if (productResult.imageUrl) {
      log(`  Running batch ingestion...`);
      try {
        const batchResult = await apiCall('/api/auto/ingest-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products: [product],
          }),
        });

        if (batchResult.summary) {
          if (batchResult.summary.updated > 0) {
            productResult.updated = true;
            results.productsUpdated++;
          }
          if (batchResult.summary.created > 0) {
            productResult.created = true;
            results.productsCreated++;
            results.draftItems.push({
              product: product.product_name || product.sku,
              reason: 'No match found',
            });
          }
        }
      } catch (error) {
        productResult.errors.push(`Batch ingestion failed: ${error.message}`);
        log(`  Batch ingestion failed: ${error.message}`);
      }
    }

    results.productsProcessed++;
    return productResult;
  } catch (error) {
    productResult.errors.push(`Processing failed: ${error.message}`);
    results.errors.push({ step: 'product_processing', product: product.product_name, error: error.message });
    return productResult;
  }
}

/**
 * Main test execution
 */
async function runFullTest() {
  log('='.repeat(60));
  log('FULL INGESTION TEST HARNESS');
  log('='.repeat(60));
  log(`Started at: ${results.startTime}`);
  log(`API Base: ${TEST_CONFIG.apiBase}`);

  // Test PO files
  const poFiles = [
    { name: 'sabritas_po.csv', type: 'csv' },
    { name: 'gamesa_po.csv', type: 'csv' },
    { name: 'surti_rico_po.csv', type: 'csv' },
  ];

  const allProducts = [];

  // Step 1: Parse all PO files
  log('\n=== STEP 1: PO PARSING ===');
  for (const poFile of poFiles) {
    const filePath = join(TEST_CONFIG.poSamplesDir, poFile.name);
    try {
      const products = await testPOParsing(filePath, poFile.name);
      allProducts.push(...products);
    } catch (error) {
      log(`Failed to parse ${poFile.name}`, { error: error.message });
    }
  }

  log(`\nTotal products parsed: ${allProducts.length}`);

  // Step 2: Process each product
  log('\n=== STEP 2: PRODUCT PROCESSING ===');
  const processedProducts = [];

  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    log(`\nProcessing product ${i + 1}/${allProducts.length}`);
    
    const result = await processProduct(product);
    processedProducts.push(result);

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Step 3: Generate summary
  log('\n=== STEP 3: TEST SUMMARY ===');
  results.endTime = new Date().toISOString();

  const summary = {
    testRun: {
      startTime: results.startTime,
      endTime: results.endTime,
      duration: new Date(results.endTime) - new Date(results.startTime),
    },
    poFiles: {
      processed: results.poFiles.length,
      totalProductsParsed: results.productsParsed,
    },
    products: {
      processed: results.productsProcessed,
      updated: results.productsUpdated,
      created: results.productsCreated,
      draftItems: results.draftItems.length,
    },
    assets: {
      imagesGenerated: results.imagesGenerated,
      designAssetsGenerated: results.designAssetsGenerated,
    },
    errors: {
      count: results.errors.length,
      details: results.errors,
    },
    draftItems: results.draftItems,
  };

  log('\n' + '='.repeat(60));
  log('TEST SUMMARY');
  log('='.repeat(60));
  log(JSON.stringify(summary, null, 2));

  // Save summary to file
  const summaryFile = join(TEST_CONFIG.logDir, `test-summary-${Date.now()}.json`);
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  log(`\nSummary saved to: ${summaryFile}`);

  // Exit with appropriate code
  if (results.errors.length > 0) {
    log(`\n⚠️  Test completed with ${results.errors.length} errors`);
    process.exit(1);
  } else {
    log(`\n✅ Test completed successfully!`);
    process.exit(0);
  }
}

// Run test
runFullTest().catch((error) => {
  log('FATAL ERROR', { error: error.message, stack: error.stack });
  process.exit(1);
});

