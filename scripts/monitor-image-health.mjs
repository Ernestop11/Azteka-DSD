#!/usr/bin/env node
/**
 * Image Health Monitoring Script
 * 
 * Monitors image health and alerts on issues
 * Can be run as a cron job or service
 */

import { PrismaClient } from '@prisma/client'
import { existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'products')
const THRESHOLD_MISSING = 0.10 // Alert if >10% of images are missing

async function checkHealth() {
  const products = await prisma.product.findMany({
    where: {
      imageUrl: { not: null }
    },
    select: {
      id: true,
      imageUrl: true,
      inStock: true
    }
  })

  const dirExists = existsSync(UPLOADS_DIR)
  let filesExist = 0
  let filesMissing = 0

  for (const product of products) {
    if (!product.imageUrl) continue

    const filename = product.imageUrl
      .replace('/uploads/products/', '')
      .replace('/uploads/prod/', '')
      .split('?')[0]

    const filepath = join(UPLOADS_DIR, filename)
    
    if (existsSync(filepath)) {
      filesExist++
    } else {
      filesMissing++
    }
  }

  const total = filesExist + filesMissing
  const missingPercent = total > 0 ? (filesMissing / total) * 100 : 0

  const health = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    metrics: {
      totalProductsWithImages: total,
      filesExist,
      filesMissing,
      missingPercent: missingPercent.toFixed(2),
      uploadsDirExists: dirExists,
      thresholdExceeded: missingPercent > (THRESHOLD_MISSING * 100)
    }
  }

  if (health.metrics.thresholdExceeded || !dirExists) {
    health.status = 'unhealthy'
  }

  return health
}

async function main() {
  const health = await checkHealth()

  console.log(JSON.stringify(health, null, 2))

  if (health.status === 'unhealthy') {
    process.exit(1)
  }

  await prisma.$disconnect()
}

main()

