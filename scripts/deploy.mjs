#!/usr/bin/env node
/**
 * Deployment Script
 * Full deployment pipeline for production
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('🚀 Starting deployment...\n');

// Load environment
const envFile = join(ROOT_DIR, '.env.production');
if (!existsSync(envFile)) {
  console.error('❌ .env.production not found!');
  process.exit(1);
}
dotenv.config({ path: envFile });

// Step 1: Build
console.log('📋 Step 1: Building for production...');
try {
  execSync('node scripts/build-production.mjs', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Run migrations
console.log('\n📋 Step 2: Running database migrations...');
try {
  execSync('npx prisma migrate deploy', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  console.log('✅ Migrations applied\n');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

// Step 3: Restart PM2
console.log('📋 Step 3: Restarting PM2 process...');
try {
  execSync('pm2 restart azteka-api-live || pm2 start ecosystem.config.js', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  console.log('✅ PM2 process restarted\n');
} catch (error) {
  console.error('❌ PM2 restart failed:', error.message);
  process.exit(1);
}

// Step 4: Health check
console.log('📋 Step 4: Running health check...');
try {
  // Wait a bit for server to start
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  const healthCheck = execSync(
    'curl -s http://localhost:3000/api/debug/health-check',
    { encoding: 'utf-8' }
  );
  const health = JSON.parse(healthCheck);
  
  if (health.status === 'ok' || health.status === 'warning') {
    console.log('✅ Health check passed');
    console.log(JSON.stringify(health, null, 2));
  } else {
    console.error('❌ Health check failed:', health);
    process.exit(1);
  }
} catch (error) {
  console.warn('⚠️  Health check failed (non-blocking):', error.message);
}

console.log('\n✅ Deployment complete!');

