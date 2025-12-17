export function getBundleValueScore(bundleId: string): number {
  let hash = 0

  for (const char of bundleId) {
    hash = (hash + char.charCodeAt(0)) % 101
  }

  return Math.round((hash / 100) * 10)
}
