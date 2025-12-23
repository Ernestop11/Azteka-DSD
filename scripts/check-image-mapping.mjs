#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    // Check a product with image
    const productWithImage = await prisma.product.findFirst({
      where: {
        imageUrl: { not: null },
        AND: { imageUrl: { not: '' } }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      }
    })
    
    if (productWithImage) {
      console.log('Product with image:')
      console.log('  ID:', productWithImage.id)
      console.log('  Name:', productWithImage.name)
      console.log('  ImageUrl:', productWithImage.imageUrl)
      const filename = productWithImage.imageUrl.split('/').pop()
      console.log('  Filename from URL:', filename)
      console.log('  Expected filename (ID.png):', productWithImage.id + '.png')
      console.log('  Match:', filename === productWithImage.id + '.png' ? '✅' : '❌ MISMATCH')
    }
    
    // Check new products without images
    const newProducts = await prisma.product.findMany({
      where: {
        sku: { startsWith: 'NEW-SKU' }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        imageUrl: true,
      }
    })
    
    console.log('\nNew products (first 5):')
    for (const p of newProducts) {
      const expectedFile = join(process.cwd(), 'public', 'uploads', 'products', `${p.id}.png`)
      const fileExists = existsSync(expectedFile)
      console.log(`  ${p.name} (${p.sku})`)
      console.log(`    ID: ${p.id}`)
      console.log(`    ImageUrl: ${p.imageUrl || 'NULL'}`)
      console.log(`    Expected file: ${p.id}.png`)
      console.log(`    File exists: ${fileExists ? '✅' : '❌'}`)
    }
    
    // Check if any images were uploaded recently
    const recentUploads = await prisma.product.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Last 3 days
        },
        imageUrl: { not: null }
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        updatedAt: true,
      }
    })
    
    console.log('\nProducts updated in last 3 days with images:')
    console.log('  Count:', recentUploads.length)
    if (recentUploads.length > 0) {
      recentUploads.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name}: ${p.imageUrl} (updated: ${p.updatedAt})`)
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



