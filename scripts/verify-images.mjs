#!/usr/bin/env node

/**
 * Verify Product Images
 *
 * Checks that all products have valid images in the database and filesystem
 *
 * Usage: node scripts/verify-images.mjs
 */

import { PrismaClient } from '@prisma/client'
import { existsSync, statSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying product images...\n')

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        imageUrl: true,
      },
    })

    console.log(`📦 Checking ${products.length} products...\n`)

    let stats = {
      total: products.length,
      hasImageUrl: 0,
      fileExists: 0,
      missingFile: 0,
      missingUrl: 0,
      validImages: 0,
      totalSize: 0,
    }

    const issues = []

    for (const product of products) {
      // Check if imageUrl is set
      if (!product.imageUrl || product.imageUrl === '') {
        stats.missingUrl++
        issues.push({
          product: product.name,
          sku: product.sku,
          issue: 'Missing imageUrl in database',
        })
        continue
      }

      stats.hasImageUrl++

      // Check if file exists
      const filepath = join(process.cwd(), 'public', product.imageUrl.replace(/^\//, ''))

      if (!existsSync(filepath)) {
        stats.missingFile++
        issues.push({
          product: product.name,
          sku: product.sku,
          issue: `File not found: ${filepath}`,
        })
        continue
      }

      stats.fileExists++

      // Check file size
      try {
        const fileStats = statSync(filepath)
        stats.totalSize += fileStats.size

        // Consider valid if file is larger than 100 bytes (not just a 1x1 placeholder)
        if (fileStats.size > 100) {
          stats.validImages++
        } else {
          issues.push({
            product: product.name,
            sku: product.sku,
            issue: `Image too small (${fileStats.size} bytes) - likely a 1x1 placeholder`,
          })
        }
      } catch (error) {
        issues.push({
          product: product.name,
          sku: product.sku,
          issue: `Error reading file: ${error.message}`,
        })
      }
    }

    // Display statistics
    console.log('📊 Statistics:')
    console.log(`   Total products: ${stats.total}`)
    console.log(`   Has imageUrl: ${stats.hasImageUrl} (${((stats.hasImageUrl/stats.total)*100).toFixed(1)}%)`)
    console.log(`   File exists: ${stats.fileExists} (${((stats.fileExists/stats.total)*100).toFixed(1)}%)`)
    console.log(`   Valid images (>100 bytes): ${stats.validImages} (${((stats.validImages/stats.total)*100).toFixed(1)}%)`)
    console.log(`   Missing imageUrl: ${stats.missingUrl}`)
    console.log(`   Missing files: ${stats.missingFile}`)
    console.log(`   Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Average size: ${(stats.totalSize / stats.fileExists / 1024).toFixed(2)} KB\n`)

    // Display issues
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues:\n`)
      issues.slice(0, 10).forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue.product} (${issue.sku})`)
        console.log(`      ${issue.issue}\n`)
      })

      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more issues\n`)
      }

      console.log('💡 To fix issues, run:')
      console.log('   npm run db:seed-images\n')
    } else {
      console.log('✅ All products have valid images!\n')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
