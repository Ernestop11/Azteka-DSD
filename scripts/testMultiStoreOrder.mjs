#!/usr/bin/env node

/**
 * MultiStoreOrder Test Script
 * Tests multi-store ordering integration
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing MultiStoreOrder...\n')

// Test 1: Check MultiStoreOrder page
console.log('1. Checking MultiStoreOrder page...')
const pagePath = join(__dirname, 'app', 'multistore-order', 'page.tsx')
if (!existsSync(pagePath)) {
  errors.push('Missing MultiStoreOrder page: app/multistore-order/page.tsx')
} else {
  console.log('   ✅ MultiStoreOrder page found')
}

// Test 2: Check confirm page
console.log('2. Checking confirm page...')
const confirmPath = join(__dirname, 'app', 'multistore-order', 'confirm', 'page.tsx')
if (!existsSync(confirmPath)) {
  errors.push('Missing confirm page: app/multistore-order/confirm/page.tsx')
} else {
  console.log('   ✅ Confirm page found')
}

// Test 3: Check API route
console.log('3. Checking API route...')
const apiPath = join(__dirname, 'app', 'api', 'multiorders', 'route.ts')
if (!existsSync(apiPath)) {
  errors.push('Missing API route: app/api/multiorders/route.ts')
} else {
  const content = readFileSync(apiPath, 'utf-8')
  if (!content.includes('POST')) {
    errors.push('MultiOrders API missing POST handler')
  } else {
    console.log('   ✅ API route found with POST handler')
  }
}

// Test 4: Check CartContext storeGroups
console.log('4. Checking storeGroups in CartContext...')
const cartContextPath = join(__dirname, 'context', 'CartContext.tsx')
if (existsSync(cartContextPath)) {
  const content = readFileSync(cartContextPath, 'utf-8')
  if (!content.includes('storeGroups')) {
    errors.push('CartContext missing storeGroups')
  } else {
    console.log('   ✅ CartContext has storeGroups')
  }
}

// Test 5: Check MultiStoreOrder component
console.log('5. Checking MultiStoreOrder component...')
const componentPath = join(__dirname, 'components', 'sales', 'MultiStoreOrder.tsx')
if (!existsSync(componentPath)) {
  warnings.push('MultiStoreOrder component not found')
} else {
  console.log('   ✅ MultiStoreOrder component found')
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All MultiStoreOrder tests passed!')
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

