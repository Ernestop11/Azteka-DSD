type ResolverResult = {
  normalized: string
  suggestion?: string
}

const COMMON_BRAND_FIXES: Record<string, string> = {
  jarritos: 'Jarritos',
  'topo chico': 'Topo Chico',
  'la costeña': 'La Costeña',
  'la costena': 'La Costeña',
  'sidral mundet': 'Sidral Mundet',
  'coca cola': 'Coca-Cola',
  'mexi snacks': 'MexiSnacks',
}

const COMMON_CATEGORY_FIXES: Record<string, string> = {
  beverages: 'Beverages',
  bebida: 'Beverages',
  snacks: 'Snacks',
  candy: 'Candy',
  dulceria: 'Candy',
  pantry: 'Pantry',
  seasonal: 'Seasonal',
}

const KNOWN_BRANDS = [
  'Jarritos',
  'Topo Chico',
  'La Costeña',
  'Goya',
  'Bimbo',
  'Sabritas',
  'Sidral Mundet',
  'Coca-Cola',
  'Pepsi',
  'MexiSnacks',
]

const KNOWN_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Candy',
  'Pantry',
  'Seasonal',
  'Household',
  'Bakery',
  'Frozen',
]

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function normalizeName(value: string, fixes: Record<string, string>): string {
  if (!value) return ''
  const trimmed = value.trim().replace(/\s+/g, ' ')
  const lower = trimmed.toLowerCase()
  if (fixes[lower]) {
    return fixes[lower]
  }
  return titleCase(trimmed)
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  const lenA = a.length
  const lenB = b.length

  for (let i = 0; i <= lenB; i += 1) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= lenA; j += 1) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= lenB; i += 1) {
    for (let j = 1; j <= lenA; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[lenB][lenA]
}

function suggestClosestName(target: string, list: string[]): string | undefined {
  if (!target) return undefined

  let bestMatch: string | undefined
  let bestScore = Infinity

  for (const item of list) {
    const distance = levenshtein(target.toLowerCase(), item.toLowerCase())
    if (distance < bestScore) {
      bestScore = distance
      bestMatch = item
    }
  }

  const threshold = Math.max(2, Math.round(target.length * 0.3))
  return bestScore <= threshold ? bestMatch : undefined
}

export function resolveBrand(name: string): ResolverResult {
  const normalized = normalizeName(name, COMMON_BRAND_FIXES)
  const suggestion = KNOWN_BRANDS.includes(normalized)
    ? normalized
    : suggestClosestName(normalized, KNOWN_BRANDS)

  return { normalized, suggestion }
}

export function resolveCategory(name: string): ResolverResult {
  const normalized = normalizeName(name, COMMON_CATEGORY_FIXES)
  const suggestion = KNOWN_CATEGORIES.includes(normalized)
    ? normalized
    : suggestClosestName(normalized, KNOWN_CATEGORIES)

  return { normalized, suggestion }
}
