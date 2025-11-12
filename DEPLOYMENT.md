# Azteka DSD - Deployment Guide

## Overview
Complete guide for deploying the Azteka DSD (Direct Store Delivery) system to your VPS at 77.243.85.8 (aztekafoods.com).

---

## 📋 Prerequisites

### VPS Requirements
- Ubuntu 20.04+ LTS
- 2GB+ RAM
- 20GB+ Storage
- Root or sudo access

### Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE azteka_dsd;
CREATE USER azteka_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE azteka_dsd TO azteka_user;
ALTER DATABASE azteka_dsd OWNER TO azteka_user;

# Grant schema permissions
\c azteka_dsd
GRANT ALL ON SCHEMA public TO azteka_user;

# Exit
\q
```

### 2. Configure PostgreSQL for Local Access

Edit `/etc/postgresql/*/main/pg_hba.conf`:
```
# Add this line (replace XX with your PostgreSQL version):
local   azteka_dsd      azteka_user                     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 🚀 Initial Deployment

### 1. Clone/Upload Project to VPS

```bash
# Create application directory
sudo mkdir -p /srv/azteka-dsd
sudo chown -R $USER:$USER /srv/azteka-dsd

# From your local machine, sync files:
rsync -avz \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  ./ root@77.243.85.8:/srv/azteka-dsd/
```

### 2. Configure Environment Variables

```bash
cd /srv/azteka-dsd

# Edit .env.production with your values:
nano .env.production
```

Update these critical values:
```env
DATABASE_URL="postgresql://azteka_user:YOUR_PASSWORD@localhost:5432/azteka_dsd?schema=public"
JWT_SECRET="GENERATE_A_STRONG_RANDOM_STRING"
OPENAI_API_KEY="your-openai-api-key"
REMOVE_BG_KEY="your-removebg-api-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
```

### 3. Install Dependencies

```bash
cd /srv/azteka-dsd
npm install
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database with initial data
npm run db:seed
```

### 5. Build Frontend

```bash
npm run build
```

### 6. Configure Nginx

```bash
# Copy nginx configuration
sudo cp /srv/azteka-dsd/etc/nginx/sites-available/azteka-dsd.conf \
  /etc/nginx/sites-available/azteka-dsd

# Create symlink
sudo ln -sf /etc/nginx/sites-available/azteka-dsd \
  /etc/nginx/sites-enabled/azteka-dsd

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Start Backend with PM2

```bash
cd /srv/azteka-dsd

# Start the application
pm2 start server.mjs --name azteka-api --node-args="--env-file=.env.production"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output instructions
```

### 8. Verify Deployment

```bash
# Check backend health
curl http://127.0.0.1:4000/health

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View logs
pm2 logs azteka-api
```

---

## 🔒 SSL Certificate Setup

### Install SSL Certificate with Certbot

```bash
# Obtain certificate
sudo certbot --nginx -d aztekafoods.com -d www.aztekafoods.com

# Follow prompts and select redirect HTTP to HTTPS

# Test automatic renewal
sudo certbot renew --dry-run
```

After SSL installation, uncomment the HTTPS block in:
`/etc/nginx/sites-available/azteka-dsd`

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## 🔄 Subsequent Deployments

Use the automated deployment script:

```bash
# From local machine, sync to VPS:
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  ./ root@77.243.85.8:/srv/azteka-dsd/

# SSH into VPS and run deploy script:
ssh root@77.243.85.8
cd /srv/azteka-dsd
bash scripts/deploy.sh
```

The `deploy.sh` script automatically:
1. Installs dependencies
2. Generates Prisma client
3. Runs database migrations
4. Builds frontend
5. Creates upload directories
6. Restarts PM2 process
7. Reloads Nginx

---

## 📊 Monitoring & Maintenance

### View Application Logs
```bash
# PM2 logs
pm2 logs azteka-api

# Nginx access logs
sudo tail -f /var/log/nginx/azteka-dsd.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/azteka-dsd.error.log
```

### PM2 Commands
```bash
# Restart application
pm2 restart azteka-api

# Stop application
pm2 stop azteka-api

# View process details
pm2 show azteka-api

# Monitor in real-time
pm2 monit
```

### Database Backups

Create a backup script at `/srv/azteka-dsd/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/srv/azteka-dsd/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U azteka_user -d azteka_dsd > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

Schedule daily backups with cron:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /srv/azteka-dsd/scripts/backup-db.sh
```

---

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl http://aztekafoods.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Login
Visit: `https://aztekafoods.com/login`

Default credentials (created by seed script):
- **Admin**: admin@aztekafoods.com / admin123
- **Sales Rep**: sales@aztekafoods.com / sales123
- **Driver**: driver@aztekafoods.com / driver123
- **Customer**: customer@example.com / customer123

### 3. Test PWA Installation
1. Open site on mobile device or Chrome
2. Look for "Install App" prompt
3. Verify offline functionality

### 4. Test API Endpoints
```bash
# Login to get JWT token
TOKEN=$(curl -X POST http://aztekafoods.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}' \
  | jq -r '.token')

# Test orders endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://aztekafoods.com/api/orders
```

---

## 🔧 Troubleshooting

### Issue: Vite build fails
```bash
# Clear node modules and rebuild
cd /srv/azteka-dsd
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database connection fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
sudo -u postgres psql -l | grep azteka_dsd

# Test connection
psql -U azteka_user -d azteka_dsd -h localhost
```

### Issue: Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Verify backend port
curl http://127.0.0.1:4000/health

# Check Nginx error logs
sudo tail -50 /var/log/nginx/azteka-dsd.error.log
```

### Issue: PM2 process crashes
```bash
# View error logs
pm2 logs azteka-api --lines 100

# Restart with verbose logging
pm2 restart azteka-api --log-date-format="YYYY-MM-DD HH:mm:ss"
```

---

## 📱 PWA Features

The application includes:
- **Offline Support**: Service worker caches critical assets
- **Installable**: Can be installed on mobile devices and desktops
- **Background Sync**: Queues orders when offline
- **Push Notifications**: Real-time order updates
- **App-like Experience**: Fullscreen mode, no browser chrome

---

## 🔐 Security Checklist

- [ ] Changed all default passwords in `.env.production`
- [ ] Generated strong JWT_SECRET (32+ characters)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (ufw) to allow only 22, 80, 443
- [ ] PostgreSQL only accepts local connections
- [ ] Regular backups scheduled
- [ ] PM2 process runs as non-root user
- [ ] Nginx configured with security headers
- [ ] API keys rotated regularly
- [ ] Database credentials stored securely

---

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs azteka-api`
- Review Nginx logs: `/var/log/nginx/azteka-dsd.error.log`
- GitHub Issues: [Project Repository]

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs)
- [Let's Encrypt](https://letsencrypt.org/docs)
