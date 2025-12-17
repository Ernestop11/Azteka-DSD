import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { toSlug } from '../lib/slug'

const prisma = new PrismaClient()

export async function seedCategories() {
  console.log('🌱 Seeding categories...')

  const csvPath = './data/categories.csv'
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Categories CSV not found at: ${csvPath}`)
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
    const name = record['Category Name']?.trim() || record.name?.trim() || record.Name?.trim()
    
    if (!name) {
      skipped++
      continue
    }

    const slug = toSlug(name)

    try {
      await prisma.category.create({
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
        console.error(`Error creating category "${name}":`, error.message)
        skipped++
      }
    }
  }

  console.log(`✅ Categories seeded: ${created} created, ${skipped} skipped`)
  return { created, skipped }
}

