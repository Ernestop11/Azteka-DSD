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
  if (!path || path.trim() === '' || path === 'null' || path === 'undefined') {
    return '/coming-soon.png'
  }

  const trimmed = path.trim()
  const normalized = trimmed.replace(/\\/g, '/')
  const envBaseUrl =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_UPLOAD_BASE_URL : undefined) ||
    process.env.NEXT_PUBLIC_UPLOAD_BASE_URL ||
    process.env.UPLOAD_BASE_URL ||
    ''
  const baseUrl = envBaseUrl.replace(/\/+$/, '')
  const baseOrigin = baseUrl.endsWith('/uploads')
    ? baseUrl.slice(0, -'/uploads'.length)
    : baseUrl

  const applyBaseUrl = (urlPath: string) => {
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
    if (!baseUrl || !cleanPath.startsWith('/uploads/')) {
      return cleanPath
    }
    return `${baseOrigin}${cleanPath}`
  }

  const uploadsIndex = normalized.indexOf('/uploads/')
  if (uploadsIndex !== -1) {
    const uploadsPath = normalized.slice(uploadsIndex).replace('/uploads/prod/', '/uploads/products/')
    return applyBaseUrl(uploadsPath)
  }

  // If already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  // Don't normalize if it's already a valid path starting with /
  if (trimmed.startsWith('/uploads/')) {
    return applyBaseUrl(trimmed.replace('/uploads/prod/', '/uploads/products/'))
  }
  
  const publicDir =
    typeof process !== 'undefined' && typeof process.cwd === 'function'
      ? `${process.cwd().replace(/\\/g, '/')}/public`
      : ''

  // FIX: Fix shortened /uploads/prod/ paths to /uploads/products/
  if (normalized.includes('/uploads/prod/')) {
    const fixed = normalized.replace('/uploads/prod/', '/uploads/products/')
    return applyBaseUrl(fixed.startsWith('/') ? fixed : `/${fixed}`)
  }

  // Strip absolute public directory paths (e.g., /app/project/public/uploads/...)
  if (publicDir && normalized.startsWith(publicDir)) {
    const relative = normalized.slice(publicDir.length)
    return applyBaseUrl(relative.startsWith('/') ? relative : `/${relative}`)
  }

  // Strip extra "public" segments if present in the path
  if (normalized.includes('/public/')) {
    const [, afterPublic] = normalized.split('/public/')
    if (afterPublic) {
      return applyBaseUrl(afterPublic.startsWith('/') ? afterPublic : `/${afterPublic}`)
    }
  }

  // If already starts with /, return as-is (but fix /uploads/prod/ if present)
  if (normalized.startsWith('/')) {
    // Fix shortened paths
    if (normalized.includes('/uploads/prod/')) {
      const result = normalized.replace('/uploads/prod/', '/uploads/products/')
      return applyBaseUrl(result)
    }
    return applyBaseUrl(normalized)
  }

  // If it's just a filename, assume it's in /uploads/products/
  if (!normalized.includes('/')) {
    return applyBaseUrl(`/uploads/products/${normalized}`)
  }

  // Otherwise, prepend / and fix shortened paths
  const result = `/${normalized}`
  const finalResult = result.includes('/uploads/prod/') 
    ? result.replace('/uploads/prod/', '/uploads/products/')
    : result
  return applyBaseUrl(finalResult)
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
  if (product.imageUrl && product.imageUrl.trim() !== '' && product.imageUrl !== 'null') {
    // If it's already a valid path starting with /uploads/, return it directly
    if (product.imageUrl.startsWith('/uploads/')) {
      return product.imageUrl.replace('/uploads/prod/', '/uploads/products/')
    }
    // Otherwise normalize it
    const normalized = getPublicImageUrl(product.imageUrl)
    // Only return normalized if it's not coming-soon (meaning we had a real URL)
    if (normalized !== '/coming-soon.png') {
      return normalized
    }
  }

  // Try image field
  if (product.image && product.image.trim() !== '') {
    return getPublicImageUrl(product.image)
  }

  // Try images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (firstImage && firstImage.trim() !== '') {
      return getPublicImageUrl(firstImage)
    }
  }

  // Fallback to coming-soon only if no image data at all
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
