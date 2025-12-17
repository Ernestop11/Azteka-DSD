/**
 * Central utility for handling image URLs
 * Ensures consistent formatting across the application
 */

/**
 * Gets the public image URL for a given path
 * Handles both absolute URLs and relative paths
 * 
 * @param path - Image path (e.g., "/uploads/products/123.png" or "https://example.com/image.png")
 * @returns Formatted public URL
 */
export function getPublicImageUrl(path: string | null | undefined): string {
  if (!path || path.trim() === '') {
    return '/coming-soon.png'
  }

  const trimmed = path.trim()
  const normalized = trimmed.replace(/\\/g, '/')
  const publicDir = `${process.cwd().replace(/\\/g, '/')}/public`

  // If already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  // Strip absolute public directory paths (e.g., /app/project/public/uploads/...)
  if (normalized.startsWith(publicDir)) {
    const relative = normalized.slice(publicDir.length)
    return relative.startsWith('/') ? relative : `/${relative}`
  }

  // Strip extra "public" segments if present in the path
  if (normalized.includes('/public/')) {
    const [, afterPublic] = normalized.split('/public/')
    if (afterPublic) {
      return afterPublic.startsWith('/') ? afterPublic : `/${afterPublic}`
    }
  }

  // If already starts with /, return as-is
  if (normalized.startsWith('/')) {
    return normalized
  }

  // If it's just a filename, assume it's in /uploads/products/
  if (!normalized.includes('/')) {
    return `/uploads/products/${normalized}`
  }

  // Otherwise, prepend /
  return `/${normalized}`
}

/**
 * Normalizes product image from multiple possible sources
 * Handles product.imageUrl, product.image, product.images[]
 * Always returns a full public URL string
 */
export function normalizeProductImage(product: {
  imageUrl?: string | null
  image?: string | null
  images?: (string | null)[] | null
}): string {
  // Try imageUrl first
  if (product.imageUrl) {
    return getPublicImageUrl(product.imageUrl)
  }

  // Try image field
  if (product.image) {
    return getPublicImageUrl(product.image)
  }

  // Try images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (firstImage) {
      return getPublicImageUrl(firstImage)
    }
  }

  // Fallback to coming-soon
  return '/coming-soon.png'
}

/**
 * Gets the image URL for a product
 */
export function getProductImageUrl(imageUrl: string | null | undefined): string {
  return getPublicImageUrl(imageUrl)
}

/**
 * Gets the image URL for a brand
 */
export function getBrandImageUrl(imageUrl: string | null | undefined): string {
  return getPublicImageUrl(imageUrl)
}

/**
 * Gets the image URL for a category
 */
export function getCategoryImageUrl(imageUrl: string | null | undefined): string {
  return getPublicImageUrl(imageUrl)
}
