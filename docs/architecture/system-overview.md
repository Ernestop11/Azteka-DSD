# Azteka DSD - System Overview

## Summary

Azteka DSD (Direct Store Delivery) is a comprehensive B2B wholesale distribution platform designed for Mexican food products. The system enables customers to browse products, place orders, track deliveries, and manage their wholesale purchasing through an intuitive catalog interface.

The platform supports multiple user roles with specialized workflows for each stakeholder in the distribution chain, from warehouse management to driver logistics.

---

## User Roles

The system supports six distinct user roles, each with specific permissions and access levels:

### 1. SUPER_ADMIN
- Full system access and configuration
- Manage all users and permissions
- System-wide settings and integrations
- Database management and backups

### 2. ADMIN
- Product catalog management (CRUD operations)
- Order management and fulfillment oversight
- Customer account management
- Analytics and reporting
- Integration management (QuickBooks, etc.)

### 3. SALES_REP
- Create orders on behalf of customers
- Access customer catalog with special pricing
- Hand-off mode for assisted ordering
- Track customer interactions and order history
- Mobile-optimized workflow

### 4. WAREHOUSE
- View incoming orders for fulfillment
- Update order picking status
- Manage inventory levels
- Print picking lists and labels
- Mark orders as ready for delivery

### 5. DRIVER
- View assigned delivery routes
- Access orders for delivery
- Update delivery status (OUT_FOR_DELIVERY, DELIVERED)
- Collect customer signatures
- Track GPS location during deliveries

### 6. CUSTOMER
- Browse product catalog
- Place and track orders
- View order history and reorder previous purchases
- Manage delivery preferences
- Earn and track loyalty rewards

---

## Module Overview

### Catalog Module
**Purpose**: Product browsing and discovery

**Features**:
- Multi-view catalog (hero layout, grid view, list view)
- Category and brand-based filtering
- Product search functionality
- Featured products showcase
- Bundle and promotion displays
- Real-time inventory status

**Components**:
- `Hero.tsx` - Hero banner with featured products
- `CategoryTabs.tsx` - Category navigation
- `ProductCard.tsx` - Individual product display
- `CatalogGrid.tsx` - Advanced grid layout with filtering
- `BundleShowcase.tsx` - Product bundle displays
- `ProductBillboard.tsx` - Featured product highlights

---

### Cart Module
**Purpose**: Shopping cart and order management

**Features**:
- Add/remove products
- Quantity adjustment
- Real-time price calculation
- Bulk order entry
- Cart persistence (localStorage)
- Reorder from history

**Components**:
- `Cart.tsx` - Cart sidebar/modal
- `BulkOrderSheet.tsx` - Multi-store bulk ordering
- `CartContext.tsx` - Zustand-based state management

**State Management**:
- Uses React Context API with localStorage persistence
- Cart items stored with product details and quantities
- Automatic subtotal calculation
- Last order saved for quick reordering

---

### Admin Module
**Purpose**: Backend management and configuration

**Features**:
- Product management (create, edit, delete)
- Category and brand management
- Order fulfillment tracking
- Customer management
- Price override configuration
- Integration settings

**Key Routes**:
- `/api/products/manage` - Product CRUD operations
- `/api/categories` - Category management
- `/api/brands` - Brand management
- `/api/admin/bundles` - Bundle configuration
- `/api/design/*` - Dynamic design rendering

---

### Warehouse Module
**Purpose**: Order fulfillment and inventory

**Features**:
- Order picking workflow
- Inventory management
- Print picking lists
- Update order status (NEW → PICKING → PICKED)
- Product location mapping

**Order Status Flow**:
```
NEW → PICKING → PICKED → OUT_FOR_DELIVERY → DELIVERED
```

---

### Driver Module
**Purpose**: Delivery logistics and routing

**Features**:
- Delivery route optimization
- Order delivery tracking
- GPS location sharing
- Customer signature capture
- Delivery status updates
- Real-time Socket.IO updates

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Customer   │  │  Sales Rep   │  │   Warehouse  │     │
│  │     UI       │  │     UI       │  │     UI       │     │
│  │  (React)     │  │  (React)     │  │  (React)     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│         └─────────────────┼──────────────────┘             │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                    HTTP/WebSocket
                            │
┌───────────────────────────┼────────────────────────────────┐
│                     API LAYER                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Express.js Server (server.mjs)            │   │
│  │                                                     │   │
│  │  ├── Authentication Middleware                     │   │
│  │  ├── Authorization Middleware (role-based)         │   │
│  │  ├── CORS & JSON parsing                          │   │
│  │  └── Error handling                               │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                    │
│  ┌────────────────────┴────────────────────────────────┐   │
│  │              Route Handlers                        │   │
│  │                                                     │   │
│  │  /api/products     - Product catalog              │   │
│  │  /api/orders       - Order management             │   │
│  │  /api/categories   - Category endpoints           │   │
│  │  /api/brands       - Brand endpoints              │   │
│  │  /api/auth         - Authentication               │   │
│  │  /api/catalog      - Catalog layout               │   │
│  │  /api/auto         - Auto-ingestion & AI          │   │
│  │  /api/design       - Dynamic design rendering     │   │
│  │  /api/quickbooks   - QuickBooks integration       │   │
│  │  /api/po           - Purchase order processing    │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                   │
└────────────────────────┼───────────────────────────────────┘
                         │
                    Prisma ORM
                         │
┌────────────────────────┼───────────────────────────────────┐
│                  DATABASE LAYER                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                      │  │
│  │                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │ Products │  │  Orders  │  │ Customers│         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │   Users  │  │Categories│  │  Brands  │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                     │  │
│  │  ┌──────────┐  ┌──────────┐                       │  │
│  │  │OrderItems│  │  Pricing │                       │  │
│  │  └──────────┘  └──────────┘                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  QuickBooks  │  │   Image AI   │  │  Socket.IO   │     │
│  │     Sync     │  │  Processing  │  │  Real-time   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand + React Context
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Headless UI
- **Icons**: Lucide React, Heroicons
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Database ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Image Processing**: Sharp

### Database
- **Primary**: PostgreSQL
- **Schema Management**: Prisma Migrations
- **Connection Pooling**: Prisma Client

### External Integrations
- **Accounting**: QuickBooks API
- **AI/ML**: OpenAI GPT-4 for product matching
- **Image Processing**: Remove.bg, Tesseract.js OCR
- **Search**: Google Image Search API

---

## Deployment Architecture

```
Production Environment:
├── Frontend (Vite build) → Static hosting
├── API Server (PM2)      → VPS (72.62.162.163:3000)
└── PostgreSQL Database   → VPS or managed service

Development Environment:
├── Frontend → http://localhost:5173
├── API      → http://localhost:3000
└── Database → localhost:5432
```

---

## Key Features

1. **Multi-tenant Support**: Different pricing and catalogs per customer
2. **Real-time Updates**: Socket.IO for live order status
3. **Responsive Design**: Mobile-first UI for field sales
4. **Offline Capabilities**: Cart persistence via localStorage
5. **Bulk Operations**: Multi-store ordering for chain customers
6. **Gamification**: Loyalty points and badge system
7. **AI-Powered**: Auto product ingestion from PO images
8. **Integration-Ready**: QuickBooks sync, image APIs

---

## Security Features

- Role-based access control (RBAC)
- JWT authentication with token verification
- Authorization middleware per route
- CORS configuration
- Input validation and sanitization
- Secure file upload handling
- Environment-based configuration

---

## Future Modules (Planned)

- **Analytics Dashboard**: Sales metrics and reporting
- **Loyalty Program**: Advanced gamification features
- **Mobile App**: Native iOS/Android apps
- **Invoice Management**: Automated invoicing system
- **Route Optimization**: AI-powered delivery routing
