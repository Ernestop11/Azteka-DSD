# 🚀 Azteka DSD - Quick Start Guide

## For Investors & Stakeholders

This is a **30-second overview** of what Azteka DSD does and how to see it in action.

---

## 🎯 What is Azteka DSD?

A complete **Direct Store Delivery (DSD) Management System** that combines:
- 📦 Order Management (Sales Reps → Warehouse → Drivers → Customers)
- 🤖 AI-Powered Insights (demand forecasting, invoice parsing)
- 🎮 Gamification (badges, leaderboards, incentives)
- 🎁 Customer Loyalty Program
- 📱 PWA (works offline on tablets/phones)
- 🔄 Real-time Updates (Socket.IO)

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AZTEKA DSD PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Roles:                                                   │
│  • Admin Dashboard → Full system control                    │
│  • Sales Rep → Create orders, view commission               │
│  • Driver → Delivery routes, order status                   │
│  • Customer → 3D product catalog, loyalty points            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  🧠 AI Features:                                             │
│  • Invoice OCR → Auto-extract products from supplier PDFs   │
│  • Demand Forecasting → Predict stock needs                 │
│  • Smart Purchase Orders → Auto-generate when low stock     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  🔧 Tech Stack:                                              │
│  Frontend: React + Vite + TailwindCSS + Three.js           │
│  Backend: Node.js + Express + Socket.IO                     │
│  Database: PostgreSQL + Prisma ORM                          │
│  AI: OpenAI GPT-4o + Remove.bg                             │
│  Hosting: Ubuntu VPS + PM2 + Nginx                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏁 Quick Demo (Local Development)

### 1. Prerequisites
```bash
# Install Node.js 18+, PostgreSQL 14+, Git
```

### 2. Clone & Install
```bash
git clone <repository-url>
cd azteka-dsd
npm install
```

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb azteka_dsd

# Update .env file with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/azteka_dsd"

# Run migrations and seed
npm run db:setup
```

### 4. Run Application
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

### 5. Open Browser
- Frontend: http://localhost:5173
- Login: `admin@aztekafoods.com` / `admin123`

---

## 🌐 Production Deployment (VPS)

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

**TL;DR:**
```bash
# 1. Sync to VPS
rsync -avz ./ root@77.243.85.8:/srv/azteka-dsd/

# 2. SSH and deploy
ssh root@77.243.85.8
cd /srv/azteka-dsd
bash scripts/deploy.sh

# 3. Done! Visit: https://aztekafoods.com
```

---

## 🔑 Default Login Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@aztekafoods.com | admin123 |
| **Sales Rep** | sales@aztekafoods.com | sales123 |
| **Driver** | driver@aztekafoods.com | driver123 |
| **Customer** | customer@example.com | customer123 |

⚠️ **Change these in production!**

---

## 📱 Key Features Breakdown

### For Sales Reps
- 📋 Create orders for customers on-the-go
- 🏆 View leaderboard & earned badges
- 💰 Track commissions & incentives
- 📊 See sales performance

### For Drivers
- 🗺️ View assigned delivery routes
- ✅ Update order status (delivered/pending)
- 📦 See order details & addresses
- 🎯 Earn delivery badges

### For Customers
- 🛒 Browse 3D product catalog
- 🎁 Earn & redeem loyalty points
- 📦 Track order history
- 🏅 View membership tier (Bronze/Silver/Gold)

### For Admins
- 📊 **Dashboard**: View all orders, sales, inventory
- 🤖 **AI Insights**: Demand forecasting, trend analysis
- 📄 **Invoice Processing**: Upload supplier invoices → AI extracts data
- 📦 **Purchase Orders**: Auto-generate when stock is low
- ⚙️ **Automation Center**: Schedule nightly tasks (PO generation, notifications)
- 🎮 **Gamification**: Create badges, set incentives
- 📈 **Analytics**: Executive dashboard with KPIs

---

## 🧪 Test Scenarios

### Scenario 1: Create an Order (Sales Rep)
1. Login as sales rep
2. Add products to cart
3. Enter customer name
4. Submit order
5. See order appear in admin dashboard

### Scenario 2: AI Invoice Processing (Admin)
1. Login as admin
2. Go to "Invoices" section
3. Upload sample invoice PDF
4. AI extracts products & prices
5. Products auto-update in catalog

### Scenario 3: Low Stock Alert (Admin)
1. Check "Purchase Orders" page
2. System shows products below minimum stock
3. Click "Generate PO"
4. PO created automatically with recommended quantities

### Scenario 4: Customer Loyalty (Customer)
1. Login as customer
2. Browse 3D product catalog
3. View loyalty points & tier
4. Redeem rewards

---

## 📂 Project Structure

```
azteka-dsd/
├── src/
│   ├── api/                 # Backend API routes
│   │   ├── auth/           # Authentication
│   │   ├── orders/         # Order management
│   │   ├── po/             # Purchase orders
│   │   ├── invoices/       # Invoice processing
│   │   ├── ai/             # AI insights
│   │   ├── automation/     # Automation engine
│   │   ├── gamification/   # Badges & incentives
│   │   ├── loyalty/        # Loyalty program
│   │   └── analytics/      # Analytics & reports
│   ├── pages/              # React pages/views
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   └── lib/                # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Database seeding
├── scripts/
│   └── deploy.sh           # Automated deployment
├── etc/nginx/              # Nginx configuration
├── public/                 # Static assets
├── server.mjs              # Express backend server
├── .env.production         # Production environment vars
├── DEPLOYMENT.md           # Full deployment guide
└── package.json
```

---

## 🎬 Next Steps

### For Development
1. Explore API endpoints in `src/api/`
2. Customize UI in `src/pages/` and `src/components/`
3. Extend database schema in `prisma/schema.prisma`
4. Add automation jobs in `src/api/automation/`

### For Production
1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) step-by-step
2. Configure SSL with Certbot
3. Set up database backups
4. Configure API keys (OpenAI, Twilio, etc.)
5. Test on tablets in the field

### For Investors
1. Review this document + DEPLOYMENT.md
2. Request live demo at deployed URL
3. Review analytics dashboard for KPIs
4. Test PWA on mobile/tablet

---

## 🆘 Common Questions

**Q: Can this run offline?**
A: Yes! PWA service worker caches assets and queues orders when offline.

**Q: How does AI invoice processing work?**
A: Upload PDF invoice → OpenAI extracts text → Parses products/prices → Updates database.

**Q: Is real-time working?**
A: Yes! Socket.IO broadcasts order updates, badge notifications, loyalty events.

**Q: Can I add more roles?**
A: Yes! Update Prisma schema, add role in auth middleware, create new dashboard.

**Q: How do I backup the database?**
A: See "Database Backups" section in DEPLOYMENT.md.

---

## 📞 Support & Documentation

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Documentation**: Coming soon (OpenAPI/Swagger)
- **Database Schema**: `prisma/schema.prisma`
- **Environment Setup**: `.env.production`

---

## 🎉 You're Ready!

This system is **production-ready** with:
- ✅ Authentication & authorization
- ✅ Database migrations & seeding
- ✅ PWA capabilities
- ✅ AI integration
- ✅ Real-time updates
- ✅ Automated deployment
- ✅ Nginx + SSL ready
- ✅ Monitoring with PM2

**Deploy now** and start managing your DSD operations!
