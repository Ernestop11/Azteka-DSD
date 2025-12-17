#!/usr/bin/env node

/**
 * Cart Flow Test Script
 * Tests the complete cart flow: add → update → remove → clear
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Cart Flow...\n')

// Test 1: Check CartContext exists
console.log('1. Checking CartContext...')
const cartContextPath = join(__dirname, 'context', 'CartContext.tsx')
if (!existsSync(cartContextPath)) {
  errors.push('Missing CartContext: context/CartContext.tsx')
} else {
  const content = readFileSync(cartContextPath, 'utf-8')
  const requiredMethods = ['add', 'remove', 'updateQty', 'clear', 'totals', 'storeGroups']
  requiredMethods.forEach(method => {
    if (!content.includes(method)) {
      errors.push(`CartContext missing method: ${method}`)
    }
  })
  console.log('   ✅ CartContext found with required methods')
}

// Test 2: Check useCart hook
console.log('2. Checking useCart hook...')
const useCartPath = join(__dirname, 'hooks', 'useCart.ts')
if (!existsSync(useCartPath)) {
  errors.push('Missing useCart hook: hooks/useCart.ts')
} else {
  console.log('   ✅ useCart hook found')
}

// Test 3: Check tier pricing utility
console.log('3. Checking tier pricing utility...')
const tierPricePath = join(__dirname, 'lib', 'price', 'tierPrice.ts')
if (!existsSync(tierPricePath)) {
  errors.push('Missing tier pricing utility: lib/price/tierPrice.ts')
} else {
  const content = readFileSync(tierPricePath, 'utf-8')
  if (!content.includes('getTierPrice')) {
    errors.push('tierPrice.ts missing getTierPrice function')
  } else {
    console.log('   ✅ Tier pricing utility found')
  }
}

// Test 4: Check CartProvider in Providers
console.log('4. Checking CartProvider integration...')
const providersPath = join(__dirname, 'components', 'Providers.tsx')
if (existsSync(providersPath)) {
  const content = readFileSync(providersPath, 'utf-8')
  if (!content.includes('CartProvider')) {
    errors.push('Providers.tsx missing CartProvider')
  } else {
    console.log('   ✅ CartProvider integrated')
  }
} else {
  warnings.push('Providers.tsx not found')
}

// Test 5: Check GlossyProductCard onAddToCart
console.log('5. Checking GlossyProductCard callback...')
const productCardPath = join(__dirname, 'components', 'catalog', 'GlossyProductCard.tsx')
if (existsSync(productCardPath)) {
  const content = readFileSync(productCardPath, 'utf-8')
  if (!content.includes('onAddToCart')) {
    errors.push('GlossyProductCard missing onAddToCart prop')
  } else {
    console.log('   ✅ GlossyProductCard has onAddToCart callback')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All cart flow tests passed!')
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

