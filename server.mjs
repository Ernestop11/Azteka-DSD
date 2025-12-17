import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import multer from 'multer';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
// Optional imports - routes may not exist in root directory
// These routes are commented out as they don't exist in root src/api/
// let ordersRouter, manageOrdersRouter, authRouter, purchaseOrderRouter, invoicesRouter;
// let aiInsightsRouter, automationRouter, registerAutomationSocket;
// let gamificationRouter, registerGamificationSocket;
// let loyaltyRouter, registerLoyaltySocket;
// let analyticsRouter;
import manageProductsRouter from './src/api/products/manage.js';
import categoriesRouter from './src/api/categories/route.js';
import brandsRouter from './src/api/brands/route.js';
import catalogLayoutRouter from './src/api/catalog/layout.js';
import healthCheckRouter from './src/api/debug/health-check.js';
import designRouter from './src/api/design/index.js';
import autoIngestRouter from './src/api/auto/index.js';
import { verifyToken, authorize } from './src/middleware/auth.js';
import poUploadRouter from './server/routes/po-upload.mjs';
import productSeedRouter from './server/routes/product-seed.mjs';
import qbSyncRouter from './server/routes/quickbooks-sync.mjs';
// Bundles router - import if available
let bundlesRouter;
try {
  const bundlesModule = await import('./remote_azteka_dsd/src/api/admin/bundles.js');
  bundlesRouter = bundlesModule.default;
} catch (e) {
  console.warn('⚠️  Bundles router not available:', e.message);
}

// Load environment variables from .env.production with absolute path
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with absolute paths for PM2 compatibility
dotenv.config({ path: join(__dirname, '.env.production') });
dotenv.config({ path: join(__dirname, '.env') }); // Fallback

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 3000;
const uploadDir =
  process.env.UPLOAD_DIR ||
  (fs.existsSync('/srv/azteka-dsd/uploads') ? '/srv/azteka-dsd/uploads' : join(__dirname, 'uploads'));

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// app.use('/api/auth', authRouter); // Auth router not available

const productsRouter = express.Router();
const BUSINESS_MODES = new Set(['MEXICAN_STORE', 'CONVENIENCE_STORE', 'GAS_STATION']);

// Optimized product list query with includes
productsRouter.get('/', async (req, res) => {
  try {
    const { segment, all } = req.query ?? {};
    const filters = {
      isHidden: false,
    };
    
    // Only filter by inStock if 'all' parameter is not set
    if (all !== 'true') {
      filters.inStock = true;
    }

    if (segment && typeof segment === 'string' && BUSINESS_MODES.has(segment)) {
      filters.OR = [
        { businessModes: { isEmpty: true } },
        { businessModes: { has: segment } },
      ];
    }

    // Optimized query with selective includes
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, logoUrl: true },
        },
        images: {
          orderBy: { sort_order: 'asc' },
          take: 1, // Only first image for list view
        },
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const baseUrl = process.env.UPLOAD_BASE_URL || 'https://aztekafoods.com/uploads';
  const url = `${baseUrl}/${req.file.filename}`;
  return res.json({ success: true, url });
});

app.post('/api/uploads', (req, res, next) => {
  const handler = upload.single('file');
  handler(req, res, (err) => {
    if (err) {
      return next(err);
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const baseUrl = process.env.UPLOAD_BASE_URL || 'https://aztekafoods.com/uploads';
    const url = `${baseUrl}/${req.file.filename}`;
    return res.json({ success: true, url });
  });
});

const logisticsRouter = express.Router();
logisticsRouter.get('/', (_req, res) => {
  res.json([]);
});

// Optional routes commented out - files don't exist
// if (ordersRouter) app.use('/api/orders', verifyToken, authorize('ADMIN', 'SALES_REP'), ordersRouter);
// if (manageOrdersRouter) app.use('/api/orders/manage', verifyToken, authorize('ADMIN'), manageOrdersRouter);
app.use('/api/products', productsRouter);
app.use('/api/products/manage', verifyToken, authorize('ADMIN'), manageProductsRouter);
import forceRegenerateRouter from './src/api/products/[id]/force-regenerate.js';
import forceRegenerateAllRouter from './src/api/products/force-regenerate-all.js';
app.use('/api/products', verifyToken, authorize('ADMIN'), forceRegenerateRouter);
app.use('/api/products', verifyToken, authorize('ADMIN'), forceRegenerateAllRouter);
app.use('/api/categories', verifyToken, authorize('ADMIN'), categoriesRouter);
app.use('/api/brands', verifyToken, authorize('ADMIN'), brandsRouter);
app.use('/api/catalog/layout', catalogLayoutRouter);
app.use('/api/debug/health-check', healthCheckRouter);
app.use('/api/design', verifyToken, authorize('ADMIN'), designRouter);
app.use('/api/auto', verifyToken, authorize('ADMIN'), autoIngestRouter);
app.use('/api/routes', verifyToken, authorize('DRIVER', 'ADMIN'), logisticsRouter);
// Optional routes commented out - files don't exist
// if (purchaseOrderRouter) app.use('/api/po', verifyToken, authorize('ADMIN'), purchaseOrderRouter);
app.use('/api/po', poUploadRouter);
app.use('/api/po', productSeedRouter);
app.use('/api/quickbooks', qbSyncRouter);
// Add bundles router if available
if (bundlesRouter) {
  app.use('/api/admin/bundles', bundlesRouter);
} else {
  // Create a simple bundles endpoint for testing
  app.get('/api/admin/bundles', async (_req, res) => {
    try {
      const bundles = await prisma.productBundle.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      res.json(bundles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
// if (invoicesRouter) app.use('/api/invoices', verifyToken, authorize('ADMIN'), invoicesRouter);
// if (aiInsightsRouter) app.use('/api/ai', verifyToken, authorize('ADMIN'), aiInsightsRouter);
// if (automationRouter) app.use('/api/automation', verifyToken, authorize('ADMIN'), automationRouter);
// if (gamificationRouter) app.use('/api/gamification', verifyToken, authorize('ADMIN', 'SALES_REP', 'DRIVER', 'CUSTOMER'), gamificationRouter);
// if (loyaltyRouter) app.use('/api/loyalty', verifyToken, authorize('ADMIN', 'SALES_REP', 'CUSTOMER'), loyaltyRouter);
// if (analyticsRouter) app.use('/api/analytics', verifyToken, authorize('ADMIN'), analyticsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Unauthorized'));
  }
  // Simplified validation for demo purposes; web clients already gated via fetch.
  return next();
});

io.on('connection', (socket) => {
  socket.emit('automation:update', { summary: 'Connected to automation events', timestamp: new Date().toISOString() });
});

// Socket registrations commented out - routes don't exist
// registerAutomationSocket(io);
// registerGamificationSocket(io);
// registerLoyaltySocket(io);

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

