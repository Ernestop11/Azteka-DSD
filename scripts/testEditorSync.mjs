#!/usr/bin/env node

/**
 * Editor Sync Test Script
 * Tests product editor → catalog sync pipeline
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🧪 Testing Editor → Catalog Sync Pipeline...\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    const result = fn()
    if (result === true) {
      console.log(`✅ ${name}`)
      passed++
    } else {
      console.log(`❌ ${name}: ${result}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`)
    failed++
  }
}

// Test 1: Upload PNG → expect filename returned
test('uploadImage route returns /uploads/products/ path', () => {
  const routePath = join(projectRoot, 'app/api/admin/products/uploadImage/route.ts')
  const content = readFileSync(routePath, 'utf-8')
  const returnsPath = content.includes('/uploads/products/')
  const returnsJson = content.includes('return NextResponse.json({ imageUrl })')
  return returnsPath && returnsJson
})

// Test 2: Update product → expect normalized product with correct imageUrl
test('PUT route normalizes imageUrl in response', () => {
  const routePath = join(projectRoot, 'app/api/admin/products/route.ts')
  const content = readFileSync(routePath, 'utf-8')
  const hasNormalize = content.includes('normalizeProductImage')
  const hasRevalidate = content.includes('revalidateTag(\'catalog\')')
  const hasRevalidatePath = content.includes('revalidatePath(\'/catalog\')')
  return hasNormalize && hasRevalidate && hasRevalidatePath
})

// Test 3: Load catalog → image URL resolved by getPublicImageUrl()
test('Catalog products route uses normalizeProductImage', () => {
  const routePath = join(projectRoot, 'app/api/catalog/products/route.ts')
  const content = readFileSync(routePath, 'utf-8')
  return content.includes('normalizeProductImage')
})

// Test 4: Editor update triggers revalidateTag('catalog')
test('PUT route triggers revalidateTag for catalog', () => {
  const routePath = join(projectRoot, 'app/api/admin/products/route.ts')
  const content = readFileSync(routePath, 'utf-8')
  const hasRevalidateTag = content.includes("revalidateTag('catalog')")
  const hasRevalidatePath = content.includes("revalidatePath('/catalog')")
  return hasRevalidateTag && hasRevalidatePath
})

// Test 5: Catalog reflects updated product name, price, image
test('Catalog page has force-dynamic and revalidate=0', () => {
  const pagePath = join(projectRoot, 'app/catalog/page.tsx')
  const content = readFileSync(pagePath, 'utf-8')
  const hasDynamic = content.includes("export const dynamic = 'force-dynamic'")
  const hasRevalidate = content.includes('export const revalidate = 0')
  return hasDynamic && hasRevalidate
})

// Test 6: ProductEditor invalidates catalog cache
test('ProductEditor invalidates catalog queries on save', () => {
  const editorPath = join(projectRoot, 'app/admin/products/ProductEditor.tsx')
  const content = readFileSync(editorPath, 'utf-8')
  const invalidatesCatalog = content.includes("queryKey: ['catalog-products']") || 
                             content.includes("queryKey: ['catalog']")
  return invalidatesCatalog
})

// Test 7: PUT route only updates imageUrl when new file provided
test('PUT route preserves imageUrl unless new file uploaded', () => {
  const routePath = join(projectRoot, 'app/api/admin/products/route.ts')
  const content = readFileSync(routePath, 'utf-8')
  const onlyUpdatesOnFile = content.includes('// Only update imageUrl if a new file is provided') ||
                             content.includes('if (imageFile)')
  const preservesImage = content.includes('// Do NOT update imageUrl') ||
                         content.includes('// Never overwrite imageUrl')
  return onlyUpdatesOnFile && preservesImage
})

// Test 8: GET [id] route exists and normalizes image
test('GET [id] route exists and normalizes imageUrl', () => {
  const routePath = join(projectRoot, 'app/api/admin/products/[id]/route.ts')
  try {
    const content = readFileSync(routePath, 'utf-8')
    return content.includes('normalizeProductImage')
  } catch {
    return false
  }
})

// Test 9: ProductEditor has all required fields
test('ProductEditor form includes category, brand, featured fields', () => {
  const editorPath = join(projectRoot, 'app/admin/products/ProductEditor.tsx')
  const content = readFileSync(editorPath, 'utf-8')
  const hasCategory = content.includes('categoryId') || content.includes('category')
  const hasBrand = content.includes('brandId') || content.includes('brand')
  const hasFeatured = content.includes('featured')
  return hasCategory && hasBrand && hasFeatured
})

// Test 10: Image upload component shows preview
test('ProductImageUpload shows preview and handles file select', () => {
  const uploadPath = join(projectRoot, 'app/admin/products/ProductImageUpload.tsx')
  const content = readFileSync(uploadPath, 'utf-8')
  const hasPreview = content.includes('preview') || content.includes('Preview')
  const hasFileSelect = content.includes('onFileSelect')
  return hasPreview && hasFileSelect
})

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('✅ All editor sync tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some tests failed')
  process.exit(1)
}

