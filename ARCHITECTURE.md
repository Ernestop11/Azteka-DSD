# 🏗️ Azteka DSD - System Architecture

## High-Level System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         AZTEKA DSD PLATFORM                                │
│                        aztekafoods.com (77.243.85.8)                      │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (PWA)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │   Admin      │  │  Sales Rep   │  │   Driver     │  │  Customer   ││
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │   Portal    ││
│  │              │  │              │  │              │  │             ││
│  │ • Orders     │  │ • Create     │  │ • Routes     │  │ • 3D        ││
│  │ • POs        │  │   Orders     │  │ • Status     │  │   Catalog   ││
│  │ • AI Insights│  │ • Leaderboard│  │ • Badges     │  │ • Loyalty   ││
│  │ • Automation │  │ • Commission │  │ • Delivery   │  │ • Rewards   ││
│  │ • Analytics  │  │ • Badges     │  │   Log        │  │ • History   ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                                          │
│  Technology: React + Vite + TailwindCSS + Three.js + Chart.js          │
│  Features: Offline-first PWA, Service Worker, Push Notifications        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────────────┐
│                         REVERSE PROXY (Nginx)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  • SSL Termination (Let's Encrypt)                                      │
│  • Static Asset Serving (/dist)                                         │
│  • API Proxy (→ :4000/api/)                                            │
│  • WebSocket Proxy (→ :4000/socket.io/)                                │
│  • Load Balancing (future)                                              │
│  • Gzip/Brotli Compression                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Node.js/PM2)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Express REST API (:4000)                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Auth       │  │   Orders     │  │  Purchase    │  │  Invoices  │ │
│  │   /api/auth  │  │   /api/orders│  │   Orders     │  │  /api/     │ │
│  │              │  │              │  │   /api/po    │  │  invoices  │ │
│  │ • Register   │  │ • Create     │  │              │  │            │ │
│  │ • Login      │  │ • List       │  │ • Auto-Gen   │  │ • AI Parse │ │
│  │ • JWT Auth   │  │ • Manage     │  │ • Receive    │  │ • Update   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │    AI        │  │  Automation  │  │ Gamification │  │  Loyalty   │ │
│  │  /api/ai     │  │  /api/       │  │  /api/       │  │  /api/     │ │
│  │              │  │  automation  │  │  gamification│  │  loyalty   │ │
│  │ • Forecast   │  │              │  │              │  │            │ │
│  │ • Insights   │  │ • Cron Jobs  │  │ • Badges     │  │ • Points   │ │
│  │ • Vision OCR │  │ • Manual Run │  │ • Leaderboard│  │ • Rewards  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │               Socket.IO Server (Real-time Events)                  │ │
│  │  • Order updates • Badge notifications • Loyalty events            │ │
│  │  • Automation logs • Live dashboards                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Technology: Express 5 + Socket.IO 4 + JWT + bcrypt + Multer          │
│  Process Manager: PM2 (auto-restart, clustering, monitoring)           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER (PostgreSQL)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Prisma ORM Client                            │  │
│  │  • Type-safe queries                                              │  │
│  │  • Automated migrations                                           │  │
│  │  • Connection pooling                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ↕                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                            │  │
│  │                                                                    │  │
│  │  Tables:                                                           │  │
│  │  • User (Admin, SalesRep, Driver, Customer)                      │  │
│  │  • Product (SKU, price, cost, margin, stock)                     │  │
│  │  • Order & OrderItem                                              │  │
│  │  • PurchaseOrder & PurchaseOrderItem                             │  │
│  │  • Invoice (AI-parsed supplier invoices)                         │  │
│  │  • Badge, Incentive, UserBadge                                   │  │
│  │  • LoyaltyAccount, Reward                                         │  │
│  │                                                                    │  │
│  │  Features:                                                         │  │
│  │  • Indexes on frequently queried fields                          │  │
│  │  • Foreign key constraints                                        │  │
│  │  • Timestamps (createdAt, updatedAt)                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Backups: Daily cron job (pg_dump) → /srv/azteka-dsd/backups          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES & INTEGRATIONS                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   OpenAI     │  │  Remove.bg   │  │   Twilio     │  │ Nodemailer │ │
│  │   GPT-4o     │  │   API        │  │   SMS API    │  │  (SMTP)    │ │
│  │              │  │              │  │              │  │            │ │
│  │ • Invoice    │  │ • Background │  │ • Order      │  │ • Order    │ │
│  │   Parsing    │  │   Removal    │  │   Alerts     │  │   Alerts   │ │
│  │ • Demand     │  │ • Product    │  │ • Driver     │  │ • Daily    │ │
│  │   Forecast   │  │   Images     │  │   Notify     │  │   Reports  │ │
│  │ • Analytics  │  │              │  │              │  │            │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATION & SCHEDULING                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Node-cron (Background Jobs)                      │ │
│  │                                                                      │ │
│  │  Nightly (3:00 AM):                                                 │ │
│  │  1. Fetch AI demand forecast                                        │ │
│  │  2. Detect low-stock products (stock < minStock)                   │ │
│  │  3. Auto-generate purchase orders                                   │ │
│  │  4. Send email/SMS notifications to admins                         │ │
│  │  5. Broadcast automation logs via Socket.IO                        │ │
│  │                                                                      │ │
│  │  Manual Triggers: /api/automation/run (Admin only)                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. Order Creation Flow

```
Sales Rep Mobile Device
         ↓
[Add products to cart]
         ↓
[Enter customer name]
         ↓
[Submit order via PWA]
         ↓
POST /api/orders (JWT Auth)
         ↓
Express validates token & role
         ↓
Prisma creates Order + OrderItems
         ↓
Database INSERT
         ↓
Socket.IO broadcasts "new_order" event
         ↓
Admin Dashboard updates in real-time
         ↓
Driver Dashboard shows new delivery
```

### 2. AI Invoice Processing Flow

```
Admin uploads invoice PDF
         ↓
POST /api/invoices/upload
         ↓
Multer saves file to /uploads/invoices/
         ↓
Backend reads file buffer
         ↓
OpenAI Vision API (GPT-4o)
         ↓
AI extracts: supplier, date, line items
         ↓
For each product:
  - Existing? Update cost/margin
  - New? Create product + generate image
         ↓
Remove.bg API (clean product images)
         ↓
Prisma updates/inserts Products
         ↓
Return parsed invoice to UI
         ↓
Admin reviews & confirms changes
```

### 3. Automated Purchase Order Flow

```
Cron trigger (3:00 AM daily)
         ↓
Automation service starts
         ↓
Fetch sales data (last 90 days)
         ↓
OpenAI GPT-4o forecasts demand
         ↓
Query products where stock < minStock
         ↓
For each low-stock product:
  - Calculate reorder quantity
  - Create PurchaseOrderItem
         ↓
Group by supplier → Create PurchaseOrders
         ↓
Save to database (Prisma)
         ↓
Send email/SMS to admin
         ↓
Socket.IO broadcasts to Automation Dashboard
         ↓
Admin reviews & approves POs
```

### 4. Gamification Badge Award Flow

```
Driver completes delivery
         ↓
PATCH /api/orders/manage/:id (status: "delivered")
         ↓
Backend checks driver's stats
         ↓
Query: Count deliveries for driver
         ↓
If count >= 50 and badge not earned:
  - Fetch "Quick Delivery" badge
  - Create UserBadge record
  - Add points to driver
         ↓
Socket.IO emits "badge_earned" event
         ↓
Driver Dashboard shows 🏅 toast notification
         ↓
Leaderboard updates in real-time
```

### 5. Customer Loyalty Flow

```
Customer places order
         ↓
POST /api/orders (via Customer Portal)
         ↓
Order total: $100
         ↓
Calculate points: $100 / 10 = 10 points
         ↓
LoyaltyAccount.points += 10
         ↓
Check tier threshold:
  - Bronze: 0-499 pts
  - Silver: 500-1499 pts
  - Gold: 1500+ pts
         ↓
If tier upgraded:
  - Update LoyaltyAccount.tier
  - Socket.IO emits "tier_upgrade"
         ↓
Customer Portal shows 🎉 celebration
         ↓
Customer can redeem rewards
```

---

## Technology Stack

### Frontend (Client Layer)
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| TailwindCSS | Utility-first CSS |
| React Router DOM | Client-side routing |
| Three.js + React Three Fiber | 3D product visualization |
| Chart.js | Analytics dashboards |
| Socket.IO Client | Real-time updates |
| Framer Motion | Animations |
| Lucide React | Icon library |

### Backend (Application Layer)
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime environment |
| Express 5 | Web framework |
| Prisma | Database ORM |
| Socket.IO | WebSocket server |
| JWT + bcrypt | Authentication |
| Multer | File uploads |
| node-cron | Task scheduling |
| OpenAI SDK | AI integrations |
| Remove.bg | Image processing |
| Twilio | SMS notifications |
| Nodemailer | Email notifications |
| PDFKit | PDF generation |
| Sharp | Image optimization |

### Database Layer
| Technology | Purpose |
|------------|---------|
| PostgreSQL 14+ | Relational database |
| Prisma Client | Type-safe queries |
| Prisma Migrate | Schema migrations |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Ubuntu 20.04+ | Operating system |
| Nginx | Reverse proxy & static files |
| PM2 | Process manager |
| Let's Encrypt | SSL certificates |
| UFW | Firewall |

---

## Security Architecture

### Authentication Flow
```
User Login Request
      ↓
POST /api/auth/login
      ↓
bcrypt.compare(password, hashedPassword)
      ↓
If valid: jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
      ↓
Return { token, user }
      ↓
Client stores token in AuthContext
      ↓
Subsequent requests: Authorization: Bearer <token>
      ↓
Middleware: verifyToken → authorize(roles)
      ↓
If valid: Continue to route handler
If invalid: Return 401/403
```

### Role-Based Access Control (RBAC)

| Route | Admin | Sales Rep | Driver | Customer |
|-------|-------|-----------|--------|----------|
| `/api/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/orders` | ✅ | ✅ | ❌ | ❌ |
| `/api/orders/manage/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/po/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/invoices/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/ai/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/automation/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/gamification/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/loyalty/*` | ✅ | ✅ | ❌ | ✅ |
| `/api/analytics/*` | ✅ | ❌ | ❌ | ❌ |

### Security Measures
- ✅ HTTPS/TLS encryption (Let's Encrypt)
- ✅ JWT tokens with expiration (7 days)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control on all routes
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration (production domain only)
- ✅ Rate limiting (optional, via nginx)
- ✅ File upload restrictions (size, type)
- ✅ Environment variable isolation (.env.production)

---

## Scalability Considerations

### Current Architecture
- **Single VPS**: All services on one server (77.243.85.8)
- **PM2 Process Manager**: Auto-restart on failure
- **PostgreSQL**: Local database with daily backups

### Future Scaling Options

#### Horizontal Scaling
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Nginx      │────▶│  App Server  │────▶│  PostgreSQL  │
│ Load Balancer│     │   Instance 1 │     │   Primary    │
└──────────────┘     └──────────────┘     └──────────────┘
        │            ┌──────────────┐              │
        └───────────▶│  App Server  │              │
                     │   Instance 2 │◀─────────────┘
                     └──────────────┘     (Read Replica)
```

#### Microservices Architecture
```
┌──────────────┐
│   API Gateway│
└──────────────┘
        ↓
   ┌────┴────┬────────┬────────┬────────┐
   ↓         ↓        ↓        ↓        ↓
Orders    AI/ML   Loyalty  Automation  Analytics
Service  Service  Service   Service    Service
```

#### Database Scaling
- **Read Replicas**: For analytics & reporting
- **Sharding**: By supplier or region
- **Connection Pooling**: PgBouncer
- **Caching**: Redis for frequently accessed data

---

## Monitoring & Observability

### Application Monitoring
- **PM2 Dashboard**: Real-time CPU/memory usage
- **PM2 Logs**: Application logs with timestamps
- **Error Tracking**: Console errors + file logging

### Server Monitoring
- **System Logs**: `/var/log/syslog`
- **Nginx Logs**: `/var/log/nginx/azteka-dsd.access.log`
- **PostgreSQL Logs**: `/var/log/postgresql/`

### Health Checks
- **Backend**: `GET /health` → `{"status":"ok","timestamp":"..."}`
- **Database**: Prisma connection check
- **External Services**: OpenAI, Twilio, Remove.bg API status

### Future Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Sentry**: Error tracking & alerting
- **Datadog/New Relic**: APM (Application Performance Monitoring)

---

## Deployment Pipeline

### Current Deployment
```
Local Machine
      ↓
rsync files to VPS
      ↓
SSH into VPS
      ↓
bash scripts/deploy.sh
      ↓
npm install
      ↓
Prisma migrate + generate
      ↓
Vite build
      ↓
PM2 restart
      ↓
Nginx reload
      ↓
Health check
```

### Future CI/CD Pipeline
```
GitHub Push
      ↓
GitHub Actions
      ↓
Run Tests
      ↓
Build Docker Image
      ↓
Push to Registry
      ↓
Deploy to Staging
      ↓
Run Integration Tests
      ↓
Manual Approval
      ↓
Deploy to Production
      ↓
Health Check & Rollback if needed
```

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily pg_dump backups (kept for 7 days)
- **Uploads**: Weekly backup of `/uploads` directory
- **Environment**: Secure storage of `.env.production`
- **Code**: Git repository with tagged releases

### Recovery Procedures
1. **Database Restore**: `psql azteka_dsd < backup.sql`
2. **Application Restore**: Redeploy from git tag
3. **File Restore**: Rsync from backup location
4. **DNS Failover**: Point domain to backup VPS (if available)

### RTO/RPO Targets
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 24 hours (daily backups)

---

## Summary

**Azteka DSD** is a production-ready, full-stack DSD management system built on modern web technologies. The architecture is designed for:

- ✅ **Performance**: PWA with offline support, optimized builds
- ✅ **Security**: JWT auth, role-based access, HTTPS
- ✅ **Scalability**: Modular design ready for horizontal scaling
- ✅ **Maintainability**: Type-safe Prisma ORM, clear separation of concerns
- ✅ **Real-time**: Socket.IO for live updates
- ✅ **AI-Powered**: OpenAI integrations for insights & automation

Ready for deployment to production at **77.243.85.8 / aztekafoods.com**.
