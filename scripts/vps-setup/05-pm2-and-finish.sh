#!/bin/bash
#===============================================================================
# AZTEKA DSD - PM2 AND FINISH (Step 5 of 5)
# Final setup step
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  AZTEKA DSD - PM2 Setup & Finish${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

#---------------------------------------
# Step 1: Create PM2 ecosystem file
#---------------------------------------
echo -e "${YELLOW}[1/5] Creating PM2 configuration...${NC}"

cat > /srv/azteka-dsd/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'azteka-production',
      cwd: '/srv/azteka-dsd',
      script: 'npm',
      args: 'run start:next',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/azteka/error.log',
      out_file: '/var/log/azteka/out.log',
      log_file: '/var/log/azteka/combined.log',
      time: true
    }
  ]
};
EOF

echo -e "${GREEN}✓ PM2 config created${NC}"

#---------------------------------------
# Step 2: Start the application
#---------------------------------------
echo -e "${YELLOW}[2/5] Starting application with PM2...${NC}"
cd /srv/azteka-dsd
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ Application started${NC}"

#---------------------------------------
# Step 3: Create helper scripts
#---------------------------------------
echo -e "${YELLOW}[3/5] Creating helper scripts...${NC}"

# Deploy script
cat > /usr/local/bin/azteka-deploy << 'EOF'
#!/bin/bash
# Quick deploy from git
set -e
echo "🚀 Deploying Azteka..."
cd /srv/azteka-dsd
git pull origin bolt-visual-stable
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build:next
pm2 restart azteka-production
echo "✅ Deploy complete!"
EOF

# Backup script
cat > /usr/local/bin/azteka-backup << 'EOF'
#!/bin/bash
# Backup database and images
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "📦 Creating backup..."

# Database
pg_dump -U azteka_user azteka_production | gzip > /srv/azteka-backups/database/db-${TIMESTAMP}.sql.gz

# Images
tar -czf /srv/azteka-backups/images/images-${TIMESTAMP}.tar.gz -C /srv/azteka-dsd/public uploads/

# Clean old backups (keep last 7 days)
find /srv/azteka-backups -type f -mtime +7 -delete

echo "✅ Backup complete: ${TIMESTAMP}"
EOF

# Status script
cat > /usr/local/bin/azteka-status << 'EOF'
#!/bin/bash
# Show system status
echo "=== AZTEKA STATUS ==="
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "💾 Disk Usage:"
df -h / | tail -1
echo ""
echo "🖼️ Images:"
find /srv/azteka-dsd/public/uploads/products -type f 2>/dev/null | wc -l
echo " product images"
echo ""
echo "🗄️ Database:"
sudo -u postgres psql -d azteka_production -c "SELECT COUNT(*) as products FROM \"Product\";" 2>/dev/null || echo "DB query failed"
EOF

# Logs script
cat > /usr/local/bin/azteka-logs << 'EOF'
#!/bin/bash
# Show recent logs
pm2 logs azteka-production --lines ${1:-100}
EOF

chmod +x /usr/local/bin/azteka-*
echo -e "${GREEN}✓ Helper scripts created${NC}"

#---------------------------------------
# Step 4: Set up daily backups
#---------------------------------------
echo -e "${YELLOW}[4/5] Setting up automatic backups...${NC}"

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/azteka-backup >> /var/log/azteka/backup.log 2>&1") | crontab -

echo -e "${GREEN}✓ Daily backup scheduled (3 AM)${NC}"

#---------------------------------------
# Step 5: Create image protection script
#---------------------------------------
echo -e "${YELLOW}[5/5] Creating image protection...${NC}"

cat > /usr/local/bin/protect-images << 'EOF'
#!/bin/bash
# Emergency image backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "🛡️ Protecting images..."
tar -czf /srv/azteka-backups/images/emergency-${TIMESTAMP}.tar.gz -C /srv/azteka-dsd/public uploads/
echo "✅ Images backed up to /srv/azteka-backups/images/emergency-${TIMESTAMP}.tar.gz"
echo "Image count: $(find /srv/azteka-dsd/public/uploads/products -type f | wc -l)"
EOF

chmod +x /usr/local/bin/protect-images
echo -e "${GREEN}✓ Image protection script created${NC}"

#---------------------------------------
# Final status check
#---------------------------------------
echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}  🎉 SETUP COMPLETE!${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo "Your Azteka DSD is now running!"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  azteka-status  - Check system status"
echo "  azteka-deploy  - Deploy latest from git"
echo "  azteka-backup  - Manual backup"
echo "  azteka-logs    - View application logs"
echo "  protect-images - Emergency image backup"
echo ""
echo -e "${YELLOW}PM2 commands:${NC}"
echo "  pm2 status            - Check app status"
echo "  pm2 restart all       - Restart app"
echo "  pm2 logs              - View logs"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the site at your domain"
echo "2. Run the data migration script"
echo "3. Set up GitHub Actions for auto-deploy"
echo ""
pm2 status
