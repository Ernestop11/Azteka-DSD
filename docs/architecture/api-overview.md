# Azteka DSD - API Overview

## Architecture Pattern

The Azteka DSD API is built using **Express.js** with a modular route structure. The API does NOT use Next.js App Router - it's a standalone Express server that serves a Vite-built React frontend.

---

## How the API Works

### Server Entry Point
**File**: `server.mjs`

The main server file initializes:
1. Express app with middleware (CORS, JSON parsing)
2. Prisma Client for database access
3. Socket.IO server for real-time updates
4. Multer for file uploads
5. Route registrations with authentication/authorization

### Request Flow
```
Client Request
    ↓
CORS Middleware
    ↓
JSON Parser
    ↓
Route Handler
    ↓
Auth Middleware (verifyToken)
    ↓
Authorization Middleware (authorize roles)
    ↓
Prisma Database Query
    ↓
JSON Response
```

---

## Prisma Usage

### Connection
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### Query Examples
```javascript
// Find many with filters
const products = await prisma.product.findMany({
  where: { isHidden: false, inStock: true },
  include: {
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logoUrl: true } },
    images: { orderBy: { sort_order: 'asc' }, take: 1 }
  },
  orderBy: { name: 'asc' }
});

// Create with relations
await prisma.order.create({
  data: {
    customerId: '...',
    status: 'NEW',
    total: 150.00,
    items: {
      create: [
        { productId: '...', quantity: 5, priceCase: 30.00 }
      ]
    }
  }
});
```

### Transaction Support
```javascript
await prisma.$transaction([
  prisma.product.update({ where: { id: '...' }, data: { ... } }),
  prisma.inventory.update({ where: { id: '...' }, data: { ... } })
]);
```

---

## API Routes Reference

### Authentication & Authorization

#### `POST /api/auth/login`
Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

**Authorization**: None (public)

---

### Product Routes

#### `GET /api/products`
Fetch product catalog with optional filters

**Query Parameters**:
- `segment` (optional): Filter by business mode (MEXICAN_STORE, CONVENIENCE_STORE, GAS_STATION)
- `all` (optional): Include out-of-stock items when set to "true"

**Response**: Array of products with category, brand, and first image

**Authorization**: None (public)

**Implementation**: Inline in `server.mjs:102-148`

---

#### `GET /api/products/manage`
Admin endpoint for product management operations

**Response**: Products with full details for editing

**Authorization**: ADMIN only

**File**: `src/api/products/manage.js`

---

#### `POST /api/products/manage`
Create new product

**Request Body**:
```json
{
  "name": "Product Name",
  "sku": "SKU-123",
  "priceCase": 25.50,
  "unitsPerCase": 12,
  "categoryId": "uuid",
  "brandId": "uuid"
}
```

**Authorization**: ADMIN only

---

#### `PUT /api/products/manage/:id`
Update existing product

**Authorization**: ADMIN only

---

#### `DELETE /api/products/manage/:id`
Delete product

**Authorization**: ADMIN only

---

#### `POST /api/products/:id/force-regenerate`
Force regenerate product images using AI

**Authorization**: ADMIN only

**File**: `src/api/products/[id]/force-regenerate.js`

---

#### `POST /api/products/force-regenerate-all`
Regenerate all product images

**Authorization**: ADMIN only

**File**: `src/api/products/force-regenerate-all.js`

---

### Category Routes

#### `GET /api/categories`
Fetch all categories

**Response**: Array of categories with products

**Authorization**: ADMIN for full access

**File**: `src/api/categories/route.js`

---

#### `POST /api/categories`
Create new category

**Request Body**:
```json
{
  "name": "Snacks",
  "slug": "snacks",
  "image_url": "https://...",
  "display_order": 1
}
```

**Authorization**: ADMIN only

---

#### `PUT /api/categories/:id`
Update category

**Authorization**: ADMIN only

---

#### `DELETE /api/categories/:id`
Delete category

**Authorization**: ADMIN only

---

### Brand Routes

#### `GET /api/brands`
Fetch all brands

**Response**: Array of brands with logo URLs

**Authorization**: ADMIN for full access

**File**: `src/api/brands/route.js`

---

#### `POST /api/brands`
Create new brand

**Request Body**:
```json
{
  "name": "Herdez",
  "slug": "herdez",
  "logo_url": "https://...",
  "is_featured": true
}
```

**Authorization**: ADMIN only

---

### Order Routes

#### `POST /api/orders`
Create new order

**Request Body**:
```json
{
  "customer": {
    "store_name": "Mi Tienda",
    "contact_name": "Juan Perez",
    "email": "juan@mitienda.com",
    "phone": "555-1234",
    "address": "123 Main St"
  },
  "order": {
    "order_number": "ORD-1234567890",
    "sales_rep_id": "uuid",
    "status": "pending",
    "total": 150.00
  },
  "items": [
    {
      "product_id": "uuid",
      "quantity": 5,
      "unit_price": 30.00
    }
  ]
}
```

**Authorization**: CUSTOMER, SALES_REP, ADMIN

---

#### `GET /api/orders`
Fetch orders (filtered by role)

**Query Parameters**:
- `status` (optional): Filter by order status
- `customerId` (optional): Filter by customer

**Authorization**: ADMIN, SALES_REP (own customers only)

---

#### `PUT /api/orders/:id/status`
Update order status

**Request Body**:
```json
{
  "status": "PICKING"
}
```

**Authorization**: WAREHOUSE, DRIVER, ADMIN

---

### Catalog Layout

#### `GET /api/catalog/layout`
Fetch catalog layout configuration

**Response**: Hero sections, featured products, bundle displays

**Authorization**: None (public)

**File**: `src/api/catalog/layout.js`

---

### Bundle Routes

#### `GET /api/admin/bundles`
Fetch product bundles

**Response**: Array of bundles with items and products

**Authorization**: None (public for display)

**Implementation**: Inline in `server.mjs:205-221`

---

### File Upload Routes

#### `POST /api/upload`
Upload single image file

**Request**: Multipart form data with 'image' field

**Response**:
```json
{
  "success": true,
  "url": "https://aztekafoods.com/uploads/1234567890-image.jpg"
}
```

**Authorization**: None (but should be restricted)

**Implementation**: `server.mjs:150-157`

---

#### `POST /api/uploads`
Alternative upload endpoint

**Request**: Multipart form data with 'file' field

**Authorization**: None

**Implementation**: `server.mjs:159-172`

---

### Purchase Order Routes

#### `POST /api/po/upload`
Upload and process purchase order PDF/image

**Authorization**: ADMIN only

**File**: `server/routes/po-upload.mjs`

---

#### `POST /api/po/seed`
Seed products from purchase order data

**Authorization**: ADMIN only

**File**: `server/routes/product-seed.mjs`

---

### QuickBooks Integration

#### `POST /api/quickbooks/sync`
Sync data with QuickBooks

**Authorization**: ADMIN only

**File**: `server/routes/quickbooks-sync.mjs`

---

### Auto-Ingestion Routes (AI-Powered)

#### `POST /api/auto/ingest-po`
Automatically ingest products from PO using AI

**Authorization**: ADMIN only

**File**: `src/api/auto/ingest-po.js`

---

#### `POST /api/auto/ingest-batch`
Batch process multiple POs

**Authorization**: ADMIN only

**File**: `src/api/auto/ingest-batch.js`

---

#### `POST /api/auto/match-product`
Use AI to match product description to catalog

**Authorization**: ADMIN only

**File**: `src/api/auto/match-product.js`

---

#### `POST /api/auto/search-image`
Search Google Images for product

**Authorization**: ADMIN only

**File**: `src/api/auto/search-image.js`

---

#### `POST /api/auto/bg-remove`
Remove background from product image

**Authorization**: ADMIN only

**File**: `src/api/auto/bg-remove.js`

---

#### `POST /api/auto/enhance`
Enhance product image quality

**Authorization**: ADMIN only

**File**: `src/api/auto/enhance.js`

---

### Design Routes (Dynamic Rendering)

#### `POST /api/design/render-product-card`
Generate product card design

**Authorization**: ADMIN only

**File**: `src/api/design/render-product-card.js`

---

#### `POST /api/design/render-hero`
Generate hero banner design

**Authorization**: ADMIN only

**File**: `src/api/design/render-hero.js`

---

#### `POST /api/design/render-bundle`
Generate bundle showcase design

**Authorization**: ADMIN only

**File**: `src/api/design/render-bundle.js`

---

#### `POST /api/design/render-promo`
Generate promotion banner

**Authorization**: ADMIN only

**File**: `src/api/design/render-promo.js`

---

#### `POST /api/design/render-brand-row`
Generate brand row layout

**Authorization**: ADMIN only

**File**: `src/api/design/render-brand-row.js`

---

#### `GET /api/design/status/:id`
Check design rendering status

**Authorization**: ADMIN only

**File**: `src/api/design/status/[id].js`

---

### Logistics Routes

#### `GET /api/routes`
Fetch delivery routes

**Response**: Array of delivery routes (currently returns empty array)

**Authorization**: DRIVER, ADMIN

**Implementation**: `server.mjs:174-177`

---

### Health Check Routes

#### `GET /health`
Server health check

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```

**Authorization**: None (public)

**Implementation**: `server.mjs:88-90`

---

#### `GET /api/health`
API health check

**Response**: Same as `/health`

**Authorization**: None (public)

**Implementation**: `server.mjs:92-94`

---

#### `GET /api/debug/health-check`
Detailed health check with database status

**Authorization**: None (public)

**File**: `src/api/debug/health-check.js`

---

## Middleware

### Authentication Middleware
**Function**: `verifyToken(req, res, next)`

**File**: `src/middleware/auth.js`

Verifies JWT token from `Authorization: Bearer <token>` header.

**Usage**:
```javascript
app.use('/api/products/manage', verifyToken, authorize('ADMIN'), manageProductsRouter);
```

---

### Authorization Middleware
**Function**: `authorize(...allowedRoles)`

**File**: `src/middleware/auth.js`

Checks if authenticated user has one of the allowed roles.

**Usage**:
```javascript
// Only ADMIN can access
app.use('/api/categories', verifyToken, authorize('ADMIN'), categoriesRouter);

// Multiple roles allowed
app.use('/api/orders', verifyToken, authorize('ADMIN', 'SALES_REP'), ordersRouter);
```

---

## Error Handling

### Global Error Handler
**Implementation**: `server.mjs:229-235`

```javascript
app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});
```

---

## WebSocket Events (Socket.IO)

### Server Setup
```javascript
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});
```

### Events

#### `connection`
Client connects to Socket.IO server

**Emits**:
```javascript
socket.emit('automation:update', {
  summary: 'Connected to automation events',
  timestamp: new Date().toISOString()
});
```

---

#### `products-updated`
Emitted when product catalog changes

**Client Handler**:
```javascript
socket.on('products-updated', () => {
  console.log('Products updated, refreshing catalog...');
  loadData();
});
```

---

## Environment Variables

Required in `.env` or `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/azteka_dsd"

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN="https://yourdomain.com"

# File Uploads
UPLOAD_DIR="/srv/azteka-dsd/uploads"
UPLOAD_BASE_URL="https://aztekafoods.com/uploads"

# JWT
JWT_SECRET="your-secret-key"

# External APIs
OPENAI_API_KEY="sk-..."
REMOVEBG_API_KEY="..."
```

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": "Additional details (dev only)"
}
```

### Pagination (Future)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Testing the API

### Using curl
```bash
# Health check
curl http://localhost:3000/health

# Get products
curl http://localhost:3000/api/products

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Authenticated request
curl http://localhost:3000/api/products/manage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Rate Limiting (Not Implemented)

Future consideration for production:
- Implement `express-rate-limit`
- Apply to public endpoints
- Different limits per role

---

## API Versioning (Not Implemented)

Current structure: `/api/...`

Future versioning:
- `/api/v1/...`
- `/api/v2/...`
