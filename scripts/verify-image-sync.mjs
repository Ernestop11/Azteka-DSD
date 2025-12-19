#!/usr/bin/env node
/**
 * Image Sync Verification Script
 * 
 * Finds:
 * - Products with imageUrl but missing files
 * - Orphaned image files (files without product reference)
 * - Products with missing imageUrl but files exist
 * 
 * Usage: node scripts/verify-image-sync.mjs
 */

import { PrismaClient } from '@prisma/client'
import { existsSync, readdir } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function verifyImageSync() {
  console.log('🔍 Verifying image sync across system...\n')

  const uploadsDir = join(__dirname, '../public/uploads/products')
  
  if (!existsSync(uploadsDir)) {
    console.error('❌ Uploads directory not found:', uploadsDir)
    process.exit(1)
  }

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  console.log(`📦 Found ${products.length} products in database\n`)

  // Get all files in uploads directory
  const files = await readdir(uploadsDir)
  console.log(`📁 Found ${files.length} files in uploads directory\n`)

  // Track issues
  const issues = {
    missingFiles: [], // Product has imageUrl but file doesn't exist
    orphanedFiles: [], // File exists but no product references it
    missingUrl: [], // Product has no imageUrl but file might exist
    synced: []
  }

  // Check each product
  console.log('🔎 Checking products...\n')
  for (const product of products) {
    if (product.imageUrl) {
      // Extract filename from imageUrl
      const filename = product.imageUrl.replace('/uploads/products/', '')
      const filepath = join(uploadsDir, filename)
      
      if (existsSync(filepath)) {
        issues.synced.push({
          product: product.name,
          id: product.id,
          imageUrl: product.imageUrl,
          file: filename
        })
      } else {
        issues.missingFiles.push({
          product: product.name,
          id: product.id,
          sku: product.sku,
          imageUrl: product.imageUrl,
          expectedFile: filename
        })
      }
    } else {
      // Check if file exists for this product (by productId)
      const possibleFiles = files.filter(f => 
        f === `${product.id}.png` || 
        f.startsWith(`${product.id}-`) ||
        f.includes(product.id)
      )
      
      if (possibleFiles.length > 0) {
        issues.missingUrl.push({
          product: product.name,
          id: product.id,
          sku: product.sku,
          foundFiles: possibleFiles
        })
      }
    }
  }

  // Check for orphaned files
  console.log('🔎 Checking for orphaned files...\n')
  for (const file of files) {
    // Try to extract product ID from filename
    // Format 1: productId.png
    // Format 2: timestamp-filename.jpg
    let productId = null
    
    if (file.endsWith('.png') && !file.includes('-')) {
      // Likely productId.png format
      productId = file.replace('.png', '')
    } else if (file.includes('-')) {
      // Try to find product by checking if any part matches a product ID
      const parts = file.split('-')
      for (const part of parts) {
        const cleanPart = part.replace(/\.(png|jpg|jpeg)$/i, '')
        const product = products.find(p => p.id === cleanPart)
        if (product) {
          productId = cleanPart
          break
        }
      }
    }

    if (!productId) {
      // Check if file matches any product ID directly
      const fileWithoutExt = file.replace(/\.(png|jpg|jpeg)$/i, '')
      const product = products.find(p => p.id === fileWithoutExt)
      if (product) {
        productId = fileWithoutExt
      }
    }

    if (productId) {
      const product = products.find(p => p.id === productId)
      if (product && product.imageUrl) {
        const expectedFilename = product.imageUrl.replace('/uploads/products/', '')
        if (expectedFilename !== file) {
          // File exists but product points to different filename
          issues.orphanedFiles.push({
            file,
            productId,
            productName: product?.name || 'Unknown',
            productPointsTo: expectedFilename
          })
        }
      } else if (!product) {
        issues.orphanedFiles.push({
          file,
          productId: 'Unknown',
          productName: 'No product found',
          productPointsTo: null
        })
      }
    } else {
      // Can't determine product ID from filename
      issues.orphanedFiles.push({
        file,
        productId: 'Unknown',
        productName: 'Cannot determine product',
        productPointsTo: null
      })
    }
  }

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('📊 VERIFICATION RESULTS')
  console.log('='.repeat(60) + '\n')

  console.log(`✅ Synced: ${issues.synced.length} products`)
  if (issues.synced.length > 0 && issues.synced.length <= 10) {
    issues.synced.forEach(item => {
      console.log(`   ✓ ${item.product} (${item.file})`)
    })
  }

  console.log(`\n❌ Missing Files: ${issues.missingFiles.length} products`)
  if (issues.missingFiles.length > 0) {
    console.log('   Products with imageUrl but file missing:')
    issues.missingFiles.forEach(item => {
      console.log(`   - ${item.product} (SKU: ${item.sku})`)
      console.log(`     Expected: ${item.expectedFile}`)
      console.log(`     imageUrl: ${item.imageUrl}`)
    })
  }

  console.log(`\n⚠️  Missing URL: ${issues.missingUrl.length} products`)
  if (issues.missingUrl.length > 0) {
    console.log('   Products with no imageUrl but files exist:')
    issues.missingUrl.forEach(item => {
      console.log(`   - ${item.product} (SKU: ${item.sku})`)
      console.log(`     Found files: ${item.foundFiles.join(', ')}`)
      console.log(`     Fix: Update product.imageUrl to /uploads/products/${item.foundFiles[0]}`)
    })
  }

  console.log(`\n🗑️  Orphaned Files: ${issues.orphanedFiles.length} files`)
  if (issues.orphanedFiles.length > 0) {
    console.log('   Files that may not be referenced by any product:')
    issues.orphanedFiles.slice(0, 20).forEach(item => {
      console.log(`   - ${item.file}`)
      if (item.productName !== 'Unknown') {
        console.log(`     Product: ${item.productName}`)
      }
    })
    if (issues.orphanedFiles.length > 20) {
      console.log(`   ... and ${issues.orphanedFiles.length - 20} more`)
    }
  }

  // Check specifically for Alpura Vaquita products
  console.log('\n' + '='.repeat(60))
  console.log('🥛 ALPURA VAQUITA PRODUCTS CHECK')
  console.log('='.repeat(60) + '\n')

  const vaquitaProducts = products.filter(p => 
    p.name.toLowerCase().includes('vaquita') && 
    p.name.toLowerCase().includes('alpura')
  )

  if (vaquitaProducts.length === 0) {
    console.log('⚠️  No Alpura Vaquita products found in database')
  } else {
    console.log(`Found ${vaquitaProducts.length} Alpura Vaquita products:\n`)
    vaquitaProducts.forEach(product => {
      console.log(`📦 ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   SKU: ${product.sku}`)
      if (product.imageUrl) {
        const filename = product.imageUrl.replace('/uploads/products/', '')
        const filepath = join(uploadsDir, filename)
        if (existsSync(filepath)) {
          console.log(`   ✅ Image: ${product.imageUrl} (file exists)`)
        } else {
          console.log(`   ❌ Image: ${product.imageUrl} (FILE MISSING!)`)
        }
      } else {
        console.log(`   ⚠️  No imageUrl set`)
        // Check if file exists
        const possibleFiles = files.filter(f => 
          f === `${product.id}.png` || 
          f.startsWith(`${product.id}-`)
        )
        if (possibleFiles.length > 0) {
          console.log(`   💡 Found files: ${possibleFiles.join(', ')}`)
          console.log(`   💡 Fix: Update imageUrl to /uploads/products/${possibleFiles[0]}`)
        }
      }
      console.log('')
    })
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 SUMMARY')
  console.log('='.repeat(60) + '\n')
  console.log(`Total Products: ${products.length}`)
  console.log(`✅ Synced: ${issues.synced.length}`)
  console.log(`❌ Missing Files: ${issues.missingFiles.length}`)
  console.log(`⚠️  Missing URL: ${issues.missingUrl.length}`)
  console.log(`🗑️  Orphaned Files: ${issues.orphanedFiles.length}`)
  
  const totalIssues = issues.missingFiles.length + issues.missingUrl.length
  if (totalIssues > 0) {
    console.log(`\n⚠️  ACTION REQUIRED: ${totalIssues} products need attention`)
  } else {
    console.log(`\n✅ All products are synced correctly!`)
  }

  await prisma.$disconnect()
}

verifyImageSync()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

