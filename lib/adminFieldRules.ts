import { toSKU } from './slug'

export type ProductFormData = {
  name?: string
  sku?: string
  priceCase?: number | string
  unitsPerCase?: number | string
  tags?: string | string[]
  displayOrder?: number | string
  backgroundColor?: string
  gradientStart?: string
  gradientEnd?: string
  badgeText?: string
}

export type NormalizedProductForm = {
  name: string
  sku: string
  priceCase: number
  unitsPerCase: number
  tags: string[]
  displayOrder: number
  backgroundColor: string
  gradientStart: string
  gradientEnd: string
  badgeText?: string
}

export type ValidationResult = {
  isValid: boolean
  errors: Record<string, string>
  normalizedData: NormalizedProductForm
}

const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalizeHexColor(value?: string, fallback = '#ffffff'): string {
  if (!value) return fallback
  const trimmed = value.trim()
  if (!HEX_REGEX.test(trimmed)) return fallback
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function parseNumber(value: number | string | undefined, precision = 2): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!Number.isNaN(parsed)) {
      return parseFloat(parsed.toFixed(precision))
    }
  }
  return 0
}

function parseInteger(value: number | string | undefined): number {
  if (typeof value === 'number') return Math.trunc(value)
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return 0
}

function normalizeTags(value?: string | string[]): string[] {
  if (!value) return []
  const list = Array.isArray(value) ? value : value.split(',')
  return Array.from(
    new Set(
      list
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.toLowerCase())
    )
  )
}

export function normalizeProductForm(data: ProductFormData): NormalizedProductForm {
  const name = data.name?.trim() ?? ''
  const derivedSku = name ? toSKU(name) : 'SKU-NEW'
  const rawSku = data.sku?.trim() ?? derivedSku
  const sku = rawSku.toUpperCase().replace(/[^A-Z0-9_-]/g, '')

  const priceCase = parseNumber(data.priceCase)
  const unitsPerCase = parseInteger(data.unitsPerCase) || 0
  const displayOrder = parseInteger(data.displayOrder)

  const badgeText = data.badgeText?.trim()

  return {
    name,
    sku,
    priceCase,
    unitsPerCase,
    tags: normalizeTags(data.tags),
    displayOrder,
    backgroundColor: normalizeHexColor(data.backgroundColor, '#ffffff'),
    gradientStart: normalizeHexColor(data.gradientStart, '#ffffff'),
    gradientEnd: normalizeHexColor(data.gradientEnd, '#f3f4f6'),
    badgeText: badgeText || undefined,
  }
}

export function validateProductForm(data: ProductFormData): ValidationResult {
  const normalizedData = normalizeProductForm(data)
  const errors: Record<string, string> = {}

  if (normalizedData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!normalizedData.sku) {
    errors.sku = 'SKU is required.'
  }

  if (!(normalizedData.priceCase > 0)) {
    errors.priceCase = 'Price per case must be a positive number.'
  }

  if (!Number.isInteger(normalizedData.unitsPerCase) || normalizedData.unitsPerCase <= 0) {
    errors.unitsPerCase = 'Units per case must be an integer greater than 0.'
  }

  if (!Number.isInteger(normalizedData.displayOrder)) {
    errors.displayOrder = 'Display order must be an integer.'
  }

  if (!HEX_REGEX.test(normalizedData.backgroundColor)) {
    errors.backgroundColor = 'Background color must be a valid hex code.'
  }

  if (!HEX_REGEX.test(normalizedData.gradientStart)) {
    errors.gradientStart = 'Gradient start must be a valid hex code.'
  }

  if (!HEX_REGEX.test(normalizedData.gradientEnd)) {
    errors.gradientEnd = 'Gradient end must be a valid hex code.'
  }

  if (normalizedData.badgeText && normalizedData.badgeText.length > 12) {
    errors.badgeText = 'Badge text must be 12 characters or less.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  }
}
