import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'

import { resolveCategory } from '../../lib/data-tools/brandCategoryResolver'
import { toSlug } from '../../lib/slug'
import type { SyncCategoryInput } from '../../types/catalog'

const prisma = new PrismaClient()

const CategoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  parentName: z.string().optional(),
})

const CategoryWriteSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

function mapCategoryRow(row: Record<string, unknown>): SyncCategoryInput {
  return {
    id: (row.ID ?? row.Id ?? row.id) as string | undefined,
    name: String(row['Category Name'] ?? row.name ?? row.Name ?? '').trim(),
    slug: row.slug ? String(row.slug) : undefined,
    parentName: row['Master Category'] ? String(row['Master Category']) : undefined,
  }
}

async function syncCategories(
  csvPath = path.resolve(process.cwd(), 'data', 'categories.csv'),
  client: PrismaClient = prisma
) {
  const csv = await fs.readFile(csvPath, 'utf8')
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[]

  let created = 0
  let updated = 0

  for (const rawRow of records) {
    const mapped = CategoryInputSchema.parse(mapCategoryRow(rawRow))
    const { normalized } = resolveCategory(mapped.name)
    const slug = toSlug(mapped.slug ?? normalized)

    const parsed = CategoryWriteSchema.parse({
      name: normalized,
      slug,
    })
    const data = { name: parsed.name, slug: parsed.slug }

    const existing = await client.category.findFirst({ where: { slug: data.slug } })
    if (existing) {
      await client.category.update({
        where: { id: existing.id },
        data,
      })
      updated += 1
    } else {
      await client.category.create({ data })
      created += 1
    }
  }

  console.log(`Category sync complete. Created: ${created}, Updated: ${updated}`)
}

const isEntryPoint = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

if (isEntryPoint) {
  try {
    const inputPath = process.argv[2]
      ? path.resolve(process.argv[2])
      : path.resolve(process.cwd(), 'data', 'categories.csv')
    await syncCategories(inputPath)
  } finally {
    await prisma.$disconnect()
  }
}

export { syncCategories }
