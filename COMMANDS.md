# 🎯 Quick Command Reference

## 🚀 Initial Deployment (Run Once)

### 1. Upload Setup Script
```bash
scp scripts/vps-initial-setup.sh root@77.243.85.8:/root/
```

### 2. SSH to VPS
```bash
ssh root@77.243.85.8
```

### 3. Run Initial Setup (on VPS)
```bash
bash /root/vps-initial-setup.sh
```

### 4. Add API Keys (on VPS)
```bash
nano /srv/azteka-dsd/.env.production
```

### 5. Sync Files (from LOCAL)
```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' ./ root@77.243.85.8:/srv/azteka-dsd/
```

### 6. Deploy (on VPS)
```bash
cd /srv/azteka-dsd
bash scripts/deploy.sh
```

### 7. Setup SSL (on VPS)
```bash
certbot --nginx -d aztekafoods.com -d www.aztekafoods.com
```

---

## 🔄 Regular Deployment (Updates)

```bash
# From LOCAL machine
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' ./ root@77.243.85.8:/srv/azteka-dsd/

# On VPS
ssh root@77.243.85.8
cd /srv/azteka-dsd
bash scripts/deploy.sh
```

---

## 📊 Monitoring

```bash
# Application status
pm2 status
pm2 logs azteka-api
pm2 monit

# Health check
curl http://localhost:4000/health

# Nginx status
systemctl status nginx
tail -f /var/log/nginx/azteka-dsd.access.log
tail -f /var/log/nginx/azteka-dsd.error.log

# Database status
systemctl status postgresql
sudo -u postgres psql -d azteka_dsd -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 🔧 Management

```bash
# Restart application
pm2 restart azteka-api

# Restart Nginx
systemctl restart nginx

# Restart PostgreSQL
systemctl restart postgresql

# View credentials
cat /root/azteka-credentials.txt

# Edit environment
nano /srv/azteka-dsd/.env.production
```

---

## 🗄️ Database

```bash
# Connect to database
sudo -u postgres psql -d azteka_dsd

# Backup database
pg_dump -U azteka_user azteka_dsd > backup_$(date +%Y%m%d).sql

# Restore database
psql -U azteka_user azteka_dsd < backup_YYYYMMDD.sql

# Run migrations
cd /srv/azteka-dsd
npx prisma migrate deploy

# Seed database
cd /srv/azteka-dsd
npm run db:seed
```

---

## 🔐 Security

```bash
# Check firewall
ufw status

# SSL certificate renewal
certbot renew --dry-run

# View SSL certificates
certbot certificates

# Change JWT secret
nano /srv/azteka-dsd/.env.production
# Then restart: pm2 restart azteka-api
```

---

## 🆘 Troubleshooting

```bash
# Full restart
pm2 restart azteka-api
systemctl restart nginx
systemctl restart postgresql

# Rebuild frontend
cd /srv/azteka-dsd
npm run build
pm2 restart azteka-api

# Clear cache and rebuild
cd /srv/azteka-dsd
rm -rf node_modules dist
npm install
npm run build
pm2 restart azteka-api

# Test API endpoints
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}'
```

---

## 📱 PWA Testing

```bash
# Check service worker
curl http://aztekafoods.com/sw.js

# Check manifest
curl http://aztekafoods.com/manifest.json

# Check frontend build
ls -la /srv/azteka-dsd/dist
```

---

## 💾 Backup & Recovery

```bash
# Create backup
mkdir -p /srv/azteka-dsd/backups
pg_dump -U azteka_user azteka_dsd > /srv/azteka-dsd/backups/backup_$(date +%Y%m%d_%H%M%S).sql
tar -czf /srv/azteka-dsd/backups/uploads_$(date +%Y%m%d).tar.gz /srv/azteka-dsd/uploads

# Restore from backup
psql -U azteka_user azteka_dsd < /srv/azteka-dsd/backups/backup_YYYYMMDD_HHMMSS.sql
tar -xzf /srv/azteka-dsd/backups/uploads_YYYYMMDD.tar.gz -C /

# Schedule automatic backups (cron)
crontab -e
# Add: 0 2 * * * pg_dump -U azteka_user azteka_dsd > /srv/azteka-dsd/backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 🧪 Testing Endpoints

```bash
# Health check
curl https://aztekafoods.com/health

# Login (get token)
TOKEN=$(curl -s -X POST https://aztekafoods.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}' \
  | jq -r '.token')

# Get orders
curl -H "Authorization: Bearer $TOKEN" https://aztekafoods.com/api/orders

# Get purchase orders
curl -H "Authorization: Bearer $TOKEN" https://aztekafoods.com/api/po

# Get loyalty points
curl -H "Authorization: Bearer $TOKEN" https://aztekafoods.com/api/loyalty/points
```

---

## 📈 Performance

```bash
# Check disk space
df -h

# Check memory
free -h

# Check processes
top
htop

# Check connections
netstat -an | grep :4000
netstat -an | grep :80

# PM2 metrics
pm2 list
pm2 show azteka-api
```

---

## 🔧 Configuration Files

```bash
# Application environment
nano /srv/azteka-dsd/.env.production

# Nginx configuration
nano /etc/nginx/sites-available/azteka-dsd

# PostgreSQL configuration
nano /etc/postgresql/*/main/postgresql.conf
nano /etc/postgresql/*/main/pg_hba.conf

# PM2 startup script
pm2 startup
pm2 save
```

---

## Quick One-Liners

```bash
# Full status check
pm2 status && systemctl status nginx && systemctl status postgresql

# View all logs
pm2 logs azteka-api --lines 100 && tail -50 /var/log/nginx/azteka-dsd.error.log

# Complete restart
pm2 restart azteka-api && systemctl restart nginx

# Quick deploy from local
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' ./ root@77.243.85.8:/srv/azteka-dsd/ && ssh root@77.243.85.8 'cd /srv/azteka-dsd && bash scripts/deploy.sh'
```
