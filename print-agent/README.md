# Azteka Print Agent

Local print agent that runs on your warehouse computer and handles automatic printing of picking lists, packing slips, and other documents.

## How It Works

```
┌─────────────────────┐         HTTPS         ┌─────────────────────┐
│   VPS (Next.js)     │◄──────────────────────│  Print Agent (Mac)  │
│   azteka.com        │    polls every 5sec   │  Your Computer      │
│                     │                       │                     │
│  ┌───────────────┐  │       JSON            │  ┌───────────────┐  │
│  │  PrintJob DB  │  │──────────────────────►│  │  CUPS (lp)    │  │
│  │  (pending)    │  │   job data            │  └───────┬───────┘  │
│  └───────────────┘  │                       │          │          │
└─────────────────────┘                       └──────────┼──────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │  Printer (local)    │
                                              │  HP LaserJet M281   │
                                              └─────────────────────┘
```

When an order is created on the VPS:
1. VPS queues a print job in the database (doesn't try to print)
2. Print Agent polls VPS every 5 seconds for new jobs
3. Agent downloads job data and prints to local printer via CUPS
4. Agent reports success/failure back to VPS

## Setup

### 1. Copy to Warehouse Computer

Copy the entire `print-agent` folder to your Mac at the warehouse.

### 2. Install Dependencies

```bash
cd print-agent
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
VPS_URL=https://your-vps-domain.com
PRINT_AGENT_SECRET=your-secret-key
PRINTER_NAME=HP_Color_LaserJet_MFP_M281fdw__FD3E28_
```

### 4. Find Your Printer Name

Run this command to list available printers:

```bash
lpstat -p
```

Copy the exact printer name and put it in `.env`.

### 5. Set VPS Secret

On your VPS, add to `.env`:

```env
PRINT_AGENT_SECRET=your-secret-key
```

Use the same key in both places!

### 6. Test Run

```bash
npm start
```

You should see:
```
========================================
     AZTEKA DSD PRINT AGENT
========================================
Agent Name: your-computer-name
VPS URL: https://your-vps-domain.com
Printer: HP_Color_LaserJet_MFP_M281fdw__FD3E28_
Poll Interval: 5s
========================================

[Startup] Printer status: ONLINE
[Startup] Heartbeat sent

Polling for print jobs...
```

### 7. Run as Background Service (Production)

Install PM2 globally:

```bash
npm install -g pm2
```

Start the agent with PM2:

```bash
pm2 start agent.mjs --name azteka-print-agent
pm2 save
pm2 startup
```

This ensures the agent:
- Starts automatically on boot
- Restarts if it crashes
- Runs in the background

### Useful PM2 Commands

```bash
pm2 status              # Check if running
pm2 logs azteka-print-agent   # View logs
pm2 restart azteka-print-agent  # Restart
pm2 stop azteka-print-agent     # Stop
```

## Troubleshooting

### Printer Offline

If you see "Printer offline, skipping...":
1. Check printer is on and connected
2. Run `lpstat -p` to verify CUPS sees the printer
3. Check printer name in `.env` matches exactly

### Connection Errors

If you see "API error: 401":
- Check `PRINT_AGENT_SECRET` matches between agent and VPS

If you see "API error: 500":
- Check VPS logs for errors
- Verify database is accessible

### Test Print

Create a test order on your site to verify printing works end-to-end.

## Auto-Start on Mac Login (Alternative to PM2)

If you prefer the native macOS approach instead of PM2:

### 1. Edit the LaunchAgent file

Edit `com.azteka.print-agent.plist` and replace `WAREHOUSE_USER` with your Mac username:

```bash
# Find your username
whoami

# Edit the file (replace WAREHOUSE_USER with your username)
nano com.azteka.print-agent.plist
```

### 2. Create logs directory

```bash
mkdir -p ~/print-agent/logs
```

### 3. Install the LaunchAgent

```bash
cp com.azteka.print-agent.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.azteka.print-agent.plist
```

### 4. Check Status

```bash
launchctl list | grep azteka
tail -f ~/print-agent/logs/agent.log
```

### 5. Useful Commands

```bash
# Stop the agent
launchctl unload ~/Library/LaunchAgents/com.azteka.print-agent.plist

# Start the agent
launchctl load ~/Library/LaunchAgents/com.azteka.print-agent.plist

# View logs
tail -f ~/print-agent/logs/agent.log
tail -f ~/print-agent/logs/agent-error.log
```

## Files

- `agent.mjs` - Main agent script
- `package.json` - Dependencies
- `.env.example` - Configuration template
- `.env` - Your configuration (create this)
- `com.azteka.print-agent.plist` - macOS LaunchAgent for auto-start
