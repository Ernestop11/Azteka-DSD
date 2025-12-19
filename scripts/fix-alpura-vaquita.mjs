#!/usr/bin/env node
/**
 * Fix Alpura Vaquita Products Image Sync
 * 
 * This script specifically fixes the Alpura Vaquita products that had
 * images uploaded but are not showing correctly.
 * 
 * Usage: node scripts/fix-alpura-vaquita.mjs
 */

import { PrismaClient } from '@prisma/client'
import { existsSync, readdir } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function fixAlpuraVaquita() {
  console.log('🥛 Fixing Alpura Vaquita Products...\n')

  const uploadsDir = join(__dirname, '../public/uploads/products')
  
  if (!existsSync(uploadsDir)) {
    console.error('❌ Uploads directory not found:', uploadsDir)
    process.exit(1)
  }

  // Find all Alpura Vaquita products
  const vaquitaProducts = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Vaquita',
        mode: 'insensitive'
      },
      brand: {
        name: {
          contains: 'Alpura',
          mode: 'insensitive'
        }
      }
    },
    include: {
      brand: true
    }
  })

  if (vaquitaProducts.length === 0) {
    console.log('⚠️  No Alpura Vaquita products found')
    await prisma.$disconnect()
    return
  }

  console.log(`Found ${vaquitaProducts.length} Alpura Vaquita products:\n`)

  const files = await readdir(uploadsDir)
  let fixed = 0
  let needsUpload = 0

  for (const product of vaquitaProducts) {
    console.log(`📦 ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   SKU: ${product.sku}`)
    console.log(`   Current imageUrl: ${product.imageUrl || 'NULL'}`)

    // Check if correct file exists (productId.png)
    const correctFile = `${product.id}.png`
    const correctFilePath = join(uploadsDir, correctFile)
    const correctFileExists = existsSync(correctFilePath)

    // Check if file from imageUrl exists
    let imageUrlFileExists = false
    let imageUrlFile = null
    if (product.imageUrl) {
      imageUrlFile = product.imageUrl.replace('/uploads/products/', '')
      const imageUrlFilePath = join(uploadsDir, imageUrlFile)
      imageUrlFileExists = existsSync(imageUrlFilePath)
    }

    // Look for any files that might be for this product
    const possibleFiles = files.filter(f => 
      f === `${product.id}.png` ||
      f.startsWith(`${product.id}-`) ||
      f.includes(product.id) ||
      (product.imageUrl && f === imageUrlFile)
    )

    if (correctFileExists) {
      // Correct file exists, just need to update database
      if (product.imageUrl !== `/uploads/products/${correctFile}`) {
        console.log(`   🔧 Fixing: Updating imageUrl to point to correct file`)
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: `/uploads/products/${correctFile}` }
        })
        fixed++
        console.log(`   ✅ Fixed!`)
      } else {
        console.log(`   ✅ Already correct`)
      }
    } else if (imageUrlFileExists && imageUrlFile) {
      // File exists but with different name, copy/rename it
      console.log(`   🔧 Fixing: File exists as ${imageUrlFile}, should be ${correctFile}`)
      const fs = await import('fs/promises')
      const oldPath = join(uploadsDir, imageUrlFile)
      const newPath = join(uploadsDir, correctFile)
      
      try {
        await fs.copyFile(oldPath, newPath)
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: `/uploads/products/${correctFile}` }
        })
        fixed++
        console.log(`   ✅ Fixed! Copied ${imageUrlFile} to ${correctFile}`)
      } catch (error) {
        console.error(`   ❌ Error copying file:`, error.message)
      }
    } else if (possibleFiles.length > 0) {
      // Found possible files, use the first one
      const fileToUse = possibleFiles[0]
      console.log(`   🔧 Fixing: Found file ${fileToUse}, updating database`)
      
      // Copy to correct filename if different
      if (fileToUse !== correctFile) {
        const fs = await import('fs/promises')
        const oldPath = join(uploadsDir, fileToUse)
        const newPath = join(uploadsDir, correctFile)
        
        try {
          await fs.copyFile(oldPath, newPath)
          console.log(`   📋 Copied ${fileToUse} to ${correctFile}`)
        } catch (error) {
          console.error(`   ❌ Error copying file:`, error.message)
          // Still update database to point to existing file
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: `/uploads/products/${fileToUse}` }
          })
          fixed++
          console.log(`   ✅ Updated database to point to ${fileToUse}`)
          continue
        }
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: `/uploads/products/${correctFile}` }
      })
      fixed++
      console.log(`   ✅ Fixed!`)
    } else {
      // No file found, needs upload
      console.log(`   ⚠️  No image file found - needs manual upload`)
      console.log(`   💡 Expected file: ${correctFile}`)
      needsUpload++
    }
    console.log('')
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 FIX SUMMARY')
  console.log('='.repeat(60) + '\n')
  console.log(`✅ Fixed: ${fixed} products`)
  console.log(`⚠️  Needs Upload: ${needsUpload} products`)
  
  if (needsUpload > 0) {
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Go to /employee/inventory`)
    console.log(`   2. Search for "Alpura Vaquita"`)
    console.log(`   3. Click on each product`)
    console.log(`   4. Go to Image tab`)
    console.log(`   5. Upload the image`)
  }

  await prisma.$disconnect()
}

fixAlpuraVaquita()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

