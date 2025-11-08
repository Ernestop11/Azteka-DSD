# 🚀 Deploy Azteka DSD NOW - Step by Step

## Current Status
- **VPS IP**: 77.243.85.8
- **Domain**: aztekafoods.com
- **You're ready to**: SSH and deploy

---

## 📋 Pre-Deployment Checklist

Before we begin, make sure:
- [ ] You can SSH into the VPS: `ssh root@77.243.85.8`
- [ ] Domain DNS is pointing to 77.243.85.8
- [ ] You have API keys ready (OpenAI, Twilio, Remove.bg) - optional but recommended

---

## 🎯 Deployment Steps

### **Step 1: SSH into VPS**

Open your terminal on your local machine:

```bash
ssh root@77.243.85.8
```

---

### **Step 2: Upload Initial Setup Script**

From your **LOCAL machine** (in the azteka-dsd directory):

```bash
# Make script executable
chmod +x scripts/vps-initial-setup.sh

# Copy script to VPS
scp scripts/vps-initial-setup.sh root@77.243.85.8:/root/
```

---

### **Step 3: Run Initial VPS Setup**

Back on the **VPS** (via SSH):

```bash
# Run the setup script
bash /root/vps-initial-setup.sh
```

**What this does:**
- Installs Node.js, PostgreSQL, PM2, Nginx, Certbot
- Creates PostgreSQL database and user
- Generates secure credentials
- Creates application directories
- Sets up .env.production with secure keys

**Time:** ~5-10 minutes

---

### **Step 4: Review Generated Credentials**

On the **VPS**, check the generated credentials:

```bash
cat /root/azteka-credentials.txt
```

**Save these credentials securely!** You'll need them if you ever need to access the database directly.

---

### **Step 5: Add API Keys (Optional but Recommended)**

On the **VPS**, edit the environment file:

```bash
nano /srv/azteka-dsd/.env.production
```

Add your API keys:
- `OPENAI_API_KEY` - For AI features (invoice parsing, forecasting)
- `REMOVE_BG_KEY` - For product image background removal
- `TWILIO_*` - For SMS notifications
- `SMTP_*` - For email notifications

**Note:** The app will work without these, but AI features will be limited.

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

### **Step 6: Sync Application Files to VPS**

From your **LOCAL machine** (in the azteka-dsd directory):

```bash
rsync -avz \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  ./ root@77.243.85.8:/srv/azteka-dsd/
```

**What this does:** Uploads all your application code to the VPS.

**Time:** ~2-5 minutes (depending on connection speed)

---

### **Step 7: Run Deployment Script**

Back on the **VPS**:

```bash
cd /srv/azteka-dsd
bash scripts/deploy.sh
```

**What this does:**
1. Installs npm dependencies
2. Generates Prisma client
3. Runs database migrations
4. Seeds database with initial data
5. Builds frontend with Vite
6. Starts backend with PM2
7. Configures and reloads Nginx

**Time:** ~5-10 minutes

**Watch for:** The script will output login credentials at the end. Save these!

---

### **Step 8: Verify Deployment**

On the **VPS**, run health checks:

```bash
# Check backend health
curl http://127.0.0.1:4000/health

# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# View application logs
pm2 logs azteka-api --lines 50
```

**Expected output:**
- Health check: `{"status":"ok","timestamp":"..."}`
- PM2 status: `azteka-api` should be "online"
- Nginx status: "active (running)"

---

### **Step 9: Test in Browser**

From your local computer, open a browser and go to:

```
http://77.243.85.8
```

or

```
http://aztekafoods.com
```

You should see the Azteka DSD login page!

**Test login:**
- Email: `admin@aztekafoods.com`
- Password: `admin123`

---

### **Step 10: Setup SSL Certificate (HTTPS)**

Back on the **VPS**:

```bash
# Install SSL certificate
certbot --nginx -d aztekafoods.com -d www.aztekafoods.com
```

**Follow the prompts:**
1. Enter your email address
2. Agree to terms
3. Choose "2" to redirect HTTP to HTTPS

**Test SSL:**
```bash
curl https://aztekafoods.com/health
```

---

### **Step 11: Enable HTTPS in Nginx**

On the **VPS**, edit Nginx config:

```bash
nano /srv/azteka-dsd/etc/nginx/sites-available/azteka-dsd.conf
```

**Uncomment the HTTPS block** (lines starting with `# server {` around line 41-80).

Then reload Nginx:

```bash
cp /srv/azteka-dsd/etc/nginx/sites-available/azteka-dsd.conf /etc/nginx/sites-available/azteka-dsd
systemctl reload nginx
```

---

### **Step 12: Final Verification**

Test everything:

```bash
# 1. HTTPS works
curl https://aztekafoods.com/health

# 2. Login endpoint
curl -X POST https://aztekafoods.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}'

# 3. Check PM2 is set to restart on reboot
pm2 startup
pm2 save

# 4. Test auto-renewal
certbot renew --dry-run
```

---

## ✅ Deployment Complete!

### 🎉 Your Azteka DSD system is now live!

**Access URLs:**
- Production: https://aztekafoods.com
- Admin: https://aztekafoods.com/admin
- API Health: https://aztekafoods.com/health

**Default Login Credentials:**
- **Admin**: admin@aztekafoods.com / admin123
- **Sales Rep**: sales@aztekafoods.com / sales123
- **Driver**: driver@aztekafoods.com / driver123
- **Customer**: customer@example.com / customer123

⚠️ **IMPORTANT**: Change these passwords in production!

---

## 📊 Monitoring Commands

```bash
# View application logs
pm2 logs azteka-api

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart azteka-api

# Check Nginx logs
tail -f /var/log/nginx/azteka-dsd.access.log
tail -f /var/log/nginx/azteka-dsd.error.log

# Check database
sudo -u postgres psql -d azteka_dsd -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 🔄 Future Deployments

For subsequent updates:

```bash
# From LOCAL machine
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
  ./ root@77.243.85.8:/srv/azteka-dsd/

# On VPS
ssh root@77.243.85.8
cd /srv/azteka-dsd
bash scripts/deploy.sh
```

---

## 🆘 Troubleshooting

### Issue: "Connection refused" on port 4000
```bash
# Check if PM2 is running
pm2 status

# Check logs
pm2 logs azteka-api

# Restart
pm2 restart azteka-api
```

### Issue: Database connection failed
```bash
# Check PostgreSQL
systemctl status postgresql

# Test connection
psql -U azteka_user -d azteka_dsd -h localhost

# Check credentials
cat /root/azteka-credentials.txt
```

### Issue: Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://127.0.0.1:4000/health

# Check Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Issue: Frontend not loading
```bash
# Check if dist folder exists
ls -la /srv/azteka-dsd/dist

# Rebuild frontend
cd /srv/azteka-dsd
npm run build
```

---

## 📱 Testing Checklist

After deployment, test these features:

- [ ] Login as Admin works
- [ ] Login as Sales Rep works
- [ ] Login as Driver works
- [ ] Login as Customer works
- [ ] Admin dashboard loads
- [ ] Can create a new order
- [ ] Orders appear in admin panel
- [ ] Real-time updates work (Socket.IO)
- [ ] PWA can be installed on mobile
- [ ] Offline mode works (service worker)
- [ ] Loyalty system displays points
- [ ] Gamification badges appear

---

## 🔐 Security Post-Deployment

1. **Change default passwords** for all users
2. **Rotate JWT_SECRET** after deployment
3. **Enable automatic backups** (see DEPLOYMENT.md)
4. **Set up monitoring** (UptimeRobot, etc.)
5. **Review firewall rules**: `ufw status`
6. **Disable root SSH** (optional, use sudo user)

---

## 📞 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture
- See [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) for verification steps

---

## 🎯 Quick Command Reference

```bash
# SSH to VPS
ssh root@77.243.85.8

# View credentials
cat /root/azteka-credentials.txt

# Check application status
pm2 status
systemctl status nginx
systemctl status postgresql

# View logs
pm2 logs azteka-api
tail -f /var/log/nginx/azteka-dsd.error.log

# Restart services
pm2 restart azteka-api
systemctl restart nginx
systemctl restart postgresql

# Deploy updates
cd /srv/azteka-dsd && bash scripts/deploy.sh
```

---

**Ready to deploy? Start with Step 1!** 🚀
