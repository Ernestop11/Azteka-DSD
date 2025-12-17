import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import multer from 'multer';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import ordersRouter from './src/api/orders/route.js';
import manageOrdersRouter from './src/api/orders/manage.js';
import authRouter from './src/api/auth/route.js';
import purchaseOrderRouter from './src/api/po/route.js';
import invoicesRouter from './src/api/invoices/route.js';
import aiInsightsRouter from './src/api/ai/insights.js';
import automationRouter, { registerSocket as registerAutomationSocket } from './src/api/automation/route.js';
import gamificationRouter, { registerGamificationSocket } from './src/api/gamification/route.js';
import loyaltyRouter, { registerLoyaltySocket } from './src/api/loyalty/route.js';
import analyticsRouter from './src/api/analytics/route.js';
import manageProductsRouter from './src/api/products/manage.js';
import categoriesRouter from './src/api/categories/route.js';
import brandsRouter from './src/api/brands/route.js';
import { verifyToken, authorize } from './src/middleware/auth.js';

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
const PORT = process.env.PORT || 4000;
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

app.use('/api/auth', authRouter);

const productsRouter = express.Router();
const BUSINESS_MODES = new Set(['MEXICAN_STORE', 'CONVENIENCE_STORE', 'GAS_STATION']);
productsRouter.get('/', async (_req, res) => {
  try {
    const { segment } = _req.query ?? {};
    const filters = {
      inStock: true,
      isHidden: false,
    };

    if (segment && typeof segment === 'string' && BUSINESS_MODES.has(segment)) {
      filters.OR = [
        { businessModes: { isEmpty: true } },
        { businessModes: { has: segment } },
      ];
    }

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
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

app.use('/api/orders', verifyToken, authorize('ADMIN', 'SALES_REP'), ordersRouter);
app.use('/api/orders/manage', verifyToken, authorize('ADMIN'), manageOrdersRouter);
app.use('/api/products', productsRouter);
app.use('/api/products/manage', verifyToken, authorize('ADMIN'), manageProductsRouter);
app.use('/api/categories', verifyToken, authorize('ADMIN'), categoriesRouter);
app.use('/api/brands', verifyToken, authorize('ADMIN'), brandsRouter);
app.use('/api/routes', verifyToken, authorize('DRIVER', 'ADMIN'), logisticsRouter);
app.use('/api/po', verifyToken, authorize('ADMIN'), purchaseOrderRouter);
app.use('/api/invoices', verifyToken, authorize('ADMIN'), invoicesRouter);
app.use('/api/ai', verifyToken, authorize('ADMIN'), aiInsightsRouter);
app.use('/api/automation', verifyToken, authorize('ADMIN'), automationRouter);
app.use('/api/gamification', verifyToken, authorize('ADMIN', 'SALES_REP', 'DRIVER', 'CUSTOMER'), gamificationRouter);
app.use('/api/loyalty', verifyToken, authorize('ADMIN', 'SALES_REP', 'CUSTOMER'), loyaltyRouter);
app.use('/api/analytics', verifyToken, authorize('ADMIN'), analyticsRouter);

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

registerAutomationSocket(io);
registerGamificationSocket(io);
registerLoyaltySocket(io);

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
