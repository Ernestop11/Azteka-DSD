import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
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
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

const productsRouter = express.Router();
productsRouter.get('/', (_req, res) => {
  res.json([]);
});

const logisticsRouter = express.Router();
logisticsRouter.get('/', (_req, res) => {
  res.json([]);
});

app.use('/api/orders', verifyToken, authorize('ADMIN', 'SALES_REP'), ordersRouter);
app.use('/api/orders/manage', verifyToken, authorize('ADMIN'), manageOrdersRouter);
app.use('/api/products', verifyToken, authorize('ADMIN'), productsRouter);
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
