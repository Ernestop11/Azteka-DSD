#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.product.count()
    console.log(`Total products in database: ${count}`)
    
    const recent = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        sku: true,
        createdAt: true,
        imageUrl: true,
      }
    })
    
    console.log('\nMost recent 10 products:')
    recent.forEach((p, i) => {
      const hasImage = p.imageUrl ? '✅' : '❌'
      console.log(`${i + 1}. ${hasImage} ${p.name} (${p.sku}) - Created: ${p.createdAt}`)
    })
    
    const withImages = await prisma.product.count({
      where: {
        imageUrl: {
          not: null,
        },
        AND: {
          imageUrl: {
            not: '',
          },
        },
      },
    })
    
    console.log(`\nProducts with images: ${withImages} / ${count}`)
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()




