#!/usr/bin/env node

/**
 * Seed Product Images Script
 * 
 * Creates placeholder PNG images for products that don't have images yet.
 * Images are saved to /public/uploads/products/<productId>.png
 * 
 * Usage: node scripts/seed-product-images.mjs
 */

import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// Create a simple colored PNG (1x1 pixel, then we'll use CSS to scale it)
// For a real placeholder, we'd use a library like sharp or canvas
// For now, we'll create a minimal valid PNG

// Minimal valid 1x1 red PNG (base64)
const RED_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Minimal valid 1x1 blue PNG
const BLUE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

// Minimal valid 1x1 green PNG
const GREEN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Create a colored placeholder based on product index
function getPlaceholderColor(index) {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52BE80', // Green
  ]
  return colors[index % colors.length]
}

// Create a simple SVG placeholder and convert to PNG data URL concept
// For MVP, we'll create actual placeholder files using a simple approach
async function createPlaceholderImage(productId, color, outputPath) {
  // Create a simple colored square as SVG, then we'll need to convert
  // For now, just create a minimal PNG with the color
  
  // Use a simple approach: create a data URL style image
  // Since we can't easily create PNGs without a library, we'll use the existing coming-soon.png
  // OR create a simple colored square using canvas-like approach
  
  // For MVP: Just copy coming-soon.png or create a simple file
  // The real fix is to ensure products have imageUrl set in DB pointing to actual files
  
  // For now, create a simple text file that indicates the color
  // In production, you'd use sharp or canvas to create actual PNGs
  console.log(`Would create placeholder for ${productId} with color ${color} at ${outputPath}`)
  
  // Actually, let's just ensure the directory exists and log what needs to be done
  return true
}

async function main() {
  console.log('🌱 Seeding product images...\n')

  try {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log('✅ Created uploads directory')
    }

    // Fetch all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        imageUrl: true,
        backgroundColor: true,
        backgroundGradient: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📦 Found ${products.length} products\n`)

    let created = 0
    let skipped = 0
    let updated = 0

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const filename = `${product.id}.png`
      const filepath = join(uploadsDir, filename)
      const imageUrl = `/uploads/products/${filename}`

      // Check if image already exists
      if (existsSync(filepath)) {
        skipped++
        continue
      }

      // Check if product already has imageUrl in DB
      if (product.imageUrl && product.imageUrl !== '/coming-soon.png' && product.imageUrl.includes('/uploads/products/')) {
        skipped++
        continue
      }

      // Create placeholder (for MVP, we'll just update the DB)
      // In production, you'd create an actual PNG file here
      // For now, we'll update the DB to point to the expected path
      // The actual image file creation would require sharp or canvas library
      
      try {
        // Update product to have imageUrl pointing to expected path
        // Use raw SQL to avoid schema validation issues
        await prisma.$executeRaw`
          UPDATE "Product" 
          SET "imageUrl" = ${imageUrl}
          WHERE id = ${product.id}
        `
        
        // Create a simple placeholder file (1x1 transparent PNG)
        // In production, use sharp to create actual colored images
        await writeFile(filepath, RED_PNG)
        
        created++
        if (created % 50 === 0) {
          console.log(`   Progress: ${created} images created...`)
        }
      } catch (error) {
        console.error(`❌ Error creating placeholder for ${product.name}:`, error.message)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Created: ${created}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Updated: ${updated}`)
    console.log(`\n✅ Image seeding complete!`)
    console.log(`\n💡 Note: Placeholder images are minimal 1x1 PNGs.`)
    console.log(`   For production, use sharp or canvas to create actual product images.`)
    console.log(`   Or upload real images via the product editor at /admin/products`)

  } catch (error) {
    console.error('❌ Error seeding images:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

