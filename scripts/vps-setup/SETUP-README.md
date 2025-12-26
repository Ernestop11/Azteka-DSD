# AZTEKA DSD - New VPS Setup Guide

## New VPS Info
- **IP:** 72.62.162.163
- **Access:** `ssh root@72.62.162.163`

## Quick Setup (Run in Order)

### Step 1: Upload setup scripts to VPS
From your Mac, run:
```bash
scp -r /Users/ernestoponce/dev/azteka-dsd/scripts/vps-setup root@72.62.162.163:/root/
```

### Step 2: SSH into VPS and run scripts
```bash
ssh root@72.62.162.163

# Make scripts executable
chmod +x /root/vps-setup/*.sh

# Run each step in order:
cd /root/vps-setup
./01-initial-setup.sh
./02-database-setup.sh
./03-clone-and-setup.sh
./04-nginx-ssl-setup.sh
./05-pm2-and-finish.sh
./06-migrate-data.sh
```

## After Setup

### Update DNS
Point `aztekafoods.com` to: `72.62.162.163`

### GitHub Secrets (for auto-deploy)
Add these to GitHub repo Settings > Secrets:
- `VPS_HOST`: `72.62.162.163`
- `VPS_USER`: `root`
- `VPS_SSH_KEY`: (your SSH private key)

### Helper Commands
- `azteka-status` - Check system status
- `azteka-deploy` - Deploy latest from git
- `azteka-backup` - Manual backup
- `azteka-logs` - View logs
- `protect-images` - Emergency image backup
