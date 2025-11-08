# 🏢 Azteka DSD - Direct Store Delivery Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org)

Modern Direct Store Delivery and Wholesale Management System with AI-powered insights, real-time tracking, gamification, and PWA capabilities.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete production deployment guide
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification checklist

## ✨ Key Features

- 📦 **Order Management** - Complete DSD workflow from sales to delivery
- 🤖 **AI-Powered Insights** - Demand forecasting, invoice parsing, trend analysis
- 🎮 **Gamification** - Badges, leaderboards, incentives for sales reps & drivers
- 🎁 **Loyalty Program** - Customer points, tiers, and rewards
- 📱 **PWA Support** - Works offline, installable on tablets and phones
- 🔄 **Real-time Updates** - Socket.IO for live order status and notifications
- 📊 **Analytics Dashboard** - Executive KPIs and business intelligence
- 🔐 **Role-Based Access** - Admin, Sales Rep, Driver, Customer portals

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd azteka-dsd

# Install dependencies
npm install

# Setup database
createdb azteka_dsd

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed
npm run db:setup

# Start backend
npm run server

# Start frontend (in another terminal)
npm run dev
```

Open http://localhost:5173 and login with:
- **Email**: admin@aztekafoods.com
- **Password**: admin123

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

---

# Azteka-DSD

## Local Development Workflow

### Backend (Express + Prisma API)
```bash
npm run server
```
The server boots on `http://localhost:4000`. Verify connectivity with:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/orders
```
Create a sample order (replace IDs with your data):
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
        "customerName": "Test Store",
        "status": "pending",
        "userId": "<user uuid>",
        "items": [
          { "productId": "<product uuid>", "quantity": 1, "price": "10.00" }
        ]
      }'
```

### Frontend (Vite React)
Set `VITE_API_URL` in a `.env.local` if your API runs on a host other than `http://localhost:4000`.
```bash
npm run dev
```
This serves the catalog UI at the Vite dev URL (defaults to `http://localhost:5173`). The checkout view now calls the API via `/api/orders` for submissions and displays the latest orders inline.

### Admin Orders Dashboard + Printing
- Visit `http://localhost:5173/admin` (or `${DEV_URL}/admin`) to review orders pulled from the API.
- Filter by status/date, and click **Print** to open a branded printable ticket that includes logo, customer info, line items, and totals. The helper lives in `src/lib/print.ts` and can be reused anywhere we need printable workflows.

### Admin → Purchase Orders Dashboard
- Visit `http://localhost:5173/admin/po` for auto-generated purchase orders and receiving workflow.
- “New PO (Auto)” calls `POST /api/po/create` to build purchase orders for products where `stock < minStock`.
- “Mark Received” triggers `PATCH /api/po/:id` and increments product stock; “Upload Invoice” is a placeholder for Phase 3A hand-off.
- All requests require an `Authorization: Bearer <token>` header from the JWT login.

### Admin → AI Invoice Upload
- Visit `http://localhost:5173/admin/invoices` to drag/drop PDFs or photos of supplier invoices.
- The backend (`POST /api/invoices/upload`) stores the source file, calls OpenAI Vision to parse supplier, date, and line items, and enriches the catalog:
  - Existing products gain updated cost/stock/margin values.
  - New products are created with placeholder images that run through background-removal (remove.bg → sharp fallback → DALL·E fallback).
- The UI shows parsed line items, new SKU counts, and deep links so admins can validate changes immediately.

### Admin → AI Insights Dashboard
- Visit `http://localhost:5173/admin/insights` for predictive analytics.
- `/api/ai/forecast` aggregates the last 90 days of sales, feeds highlights to GPT-4o, and returns JSON with SKU forecasts + a natural-language summary.
- Visual charts (Chart.js) surface top movers, while quick-action buttons let you trigger PO creation directly from insight cards.

### Admin → Automation Center
- Visit `http://localhost:5173/admin/automation` to monitor cron agents, live logs, and trigger manual runs.
- `/api/automation/run` kicks off the same workflow used nightly (forecast → low stock detection → PO creation → notifications).
- Socket.IO pushes real-time status events to the dashboard so ops can watch automation progress without refreshing.

### Admin → Executive Analytics
- `http://localhost:5173/admin/analytics` aggregates KPIs (orders, inventory, loyalty, gamification) with Chart.js visual cards.
- `/api/analytics/summary` returns JSON for BI tools; `/api/analytics/export` emits CSV; `/api/analytics/report` calls GPT-4o + pdfkit to write PDF reports under `./reports`.

### Gamification Suite
- `http://localhost:5173/leaderboard` shows rep/driver rankings (points, orders, badge chips).
- `http://localhost:5173/admin/incentives` lets admins award badges or incentives on demand.
- Sales Rep & Driver dashboards now display live badges/points; Socket.IO pushes 🏅 events when new achievements unlock.

### Loyalty & Customer Portal
- `http://localhost:5173/customer` renders the immersive 3D catalog + AI showcase for shoppers.
- `http://localhost:5173/customer/rewards` lists active rewards and lets customers redeem points with live Socket.IO confirmations.
- `/api/loyalty/points`, `/api/loyalty/rewards`, `/api/loyalty/redeem` power the portal; orders automatically add 1 pt per $10 sold.

## Authentication & Roles

- Set `JWT_SECRET` inside `.env` (already seeded with `supersecretazteka` for local testing). Restart `npm run server` after changing it.
- Auth endpoints (body: JSON):
  - `POST /api/auth/register` → `{ email, password, name?, role? }`
  - `POST /api/auth/login` → `{ email, password }`
  - Response shape: `{ token, user: { id, email, role, name } }`
- Tokens last 7 days and must be sent as `Authorization: Bearer <token>`; the frontend stores them via `AuthContext`.
- Roles & protected routes:
  - `CUSTOMER` → `/`
  - `ADMIN` → `/admin`
  - `SALES_REP` → `/salesrep` (and API order submission)
  - `DRIVER` → `/driver`
- Backend route guards (see `src/middleware/auth.js`):
  - `/api/orders` → `ADMIN` or `SALES_REP`
  - `/api/orders/manage/*` → `ADMIN`
  - `/api/products` → `ADMIN`
  - `/api/routes` → `DRIVER` or `ADMIN`
  - `/api/po/*` → `ADMIN`
  - `/api/invoices/*` → `ADMIN`
  - `/api/ai/*` → `ADMIN`
- `/api/automation/*` → `ADMIN`
- `/api/gamification/*` → `ADMIN`, `SALES_REP`, or `DRIVER` (award endpoint remains admin-only)
- `/api/loyalty/*` → `ADMIN`, `SALES_REP`, or `CUSTOMER`

### AI / Media Environment Variables
- `OPENAI_API_KEY` – required for invoice parsing + image generation (falls back to mock data when unset).
- `OPENAI_VISION_MODEL` – defaults to `gpt-4o-mini`.
- `REMOVE_BG_KEY` – optional remove.bg key to clean product art (sharp alpha mask fallback used when absent).
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_TO` – optional email alerts for automation.
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` / `TWILIO_TO` – optional SMS alerts.
- `AUTOMATION_CRON` – override cron schedule (defaults to `0 3 * * *`).
- `AUTOMATION_TOKEN` – server-side bearer token used by automation agents when calling internal APIs.
- `BADGE_CDN_URL` – optional CDN base for badge icons (falls back to stored URLs).
- `LOYALTY_POINTS_PER_ORDER` (optional) – override default 1 pt per $10 logic.
- `REPORTS_DIR` – where `/api/analytics/report` saves PDF files (defaults to `./reports`).

### Quick start credentials
- Run `node prisma/seed.js` to seed:
  - Email: `sample.rep@azteka.local`
  - Password: `password123`
  - Role: `ADMIN`
Use `/api/auth/register` to create additional roles as needed.

## API Reference – Phase 3

### Order Management
```bash
# Update order assignment/status/notes
curl -X PATCH http://localhost:4000/api/orders/manage/<orderId> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_transit","driverId":"driver-123","notes":"Drop offs after 2pm"}'

# Summary counts + revenue
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/orders/manage/summary
```

### Purchase Orders
```bash
# Auto-generate POs for low-stock products
curl -X POST http://localhost:4000/api/po/create -H "Authorization: Bearer $TOKEN"

# List purchase orders
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/po

# Mark PO as received + update inventory
curl -X PATCH http://localhost:4000/api/po/<poId> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"received"}'
```

### AI Invoice Upload
```bash
curl -X POST http://localhost:4000/api/invoices/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/invoice.pdf"
```
Response: `{ invoice: {...}, items: [{ type:'new'|'existing', productId, name, cost, quantity }] }`

### AI Forecasts
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/ai/forecast
```
Response includes `{ forecasts: [...], aiSummary: "text" }`.

### Automation
```bash
curl -X POST http://localhost:4000/api/automation/run \
  -H "Authorization: Bearer $TOKEN"
```
Response: `{ ok: true, result: { lowStock: [...], aiSummary: "..." } }`

### Gamification
```bash
# Leaderboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/gamification/leaderboard

# Award a badge/incentive
curl -X POST http://localhost:4000/api/gamification/award \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","badgeId":"<badge uuid>","incentiveId":"<incentive uuid>"}'

### Loyalty
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/loyalty/points

curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/loyalty/rewards

curl -X POST http://localhost:4000/api/loyalty/redeem \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rewardId":"<reward uuid>"}'

### Analytics
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/analytics/summary

curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/analytics/export -o analytics.csv

curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/analytics/report
# => { "message": "Report generated", "path": "/reports/Executive-Report-2025-11-07-17-00.pdf" }
```
```
```
