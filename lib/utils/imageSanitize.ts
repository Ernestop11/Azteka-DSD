/**
 * Sanitizes a filename to be safe for filesystem storage
 * - Converts to lowercase
 * - Removes spaces
 * - Only allows letters, numbers, hyphens, and underscores
 * - Rejects all other characters
 */
export function sanitizeFilename(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\-_]/g, '') // Remove all characters except letters, numbers, hyphens, underscores
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Sanitizes an ID for use in filenames
 * UUIDs are already safe, but this ensures consistency
 */
export function sanitizeIdForFilename(id: string): string {
  // UUIDs are already safe, but sanitize just in case
  return sanitizeFilename(id)
}

