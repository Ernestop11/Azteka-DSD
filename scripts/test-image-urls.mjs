#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { normalizeProductImage } from '../lib/imageUrl.js'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    // Test products that should have images
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: '7 Up' } },
          { name: { contains: 'Adobada Botanota' } },
          { name: { contains: 'Alpura Vaquita Chocolate' } },
        ]
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      }
    })
    
    console.log('Testing image URL normalization:')
    console.log('='.repeat(60))
    
    for (const product of testProducts) {
      console.log(`\nProduct: ${product.name}`)
      console.log(`  DB imageUrl: ${product.imageUrl || 'NULL'}`)
      const normalized = normalizeProductImage({ imageUrl: product.imageUrl })
      console.log(`  Normalized: ${normalized}`)
      console.log(`  Should show image: ${!normalized.includes('coming-soon') && !normalized.includes('placeholder')}`)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()




