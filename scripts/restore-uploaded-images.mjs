#!/usr/bin/env node

/**
 * Restore Uploaded Product Images
 *
 * This script restores the imageUrl in the database for products
 * that had real images uploaded (identified by timestamp filenames)
 *
 * Usage: node scripts/restore-uploaded-images.mjs
 */

import { PrismaClient } from '@prisma/client'
import { readdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// Mapping of filenames to product names/SKUs based on what we know
const knownMappings = {
  '1763867035027-adobada.png': { name: 'Adobada' },
  '1763844357424-7_up_250ml.png': { name: '7 Up 250ml' },
  '1763865369966-Barcel_Toreadas_170g.png': { name: 'Barcel Toreada Habanero 170g' },
  '1763865620781-Barcel_Chips_Jalapeno.png': { name: 'Barcel Chips Jalapeño 170g' },
  '1763865748579-Barcel_Chips_Fuego.png': { name: 'Barcel Chips Fuego 170g' },
  '1763865772035-Barcel_Chipotles.png': { name: 'Barcel Chipotles 65g' },
  '1763866085577-ValleDurazno.png': { name: 'Del Valle Durazno 413ml.' },
  '1763866096541-ValleMango.png': { name: 'Del Valle Mango 413ml' },
  '1763866111654-ValleManzana.png': { name: 'Del Valle Manzana 413ml.' },
  '1763865980589-368.png': { sku: 'PROD-000368' }, // Chipileta Naranja
  '1763866015820-367.png': { sku: 'PROD-000367' }, // Alvbro Pollito Asado
  // Unknown image - needs manual mapping:
  // '1763493466982-30.png': { name: 'PRODUCT_NAME_HERE' },
}

async function main() {
  console.log('🔄 Restoring uploaded product images...\n')

  try {
    // Find all timestamp-based images
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    const files = readdirSync(uploadsDir)
    const timestampImages = files.filter(f => /^176\d{10}-.+\.png$/.test(f))

    console.log(`📁 Found ${timestampImages.length} uploaded images\n`)

    let restored = 0
    let notFound = 0

    for (const filename of timestampImages) {
      const imageUrl = `/uploads/products/${filename}`
      const mapping = knownMappings[filename]

      if (!mapping) {
        console.log(`⚠️  No mapping found for: ${filename}`)
        notFound++
        continue
      }

      try {
        let product

        if (mapping.sku) {
          // Try SKU match
          product = await prisma.product.findFirst({
            where: { sku: mapping.sku }
          })
        } else if (mapping.name) {
          // Try exact match first
          product = await prisma.product.findFirst({
            where: { name: { equals: mapping.name, mode: 'insensitive' } }
          })
        }

        if (!product && mapping.search) {
          // Try regex search
          product = await prisma.product.findFirst({
            where: { name: { contains: mapping.search.replace('.*', ''), mode: 'insensitive' } }
          })
        }

        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl }
          })
          console.log(`✅ Restored: ${product.name} → ${filename}`)
          restored++
        } else {
          console.log(`❌ Product not found for: ${filename}`)
          notFound++
        }
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message)
        notFound++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Restored: ${restored}`)
    console.log(`   ❌ Not found: ${notFound}`)
    console.log(`   📁 Total images: ${timestampImages.length}`)

    if (notFound > 0) {
      console.log(`\n💡 For unmapped images, you can:`)
      console.log(`   1. Update the knownMappings in this script`)
      console.log(`   2. Re-upload via admin UI at /admin/products`)
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
