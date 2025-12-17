#!/usr/bin/env node

/**
 * Editor Preview Test Script
 * Tests PNG editor → catalog preview pipeline
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Editor Preview Pipeline...\n')

// Test 1: Check revalidation in product API
console.log('1. Checking revalidation in product API...')
const productApiPath = join(__dirname, 'app', 'api', 'admin', 'products', 'route.ts')
if (existsSync(productApiPath)) {
  const content = readFileSync(productApiPath, 'utf-8')
  if (!content.includes('revalidateTag')) {
    errors.push('Product API missing revalidateTag')
  } else if (!content.includes('revalidatePath')) {
    warnings.push('Product API missing revalidatePath')
  } else {
    console.log('   ✅ Product API has revalidation')
  }
} else {
  errors.push('Product API route not found')
}

// Test 2: Check imageUrl utility usage
console.log('2. Checking imageUrl utility usage...')
const imageUrlPath = join(__dirname, 'lib', 'imageUrl.ts')
if (!existsSync(imageUrlPath)) {
  errors.push('Missing imageUrl utility: lib/imageUrl.ts')
} else {
  // Check if components use getPublicImageUrl
  const componentsToCheck = [
    'components/catalog/GlossyProductCard.tsx',
    'components/catalog/ProductGrid.tsx',
    'app/catalog/[slug]/ProductDetailClient.tsx',
  ]

  componentsToCheck.forEach(componentPath => {
    const fullPath = join(__dirname, componentPath)
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf-8')
      if (!content.includes('getPublicImageUrl') && content.includes('imageUrl')) {
        warnings.push(`${componentPath} may not be using getPublicImageUrl`)
      }
    }
  })
  console.log('   ✅ ImageUrl utility found')
}

// Test 3: Check coming-soon fallback
console.log('3. Checking fallback image...')
const fallbackPath = join(__dirname, 'public', 'coming-soon.png')
if (!existsSync(fallbackPath)) {
  warnings.push('Missing fallback image: public/coming-soon.png')
} else {
  console.log('   ✅ Fallback image found')
}

// Test 4: Check catalog page dynamic export
console.log('4. Checking catalog page dynamic export...')
const catalogPagePath = join(__dirname, 'app', 'catalog', 'page.tsx')
if (existsSync(catalogPagePath)) {
  const content = readFileSync(catalogPagePath, 'utf-8')
  if (!content.includes("export const dynamic")) {
    warnings.push('Catalog page missing dynamic export')
  } else {
    console.log('   ✅ Catalog page has dynamic export')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All editor preview tests passed!')
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

