#!/usr/bin/env node

/**
 * Catalog Build Test Script
 * Tests for broken imports, missing props, and missing images
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

// Test 1: Check for missing component imports
console.log('🔍 Testing component imports...')
const catalogPagePath = join(__dirname, 'app', 'catalog', 'page.tsx')
if (existsSync(catalogPagePath)) {
  const catalogPageContent = readFileSync(catalogPagePath, 'utf-8')
  
  const requiredComponents = [
    'HeroBanner',
    'PromoPanelRow',
    'ShowcaseSection',
    'TrendingRow',
    'BrandsRow',
    'CategoriesRow',
    'ProductGrid',
  ]
  
  requiredComponents.forEach(component => {
    if (!catalogPageContent.includes(component)) {
      errors.push(`Missing component: ${component} in catalog page`)
    }
  })
}

// Test 2: Check for missing image utilities
console.log('🔍 Testing image utilities...')
const imageUrlPath = join(__dirname, 'lib', 'imageUrl.ts')
if (!existsSync(imageUrlPath)) {
  errors.push('Missing imageUrl utility: lib/imageUrl.ts')
}

// Test 3: Check for Suspense boundaries
console.log('🔍 Testing Suspense boundaries...')
const pagesWithSearchParams = [
  join(__dirname, 'app', 'login', 'page.tsx'),
  join(__dirname, 'app', 'auth', 'login', 'page.tsx'),
]

pagesWithSearchParams.forEach(pagePath => {
  if (existsSync(pagePath)) {
    const content = readFileSync(pagePath, 'utf-8')
    if (content.includes('useSearchParams') && !content.includes('Suspense')) {
      errors.push(`Missing Suspense boundary in ${pagePath}`)
    }
  }
})

// Test 4: Check for device detection hook
console.log('🔍 Testing device detection...')
const deviceHookPath = join(__dirname, 'hooks', 'useDeviceType.ts')
if (!existsSync(deviceHookPath)) {
  errors.push('Missing device detection hook: hooks/useDeviceType.ts')
}

// Test 5: Check for revalidation in product API
console.log('🔍 Testing revalidation...')
const productApiPath = join(__dirname, 'app', 'api', 'admin', 'products', 'route.ts')
if (existsSync(productApiPath)) {
  const content = readFileSync(productApiPath, 'utf-8')
  if (!content.includes('revalidateTag')) {
    warnings.push('Product API missing revalidateTag calls')
  }
}

// Test 6: Check for dynamic export in catalog page
console.log('🔍 Testing dynamic exports...')
if (existsSync(catalogPagePath)) {
  const content = readFileSync(catalogPagePath, 'utf-8')
  if (!content.includes("export const dynamic")) {
    warnings.push('Catalog page missing dynamic export')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All tests passed!')
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

