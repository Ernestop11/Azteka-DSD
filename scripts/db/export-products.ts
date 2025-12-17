import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

import { toSlug } from '../../lib/slug'
import type { ProductExportRecord } from '../../types/catalog'

const prisma = new PrismaClient()

const ExportProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  priceCase: z.number().nonnegative(),
  unitsPerCase: z.number().int().positive(),
  category: z.string().nullable(),
  brand: z.string().nullable(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  updatedAt: z.string(),
})

function toCsv(rows: ProductExportRecord[]): string {
  const headers = [
    'id',
    'name',
    'slug',
    'sku',
    'priceCase',
    'unitsPerCase',
    'category',
    'brand',
    'description',
    'imageUrl',
    'updatedAt',
  ]

  const escape = (value: unknown) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [headers.join(',')]
  for (const row of rows) {
    const values = headers.map((key) => escape((row as Record<string, unknown>)[key]))
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

async function exportProducts() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { name: 'asc' },
  })

  const normalized: ProductExportRecord[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: toSlug(product.name),
    sku: product.sku,
    priceCase:
      typeof product.price === 'number'
        ? Number(product.price)
        : Number(product.price?.toString() ?? 0),
    unitsPerCase: product.unitsPerCase,
    category: product.category?.name ?? null,
    brand: product.brand?.name ?? null,
    description: product.description ?? null,
    imageUrl: product.imageUrl ?? null,
    updatedAt: product.updatedAt.toISOString(),
  }))

  const validated: ProductExportRecord[] = normalized.map(
    (row) => ExportProductSchema.parse(row) as ProductExportRecord
  )

  const outputDir = path.resolve(process.cwd(), 'exports')
  await fs.mkdir(outputDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const jsonPath = path.join(outputDir, `products-${timestamp}.json`)
  const csvPath = path.join(outputDir, `products-${timestamp}.csv`)

  await fs.writeFile(jsonPath, JSON.stringify(validated, null, 2), 'utf8')
  await fs.writeFile(csvPath, toCsv(validated), 'utf8')

  console.log(`Exported ${validated.length} products to:`)
  console.log(`- ${jsonPath}`)
  console.log(`- ${csvPath}`)
}

const isEntryPoint = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

if (isEntryPoint) {
  try {
    await exportProducts()
  } finally {
    await prisma.$disconnect()
  }
}

export { exportProducts }
