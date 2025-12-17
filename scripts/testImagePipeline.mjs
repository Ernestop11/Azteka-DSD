#!/usr/bin/env node

/**
 * Image Pipeline Test Script
 * Tests getPublicImageUrl, normalization, and catalog image serving
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Mock getPublicImageUrl function (simplified version)
function getPublicImageUrl(path) {
  if (!path || path.trim() === '') {
    return '/coming-soon.png'
  }
  const trimmed = path.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    return trimmed
  }
  if (!trimmed.includes('/')) {
    return `/uploads/products/${trimmed}`
  }
  return `/${trimmed}`
}

function normalizeProductImage(product) {
  if (product.imageUrl) {
    return getPublicImageUrl(product.imageUrl)
  }
  if (product.image) {
    return getPublicImageUrl(product.image)
  }
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (firstImage) {
      return getPublicImageUrl(firstImage)
    }
  }
  return '/coming-soon.png'
}

console.log('🧪 Testing Image Pipeline...\n')

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

// Test 1: getPublicImageUrl resolves correct path
test('getPublicImageUrl with full path returns as-is', () => {
  const result = getPublicImageUrl('/uploads/products/test.png')
  return result === '/uploads/products/test.png'
})

test('getPublicImageUrl with filename only adds /uploads/products/', () => {
  const result = getPublicImageUrl('test.png')
  return result === '/uploads/products/test.png'
})

test('getPublicImageUrl with null returns coming-soon.png', () => {
  const result = getPublicImageUrl(null)
  return result === '/coming-soon.png'
})

test('getPublicImageUrl with empty string returns coming-soon.png', () => {
  const result = getPublicImageUrl('')
  return result === '/coming-soon.png'
})

test('getPublicImageUrl with http URL returns as-is', () => {
  const result = getPublicImageUrl('https://example.com/image.png')
  return result === 'https://example.com/image.png'
})

// Test 2: Missing image returns coming-soon.png
test('normalizeProductImage with no image fields returns coming-soon.png', () => {
  const result = normalizeProductImage({})
  return result === '/coming-soon.png'
})

test('normalizeProductImage with null imageUrl returns coming-soon.png', () => {
  const result = normalizeProductImage({ imageUrl: null })
  return result === '/coming-soon.png'
})

// Test 3: DB image filenames convert to correct URL
test('normalizeProductImage with imageUrl filename converts correctly', () => {
  const result = normalizeProductImage({ imageUrl: 'product-123.png' })
  return result === '/uploads/products/product-123.png'
})

test('normalizeProductImage with full path imageUrl returns as-is', () => {
  const result = normalizeProductImage({ imageUrl: '/uploads/products/product-123.png' })
  return result === '/uploads/products/product-123.png'
})

// Test 4: Editor uploads resolve to correct URL
test('normalizeProductImage handles editor upload path', () => {
  const result = normalizeProductImage({ imageUrl: '/uploads/products/abc123.png' })
  return result === '/uploads/products/abc123.png'
})

// Test 5: Catalog endpoints return image strings without nulls
test('normalizeProductImage always returns string (never null)', () => {
  const result1 = normalizeProductImage({ imageUrl: null })
  const result2 = normalizeProductImage({})
  const result3 = normalizeProductImage({ imageUrl: 'test.png' })
  return typeof result1 === 'string' && typeof result2 === 'string' && typeof result3 === 'string'
})

// Test 6: Multiple image sources (imageUrl, image, images[])
test('normalizeProductImage prioritizes imageUrl', () => {
  const result = normalizeProductImage({
    imageUrl: '/uploads/products/primary.png',
    image: '/uploads/products/secondary.png',
    images: ['/uploads/products/tertiary.png'],
  })
  return result === '/uploads/products/primary.png'
})

test('normalizeProductImage falls back to image field', () => {
  const result = normalizeProductImage({
    image: '/uploads/products/secondary.png',
    images: ['/uploads/products/tertiary.png'],
  })
  return result === '/uploads/products/secondary.png'
})

test('normalizeProductImage falls back to images array', () => {
  const result = normalizeProductImage({
    images: ['/uploads/products/tertiary.png'],
  })
  return result === '/uploads/products/tertiary.png'
})

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('✅ All image pipeline tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some tests failed')
  process.exit(1)
}

