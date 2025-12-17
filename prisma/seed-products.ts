import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { toSlug } from '../lib/slug'

const prisma = new PrismaClient()

// Parse product image JSON from CSV
function parseImageUrl(imageStr: string | undefined): string | null {
  if (!imageStr || imageStr === '') return null
  try {
    // Handle Python dict format: {'url':'...','size':...}
    const cleaned = imageStr.replace(/'/g, '"')
    const parsed = JSON.parse(cleaned)
    return parsed.url || null
  } catch (e) {
    return null
  }
}

export async function seedProducts() {
  console.log('🌱 Seeding products from CSV...')

  const csvPath = './data/products.csv'
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Products CSV not found at: ${csvPath}`)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`📊 Found ${records.length} products in CSV`)

  // Load all categories and brands for lookup
  const categories = await prisma.category.findMany()
  const brands = await prisma.brand.findMany()

  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
  const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]))

  let created = 0
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const record of records) {
    const name = record['Product Name']?.trim() || record.name?.trim() || record.Name?.trim()
    const productId = record.ID?.trim() || record.id?.trim() || record.Id?.trim()
    let sku = record['SKU#']?.trim()?.toUpperCase() || record.sku?.trim()?.toUpperCase() || record.SKU?.trim()?.toUpperCase()
    
    // Generate SKU from product ID if missing
    if (!sku && productId) {
      sku = `PROD-${productId.padStart(6, '0')}`.toUpperCase()
    }
    
    // Generate SKU from name slug if still missing
    if (!sku && name) {
      const nameSlug = toSlug(name).substring(0, 20).toUpperCase().replace(/-/g, '')
      sku = `GEN-${nameSlug}`.toUpperCase()
    }
    
    const categoryName = record.Category?.trim() || record.category?.trim() || record.categoryName?.trim()
    const brandName = record.Brand?.trim() || record.brand?.trim() || record.brandName?.trim()
    const priceValue = record['Sales Price'] || record.priceCase || record.price_case || record.price
    const unitsPerCase = record['Case Pack'] || record.unitsPerCase || record.units_per_case || record.units
    const description = record['SIze Descripton']?.trim() || record.description?.trim() || record.Description?.trim() || null
    const qtyOnHand = parseInt(record['QTY on hand'] || '0', 10) || 0
    const inStock = qtyOnHand > 0
    const featured = record['Front Page'] === 'TRUE' || record['Front Page New2'] === 'TRUE'
    const supplier = record.Supplier?.trim() || null
    const imageUrl = parseImageUrl(record['Product Image'])

    if (!name || !sku) {
      skipped++
      continue
    }

    // Lookup category (optional)
    const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) : null
    if (categoryName && !categoryId) {
      errors.push(`Product "${name}" (SKU: ${sku}): Category "${categoryName}" not found`)
      // Continue anyway - category is optional
    }

    // Lookup brand (optional)
    const brandId = brandName ? brandMap.get(brandName.toLowerCase()) : null
    if (brandName && !brandId) {
      errors.push(`Product "${name}" (SKU: ${sku}): Brand "${brandName}" not found`)
      // Continue anyway - brand is optional
    }

    // Parse numeric fields
    const priceValueParsed = priceValue ? parseFloat(String(priceValue)) : null
    const unitsPerCaseValue = unitsPerCase ? parseInt(String(unitsPerCase), 10) : 1

    if (!priceValueParsed || isNaN(priceValueParsed)) {
      errors.push(`Product "${name}" (SKU: ${sku}): Invalid price`)
      skipped++
      continue
    }

    try {
      // Use upsert to handle existing products
      const product = await prisma.product.upsert({
        where: { sku: sku.toUpperCase() },
        update: {
          name: name.trim(),
          description: description || null,
          price: priceValueParsed,
          unitsPerCase: unitsPerCaseValue || 1,
          categoryId: categoryId || null,
          brandId: brandId || null,
          inStock,
          featured,
          imageUrl: imageUrl || '',
          supplier: supplier || null,
        },
        create: {
          name: name.trim(),
          sku: sku.toUpperCase(),
          description: description || null,
          price: priceValueParsed,
          unitsPerCase: unitsPerCaseValue || 1,
          categoryId: categoryId || null,
          brandId: brandId || null,
          inStock,
          featured,
          imageUrl: imageUrl || '',
          supplier: supplier || null,
        },
      })

      // Check if this was a create or update
      if (product.createdAt.getTime() === product.updatedAt.getTime()) {
        created++
      } else {
        updated++
      }

      // Progress indicator
      if ((created + updated) % 50 === 0) {
        console.log(`  📦 Processed ${created + updated} products...`)
      }
    } catch (error: any) {
      errors.push(`Product "${name}" (SKU: ${sku}): ${error.message}`)
      skipped++
    }
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  Product seeding errors (${errors.length}):`)
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`))
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`)
    }
  }

  console.log(`\n✅ Products seeded: ${created} created, ${updated} updated, ${skipped} skipped`)
  return { created, updated, skipped, errors }
}

