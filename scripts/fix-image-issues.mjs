#!/usr/bin/env node
/**
 * Image Issues Fix Script
 * 
 * This script:
 * 1. Checks image status (database vs filesystem)
 * 2. Fixes missing image files
 * 3. Updates database paths if needed
 * 4. Syncs images between locations
 * 5. Validates image serving
 */

import { PrismaClient } from '@prisma/client'
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'products')
const ALT_UPLOADS_DIR = join(process.cwd(), 'uploads', 'products')

async function checkDirectories() {
  console.log('\n📁 Checking upload directories...\n')
  
  const dirs = [
    { name: 'Primary (public/uploads/products)', path: UPLOADS_DIR },
    { name: 'Alternative (uploads/products)', path: ALT_UPLOADS_DIR },
    { name: 'Public root', path: join(process.cwd(), 'public') },
  ]

  for (const dir of dirs) {
    const exists = existsSync(dir.path)
    console.log(`${exists ? '✅' : '❌'} ${dir.name}: ${dir.path} ${exists ? 'EXISTS' : 'MISSING'}`)
    
    if (exists) {
      try {
        const files = readdirSync(dir.path)
          .filter(f => f.match(/\.(png|jpg|jpeg)$/i))
        console.log(`   └─ ${files.length} image files found`)
      } catch (e) {
        console.log(`   └─ Error reading: ${e.message}`)
      }
    }
  }
}

async function checkDatabase() {
  console.log('\n📊 Checking database...\n')
  
  const products = await prisma.product.findMany({
    where: {
      imageUrl: { not: null }
    },
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
      inStock: true
    }
  })

  console.log(`Found ${products.length} products with imageUrl in database`)
  
  // Check for path issues
  const pathIssues = products.filter(p => {
    const url = p.imageUrl || ''
    return !url.startsWith('/uploads/products/') && !url.startsWith('/uploads/prod/')
  })
  
  if (pathIssues.length > 0) {
    console.log(`\n⚠️  ${pathIssues.length} products have non-standard image paths:`)
    pathIssues.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} (${p.sku}): ${p.imageUrl}`)
    })
  }

  // Check for out-of-stock
  const outOfStock = products.filter(p => p.inStock === false)
  if (outOfStock.length > 0) {
    console.log(`\n⚠️  ${outOfStock.length} products with images are marked out-of-stock`)
  }

  return products
}

async function verifyFiles(products) {
  console.log('\n🔍 Verifying files on disk...\n')
  
  let exists = 0
  let missing = 0
  let fixed = 0

  for (const product of products) {
    if (!product.imageUrl) continue

    // Extract expected filename
    let filename = product.imageUrl
      .replace('/uploads/products/', '')
      .replace('/uploads/prod/', '')
      .split('?')[0]
      .split('#')[0]

    // Try productId.png format
    if (filename !== `${product.id}.png`) {
      filename = `${product.id}.png`
    }

    const primaryPath = join(UPLOADS_DIR, filename)
    const altPath = join(ALT_UPLOADS_DIR, filename)

    if (existsSync(primaryPath)) {
      exists++
    } else if (existsSync(altPath)) {
      // File exists in alt location, copy to primary
      console.log(`📦 Copying ${filename} from alt location to primary...`)
      try {
        if (!existsSync(UPLOADS_DIR)) {
          mkdirSync(UPLOADS_DIR, { recursive: true })
        }
        copyFileSync(altPath, primaryPath)
        exists++
        fixed++
      } catch (e) {
        console.error(`   ❌ Failed to copy: ${e.message}`)
        missing++
      }
    } else {
      missing++
      if (missing <= 10) {
        console.log(`   ❌ Missing: ${filename} (${product.name})`)
      }
    }
  }

  console.log(`\n✅ Files exist: ${exists}`)
  console.log(`❌ Files missing: ${missing}`)
  console.log(`📦 Files fixed (copied): ${fixed}`)

  return { exists, missing, fixed }
}

async function fixDatabasePaths(products) {
  console.log('\n🔧 Fixing database paths...\n')
  
  let updated = 0

  for (const product of products) {
    if (!product.imageUrl) continue

    // Fix shortened paths
    if (product.imageUrl.includes('/uploads/prod/')) {
      const fixedPath = product.imageUrl.replace('/uploads/prod/', '/uploads/products/')
      console.log(`   Fixing path: ${product.imageUrl} → ${fixedPath}`)
      
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: fixedPath }
        })
        updated++
      } catch (e) {
        console.error(`   ❌ Failed to update: ${e.message}`)
      }
    }
  }

  console.log(`\n✅ Updated ${updated} database paths`)

  return updated
}

async function ensureDirectories() {
  console.log('\n📁 Ensuring directories exist...\n')
  
  const dirs = [UPLOADS_DIR, ALT_UPLOADS_DIR]
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      console.log(`   Creating: ${dir}`)
      mkdirSync(dir, { recursive: true })
      console.log(`   ✅ Created`)
    } else {
      console.log(`   ✅ Exists: ${dir}`)
    }
  }
}

async function main() {
  console.log('🚀 Starting Image Issues Fix Script\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Check directories
    await checkDirectories()
    
    // Step 2: Ensure directories exist
    await ensureDirectories()

    // Step 3: Check database
    const products = await checkDatabase()

    // Step 4: Verify files
    const fileStats = await verifyFiles(products)

    // Step 5: Fix database paths
    await fixDatabasePaths(products)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 SUMMARY\n')
    console.log(`Total products with images: ${products.length}`)
    console.log(`Files existing: ${fileStats.exists}`)
    console.log(`Files missing: ${fileStats.missing}`)
    console.log(`Files fixed: ${fileStats.fixed}`)
    console.log('\n✅ Fix script complete!\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

