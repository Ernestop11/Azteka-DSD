# Server Setup Status

## Current Issue

The root `server.mjs` has many missing dependencies and route files. To successfully run the server from the root directory, the following are needed:

### Missing Dependencies (Installed)
- ✅ jsonwebtoken
- ✅ pdf-parse  
- ✅ xlsx
- ✅ csv-parse
- ✅ openai
- ✅ sharp
- ✅ string-similarity
- ✅ remove.bg
- ✅ form-data
- ✅ node-fetch
- ✅ tesseract.js

### Missing Route Files (Commented Out)
- ✅ orders/manage.js - commented out
- ✅ auth/route.js - commented out  
- ✅ po/route.js - commented out
- ✅ invoices/route.js - commented out
- ✅ ai/insights.js - commented out
- ✅ automation/route.js - commented out
- ✅ gamification/route.js - commented out
- ✅ loyalty/route.js - commented out
- ✅ analytics/route.js - commented out

### Fixed Import Paths
- ✅ src/api/catalog/layout.js - fixed templateRenderer import path

## Recommendation

**Option A (Recommended):** Run server from `remote_azteka_dsd/` where all dependencies exist:
```bash
cd remote_azteka_dsd
node server.mjs
```

**Option B:** Continue fixing root server by installing all missing dependencies and creating stub routes.

## Test Endpoint Status

Once server is running, test with:
```bash
curl -v http://localhost:4000/api/auto/ingest-po
```

Expected: 401 Unauthorized (needs auth token) or 400 Bad Request (needs file upload)

