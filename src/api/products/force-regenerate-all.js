import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../../..');

const prisma = new PrismaClient();
const router = Router();

// POST /api/products/force-regenerate-all
router.post('/force-regenerate-all', async (req, res) => {
  try {
    const { batchSize = 20, delay = 2000 } = req.body;

    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalProducts = products.length;
    const batches = [];

    // Split into batches
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }

    // Create log directory
    const logDir = join(ROOT_DIR, 'logs', 'regen');
    mkdirSync(logDir, { recursive: true });

    const logFile = join(logDir, `regen-${Date.now()}.log`);
    const summaryFile = join(logDir, `regen-summary-${Date.now()}.json`);

    const summary = {
      startTime: new Date().toISOString(),
      totalProducts,
      batchSize,
      batches: batches.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      results: [],
    };

    // Log start
    writeFileSync(logFile, `[${summary.startTime}] Starting batch regeneration\n`);
    writeFileSync(logFile, `Total products: ${totalProducts}\n`, { flag: 'a' });
    writeFileSync(logFile, `Batch size: ${batchSize}\n`, { flag: 'a' });
    writeFileSync(logFile, `Total batches: ${batches.length}\n\n`, { flag: 'a' });

    // Return immediately (non-blocking)
    res.json({
      success: true,
      message: 'Batch regeneration started',
      job: {
        totalProducts,
        batches: batches.length,
        batchSize,
        logFile,
        summaryFile,
      },
    });

    // Process batches asynchronously
    processBatches(batches, batchSize, delay, logFile, summary, summaryFile).catch((error) => {
      writeFileSync(logFile, `\n[ERROR] Fatal error: ${error.message}\n`, { flag: 'a' });
    });

  } catch (error) {
    console.error('Force regenerate all error:', error);
    res.status(500).json({
      error: 'REGENERATION_ERROR',
      message: 'Failed to start batch regeneration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

async function processBatches(batches, batchSize, delay, logFile, summary, summaryFile) {
  const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
  const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN || 'test-token';

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchStart = new Date().toISOString();

    writeFileSync(logFile, `\n[${batchStart}] Processing batch ${batchIndex + 1}/${batches.length}\n`, { flag: 'a' });

    for (const product of batch) {
      try {
        // Call force-regenerate endpoint
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${API_BASE}/api/products/${product.id}/force-regenerate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ regenerateDesign: 'true' }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          summary.succeeded++;
          writeFileSync(logFile, `  ✅ ${product.name} (${product.sku})\n`, { flag: 'a' });
        } else {
          summary.failed++;
          writeFileSync(logFile, `  ❌ ${product.name} (${product.sku}): ${result.message || 'Failed'}\n`, { flag: 'a' });
        }

        summary.results.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          success: response.ok && result.success,
          error: result.error || null,
        });

        summary.processed++;
      } catch (error) {
        summary.failed++;
        writeFileSync(logFile, `  ❌ ${product.name} (${product.sku}): ${error.message}\n`, { flag: 'a' });
        summary.results.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          success: false,
          error: error.message,
        });
      }

      // Delay between products
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Update summary file
    summary.endTime = new Date().toISOString();
    summary.progress = {
      batchesCompleted: batchIndex + 1,
      batchesRemaining: batches.length - (batchIndex + 1),
      percentComplete: Math.round(((batchIndex + 1) / batches.length) * 100),
    };

    writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  }

  // Final summary
  summary.endTime = new Date().toISOString();
  summary.duration = new Date(summary.endTime) - new Date(summary.startTime);

  writeFileSync(logFile, `\n[${summary.endTime}] Batch regeneration complete\n`, { flag: 'a' });
  writeFileSync(logFile, `Processed: ${summary.processed}\n`, { flag: 'a' });
  writeFileSync(logFile, `Succeeded: ${summary.succeeded}\n`, { flag: 'a' });
  writeFileSync(logFile, `Failed: ${summary.failed}\n`, { flag: 'a' });
  writeFileSync(logFile, `Duration: ${summary.duration}ms\n`, { flag: 'a' });

  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
}

export default router;

