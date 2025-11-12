# AZTEKA DSD - TECHNOLOGY STACK REFERENCE

**Quick reference for all technologies used in the Azteka DSD platform**

---

## 📊 STACK OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Chrome, Safari, Firefox, Edge)                       │
│  └─→ React 18.3.1 (TypeScript 5.5.3)                          │
│      └─→ TailwindCSS 3.4.1 (Styling)                          │
│      └─→ React Router 7.9.5 (Routing)                         │
│      └─→ Three.js 0.181.0 (3D Graphics)                       │
│      └─→ Chart.js 4.5.1 (Charts)                              │
│      └─→ Socket.IO Client 4.8.1 (WebSockets)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      REVERSE PROXY LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Nginx 1.18+                                                    │
│  ├─→ Static Files (/dist)                                      │
│  ├─→ SSL/TLS (Let's Encrypt)                                   │
│  └─→ API Proxy (→ localhost:4000)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  PM2 Process Manager                                            │
│  └─→ Node.js 18+ (Express 5.1.0)                              │
│      ├─→ JWT Auth (jsonwebtoken 9.0.2)                        │
│      ├─→ Multer 2.0.2 (File Uploads)                          │
│      ├─→ Socket.IO Server 4.8.1                               │
│      ├─→ node-cron 4.2.1 (Scheduling)                         │
│      └─→ Prisma 6.19.0 (ORM)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL 14+                                                 │
│  └─→ 14 Tables (User, Product, Order, etc.)                   │
│      └─→ Prisma Migrations                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  ├─→ OpenAI API (GPT-4o, DALL-E)                              │
│  ├─→ Remove.bg API (Background Removal)                        │
│  ├─→ Twilio API (SMS)                                          │
│  └─→ SMTP Server (Email)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 FRONTEND STACK

### Core Framework
```json
{
  "react": "18.3.1",           // UI library
  "typescript": "5.5.3",        // Type safety
  "vite": "5.4.2"               // Build tool
}
```

### Routing & State
```json
{
  "react-router-dom": "7.9.5",  // Client routing
  "react-context": "built-in"   // Global state
}
```

### Styling
```json
{
  "tailwindcss": "3.4.1",       // Utility CSS
  "autoprefixer": "10.4.20",    // CSS vendor prefixes
  "postcss": "8.4.47"           // CSS processor
}
```

### 3D Graphics
```json
{
  "three": "0.181.0",           // WebGL 3D engine
  "@react-three/fiber": "9.4.0", // React renderer
  "@react-three/drei": "10.7.6"  // Helpers
}
```

### Data Visualization
```json
{
  "chart.js": "4.5.1",          // Charts
  "react-chartjs-2": "6.0.0"    // React wrapper
}
```

### UI Components
```json
{
  "lucide-react": "0.344.0",    // Icons
  "framer-motion": "12.23.24",  // Animations
  "lottie-react": "2.4.1"       // Lottie animations
}
```

### Real-Time
```json
{
  "socket.io-client": "4.8.1"   // WebSocket client
}
```

### Build Output
```
dist/
├── index.html (2.9 KB)
├── manifest.json (1.4 KB)
├── sw.js (4.6 KB)
└── assets/
    ├── index-*.js (675 KB → 170 KB gzipped)
    ├── react-vendor-*.js (174 KB → 57 KB gzipped)
    ├── chart-vendor-*.js (207 KB → 71 KB gzipped)
    └── three-vendor-*.js (894 KB → 245 KB gzipped)

Total: 1.9 MB → 550 KB gzipped
```

---

## ⚙️ BACKEND STACK

### Runtime & Framework
```json
{
  "node": "18+",                // JavaScript runtime
  "express": "5.1.0",           // Web framework
  "cors": "2.8.5",              // CORS handling
  "dotenv": "17.0.4"            // Environment variables
}
```

### Database & ORM
```json
{
  "@prisma/client": "6.19.0",   // Type-safe DB client
  "prisma": "6.19.0",           // ORM toolkit
  "pg": "8.13.1"                // PostgreSQL driver
}
```

### Authentication
```json
{
  "jsonwebtoken": "9.0.2",      // JWT tokens
  "bcryptjs": "3.0.3"           // Password hashing
}
```

### File Processing
```json
{
  "multer": "2.0.2",            // File uploads
  "sharp": "0.34.5",            // Image processing
  "remove.bg": "1.3.0",         // Background removal
  "pdfkit": "0.17.2"            // PDF generation
}
```

### AI & Machine Learning
```json
{
  "openai": "6.8.1"             // GPT-4o, DALL-E
}
```

### Communication
```json
{
  "socket.io": "4.8.1",         // WebSockets
  "twilio": "5.10.4",           // SMS
  "nodemailer": "7.0.10"        // Email
}
```

### Scheduling & Utilities
```json
{
  "node-cron": "4.2.1",         // Cron jobs
  "date-fns": "4.1.0",          // Date utilities
  "uuid": "11.0.3"              // UUID generation
}
```

---

## 💾 DATABASE STACK

### PostgreSQL 14+
```sql
-- 14 Tables:
- users (accounts)
- products (inventory)
- orders (customer orders)
- order_items (line items)
- purchase_orders (supplier POs)
- purchase_order_items (PO line items)
- invoices (supplier invoices)
- badges (achievements)
- incentives (sales targets)
- user_badges (badge awards)
- loyalty_accounts (customer loyalty)
- rewards (loyalty rewards)
- (future: categories, brands)
```

### Prisma ORM Features
- Type-safe queries
- Auto-generated client
- Migration system
- Seed scripts
- Relation management
- Decimal precision (for money)

### Connection Pooling
```javascript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});
```

---

## 🔧 INFRASTRUCTURE STACK

### Operating System
```
Ubuntu 20.04 LTS (64-bit)
- Kernel: 5.4+
- Architecture: x86_64
```

### Web Server
```nginx
Nginx 1.18+
- Reverse proxy
- Static file serving
- SSL/TLS termination
- HTTP/2 support
- Gzip compression
```

### Process Manager
```bash
PM2 5.3+
- Auto-restart on crash
- Log management
- Cluster mode (planned)
- Zero-downtime reload
- Environment management
```

### SSL/TLS
```
Let's Encrypt (Certbot)
- Auto-renewal (cron job)
- ACME protocol
- 90-day certificate rotation
```

### Firewall
```bash
UFW (Uncomplicated Firewall)
- Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3002 (API dev)
- Default: deny incoming
- Default: allow outgoing
```

---

## 🌐 EXTERNAL APIS & SERVICES

### OpenAI API
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Models used:
- gpt-4o-mini (vision, analytics)
- dall-e-3 (image generation)
```

**Endpoints:**
- `/v1/chat/completions` - Text generation
- `/v1/images/generations` - Image creation

**Pricing:**
- GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output
- DALL-E 3: $0.040/image (1024x1024)

---

### Remove.bg API
```javascript
const removeBackgroundFromImageUrl = require('remove.bg');

removeBackgroundFromImageUrl({
  url: imageUrl,
  apiKey: process.env.REMOVE_BG_KEY,
  size: 'regular',
  type: 'product'
});
```

**Pricing:**
- Free tier: 50 images/month
- Paid: $0.20/image

---

### Twilio API
```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  body: 'Low stock alert!',
  from: process.env.TWILIO_FROM,
  to: process.env.TWILIO_TO
});
```

**Pricing:**
- SMS: $0.0075/message (US)

---

### SMTP (Email)
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

**Compatible with:**
- Gmail SMTP
- SendGrid
- Mailgun
- AWS SES

---

## 📦 DEPENDENCY VERSIONS (package.json)

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.5",
    "three": "^0.181.0",
    "@react-three/fiber": "^9.4.0",
    "@react-three/drei": "^10.7.6",
    "chart.js": "^4.5.1",
    "react-chartjs-2": "^6.0.0",
    "framer-motion": "^12.23.24",
    "lucide-react": "^0.344.0",
    "socket.io-client": "^4.8.1",
    "lottie-react": "^2.4.1",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "~5.5.3",
    "vite": "^5.4.2",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.181.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "@prisma/client": "^6.19.0",
    "cors": "^2.8.5",
    "dotenv": "^17.0.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.3",
    "multer": "^2.0.2",
    "sharp": "^0.34.5",
    "remove.bg": "^1.3.0",
    "openai": "^6.8.1",
    "socket.io": "^4.8.1",
    "twilio": "^5.10.4",
    "nodemailer": "^7.0.10",
    "node-cron": "^4.2.1",
    "pdfkit": "^0.17.2",
    "date-fns": "^4.1.0",
    "uuid": "^11.0.3"
  },
  "devDependencies": {
    "prisma": "^6.19.0"
  }
}
```

---

## 🔐 SECURITY STACK

### Authentication
- **JWT**: RS256 algorithm, 7-day expiration
- **bcrypt**: 10 salt rounds
- **Tokens**: Stored in localStorage (client) or httpOnly cookies (planned)

### Authorization
- **RBAC**: Role-based access control (4 roles)
- **Middleware**: Express middleware chain validation
- **Route Protection**: Per-endpoint role requirements

### Encryption
- **TLS 1.3**: Let's Encrypt SSL certificates
- **Ciphers**: Modern cipher suites (no RC4, no MD5)
- **HSTS**: Strict-Transport-Security header

### Input Validation
- **Prisma**: Parameterized queries (SQL injection prevention)
- **Express**: Body parsing limits (10MB max)
- **Multer**: File type validation (PDF, JPG, PNG only)

### Headers
```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## 📊 MONITORING & LOGGING

### Application Logs
```bash
PM2 Logs:
~/.pm2/logs/azteka-api-out.log  # stdout
~/.pm2/logs/azteka-api-error.log # stderr

pm2 logs azteka-api --lines 100
```

### Web Server Logs
```bash
Nginx Logs:
/var/log/nginx/access.log       # Access logs
/var/log/nginx/error.log        # Error logs

tail -f /var/log/nginx/access.log
```

### Database Logs
```bash
PostgreSQL Logs:
/var/log/postgresql/postgresql-14-main.log

tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitoring Tools (Planned)
- **Sentry**: Error tracking & alerting
- **Grafana**: Metrics dashboards
- **Prometheus**: Time-series metrics
- **Datadog**: APM & infrastructure monitoring

---

## 🚀 DEPLOYMENT STACK

### Build Process
```bash
# Frontend
npm run build
# → Vite bundles to dist/

# Backend
# No build step (Node.js runtime)
```

### Deployment Pipeline
```
Local Dev → Git Push → VPS Pull → PM2 Restart → Nginx Reload
```

### Environment Configuration
```bash
# Production
.env.production          # Backend vars
.env.production.local    # Frontend vars (Vite)

# Development
.env                     # Local overrides
```

### PM2 Ecosystem
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'azteka-api',
      script: './server.mjs',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
```

---

## 🧪 TESTING STACK (Planned)

### Unit Testing
```json
{
  "jest": "^29.0.0",            // Test runner
  "@testing-library/react": "^14.0.0", // React testing
  "@testing-library/jest-dom": "^6.0.0" // DOM matchers
}
```

### E2E Testing
```json
{
  "playwright": "^1.40.0"       // Browser automation
}
```

### API Testing
```json
{
  "supertest": "^6.3.0"         // HTTP assertions
}
```

---

## 📋 DEVELOPMENT TOOLS

### Code Quality
```json
{
  "eslint": "^8.57.0",          // Linting
  "prettier": "^3.2.5",         // Formatting
  "typescript": "^5.5.3"        // Type checking
}
```

### Git Hooks (Planned)
```json
{
  "husky": "^9.0.0",            // Git hooks
  "lint-staged": "^15.0.0"      // Staged file linting
}
```

### Database Tools
```bash
# Prisma CLI
npx prisma studio              # Database GUI
npx prisma migrate dev         # Create migration
npx prisma generate            # Generate client
```

---

## 🔄 VERSION CONTROL

### Git
```bash
Repository: Private (assumed)
Branches:
  - main (production)
  - dev (development)
  - feature/* (feature branches)
```

### Package Managers
```bash
npm 10+                        # Node package manager
npx                            # Package runner
```

---

## 📚 DOCUMENTATION STACK

### Markdown Files
- README.md
- ARCHITECTURE.md
- DEPLOYMENT.md
- QUICKSTART.md
- PRODUCT_SUMMARY.md (this file's sibling)
- TECH_STACK.md (this file)

### API Documentation (Planned)
- Swagger/OpenAPI 3.0
- Postman collection

---

## 🌍 BROWSER SUPPORT

### Minimum Versions
- Chrome: 90+ (2021)
- Firefox: 88+ (2021)
- Safari: 14+ (2020)
- Edge: 90+ (2021)

### Progressive Web App
- Service Worker API
- Cache API
- IndexedDB (planned)
- Web Push Notifications (planned)

---

## 📦 BUNDLE ANALYSIS

### Frontend Bundles
```
Main Bundle (index-*.js):
  - React core: ~140 KB
  - React Router: ~30 KB
  - UI components: ~200 KB
  - Business logic: ~300 KB
  Total: 674 KB (169 KB gzipped)

React Vendor Bundle:
  - react: ~40 KB
  - react-dom: ~130 KB
  Total: 173 KB (57 KB gzipped)

Chart Vendor Bundle:
  - chart.js: ~207 KB
  Total: 207 KB (71 KB gzipped)

Three Vendor Bundle:
  - three.js: ~600 KB
  - @react-three/fiber: ~200 KB
  - @react-three/drei: ~90 KB
  Total: 894 KB (245 KB gzipped)
```

---

## 🔧 CONFIGURATION FILES

```
├── vite.config.ts           # Vite build config
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # TailwindCSS config
├── postcss.config.js        # PostCSS config
├── ecosystem.config.cjs     # PM2 config
├── prisma/schema.prisma     # Database schema
├── .env.production          # Production env vars
├── .gitignore               # Git ignore rules
└── package.json             # NPM dependencies
```

---

**Last Updated:** November 7, 2025
**Stack Version:** 1.0.0
**Node Version:** 18.20.5
**npm Version:** 10.8.2
