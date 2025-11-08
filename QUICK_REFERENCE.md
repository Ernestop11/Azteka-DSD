# Azteka DSD - Quick Reference Card

**Updated:** November 8, 2025
**Version:** PostgreSQL (Post-Supabase Migration)

---

## 🚀 One-Command Deployments

### Deploy Frontend
```bash
cd /Users/ernestoponce/dev/azteka-dsd
npm run build
./deploy-frontend.sh
```

### Deploy Everything (Mega Deploy)
```bash
ssh root@77.243.85.8 "/root/deploy-mega.sh"
```

### Health Check
```bash
ssh root@77.243.85.8 "/root/health.sh"
```

---

## 📊 System Status

| Component | Location | Status Check |
|-----------|----------|--------------|
| **Frontend** | https://aztekafoods.com | `curl -I https://aztekafoods.com` |
| **Backend API** | https://aztekafoods.com/api | `curl https://aztekafoods.com/api/health` |
| **Database** | PostgreSQL @ localhost:5432 | `PGPASSWORD='...' psql -U azteka_user -d azteka_dsd -c '\dt'` |
| **PM2 Process** | azteka-api | `ssh root@77.243.85.8 "pm2 list"` |
| **Nginx** | Port 80/443 | `ssh root@77.243.85.8 "systemctl status nginx"` |

---

## 🔑 Quick SSH Commands

### Restart Services
```bash
# Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Restart nginx
ssh root@77.243.85.8 "systemctl reload nginx"

# Restart PostgreSQL
ssh root@77.243.85.8 "systemctl restart postgresql"
```

### Check Logs
```bash
# Backend logs (last 50 lines)
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 50"

# Nginx error log
ssh root@77.243.85.8 "tail -50 /var/log/nginx/error.log"

# Deployment log
ssh root@77.243.85.8 "tail -20 /root/DEPLOY_LOG.txt"
```

### Database Quick Access
```bash
# Connect to database
ssh root@77.243.85.8
PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost

# Count products
ssh root@77.243.85.8 "PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c 'SELECT COUNT(*) FROM \"Product\";'"

# List all tables
ssh root@77.243.85.8 "PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c '\dt'"
```

---

## 📁 File Locations

### On VPS (77.243.85.8)
```
/srv/azteka-dsd/          # Main application directory
├── dist/                 # Frontend build (served by Nginx)
├── server.mjs            # Express backend
├── routes/               # API routes
├── prisma/               # Database schema & migrations
├── .env                  # Backend environment variables
└── node_modules/         # Dependencies

/root/
├── deploy-mega.sh        # Full deployment script
├── health.sh             # 9-point health check
├── DEPLOY_LOG.txt        # Deployment history
└── FIXED.txt             # Fix history

/etc/nginx/sites-enabled/
└── aztekafoods.com       # Nginx configuration

/var/log/nginx/
├── access.log            # HTTP access logs
└── error.log             # Nginx error logs
```

### On Local Machine
```
/Users/ernestoponce/dev/azteka-dsd/
├── src/                                    # Source code
├── dist/                                   # Build output (after npm run build)
├── prisma/                                 # Database schema
├── deploy-frontend.sh                      # Deployment script
├── SUPABASE_MIGRATION_COMPLETE.md          # Migration report
├── DEPLOYMENT_DEBUGGING.md                 # This guide
└── QUICK_REFERENCE.md                      # This file
```

---

## 🔧 Common Tasks

### Build & Deploy Frontend
```bash
# Step 1: Build locally
cd /Users/ernestoponce/dev/azteka-dsd
npm run build

# Step 2: Deploy to VPS
./deploy-frontend.sh

# Step 3: Verify
curl -I https://aztekafoods.com
```

### Update Backend Code
```bash
# Copy server file
scp server.mjs root@77.243.85.8:/srv/azteka-dsd/

# Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Check logs
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 20"
```

### Run Database Migration
```bash
# Step 1: Generate migration locally
npx prisma migrate dev --name your_migration_name

# Step 2: Copy migration to VPS
scp -r prisma/schema.prisma root@77.243.85.8:/srv/azteka-dsd/prisma/
scp -r prisma/migrations root@77.243.85.8:/srv/azteka-dsd/prisma/

# Step 3: Deploy migration
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma migrate deploy"

# Step 4: Regenerate Prisma Client
ssh root@77.243.85.8 "cd /srv/azteka-dsd && npx prisma generate"

# Step 5: Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"
```

### Add New API Endpoint
```bash
# Step 1: Create route file locally
# Example: routes/categories.js

# Step 2: Copy to VPS
scp routes/categories.js root@77.243.85.8:/srv/azteka-dsd/routes/

# Step 3: Update server.mjs to include route
# Add: app.use('/api/categories', categoriesRouter);

# Step 4: Copy updated server.mjs
scp server.mjs root@77.243.85.8:/srv/azteka-dsd/

# Step 5: Restart backend
ssh root@77.243.85.8 "pm2 restart azteka-api"

# Step 6: Test endpoint
curl https://aztekafoods.com/api/categories
```

---

## 🐛 Troubleshooting

### App Not Loading
```bash
# Check all services
ssh root@77.243.85.8 "/root/health.sh"

# If any are down, restart
ssh root@77.243.85.8 "pm2 restart azteka-api && systemctl reload nginx"
```

### API Returning Errors
```bash
# Check backend logs
ssh root@77.243.85.8 "pm2 logs azteka-api --err --lines 50"

# Check if backend is running
ssh root@77.243.85.8 "pm2 list"

# Restart if needed
ssh root@77.243.85.8 "pm2 restart azteka-api"
```

### Database Connection Issues
```bash
# Check PostgreSQL status
ssh root@77.243.85.8 "systemctl status postgresql"

# Test connection
ssh root@77.243.85.8 "PGPASSWORD='8jzL7PwAKwvNHZyBydKPImCnj' psql -U azteka_user -d azteka_dsd -h localhost -c 'SELECT 1;'"

# Start PostgreSQL if down
ssh root@77.243.85.8 "systemctl start postgresql"
```

### Frontend Shows Old Version (Cache)
```bash
# Force rebuild with cache clear
npm run build

# Deploy with cache-busting timestamp
./deploy-frontend.sh

# Or manually visit with cache buster
# https://aztekafoods.com/?v=$(date +%s)
```

---

## 🔑 Environment Variables

### Frontend (.env.production.local)
```bash
VITE_API_URL=/api
VITE_NODE_ENV=production
```

### Backend (.env)
```bash
DATABASE_URL="postgresql://azteka_user:8jzL7PwAKwvNHZyBydKPImCnj@localhost:5432/azteka_dsd?schema=public"
SHADOW_DATABASE_URL="postgresql://azteka_user:8jzL7PwAKwvNHZyBydKPImCnj@localhost:5432/azteka_dsd_shadow?schema=public"
PORT=3002
CORS_ORIGIN=https://aztekafoods.com
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
```

---

## 📊 Database Tables (21 Total)

### Core Tables
- `Product` (5 items) - Product catalog
- `Order` - Customer orders
- `OrderItem` - Order line items
- `User` - User accounts

### New Tables (After Migration)
- `Category` - Product categories
- `Brand` - Product brands
- `Subcategory` - Category refinements
- `Promotion` - Marketing promotions
- `ProductBundle` - Bundle offers
- `SpecialOffer` - Special deals
- `SalesRep` - Sales representatives
- `Customer` - Customer records

### Supporting Tables
- `LoyaltyAccount` - Loyalty points
- `Reward` - Loyalty rewards
- `Badge` - Achievement badges
- `UserBadge` - User achievements
- `Incentive` - Sales incentives
- `PurchaseOrder` - Procurement
- `PurchaseOrderItem` - Purchase items
- `Invoice` - Finance tracking

---

## 🌐 API Endpoints

### Public Endpoints (No Auth)
```
GET  /api/health              # Server health check
GET  /api/products            # List products (5 items)
POST /api/auth/login          # User login (JWT)
```

### Protected Endpoints (JWT Required)
```
GET  /api/orders              # List orders
POST /api/orders              # Create order
```

### Admin Endpoints (Admin Role Required)
```
Coming soon: categories, brands, promotions, etc.
```

---

## 🚨 Emergency Commands

### Complete Restart
```bash
ssh root@77.243.85.8 "
  pm2 restart azteka-api && \
  systemctl reload nginx && \
  systemctl status postgresql
"
```

### Check Everything
```bash
ssh root@77.243.85.8 "
  echo 'PM2 Status:' && pm2 list && \
  echo '' && echo 'Nginx Status:' && systemctl status nginx --no-pager | head -3 && \
  echo '' && echo 'PostgreSQL Status:' && systemctl status postgresql --no-pager | head -3 && \
  echo '' && echo 'API Health:' && curl -s http://localhost:3002/api/health
"
```

### Nuclear Redeploy
```bash
# Step 1: Rebuild everything locally
cd /Users/ernestoponce/dev/azteka-dsd
rm -rf dist node_modules/.vite
npm run build

# Step 2: Deploy
./deploy-frontend.sh

# Step 3: Restart everything
ssh root@77.243.85.8 "pm2 restart azteka-api && systemctl reload nginx"

# Step 4: Verify
ssh root@77.243.85.8 "/root/health.sh"
```

---

## 📞 Support

**Health Check:**
```bash
ssh root@77.243.85.8 "/root/health.sh"
```

**Backend Logs:**
```bash
ssh root@77.243.85.8 "pm2 logs azteka-api --lines 100"
```

**Nginx Logs:**
```bash
ssh root@77.243.85.8 "tail -50 /var/log/nginx/error.log"
```

---

## ✅ Current Status (Nov 8, 2025)

- ✅ **Migration Complete** - Supabase removed, PostgreSQL active
- ✅ **21 Database Tables** - All tables migrated and enhanced
- ✅ **Frontend Live** - https://aztekafoods.com
- ✅ **Backend API** - https://aztekafoods.com/api
- ✅ **SSL Active** - Let's Encrypt certificate valid
- ✅ **Health Monitoring** - Automated checks every 5 minutes

---

**Last Updated:** November 8, 2025
**Version:** 2.0 (Post-Supabase Migration)
