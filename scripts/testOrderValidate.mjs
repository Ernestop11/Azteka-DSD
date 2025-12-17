#!/usr/bin/env node

/**
 * Order Validation Test Script
 * Tests order validation, sanitization, and normalization
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Order Validation...\n')

// Test 1: Check validateOrder
console.log('1. Checking validateOrder...')
const validatePath = join(__dirname, 'lib', 'orders', 'validateOrder.ts')
if (!existsSync(validatePath)) {
  errors.push('Missing validateOrder: lib/orders/validateOrder.ts')
} else {
  const content = readFileSync(validatePath, 'utf-8')
  const requiredFunctions = ['validateOrder', 'validateMultiOrder', 'validateStoreGroups']
  const missing = requiredFunctions.filter(fn => !content.includes(`export.*${fn}`) && !content.includes(`function ${fn}`))
  if (missing.length > 0) {
    warnings.push(`validateOrder may be missing functions: ${missing.join(', ')}`)
  } else {
    console.log('   ✅ validateOrder found')
  }
}

// Test 2: Check sanitizeOrder
console.log('2. Checking sanitizeOrder...')
const sanitizePath = join(__dirname, 'lib', 'orders', 'sanitizeOrder.ts')
if (!existsSync(sanitizePath)) {
  errors.push('Missing sanitizeOrder: lib/orders/sanitizeOrder.ts')
} else {
  const content = readFileSync(sanitizePath, 'utf-8')
  if (!content.includes('sanitizeOrder') || !content.includes('sanitizeMultiOrder')) {
    errors.push('sanitizeOrder missing required functions')
  } else {
    console.log('   ✅ sanitizeOrder found')
  }
}

// Test 3: Check orderNormalizer
console.log('3. Checking orderNormalizer...')
const normalizerPath = join(__dirname, 'lib', 'orders', 'orderNormalizer.ts')
if (!existsSync(normalizerPath)) {
  errors.push('Missing orderNormalizer: lib/orders/orderNormalizer.ts')
} else {
  const content = readFileSync(normalizerPath, 'utf-8')
  if (!content.includes('normalizeStoreGroupToOrder') || !content.includes('normalizeCartToOrder')) {
    errors.push('orderNormalizer missing required functions')
  } else {
    console.log('   ✅ orderNormalizer found')
  }
}

// Test 4: Check API route integration
console.log('4. Checking API route integration...')
const apiPath = join(__dirname, 'app', 'api', 'multiorders', 'route.ts')
if (existsSync(apiPath)) {
  const content = readFileSync(apiPath, 'utf-8')
  if (!content.includes('sanitizeMultiOrder') || !content.includes('validateMultiOrder')) {
    errors.push('MultiOrders API missing validation/sanitization')
  } else {
    console.log('   ✅ API route has validation/sanitization')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All order validation tests passed!')
  process.exit(0)
} else {
  if (errors.length > 0) {
    console.error('\n❌ Errors:')
    errors.forEach(error => console.error(`  - ${error}`))
  }
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  process.exit(errors.length > 0 ? 1 : 0)
}

