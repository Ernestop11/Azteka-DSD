#!/bin/bash

# Integrations Setup Script
# This script helps set up API keys and OAuth connections

set -e

echo "🔧 Azteka DSD - Integrations Setup"
echo "=================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "⚠️  .env.production not found. Creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env.production
  else
    touch .env.production
  fi
fi

# Generate encryption key if not set
if ! grep -q "ENCRYPTION_KEY=" .env.production; then
  echo "🔑 Generating encryption key..."
  ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.production
  echo "✅ Encryption key generated and added to .env.production"
else
  echo "✅ Encryption key already set"
fi

# Run database migration
echo ""
echo "📦 Running database migration..."
npx prisma migrate dev --name add_integrations || echo "⚠️  Migration may have already been run"

# Generate Prisma client
echo ""
echo "🔨 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Add your API keys in /admin/integrations:"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Claude: https://console.anthropic.com/"
echo "   - Gemini: https://makersuite.google.com/app/apikey"
echo ""
echo "2. (Optional) Add OAuth credentials to .env.production:"
echo "   - CANVA_CLIENT_ID=your_canva_client_id"
echo "   - CANVA_CLIENT_SECRET=your_canva_client_secret"
echo "   - BOLT_CLIENT_ID=your_bolt_client_id"
echo "   - BOLT_CLIENT_SECRET=your_bolt_client_secret"
echo ""
echo "3. Connect OAuth services in /admin/integrations"
echo ""
echo "🚀 Ready to use!"









