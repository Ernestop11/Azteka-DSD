#!/usr/bin/env node

/**
 * Improved Product Images Seeding Script
 *
 * Creates proper placeholder images with product names and colors
 * Uses sharp library to generate actual PNG images
 *
 * Usage: node scripts/seed-images-improved.mjs
 */

import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// Color palette for different categories
const categoryColors = {
  beverages: { bg: '#2563eb', text: '#ffffff' },
  snacks: { bg: '#dc2626', text: '#ffffff' },
  candy: { bg: '#7c3aed', text: '#ffffff' },
  cookies: { bg: '#ea580c', text: '#ffffff' },
  coffee: { bg: '#78350f', text: '#ffffff' },
  chips: { bg: '#f59e0b', text: '#ffffff' },
  soda: { bg: '#0ea5e9', text: '#ffffff' },
  water: { bg: '#06b6d4', text: '#ffffff' },
  juice: { bg: '#8b5cf6', text: '#ffffff' },
  default: { bg: '#6b7280', text: '#ffffff' },
}

// Get color based on product name and category
function getColorForProduct(product, index) {
  const name = (product.name || '').toLowerCase()
  const categoryName = (product.category?.name || '').toLowerCase()

  // Try to match category
  for (const [key, colors] of Object.entries(categoryColors)) {
    if (categoryName.includes(key) || name.includes(key)) {
      return colors
    }
  }

  // Fallback to rotating colors
  const colorKeys = Object.keys(categoryColors).filter(k => k !== 'default')
  const colorKey = colorKeys[index % colorKeys.length]
  return categoryColors[colorKey]
}

// Create an SVG placeholder image
function createSVG(text, bgColor, textColor, width = 400, height = 400) {
  // Truncate text if too long
  const displayText = text.length > 30 ? text.substring(0, 27) + '...' : text

  // Split text into multiple lines if needed
  const words = displayText.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length > 20 && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  // Calculate positions
  const lineHeight = 30
  const totalHeight = lines.length * lineHeight
  const startY = (height - totalHeight) / 2 + 20

  // Build SVG
  let textElements = lines.map((line, i) => {
    const y = startY + (i * lineHeight)
    return `<text x="50%" y="${y}" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`
  }).join('\n    ')

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${textElements}
      <circle cx="50%" cy="85%" r="40" fill="${textColor}" opacity="0.1"/>
    </svg>
  `.trim()
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Create placeholder image using sharp
async function createPlaceholderImage(product, outputPath, index) {
  try {
    const colors = getColorForProduct(product, index)
    const svg = createSVG(product.name, colors.bg, colors.text)

    await sharp(Buffer.from(svg))
      .resize(400, 400)
      .png()
      .toFile(outputPath)

    return true
  } catch (error) {
    console.error(`   ❌ Error creating image for ${product.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🎨 Creating improved product placeholder images...\n')

  try {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log('✅ Created uploads directory')
    }

    // Fetch all products with their categories
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    console.log(`📦 Found ${products.length} products\n`)

    let created = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < products.length; i++) {
      const product = products[i]

      // IMPORTANT: Skip products that have real uploaded images (timestamp-based filenames)
      if (product.imageUrl && product.imageUrl.match(/\/uploads\/products\/176\d{10}-/)) {
        console.log(`   ⏭️  Skipping ${product.name} (has real uploaded image)`)
        skipped++
        continue
      }

      const filename = `${product.id}.png`
      const filepath = join(uploadsDir, filename)
      const imageUrl = `/uploads/products/${filename}`

      // Only recreate if explicitly needed (set to false to avoid overwriting)
      const forceRecreate = false

      if (existsSync(filepath) && !forceRecreate) {
        skipped++
        continue
      }

      // Create the placeholder image
      const success = await createPlaceholderImage(product, filepath, i)

      if (success) {
        // Update database to ensure imageUrl is set
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl },
        })

        created++

        if (created % 50 === 0) {
          console.log(`   Progress: ${created} images created...`)
        }
      } else {
        errors++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Created: ${created}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`\n✨ Image seeding complete!`)
    console.log(`\n💡 All products now have colorful placeholder images with their names.`)
    console.log(`   You can replace them with real images via /admin/products`)

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
