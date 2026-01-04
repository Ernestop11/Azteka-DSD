#!/bin/bash

# AZTEKA DSD DEPLOYMENT SCRIPT
# This script is the ONLY way to deploy. Never use rsync/ssh commands directly.
# CREATES AUTOMATIC BACKUP BEFORE EVERY DEPLOYMENT
#
# USAGE:
#   ./scripts/deploy.sh              # Deploy to Azteka VPS (72.62.162.163)
#   ./scripts/deploy.sh --alessa     # Deploy to Alessa/Las Reinas VPS (77.243.85.8)
#
# SAFETY SETUP (one-time per team):
#   AZTEKA TEAM - Block Alessa VPS:
#     sed -i '' 's/"77.243.85.8"/"77.243.85.8"/' scripts/deploy.sh
#
#   ALESSA TEAM - Block Azteka VPS:
#     sed -i '' 's/# "72.62.162.163"/"72.62.162.163"/' scripts/deploy.sh

set -e

# ============================================================
# 🚨 FORBIDDEN IPS - NEVER DEPLOY TO THESE SERVERS 🚨
# ============================================================
# These are servers you should NOT deploy to from THIS copy.
# Each team should uncomment the OTHER team's VPS to prevent accidents.
FORBIDDEN_IPS=(
    # ⚠️ AZTEKA TEAM: Keep 77.243.85.8 commented - that's Alessa's VPS (Las Reinas)
    # ⚠️ ALESSA TEAM: Keep 72.62.162.163 commented - that's Azteka's VPS

    "77.243.85.8"    # ALESSA VPS (Las Reinas) - Uncomment if you're AZTEKA team
    # "72.62.162.163"  # AZTEKA VPS - Uncomment if you're ALESSA team
)

# ============================================================
# GUARDRAIL: Block any attempt to deploy to forbidden servers
# ============================================================
block_forbidden_ips() {
    local target_ip="$1"
    for forbidden in "${FORBIDDEN_IPS[@]}"; do
        if [[ "$target_ip" == "$forbidden" ]]; then
            echo ""
            echo "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨"
            echo "🚨                                                          🚨"
            echo "🚨   BLOCKED: DEPLOYMENT TO FORBIDDEN SERVER                🚨"
            echo "🚨                                                          🚨"
            echo "🚨   IP $forbidden is blocked in this script      🚨"
            echo "🚨                                                          🚨"
            echo "🚨   Check FORBIDDEN_IPS array in scripts/deploy.sh        🚨"
            echo "🚨                                                          🚨"
            echo "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨"
            echo ""
            exit 1
        fi
    done
}

# ============================================================
# VPS CONFIGURATION
# ============================================================
# Default: Azteka VPS
VPS_IP="72.62.162.163"
VPS_USER="root"
VPS_PATH="/srv/azteka-dsd"
PM2_PROCESS="azteka-production"
BACKUP_DIR="/srv/backups"
DOMAIN="aztekafoods.com"

# Override for Alessa VPS (Las Reinas)
if [[ "$1" == "--alessa" || "$1" == "--lasreinas" ]]; then
    VPS_IP="${ALESSA_VPS_IP:-77.243.85.8}"  # Alessa/Las Reinas VPS
    VPS_PATH="/srv/alessa-ordering"
    PM2_PROCESS="alessa-ordering"
    DOMAIN="lasreinascolusa.com"
    echo "🔄 Deploying to ALESSA VPS (Las Reinas)"
fi

# Run the guardrail check
block_forbidden_ips "$VPS_IP"

# Auto-detect local path (works for any user/machine)
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "AZTEKA DSD DEPLOYMENT"
echo "=========================================="
echo "Target VPS: ${VPS_USER}@${VPS_IP}"
echo "Target Path: ${VPS_PATH}"
echo "PM2 Process: ${PM2_PROCESS}"
echo "=========================================="
echo ""
echo "⚠️  THIS WILL:"
echo "   1. Create a backup of the database"
echo "   2. Create a backup of uploads"
echo "   3. Deploy new code"
echo "   4. Restart the server"
echo ""

# Confirm before proceeding
read -p "Deploy to ${VPS_IP}? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Deployment cancelled."
    exit 0
fi

DATE=$(date +%Y%m%d_%H%M%S)

echo ""
echo "[1/6] Creating database backup before deployment..."
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${BACKUP_DIR} && PGPASSWORD='azteka_pass_2024' pg_dump -h localhost -U azteka_user -d azteka_production -F c -f ${BACKUP_DIR}/pre_deploy_${DATE}.dump"
echo "      Backup saved: ${BACKUP_DIR}/pre_deploy_${DATE}.dump"

echo ""
echo "[2/6] Creating uploads backup..."
ssh "${VPS_USER}@${VPS_IP}" "tar -czf ${BACKUP_DIR}/uploads_pre_deploy_${DATE}.tar.gz -C ${VPS_PATH}/public uploads 2>/dev/null || echo 'No uploads to backup'"
echo "      Uploads saved: ${BACKUP_DIR}/uploads_pre_deploy_${DATE}.tar.gz"

echo ""
echo "[3/6] Building locally..."
cd "$LOCAL_PATH"
npm run build:next

echo ""
echo "[4/6] Syncing source files to VPS (excluding uploads)..."
rsync -avz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.production' \
    --exclude='.env.production.local' \
    --exclude='.next' \
    --exclude='.next-azteka' \
    --exclude='public/uploads' \
    "$LOCAL_PATH/" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

echo ""
echo "[5/6] Syncing build folder..."
rsync -avz --delete \
    "$LOCAL_PATH/.next-azteka/" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/.next-azteka/"

echo ""
echo "[6/6] Generating Prisma client and restarting PM2..."
ssh "${VPS_USER}@${VPS_IP}" "cd ${VPS_PATH} && npx prisma generate && pm2 restart ${PM2_PROCESS}"

echo ""
echo "=========================================="
echo "DEPLOYMENT COMPLETE"
echo "=========================================="
echo "Deployed to: ${VPS_IP}"
echo "Process: ${PM2_PROCESS}"
echo "Backup: pre_deploy_${DATE}.dump"
echo ""

# Quick health check
echo "Running health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/api/products")
if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✅ Health check PASSED (HTTP $HTTP_CODE)"
else
    echo "⚠️  Health check WARNING (HTTP $HTTP_CODE)"
    echo ""
    echo "To rollback database:"
    echo "  ssh ${VPS_USER}@${VPS_IP} \"PGPASSWORD='azteka_pass_2024' pg_restore -h localhost -U azteka_user -d azteka_production -c ${BACKUP_DIR}/pre_deploy_${DATE}.dump\""
    echo ""
    echo "Check logs:"
    echo "  ssh ${VPS_USER}@${VPS_IP} 'pm2 logs ${PM2_PROCESS} --lines 50'"
fi

echo ""
echo "To restore this backup later:"
echo "  ssh ${VPS_USER}@${VPS_IP} \"PGPASSWORD='azteka_pass_2024' pg_restore -h localhost -U azteka_user -d azteka_production -c ${BACKUP_DIR}/pre_deploy_${DATE}.dump\""
