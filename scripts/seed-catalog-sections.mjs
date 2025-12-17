#!/usr/bin/env node
/**
 * Seed Catalog Sections
 *
 * This script creates initial catalog sections and populates them with products
 * based on categories and brands from the database.
 *
 * Usage: DATABASE_URL="..." node scripts/seed-catalog-sections.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SECTION_TYPES = {
  GROCERY: 'GROCERY',
  CHIPS: 'CHIPS',
  CANDY: 'CANDY',
  BEVERAGES: 'BEVERAGES',
  SEASONAL: 'SEASONAL',
  SPECIAL: 'SPECIAL',
  BUNDLES: 'BUNDLES',
  FEATURED: 'FEATURED',
  BAKERY: 'BAKERY',
  DAIRY: 'DAIRY',
  OTHER: 'OTHER',
}

async function main() {
  console.log('🚀 Starting catalog sections seeding...')

  // Get all products with their brands and categories
  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: {
      Brand: true,
      Category: true,
    },
    orderBy: { name: 'asc' },
  })

  console.log(`📦 Found ${products.length} products`)

  // Get all brands
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  console.log(`🏷️ Found ${brands.length} brands, ${categories.length} categories`)

  // Delete existing sections (clean slate)
  console.log('🧹 Clearing existing sections...')
  await prisma.catalogSectionItem.deleteMany()
  await prisma.catalogSection.deleteMany()

  let position = 0

  // 1. Create HERO section - "Weekend Specials" with featured products
  const featuredProducts = products.filter(p => p.featured).slice(0, 6)
  if (featuredProducts.length > 0) {
    console.log(`✨ Creating Weekend Specials hero section (${featuredProducts.length} products)`)
    const weekendSection = await prisma.catalogSection.create({
      data: {
        name: 'Weekend Specials',
        description: 'Exclusive deals for this weekend only!',
        type: SECTION_TYPES.SPECIAL,
        hero: true,
        position: position++,
        badgeText: 'LIMITED TIME',
        badgeColor: '#ef4444',
        active: true,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: featuredProducts.map((product, idx) => ({
        sectionId: weekendSection.id,
        productId: product.id,
        displayOrder: idx,
        featured: true,
      })),
    })
  }

  // 2. Create sections for major brands
  const majorBrands = ['Sabritas', 'Barcel', 'Gamesa', 'Bimbo', 'La Molienda', 'Marinela']

  for (const brandName of majorBrands) {
    const brand = brands.find(b => b.name.toLowerCase().includes(brandName.toLowerCase()))
    if (!brand) continue

    const brandProducts = products.filter(p => p.brandId === brand.id).slice(0, 24)
    if (brandProducts.length === 0) continue

    console.log(`🏪 Creating section for ${brand.name} (${brandProducts.length} products)`)

    // Determine section type based on brand
    let sectionType = SECTION_TYPES.GROCERY
    if (['Sabritas', 'Barcel'].includes(brandName)) sectionType = SECTION_TYPES.CHIPS
    if (['Marinela', 'Gamesa'].includes(brandName)) sectionType = SECTION_TYPES.BAKERY

    const section = await prisma.catalogSection.create({
      data: {
        name: brand.name,
        description: `Premium products from ${brand.name}`,
        type: sectionType,
        hero: false,
        position: position++,
        badgeText: brandProducts.length > 10 ? 'BESTSELLER' : null,
        badgeColor: '#10b981',
        active: true,
        imageUrl: brand.logoUrl || null,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: brandProducts.map((product, idx) => ({
        sectionId: section.id,
        productId: product.id,
        displayOrder: idx,
        featured: product.featured || false,
      })),
    })
  }

  // 3. Create sections for categories
  const categoryMappings = [
    { name: 'Chips & Snacks', keywords: ['chip', 'snack', 'botana'], type: SECTION_TYPES.CHIPS },
    { name: 'Candy & Sweets', keywords: ['candy', 'dulce', 'chocolate'], type: SECTION_TYPES.CANDY },
    { name: 'Beverages', keywords: ['beverage', 'drink', 'bebida', 'juice', 'agua'], type: SECTION_TYPES.BEVERAGES },
    { name: 'Bakery', keywords: ['bread', 'pan', 'bake', 'cookie'], type: SECTION_TYPES.BAKERY },
  ]

  for (const mapping of categoryMappings) {
    const matchingCategories = categories.filter(c =>
      mapping.keywords.some(kw => c.name.toLowerCase().includes(kw))
    )

    if (matchingCategories.length === 0) continue

    const categoryIds = matchingCategories.map(c => c.id)
    const categoryProducts = products
      .filter(p => p.categoryId && categoryIds.includes(p.categoryId))
      .slice(0, 30)

    if (categoryProducts.length === 0) continue

    console.log(`📂 Creating section for ${mapping.name} (${categoryProducts.length} products)`)

    const section = await prisma.catalogSection.create({
      data: {
        name: mapping.name,
        description: `Browse our ${mapping.name.toLowerCase()} collection`,
        type: mapping.type,
        hero: false,
        position: position++,
        active: true,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: categoryProducts.map((product, idx) => ({
        sectionId: section.id,
        productId: product.id,
        displayOrder: idx,
        featured: product.featured || false,
      })),
    })
  }

  // 4. Create "New Arrivals" section with seasonal products
  const seasonalProducts = products.filter(p => p.seasonal).slice(0, 12)
  if (seasonalProducts.length > 0) {
    console.log(`🌸 Creating Seasonal section (${seasonalProducts.length} products)`)
    const seasonalSection = await prisma.catalogSection.create({
      data: {
        name: 'Seasonal Favorites',
        description: 'Limited edition seasonal products',
        type: SECTION_TYPES.SEASONAL,
        hero: false,
        position: position++,
        badgeText: 'SEASONAL',
        badgeColor: '#8b5cf6',
        active: true,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: seasonalProducts.map((product, idx) => ({
        sectionId: seasonalSection.id,
        productId: product.id,
        displayOrder: idx,
        featured: true,
      })),
    })
  }

  // 5. Create "Trending Now" section
  const trendingProducts = products.filter(p => p.trending).slice(0, 12)
  if (trendingProducts.length > 0) {
    console.log(`🔥 Creating Trending section (${trendingProducts.length} products)`)
    const trendingSection = await prisma.catalogSection.create({
      data: {
        name: 'Trending Now',
        description: 'What everyone is buying right now',
        type: SECTION_TYPES.FEATURED,
        hero: false,
        position: position++,
        badgeText: 'HOT',
        badgeColor: '#f59e0b',
        active: true,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: trendingProducts.map((product, idx) => ({
        sectionId: trendingSection.id,
        productId: product.id,
        displayOrder: idx,
        featured: true,
      })),
    })
  }

  // 6. Create catch-all "All Products" section with remaining products
  const assignedProductIds = new Set()
  const allSections = await prisma.catalogSection.findMany({
    include: { items: true },
  })

  for (const section of allSections) {
    for (const item of section.items) {
      assignedProductIds.add(item.productId)
    }
  }

  const unassignedProducts = products.filter(p => !assignedProductIds.has(p.id)).slice(0, 50)
  if (unassignedProducts.length > 0) {
    console.log(`📋 Creating All Products section (${unassignedProducts.length} products)`)
    const allProductsSection = await prisma.catalogSection.create({
      data: {
        name: 'All Products',
        description: 'Browse our complete catalog',
        type: SECTION_TYPES.GROCERY,
        hero: false,
        position: position++,
        active: true,
      },
    })

    await prisma.catalogSectionItem.createMany({
      data: unassignedProducts.map((product, idx) => ({
        sectionId: allProductsSection.id,
        productId: product.id,
        displayOrder: idx,
        featured: false,
      })),
    })
  }

  // Final stats
  const finalSections = await prisma.catalogSection.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { position: 'asc' },
  })

  console.log('\n✅ Seeding complete!')
  console.log('📊 Created sections:')
  for (const section of finalSections) {
    const heroTag = section.hero ? ' [HERO]' : ''
    console.log(`   ${section.position + 1}. ${section.name}${heroTag} - ${section._count.items} products`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    prisma.$disconnect()
    process.exit(1)
  })
