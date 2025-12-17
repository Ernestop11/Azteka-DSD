import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { Prisma, PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'

import {
  validateRawProductRow,
  type RawProductRow,
  type ProductGuardResult,
} from '../../lib/data-tools/productGuards'
import { resolveBrand, resolveCategory } from '../../lib/data-tools/brandCategoryResolver'
import { toSKU, toSlug } from '../../lib/slug'

const prisma = new PrismaClient()

const VendorRowSchema = z.record(z.union([z.string(), z.number(), z.null()]))
type ParsedVendorRow = z.infer<typeof VendorRowSchema>

const ProductWriteSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  unitsPerCase: z.number().int().positive(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
})

async function readVendorRows(filePath: string): Promise<ParsedVendorRow[]> {
  const file = await fs.readFile(filePath, 'utf8')
  const records = parse(file, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[]
  return records.map((row) => VendorRowSchema.parse(row))
}

function normalizeVendorRow(row: ParsedVendorRow): RawProductRow {
  const normalized: Record<string, string | number | undefined> = {}

  Object.entries(row).forEach(([key, value]) => {
    if (value === null) return
    normalized[key] = typeof value === 'number' ? value : String(value)
  })

  const productName = row.Name ?? row['Product Name']
  if (productName) {
    normalized.Name = String(productName)
  }

  if (!row.SKU && productName) {
    normalized.SKU = toSKU(String(productName))
  }

  if (!normalized.Category && row.Category) {
    normalized.Category = row.Category
  }

  if (!normalized.Brand && row.Brand) {
    normalized.Brand = row.Brand
  }

  normalized['Sales Price'] =
    row['Sales Price'] ?? row.Price ?? row['Price Case'] ?? normalized['Sales Price']

  normalized['Case Pack'] =
    row['Case Pack'] ?? row.Units ?? row['Units Per Case'] ?? normalized['Case Pack']

  return normalized
}

async function ensureBrandId(name: string): Promise<string> {
  const { normalized } = resolveBrand(name)
  const slug = toSlug(normalized)

  const existing = await prisma.brand.findFirst({
    where: { slug },
  })

  if (existing) return existing.id

  const created = await prisma.brand.create({
    data: {
      name: normalized,
      slug,
    },
  })

  return created.id
}

async function ensureCategoryId(name: string): Promise<string> {
  const { normalized } = resolveCategory(name)
  const slug = toSlug(normalized)

  const existing = await prisma.category.findFirst({
    where: { slug },
  })

  if (existing) return existing.id

  const created = await prisma.category.create({
    data: {
      name: normalized,
      slug,
    },
  })

  return created.id
}

async function importVendorPO(filePath: string) {
  const rows = await readVendorRows(filePath)
  const successes: string[] = []
  const failures: { row: ParsedVendorRow; errors: string[] }[] = []

  for (const row of rows) {
    const normalizedRow = normalizeVendorRow(row)
    const result: ProductGuardResult = validateRawProductRow(normalizedRow)

    if (result.ok === false) {
      failures.push({ row, errors: result.errors })
      continue
    }

    const clean = result.value

    try {
      const brandId = await ensureBrandId(clean.brandName)
      const categoryId = await ensureCategoryId(clean.categoryName)

      const data = ProductWriteSchema.parse({
        name: clean.name,
        sku: clean.sku,
        price: clean.priceCase,
        unitsPerCase: clean.unitsPerCase,
        brandId,
        categoryId,
      })

      await prisma.product.upsert({
        where: { sku: data.sku },
        update: {
          name: data.name,
          price: new Prisma.Decimal(data.price.toFixed(2)),
          unitsPerCase: data.unitsPerCase,
          brandId: data.brandId,
          categoryId: data.categoryId,
        },
        create: {
          name: data.name,
          sku: data.sku,
          price: new Prisma.Decimal(data.price.toFixed(2)),
          unitsPerCase: data.unitsPerCase,
          brandId: data.brandId,
          categoryId: data.categoryId,
        },
      })

      successes.push(data.sku)
    } catch (error) {
      failures.push({
        row,
        errors: [(error as Error).message],
      })
    }
  }

  console.log(`Processed ${rows.length} vendor rows.`)
  console.log(`- Imported/updated: ${successes.length}`)
  console.log(`- Failed: ${failures.length}`)

  if (failures.length) {
    for (const failure of failures) {
      console.warn('Failed row:', failure.row)
      console.warn('Errors:', failure.errors.join('; '))
    }
  }
}

const isEntryPoint = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

if (isEntryPoint) {
  try {
    const targetPath = process.argv[2]
      ? path.resolve(process.argv[2])
      : path.resolve(process.cwd(), 'data', 'vendor-po.csv')
    await importVendorPO(targetPath)
  } finally {
    await prisma.$disconnect()
  }
}

export { importVendorPO }
