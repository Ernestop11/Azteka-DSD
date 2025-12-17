export const ADMIN_ERROR_MESSAGES = {
  NAME_REQUIRED: 'Product name is required.',
  NAME_TOO_SHORT: 'Product name must be at least 2 characters.',
  SKU_REQUIRED: 'SKU is required.',
  SKU_INVALID: 'SKU must be uppercase and contain only letters, numbers, dashes, or underscores.',
  PRICE_INVALID: 'Invalid price value.',
  PRICE_REQUIRED: 'Price per case is required.',
  UNITS_REQUIRED: 'Units per case are required.',
  UNITS_INVALID: 'Units per case must be an integer greater than 0.',
  TAGS_INVALID: 'Tags must be comma-separated values with no empty items.',
  HEX_INVALID: 'Color must be a valid hex value.',
  BADGE_INVALID: 'Badge text must be 12 characters or less.',
  SLUG_REQUIRED: 'Slug is required.',
  SLUG_INVALID: 'Slug must be lowercase and use dashes.',
  THEME_REQUIRED: 'A card theme must be selected.',
  THEME_INVALID: 'Theme must be one of the available card styles.',
} as const

export type AdminErrorKey = keyof typeof ADMIN_ERROR_MESSAGES
