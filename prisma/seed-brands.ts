import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { toSlug } from '../lib/slug'

const prisma = new PrismaClient()

export async function seedBrands() {
  console.log('🌱 Seeding brands...')

  const csvPath = './data/brands.csv'
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Brands CSV not found at: ${csvPath}`)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let created = 0
  let skipped = 0

  for (const record of records) {
    const name = record['Brand Name']?.trim() || record.name?.trim() || record.Name?.trim()
    
    if (!name) {
      skipped++
      continue
    }

    const slug = toSlug(name)

    try {
      await prisma.brand.create({
        data: {
          name,
          slug,
        },
      })
      created++
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation (slug already exists)
        skipped++
      } else {
        console.error(`Error creating brand "${name}":`, error.message)
        skipped++
      }
    }
  }

  console.log(`✅ Brands seeded: ${created} created, ${skipped} skipped`)
  return { created, skipped }
}

