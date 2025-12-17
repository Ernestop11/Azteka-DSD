#!/usr/bin/env node

/**
 * Prisma Relations Test Script
 * Validates brandId and categoryId relations in the database
 */

import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const prisma = new PrismaClient()

const errors = []
const warnings = []

async function testRelations() {
  console.log('🔍 Testing Prisma relations...\n')

  try {
    // Test 1: Check Product.brandId relation
    console.log('1. Testing Product.brandId relation...')
    const productsWithBrands = await prisma.product.findMany({
      where: { brandId: { not: null } },
      include: { brand: true },
      take: 10,
    })

    const invalidBrands = productsWithBrands.filter(p => !p.brand)
    if (invalidBrands.length > 0) {
      errors.push(`Found ${invalidBrands.length} products with invalid brandId`)
      invalidBrands.forEach(p => {
        errors.push(`  - Product ${p.id} (${p.name}) has brandId ${p.brandId} but brand not found`)
      })
    } else {
      console.log('   ✅ All product brand relations valid')
    }

    // Test 2: Check Product.categoryId relation
    console.log('2. Testing Product.categoryId relation...')
    const productsWithCategories = await prisma.product.findMany({
      where: { categoryId: { not: null } },
      include: { category: true },
      take: 10,
    })

    const invalidCategories = productsWithCategories.filter(p => !p.category)
    if (invalidCategories.length > 0) {
      errors.push(`Found ${invalidCategories.length} products with invalid categoryId`)
      invalidCategories.forEach(p => {
        errors.push(`  - Product ${p.id} (${p.name}) has categoryId ${p.categoryId} but category not found`)
      })
    } else {
      console.log('   ✅ All product category relations valid')
    }

    // Test 3: Check Brand.products relation
    console.log('3. Testing Brand.products relation...')
    const brands = await prisma.brand.findMany({
      include: { products: true },
      take: 10,
    })

    brands.forEach(brand => {
      const productsWithThisBrand = await prisma.product.findMany({
        where: { brandId: brand.id },
      })
      if (brand.products.length !== productsWithThisBrand.length) {
        warnings.push(`Brand ${brand.name} has ${brand.products.length} products in relation but ${productsWithThisBrand.length} in database`)
      }
    })
    console.log('   ✅ Brand.products relations checked')

    // Test 4: Check Category.products relation
    console.log('4. Testing Category.products relation...')
    const categories = await prisma.category.findMany({
      include: { products: true },
      take: 10,
    })

    categories.forEach(category => {
      const productsWithThisCategory = await prisma.product.findMany({
        where: { categoryId: category.id },
      })
      if (category.products.length !== productsWithThisCategory.length) {
        warnings.push(`Category ${category.name} has ${category.products.length} products in relation but ${productsWithThisCategory.length} in database`)
      }
    })
    console.log('   ✅ Category.products relations checked')

    // Test 5: Check for orphaned products (no brand or category)
    console.log('5. Checking for orphaned products...')
    const orphanedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { brandId: null },
          { categoryId: null },
        ],
      },
      take: 10,
    })

    if (orphanedProducts.length > 0) {
      warnings.push(`Found ${orphanedProducts.length} products with no brand or category`)
    } else {
      console.log('   ✅ No orphaned products found')
    }

  } catch (error) {
    errors.push(`Database query failed: ${error.message}`)
    console.error('   ❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }

  // Report results
  console.log('\n📊 Test Results:')
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All relation tests passed!')
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
}

testRelations().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

