#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { readdir, stat, rename } from 'fs/promises'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    const files = await readdir(uploadsDir)
    const pngFiles = files.filter(f => f.endsWith('.png'))
    
    console.log(`Found ${pngFiles.length} PNG files`)
    console.log('Checking for filename mismatches...\n')
    
    let matched = 0
    let mismatched = 0
    const mismatches = []
    
    // Check products with images
    const productsWithImages = await prisma.product.findMany({
      where: {
        imageUrl: { not: null },
        AND: { imageUrl: { not: '' } }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
      take: 100
    })
    
    for (const product of productsWithImages) {
      const expectedFilename = `${product.id}.png`
      const imageUrl = product.imageUrl || ''
      const urlFilename = imageUrl.split('/').pop() || ''
      
      // Check if file exists with expected name
      const expectedPath = join(uploadsDir, expectedFilename)
      const fileExists = pngFiles.includes(expectedFilename)
      
      if (!fileExists && urlFilename !== expectedFilename) {
        // Try to find file by URL filename
        if (pngFiles.includes(urlFilename)) {
          mismatches.push({
            product: product.name,
            productId: product.id,
            expected: expectedFilename,
            actual: urlFilename,
            dbUrl: imageUrl
          })
          mismatched++
        }
      } else {
        matched++
      }
    }
    
    console.log(`✅ Matched: ${matched}`)
    console.log(`❌ Mismatched: ${mismatched}\n`)
    
    if (mismatches.length > 0) {
      console.log('Sample mismatches:')
      mismatches.slice(0, 5).forEach(m => {
        console.log(`  ${m.product}:`)
        console.log(`    Expected: ${m.expected}`)
        console.log(`    Actual: ${m.actual}`)
        console.log(`    DB URL: ${m.dbUrl}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



