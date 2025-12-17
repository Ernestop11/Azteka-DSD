#!/usr/bin/env node

/**
 * Product Detail Page Test Script
 * Tests product detail page routing and components
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Product Detail Page...\n')

// Test 1: Check product detail page exists
console.log('1. Checking product detail page...')
const detailPagePath = join(__dirname, 'app', 'catalog', '[slug]', 'page.tsx')
if (!existsSync(detailPagePath)) {
  errors.push('Missing product detail page: app/catalog/[slug]/page.tsx')
} else {
  const content = readFileSync(detailPagePath, 'utf-8')
  if (!content.includes('getProductBySlug')) {
    errors.push('Product detail page missing getProductBySlug function')
  } else {
    console.log('   ✅ Product detail page found')
  }
}

// Test 2: Check loading state
console.log('2. Checking loading state...')
const loadingPath = join(__dirname, 'app', 'catalog', '[slug]', 'loading.tsx')
if (!existsSync(loadingPath)) {
  warnings.push('Missing loading state: app/catalog/[slug]/loading.tsx')
} else {
  console.log('   ✅ Loading state found')
}

// Test 3: Check not-found page
console.log('3. Checking not-found page...')
const notFoundPath = join(__dirname, 'app', 'catalog', '[slug]', 'not-found.tsx')
if (!existsSync(notFoundPath)) {
  warnings.push('Missing not-found page: app/catalog/[slug]/not-found.tsx')
} else {
  console.log('   ✅ Not-found page found')
}

// Test 4: Check ProductDetailClient
console.log('4. Checking ProductDetailClient...')
const clientPath = join(__dirname, 'app', 'catalog', '[slug]', 'ProductDetailClient.tsx')
if (!existsSync(clientPath)) {
  errors.push('Missing ProductDetailClient: app/catalog/[slug]/ProductDetailClient.tsx')
} else {
  const content = readFileSync(clientPath, 'utf-8')
  if (!content.includes('useCart')) {
    errors.push('ProductDetailClient missing useCart integration')
  } else {
    console.log('   ✅ ProductDetailClient found with cart integration')
  }
}

// Test 5: Check ProductGrid routing
console.log('5. Checking ProductGrid routing...')
const productGridPath = join(__dirname, 'components', 'catalog', 'ProductGrid.tsx')
if (existsSync(productGridPath)) {
  const content = readFileSync(productGridPath, 'utf-8')
  if (!content.includes('router.push') && !content.includes('/catalog/')) {
    warnings.push('ProductGrid may not have routing to detail pages')
  } else {
    console.log('   ✅ ProductGrid has routing')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All product detail tests passed!')
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

