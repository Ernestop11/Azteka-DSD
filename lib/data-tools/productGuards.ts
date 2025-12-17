import { toSlug } from '../slug'

export type RawProductRow = Record<string, string | number | undefined>

export type CleanProduct = {
  name: string
  slug: string
  sku: string
  priceCase: number
  unitsPerCase: number
  categoryName: string
  brandName: string
}

export type ProductGuardResult =
  | { ok: true; value: CleanProduct }
  | { ok: false; errors: string[] }

function getField(row: RawProductRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()]
    if (value !== undefined && value !== null) {
      return String(value).trim()
    }
  }
  return ''
}

function parseNumber(value: string, precision = 2): number | null {
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) {
    return null
  }
  return parseFloat(parsed.toFixed(precision))
}

function parseInteger(value: string): number | null {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export function validateRawProductRow(row: RawProductRow): ProductGuardResult {
  const errors: string[] = []

  const name = getField(row, ['name', 'Name', 'Product Name'])
  if (!name) {
    errors.push('Name is required.')
  }

  const sku = getField(row, ['sku', 'SKU'])
  if (!sku) {
    errors.push('SKU is required.')
  }

  const categoryName = getField(row, ['category', 'Category'])
  if (!categoryName) {
    errors.push('Category is required.')
  }

  const brandName = getField(row, ['brand', 'Brand'])
  if (!brandName) {
    errors.push('Brand is required.')
  }

  const priceRaw = getField(row, ['priceCase', 'Sales Price', 'Price', 'Price Case'])
  const priceCase = priceRaw ? parseNumber(priceRaw) : null
  if (priceCase === null || priceCase <= 0) {
    errors.push('Sales price must be a positive number.')
  }

  const unitsRaw = getField(row, ['unitsPerCase', 'Case Pack', 'Units', 'Units Per Case'])
  const unitsPerCase = unitsRaw ? parseInteger(unitsRaw) : null
  if (unitsPerCase === null || unitsPerCase <= 0) {
    errors.push('Case pack must be a positive integer.')
  }

  if (errors.length) {
    return { ok: false, errors }
  }

  const cleanProduct: CleanProduct = {
    name,
    slug: toSlug(name),
    sku: sku.toUpperCase(),
    priceCase: priceCase!,
    unitsPerCase: unitsPerCase!,
    categoryName,
    brandName,
  }

  return { ok: true, value: cleanProduct }
}
