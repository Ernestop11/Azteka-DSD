import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/debug/health-check - Comprehensive system health check
router.get('/', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown', latency: null, error: null },
      prisma: { status: 'unknown', error: null },
      layout: { status: 'unknown', exists: false, error: null },
      seed: {
        status: 'unknown',
        products: null,
        categories: null,
        brands: null,
        error: null,
      },
    },
  };

  // Check PostgreSQL connection
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    health.checks.database = {
      status: 'ok',
      latency: `${latency}ms`,
      error: null,
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = {
      status: 'error',
      latency: null,
      error: error.message,
    };
    return res.status(503).json(health);
  }

  // Check Prisma Client
  try {
    await prisma.$connect();
    health.checks.prisma = {
      status: 'ok',
      error: null,
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.prisma = {
      status: 'error',
      error: error.message,
    };
  }

  // Check layout existence (may not be migrated)
  try {
    const layoutCount = await prisma.frontPageLayout.count();
    health.checks.layout = {
      status: 'ok',
      exists: layoutCount > 0,
      count: layoutCount,
      error: null,
    };
  } catch (error) {
    // Model may not exist - that's okay
    if (error.code === 'P2001' || error.message?.includes('does not exist')) {
      health.checks.layout = {
        status: 'not_migrated',
        exists: false,
        error: 'Layout model not migrated yet',
      };
    } else {
      health.checks.layout = {
        status: 'error',
        exists: false,
        error: error.message,
      };
    }
  }

  // Check seed data
  try {
    const [productCount, categoryCount, brandCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
    ]);

    health.checks.seed = {
      status: 'ok',
      products: productCount,
      categories: categoryCount,
      brands: brandCount,
      error: null,
    };

    // Warn if no seed data
    if (productCount === 0 && categoryCount === 0 && brandCount === 0) {
      health.checks.seed.status = 'warning';
      health.checks.seed.error = 'No seed data found';
    }
  } catch (error) {
    health.checks.seed = {
      status: 'error',
      products: null,
      categories: null,
      brands: null,
      error: error.message,
    };
  }

  // Determine overall status
  const hasErrors = Object.values(health.checks).some(
    (check) => check.status === 'error'
  );
  const hasWarnings = Object.values(health.checks).some(
    (check) => check.status === 'warning'
  );

  if (hasErrors) {
    health.status = 'error';
    return res.status(503).json(health);
  }

  if (hasWarnings) {
    health.status = 'warning';
  }

  const statusCode = health.status === 'ok' ? 200 : 200; // Still return 200 for warnings
  res.status(statusCode).json(health);
});

export default router;

