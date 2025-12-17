import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'

import { resolveBrand } from '../../lib/data-tools/brandCategoryResolver'
import { toSlug } from '../../lib/slug'
import type { SyncBrandInput } from '../../types/catalog'

const prisma = new PrismaClient()

const BrandInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
})

const BrandWriteSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

function mapBrandRow(row: Record<string, unknown>): SyncBrandInput {
  return {
    id: (row.ID ?? row.Id ?? row.id) as string | undefined,
    name: String(row['Brand Name'] ?? row.name ?? row.Name ?? '').trim(),
    slug: row.slug ? String(row.slug) : undefined,
  }
}

async function syncBrands(
  csvPath = path.resolve(process.cwd(), 'data', 'brands.csv'),
  client: PrismaClient = prisma
) {
  const csv = await fs.readFile(csvPath, 'utf8')
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[]

  let created = 0
  let updated = 0

  for (const rawRow of records) {
    const mapped = BrandInputSchema.parse(mapBrandRow(rawRow))
    const { normalized } = resolveBrand(mapped.name)
    const slug = toSlug(mapped.slug ?? normalized)

    const parsed = BrandWriteSchema.parse({
      name: normalized,
      slug,
    })
    const data = { name: parsed.name, slug: parsed.slug }

    const existing = await client.brand.findFirst({ where: { slug: data.slug } })
    if (existing) {
      await client.brand.update({
        where: { id: existing.id },
        data,
      })
      updated += 1
    } else {
      await client.brand.create({ data })
      created += 1
    }
  }

  console.log(`Brand sync complete. Created: ${created}, Updated: ${updated}`)
}

const isEntryPoint = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

if (isEntryPoint) {
  try {
    const inputPath = process.argv[2]
      ? path.resolve(process.argv[2])
      : path.resolve(process.cwd(), 'data', 'brands.csv')
    await syncBrands(inputPath)
  } finally {
    await prisma.$disconnect()
  }
}

export { syncBrands }
