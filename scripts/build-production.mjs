#!/usr/bin/env node
/**
 * Production Build Script
 * Prepares backend for production deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('🚀 Starting production build...\n');

// Step 1: Load environment
console.log('📋 Step 1: Loading environment...');
const envFile = join(ROOT_DIR, '.env.production');
if (!existsSync(envFile)) {
  console.error('❌ .env.production not found!');
  process.exit(1);
}
dotenv.config({ path: envFile });
console.log('✅ Environment loaded\n');

// Step 2: Generate Prisma Client
console.log('📋 Step 2: Generating Prisma Client...');
try {
  execSync('npx prisma generate', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  console.log('✅ Prisma Client generated\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

// Step 3: Verify seed data (optional)
console.log('📋 Step 3: Verifying seed data...');
try {
  execSync('node scripts/verify-seed.mjs', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  console.log('✅ Seed verification passed\n');
} catch (error) {
  console.warn('⚠️  Seed verification failed (non-blocking):', error.message);
  console.log('   Continuing build...\n');
}

// Step 4: Check for TypeScript errors (if applicable)
console.log('📋 Step 4: Checking for syntax errors...');
try {
  // Check if server.mjs has syntax errors
  execSync('node --check server.mjs', {
    cwd: ROOT_DIR,
    stdio: 'pipe',
  });
  console.log('✅ Syntax check passed\n');
} catch (error) {
  console.error('❌ Syntax errors found:', error.message);
  process.exit(1);
}

// Step 5: Create logs directory
console.log('📋 Step 5: Setting up logs directory...');
const logsDir = join(ROOT_DIR, 'logs');
if (!existsSync(logsDir)) {
  execSync(`mkdir -p ${logsDir}`, { cwd: ROOT_DIR });
  console.log('✅ Logs directory created\n');
} else {
  console.log('✅ Logs directory exists\n');
}

// Step 6: Verify PM2 config
console.log('📋 Step 6: Verifying PM2 configuration...');
const pm2Config = join(ROOT_DIR, 'ecosystem.config.js');
if (!existsSync(pm2Config)) {
  console.error('❌ ecosystem.config.js not found!');
  process.exit(1);
}
console.log('✅ PM2 configuration found\n');

console.log('✅ Production build complete!');
console.log('\n📝 Next steps:');
console.log('   1. Run migrations: npx prisma migrate deploy');
console.log('   2. Start with PM2: pm2 start ecosystem.config.js');
console.log('   3. Check health: curl http://localhost:3000/api/debug/health-check');

