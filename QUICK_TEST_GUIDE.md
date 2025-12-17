# Quick Test Execution Guide

## Prerequisites Check

Run these commands to verify setup:

```bash
cd /Users/ernestoponce/Downloads/Azteka-DSD-main

# Check Node.js
node --version  # Should be v18+ or v22+

# Check dependencies
test -d node_modules && echo "✅ Dependencies installed" || echo "❌ Run: npm install"

# Check environment
test -f .env && echo "✅ .env exists" || echo "❌ Create .env file"

# Check Prisma
test -f prisma/schema.prisma && echo "✅ Prisma schema found" || echo "❌ Check Prisma setup"

# Check test files
test -f tests/po-samples/sabritas_po.csv && echo "✅ Test PO files exist" || echo "❌ Test files missing"
test -f scripts/run-full-ingestion-test.mjs && echo "✅ Test script exists" || echo "❌ Test script missing"
```

## Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env` file with:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
OPENAI_API_KEY=sk-...
BING_SEARCH_API_KEY=...
REMOVE_BG_API_KEY=...
CANVA_API_KEY=...
PORT=3000
ADMIN_TEST_TOKEN=test-token-123
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Start Server
```bash
# Option 1: If server.mjs is in root
node server.mjs

# Option 2: If in remote_azteka_dsd
cd remote_azteka_dsd
node server.mjs
```

### 5. Run Tests
```bash
export ADMIN_TEST_TOKEN=test-token-123
export API_BASE_URL=http://localhost:3000

# Test PO ingestion
curl -X POST http://localhost:3000/api/auto/ingest-po \
  -H "Authorization: Bearer test-token-123" \
  -F "file=@tests/po-samples/sabritas_po.csv" \
  -F "autoProcess=false"

# Run full test
node scripts/run-full-ingestion-test.mjs
```

## Expected Test Results

After running the full test, check:

1. **Logs:** `logs/testing/YYYY-MM-DD.log`
2. **Summary:** `logs/testing/test-summary-*.json`
3. **Database:** Products should be created/updated
4. **Images:** Check `/uploads/products/` directory

## Troubleshooting

### "Cannot find module"
- Run: `npm install`

### "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running

### "API key not configured"
- Add API keys to `.env`
- Restart server

### "Port already in use"
- Change `PORT` in `.env`
- Or kill process on port 3000

