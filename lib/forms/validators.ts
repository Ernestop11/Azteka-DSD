const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SKU_REGEX = /^[A-Z0-9_-]+$/

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string }

const ok: ValidationResult = { valid: true }

function invalid(error: string): ValidationResult {
  return { valid: false, error }
}

export function validateName(name?: string): ValidationResult {
  if (!name || name.trim().length < 2) {
    return invalid('Name must be at least 2 characters.')
  }
  return ok
}

export function validateSKU(sku?: string): ValidationResult {
  if (!sku) {
    return invalid('SKU is required.')
  }
  if (!SKU_REGEX.test(sku)) {
    return invalid('SKU must contain only uppercase alphanumeric characters, dashes, or underscores.')
  }
  return ok
}

export function validatePrice(priceCase?: number | string): ValidationResult {
  if (priceCase === undefined || priceCase === null || priceCase === '') {
    return invalid('Price per case is required.')
  }
  const value = typeof priceCase === 'number' ? priceCase : parseFloat(priceCase)
  if (Number.isNaN(value) || value <= 0) {
    return invalid('Price per case must be a positive number.')
  }
  return ok
}

export function validateUnits(unitsPerCase?: number | string): ValidationResult {
  if (unitsPerCase === undefined || unitsPerCase === null || unitsPerCase === '') {
    return invalid('Units per case are required.')
  }
  const value = typeof unitsPerCase === 'number' ? unitsPerCase : parseInt(unitsPerCase, 10)
  if (Number.isNaN(value) || value <= 0) {
    return invalid('Units per case must be an integer greater than 0.')
  }
  return ok
}

export function validateHex(color?: string): ValidationResult {
  if (!color) return invalid('Color value is required.')
  const trimmed = color.trim()
  if (!HEX_REGEX.test(trimmed)) {
    return invalid('Color must be a valid hex value.')
  }
  return ok
}

export function validateTags(tags?: string | string[]): ValidationResult {
  if (!tags || (Array.isArray(tags) && tags.length === 0)) {
    return ok
  }

  const list = Array.isArray(tags) ? tags : tags.split(',')
  const invalidTag = list.find((tag) => tag.trim().length === 0)

  if (invalidTag !== undefined) {
    return invalid('Tags must contain only non-empty values.')
  }

  return ok
}

export function validateBadgeText(text?: string): ValidationResult {
  if (!text) return ok
  const trimmed = text.trim()
  if (trimmed.length > 12) {
    return invalid('Badge text must be 12 characters or less.')
  }
  return ok
}

export function validateSlug(slug?: string): ValidationResult {
  if (!slug) return invalid('Slug is required.')
  if (!SLUG_REGEX.test(slug)) {
    return invalid('Slug must be lowercase, use dashes, and contain no spaces.')
  }
  return ok
}

export function validateTheme(themeId?: string): ValidationResult {
  if (!themeId) return invalid('Theme is required.')
  if (!['basic', 'gradient', 'splash'].includes(themeId)) {
    return invalid('Theme must be basic, gradient, or splash.')
  }
  return ok
}
