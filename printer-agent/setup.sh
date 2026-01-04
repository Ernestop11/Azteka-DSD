#!/bin/bash

# Azteka Print Agent Setup Script
# Run this on the warehouse Mac to set up the print agent

set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║         AZTEKA PRINT AGENT SETUP                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Warning: This script is designed for macOS"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install it from https://nodejs.org/ or with Homebrew:"
    echo "   brew install node"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check for printers
echo ""
echo "📋 Checking available printers..."
lpstat -p 2>/dev/null || echo "   No printers found"
echo ""
lpstat -d 2>/dev/null || echo "   No default printer set"
echo ""

# Generate a random secret if not exists
SECRET_FILE="$HOME/.azteka-print-secret"
if [ -f "$SECRET_FILE" ]; then
    PRINT_SECRET=$(cat "$SECRET_FILE")
    echo "🔑 Using existing secret from $SECRET_FILE"
else
    PRINT_SECRET=$(openssl rand -hex 32)
    echo "$PRINT_SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
    echo "🔑 Generated new secret and saved to $SECRET_FILE"
fi

echo ""
echo "══════════════════════════════════════════════════"
echo "IMPORTANT: Add this secret to your VPS .env file:"
echo ""
echo "   PRINT_AGENT_SECRET=$PRINT_SECRET"
echo ""
echo "══════════════════════════════════════════════════"
echo ""

# Create LaunchAgent for auto-start
PLIST_PATH="$HOME/Library/LaunchAgents/com.azteka.printagent.plist"
AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.azteka.printagent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${AGENT_DIR}/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${AGENT_DIR}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>VPS_URL</key>
        <string>https://aztekafoods.com</string>
        <key>PRINT_AGENT_SECRET</key>
        <string>${PRINT_SECRET}</string>
        <key>AGENT_NAME</key>
        <string>warehouse-mac</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/azteka-print-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/azteka-print-agent.error.log</string>
</dict>
</plist>
EOF

echo "✅ Created LaunchAgent at $PLIST_PATH"

# Load the agent
launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"

echo "✅ Print agent started"
echo ""
echo "══════════════════════════════════════════════════"
echo "NEXT STEPS:"
echo ""
echo "1. Add the secret to VPS (new VPS at 72.62.162.163):"
echo "   ssh root@72.62.162.163"
echo "   echo 'PRINT_AGENT_SECRET=$PRINT_SECRET' >> /srv/azteka-dsd/.env"
echo "   pm2 restart azteka-production"
echo ""
echo "2. Check agent logs:"
echo "   tail -f /tmp/azteka-print-agent.log"
echo ""
echo "3. Test print from admin:"
echo "   https://aztekafoods.com/admin/warehouse"
echo ""
echo "══════════════════════════════════════════════════"
