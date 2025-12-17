/**
 * Normalizes SKU strings for consistent matching
 * - Lowercase
 * - Trim spaces
 * - Remove "sku:" prefix if present
 */
export function normalizeSku(sku: string | null | undefined): string {
  if (!sku) return ''
  
  return sku
    .toLowerCase()
    .trim()
    .replace(/^sku:/i, '') // Remove "sku:" prefix (case-insensitive)
    .trim()
}

