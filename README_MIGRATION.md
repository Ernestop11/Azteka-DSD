# Migration from Supabase to PostgreSQL - Action Plan

## Current Situation

Your app is built with:
- ✅ React/Vite frontend
- ✅ Database schema migration file (incomplete)
- ❌ Currently uses Supabase (needs to be replaced)
- ❌ Missing several database tables
- ❓ Unknown build status on VPS

## Step 1: Smoke Test Your VPS

First, let's see what's actually on your server:

```bash
# SSH into your VPS
ssh root@77.243.85.8

# Upload the smoke-test.sh script (or create it there)
# Then run it:
bash smoke-test.sh
```

This will show you:
- Where your project is located
- If there are multiple build folders (messy situation)
- What web server is running
- PostgreSQL status
- Current build status

## Step 2: Check Current Build Status

After running the smoke test, check:

1. **Where is the project?**
   - Look for the project directory path
   - Check if there are multiple locations

2. **Is there a build?**
   - Check if `dist/` folder exists
   - Check if web server is pointing to the right location

3. **What's the web server config?**
   - Nginx or Apache?
   - What directory is it serving?

## Step 3: Complete Database Schema

The migration file is missing several tables. We need to add:
- brands
- subcategories
- product_bundles
- promotions
- product_promotions
- special_offers
- rewards_badges

## Step 4: Replace Supabase with PostgreSQL

We'll need to:
1. Create a backend API (Node.js/Express recommended)
2. Replace all Supabase client calls with API calls
3. Connect backend to PostgreSQL
4. Update frontend to use API instead of Supabase

## Quick Start: Run Smoke Test Now

1. **Copy smoke-test.sh to your VPS:**
   ```bash
   scp smoke-test.sh root@77.243.85.8:/root/
   ```

2. **SSH into VPS:**
   ```bash
   ssh root@77.243.85.8
   ```

3. **Run the smoke test:**
   ```bash
   bash smoke-test.sh
   ```

4. **Share the results** so we can:
   - Identify where everything is
   - Clean up any messy folder structure
   - Plan the migration properly

## What We'll Build

After the smoke test, we'll create:

1. **Complete PostgreSQL Schema**
   - All missing tables
   - Proper indexes
   - Data types

2. **Backend API** (Node.js/Express)
   - RESTful endpoints
   - PostgreSQL connection
   - Error handling

3. **Updated Frontend**
   - Replace Supabase calls with API calls
   - Keep all existing functionality

4. **Deployment Scripts**
   - Database setup
   - Build process
   - Web server configuration

## Questions to Answer

After running the smoke test, we need to know:

1. Where is your project located on the VPS?
2. Is there already a build? Where?
3. What web server are you using? (Nginx/Apache)
4. Is PostgreSQL installed and running?
5. Are there multiple build locations causing confusion?

Run the smoke test and share the output!


