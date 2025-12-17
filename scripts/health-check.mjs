import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000,
    }, (res) => {
      resolve({ status: res.statusCode });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function systemHealthCheck() {
  console.log('📊 System Health Check - ' + new Date().toISOString());
  console.log('='.repeat(60));
  
  const health = {
    database: { status: 'unknown', details: {} },
    images: { status: 'unknown', details: {} },
    api: { status: 'unknown', details: {} },
    performance: { status: 'unknown', details: {} },
  };
  
  try {
    // Database Health
    console.log('🗄️  Checking database...');
    const productCount = await prisma.product.count();
    const productsWithImages = await prisma.productImage.count();
    const bundleCount = await prisma.productBundle.count();
    
    const categories = await prisma.category.count();
    
    health.database = {
      status: productCount === 642 ? 'healthy' : 'warning',
      details: {
        totalProducts: productCount,
        expectedProducts: 642,
        productsWithImages,
        imageCompletionRate: `${((productsWithImages / productCount) * 100).toFixed(1)}%`,
        categoryCount: categories,
        bundleCount,
      },
    };
    
    console.log(`   Products: ${productCount}/642`);
    console.log(`   Products with images: ${productsWithImages}`);
    console.log(`   Bundles: ${bundleCount}`);
    console.log(`   Categories: ${categories}`);
    
    // Image Storage Health
    console.log('\n🖼️  Checking image storage...');
    try {
      const originalDir = await fs.readdir('public/uploads/products/original');
      const thumbnailDir = await fs.readdir('public/uploads/products/thumbnails');
      const mediumDir = await fs.readdir('public/uploads/products/medium');
      const bundleOriginalDir = await fs.readdir('public/uploads/bundles/original');
      const bundleThumbnailDir = await fs.readdir('public/uploads/bundles/thumbnails');
      
      health.images = {
        status: 'healthy',
        details: {
          originalImages: originalDir.length,
          thumbnailImages: thumbnailDir.length,
          mediumImages: mediumDir.length,
          bundleOriginalImages: bundleOriginalDir.length,
          bundleThumbnailImages: bundleThumbnailDir.length,
          storageStructure: 'complete',
        },
      };
      
      console.log(`   Product images: ${originalDir.length} original, ${thumbnailDir.length} thumbnails, ${mediumDir.length} medium`);
      console.log(`   Bundle images: ${bundleOriginalDir.length} original, ${bundleThumbnailDir.length} thumbnails`);
    } catch (error) {
      health.images = {
        status: 'error',
        details: { error: error.message },
      };
      console.log(`   ⚠️  Storage check error: ${error.message}`);
    }
    
    // API Health
    console.log('\n🌐 Checking API availability...');
    try {
      const apiHealth = await httpRequest('http://localhost:3000/api/health');
      health.api = {
        status: apiHealth.status === 200 ? 'healthy' : 'warning',
        details: { httpStatus: apiHealth.status },
      };
      console.log(`   API Status: ${apiHealth.status === 200 ? '✅ Healthy' : '⚠️  Warning'}`);
    } catch (error) {
      health.api = {
        status: 'down',
        details: { error: error.message },
      };
      console.log(`   ❌ API not responding: ${error.message}`);
    }
    
    // Performance Check
    console.log('\n⚡ Checking performance...');
    const startTime = Date.now();
    await prisma.product.findMany({
      take: 50,
      select: {
        id: true,
        name: true,
        priceCase: true,
        images: {
          take: 1,
          select: {
            thumbnail_url: true,
            medium_url: true,
          },
        },
      },
    });
    const queryTime = Date.now() - startTime;
    
    health.performance = {
      status: queryTime < 100 ? 'healthy' : queryTime < 500 ? 'warning' : 'slow',
      details: {
        queryTimeMs: queryTime,
        recommendation: queryTime < 100 ? 'Excellent' : queryTime < 500 ? 'Good' : 'Consider optimization',
      },
    };
    
    console.log(`   Query time: ${queryTime}ms (${health.performance.details.recommendation})`);
    
    // Summary
    console.log('\n📋 HEALTH SUMMARY:');
    console.log('='.repeat(60));
    Object.entries(health).forEach(([component, status]) => {
      const icon = status.status === 'healthy' ? '✅' : status.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${component.toUpperCase()}: ${status.status}`);
    });
    
    console.log('\n📊 KEY METRICS:');
    console.log(`   Products: ${health.database.details.totalProducts}/642`);
    console.log(`   Images: ${health.database.details.imageCompletionRate} complete`);
    console.log(`   Categories: ${health.database.details.categoryCount}`);
    console.log(`   Bundles: ${health.database.details.bundleCount}`);
    console.log(`   API: ${health.api.status}`);
    console.log(`   Performance: ${health.performance.details.queryTimeMs}ms`);
    
    // Save health report
    await fs.writeFile('health-report.json', JSON.stringify(health, null, 2));
    console.log('\n💾 Health report saved to health-report.json');
    
    // Overall status
    const allHealthy = Object.values(health).every(h => h.status === 'healthy');
    if (allHealthy) {
      console.log('\n✅ All systems healthy!');
    } else {
      console.log('\n⚠️  Some systems need attention');
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

systemHealthCheck()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });

