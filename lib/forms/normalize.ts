type NormalizeInput = Record<string, any>

function trimString(value?: string): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSlug(value?: string): string {
  return trimString(value).toLowerCase().replace(/\s+/g, '-')
}

function normalizeSKU(value?: string): string {
  return trimString(value).replace(/\s+/g, '-').toUpperCase()
}

function normalizePrice(value?: number | string): number {
  if (typeof value === 'number') return value
  const parsed = parseFloat(trimString(value))
  return Number.isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2))
}

function normalizeUnits(value?: number | string): number {
  if (typeof value === 'number') return Math.trunc(value)
  const parsed = parseInt(trimString(value), 10)
  return Number.isNaN(parsed) ? 0 : parsed
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

function normalizeCommonFields(form: NormalizeInput) {
  return {
    name: trimString(form.name),
    slug: normalizeSlug(form.slug),
    sku: normalizeSKU(form.sku),
    description: trimString(form.description),
    tags: normalizeTags(form.tags),
    priceCase: normalizePrice(form.priceCase),
    unitsPerCase: normalizeUnits(form.unitsPerCase),
    badgeText: trimString(form.badgeText) || undefined,
    backgroundColor: trimString(form.backgroundColor),
    gradientStart: trimString(form.gradientStart),
    gradientEnd: trimString(form.gradientEnd),
    themeId: trimString(form.themeId),
  }
}

export function normalizeProductForm(form: NormalizeInput) {
  const base = normalizeCommonFields(form)
  return {
    ...base,
    displayOrder: normalizeUnits(form.displayOrder),
    imageUrl: trimString(form.imageUrl),
    overlayImage: trimString(form.overlayImage),
    glowClass: trimString(form.glowClass),
  }
}

export function normalizeCategoryForm(form: NormalizeInput) {
  return {
    name: trimString(form.name),
    slug: normalizeSlug(form.slug),
    description: trimString(form.description),
    themeId: trimString(form.themeId),
    displayOrder: normalizeUnits(form.displayOrder),
  }
}

export function normalizeBrandForm(form: NormalizeInput) {
  return {
    name: trimString(form.name),
    slug: normalizeSlug(form.slug),
    tagline: trimString(form.tagline),
    description: trimString(form.description),
    displayOrder: normalizeUnits(form.displayOrder),
    primaryColor: trimString(form.primaryColor),
    secondaryColor: trimString(form.secondaryColor),
  }
}
