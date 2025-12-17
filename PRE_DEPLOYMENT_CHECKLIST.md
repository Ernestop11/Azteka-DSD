# 📋 Pre-Deployment Checklist for Azteka DSD

Use this checklist before deploying to production (77.243.85.8 / aztekafoods.com).

---

## 🔐 Security & Configuration

### Environment Variables
- [ ] Created `.env.production` file with all required variables
- [ ] Changed `DATABASE_URL` with production PostgreSQL credentials
- [ ] Generated strong `JWT_SECRET` (min 32 characters random string)
- [ ] Added `OPENAI_API_KEY` (if using AI features)
- [ ] Added `REMOVE_BG_KEY` (if using background removal)
- [ ] Configured `TWILIO_*` variables (if using SMS notifications)
- [ ] Set `CORS_ORIGIN` to `https://aztekafoods.com`
- [ ] Verified `NODE_ENV=production`

### Database
- [ ] PostgreSQL installed and running on VPS
- [ ] Database `azteka_dsd` created
- [ ] User `azteka_user` created with secure password
- [ ] Database user has proper permissions (GRANT ALL)
- [ ] `pg_hba.conf` configured for local access
- [ ] Tested database connection: `psql -U azteka_user -d azteka_dsd`

### Server Software
- [ ] Node.js v18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] PM2 installed globally: `pm2 --version`
- [ ] Nginx installed: `nginx -v`
- [ ] Certbot installed (for SSL): `certbot --version`

---

## 📂 File Preparation

### Local Files
- [ ] Committed all changes to git
- [ ] Removed `node_modules` from sync (in .gitignore)
- [ ] Removed `dist` folder (will rebuild on server)
- [ ] Verified `.env.production` exists (NOT .env)
- [ ] Tested local build: `npm run build`
- [ ] Verified `prisma/seed.js` is ready
- [ ] Checked `scripts/deploy.sh` is executable

### VPS Directory Structure
- [ ] Created `/srv/azteka-dsd` directory
- [ ] Set proper ownership: `chown -R $USER:$USER /srv/azteka-dsd`
- [ ] Verified write permissions: `ls -la /srv/azteka-dsd`

---

## 🌐 Network & DNS

### Domain Configuration
- [ ] Domain `aztekafoods.com` points to 77.243.85.8 (A record)
- [ ] Subdomain `www.aztekafoods.com` points to 77.243.85.8 (A record)
- [ ] DNS propagation complete (check: `nslookup aztekafoods.com`)
- [ ] Firewall allows HTTP (80) and HTTPS (443)
- [ ] Firewall allows SSH (22) from your IP only

### Nginx Configuration
- [ ] Nginx configuration file ready at `etc/nginx/sites-available/azteka-dsd.conf`
- [ ] Server name matches domain: `aztekafoods.com www.aztekafoods.com`
- [ ] Root directory correct: `/srv/azteka-dsd/dist`
- [ ] API proxy to port 4000 configured
- [ ] Socket.IO proxy configured
- [ ] Client max body size set (50M for invoice uploads)

---

## 🗄️ Database Migration Readiness

### Prisma Setup
- [ ] `prisma/schema.prisma` is up to date
- [ ] All migrations are in `prisma/migrations/` folder
- [ ] Tested migrations locally: `npx prisma migrate dev`
- [ ] Seed script tested: `npm run db:seed`
- [ ] No pending schema changes

### Data Backup Plan
- [ ] Backup strategy defined (daily cron job)
- [ ] Backup directory created: `/srv/azteka-dsd/backups`
- [ ] Backup script created (see DEPLOYMENT.md)
- [ ] Tested backup restoration process locally

---

## 🚀 Deployment Process

### Pre-Deployment
- [ ] Notified team about deployment window
- [ ] Created backup of current production (if applicable)
- [ ] Documented current state (git commit hash, DB version)

### File Sync
- [ ] Synced files to VPS using rsync:
  ```bash
  rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    ./ root@77.243.85.8:/srv/azteka-dsd/
  ```
- [ ] Verified files are on server: `ls -la /srv/azteka-dsd`

### Deployment Steps
- [ ] SSH into VPS: `ssh root@77.243.85.8`
- [ ] Navigate to app directory: `cd /srv/azteka-dsd`
- [ ] Run deployment script: `bash scripts/deploy.sh`
- [ ] Verified no errors in deployment output
- [ ] Checked PM2 status: `pm2 status`
- [ ] Verified Nginx status: `systemctl status nginx`

---

## ✅ Post-Deployment Verification

### Health Checks
- [ ] Backend health endpoint responds:
  ```bash
  curl http://127.0.0.1:4000/health
  # Should return: {"status":"ok","timestamp":"..."}
  ```
- [ ] Frontend accessible via IP: http://77.243.85.8
- [ ] Frontend accessible via domain: http://aztekafoods.com
- [ ] No 502/504 errors in browser

### Functionality Tests
- [ ] Login page loads: `https://aztekafoods.com/login`
- [ ] Can login as admin: `admin@aztekafoods.com` / `admin123`
- [ ] Admin dashboard loads and shows data
- [ ] Can create a test order (Sales Rep role)
- [ ] Can view orders in admin panel
- [ ] Real-time updates work (Socket.IO connected)
- [ ] Loyalty system loads for customer role
- [ ] Gamification badges display

### API Tests
- [ ] `/api/auth/login` returns JWT token
- [ ] `/api/orders` returns orders (with auth)
- [ ] `/api/po` returns purchase orders (admin only)
- [ ] `/api/loyalty/points` returns loyalty data
- [ ] WebSocket connection established (`/socket.io`)

### PWA Tests
- [ ] Manifest file loads: `/manifest.json`
- [ ] Service worker registers: `/sw.js`
- [ ] Install prompt appears on mobile
- [ ] App works offline (cached assets)
- [ ] App icon shows correctly

---

## 🔒 SSL Certificate

### Certbot Setup
- [ ] Certbot installed on VPS
- [ ] Ran: `sudo certbot --nginx -d aztekafoods.com -d www.aztekafoods.com`
- [ ] SSL certificate obtained successfully
- [ ] HTTPS redirect working: http → https
- [ ] Certificate auto-renewal tested: `sudo certbot renew --dry-run`
- [ ] SSL Labs test passed: https://www.ssllabs.com/ssltest/

### HTTPS Configuration
- [ ] Uncommented HTTPS block in nginx config
- [ ] Reloaded nginx: `sudo systemctl reload nginx`
- [ ] Verified HTTPS works: `https://aztekafoods.com`
- [ ] Mixed content warnings resolved (all assets over HTTPS)

---

## 📊 Monitoring Setup

### PM2 Monitoring
- [ ] PM2 startup configured: `pm2 startup`
- [ ] PM2 save executed: `pm2 save`
- [ ] PM2 restarts on server reboot (tested if possible)
- [ ] PM2 logs accessible: `pm2 logs azteka-api`

### Log Rotation
- [ ] PM2 log rotation configured
- [ ] Nginx log rotation working (default Ubuntu setup)
- [ ] Application logs writing to correct location

### Alerts (Optional)
- [ ] PM2 monitoring dashboard connected (pm2.io)
- [ ] Email alerts configured for crashes
- [ ] Uptime monitoring service configured (UptimeRobot, etc.)

---

## 🎯 Performance Optimization

### Frontend
- [ ] Vite build completed without errors
- [ ] Build size reasonable (<5MB for main bundle)
- [ ] Assets compressed (gzip/brotli in nginx)
- [ ] Images optimized
- [ ] Lazy loading implemented for routes

### Backend
- [ ] Database indexes added for frequent queries
- [ ] Connection pooling configured (Prisma default)
- [ ] Rate limiting enabled (if needed)
- [ ] CORS properly configured

### Caching
- [ ] Service worker caching critical assets
- [ ] Nginx caching static files
- [ ] API responses cached where appropriate

---

## 📱 Mobile/Tablet Testing

### PWA Installation
- [ ] Tested on iOS Safari (Add to Home Screen)
- [ ] Tested on Android Chrome (Install App)
- [ ] Tested on tablet (landscape + portrait)
- [ ] Offline mode works on mobile
- [ ] Touch interactions work properly

### Responsive Design
- [ ] Mobile menu works
- [ ] Forms are mobile-friendly
- [ ] Tables are scrollable on small screens
- [ ] Buttons are touch-target sized (44x44px min)

---

## 🔧 Troubleshooting Prepared

### Common Issues Documented
- [ ] Know how to view PM2 logs: `pm2 logs azteka-api`
- [ ] Know how to restart: `pm2 restart azteka-api`
- [ ] Know how to check nginx errors: `tail -f /var/log/nginx/error.log`
- [ ] Know how to rebuild: `npm run build`
- [ ] Know how to revert database migration (if needed)

### Rollback Plan
- [ ] Previous version git commit hash noted
- [ ] Database backup taken before migration
- [ ] Know how to restore from backup
- [ ] Emergency contact list ready

---

## 📋 Final Checklist

Before announcing to users:
- [ ] All critical features tested
- [ ] Default admin password changed in production
- [ ] API keys are production keys (not test/dev)
- [ ] Error pages configured (404, 500)
- [ ] Privacy policy & terms of service linked (if required)
- [ ] Support contact info updated
- [ ] User documentation prepared
- [ ] Training materials ready for sales reps/drivers

---

## ✅ Sign Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Git Commit Hash:** _______________

**Database Version:** _______________

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## 🎉 Ready to Launch!

Once all items are checked, your Azteka DSD system is **production-ready**!

**Next Steps:**
1. Share login credentials with team
2. Conduct training sessions
3. Monitor logs for first 24 hours
4. Gather user feedback
5. Plan next iteration based on usage

---

**Need Help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
