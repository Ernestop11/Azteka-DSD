#!/usr/bin/env node
/**
 * Test Setup Validation Script
 * Validates that all prerequisites are met for end-to-end testing
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

function check(name, condition, message) {
  if (condition) {
    checks.passed.push(name);
    console.log(`✅ ${name}: ${message || 'OK'}`);
  } else {
    checks.failed.push(name);
    console.log(`❌ ${name}: ${message || 'FAILED'}`);
  }
}

function warn(name, message) {
  checks.warnings.push(name);
  console.log(`⚠️  ${name}: ${message}`);
}

console.log('🔍 Validating Test Setup...\n');

// Check project structure
check('Project root exists', existsSync(ROOT_DIR), ROOT_DIR);
check('server.mjs exists', existsSync(join(ROOT_DIR, 'server.mjs')), 'Main server file found');
check('package.json exists', existsSync(join(ROOT_DIR, 'package.json')), 'Package config found');

// Check dependencies
check('node_modules exists', existsSync(join(ROOT_DIR, 'node_modules')), 'Dependencies installed');

// Check Prisma
const prismaPaths = [
  join(ROOT_DIR, 'prisma', 'schema.prisma'),
  join(ROOT_DIR, 'remote_azteka_dsd', 'prisma', 'schema.prisma'),
];
const prismaExists = prismaPaths.some(p => existsSync(p));
check('Prisma schema exists', prismaExists, prismaExists ? 'Schema found' : 'Run: npx prisma init');

// Check test files
check('Test PO samples exist', existsSync(join(ROOT_DIR, 'tests', 'po-samples', 'sabritas_po.csv')), 'Test files found');
check('Test harness script exists', existsSync(join(ROOT_DIR, 'scripts', 'run-full-ingestion-test.mjs')), 'Test script found');

// Check API routes
check('Auto-ingestion routes exist', existsSync(join(ROOT_DIR, 'src', 'api', 'auto')), 'API routes found');
check('Force-regenerate routes exist', existsSync(join(ROOT_DIR, 'src', 'api', 'products', '[id]', 'force-regenerate.js')), 'Regenerate routes found');

// Check log directories
check('Log directories exist', existsSync(join(ROOT_DIR, 'logs', 'testing')), 'Log dirs created');

// Check environment
if (existsSync(join(ROOT_DIR, '.env'))) {
  const envContent = readFileSync(join(ROOT_DIR, '.env'), 'utf-8');
  const hasDatabase = envContent.includes('DATABASE_URL');
  const hasOpenAI = envContent.includes('OPENAI_API_KEY');
  const hasBing = envContent.includes('BING_SEARCH_API_KEY');
  
  check('.env file exists', true, 'Environment file found');
  check('DATABASE_URL configured', hasDatabase, hasDatabase ? 'Database URL set' : 'Add DATABASE_URL');
  warn('OPENAI_API_KEY', hasOpenAI ? 'Configured' : 'Not configured (required for AI features)');
  warn('BING_SEARCH_API_KEY', hasBing ? 'Configured' : 'Not configured (required for image search)');
} else {
  check('.env file exists', false, 'Create .env file with required variables');
}

// Check required dependencies in package.json
if (existsSync(join(ROOT_DIR, 'package.json'))) {
  const pkg = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const requiredDeps = ['express', '@prisma/client', 'openai', 'sharp'];
  requiredDeps.forEach(dep => {
    const installed = deps[dep] || deps[dep.replace('@', '')];
    check(`Dependency: ${dep}`, !!installed, installed ? `v${installed}` : 'Not installed');
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:');
  checks.failed.forEach(f => console.log(`   - ${f}`));
  console.log('\n⚠️  Please fix the failed checks before running tests.');
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  checks.warnings.forEach(w => console.log(`   - ${w}`));
  console.log('\n✅ Setup validation passed with warnings.');
  console.log('⚠️  Some features may not work without API keys.');
  process.exit(0);
} else {
  console.log('\n✅ All checks passed! Ready for testing.');
  process.exit(0);
}

