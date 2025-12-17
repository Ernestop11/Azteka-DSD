function baseSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

export function toSlug(input: string): string {
  return baseSlug(input) || simpleHash(input).slice(0, 6)
}

export function toSKU(name: string): string {
  const slug = toSlug(name).replace(/-/g, '_').toUpperCase()
  const suffix = simpleHash(name).slice(0, 4).toUpperCase()
  return `${slug}-${suffix}`
}

export async function ensureUniqueSlug(prisma: any, base: string): Promise<string> {
  const initial = toSlug(base)

  if (!prisma?.product?.count) {
    return initial
  }

  let suffix = 1
  let candidate = initial

  while (true) {
    const count = await prisma.product.count({ where: { slug: candidate } })
    if (count === 0) {
      return candidate
    }
    candidate = `${initial}-${suffix}`
    suffix += 1
  }
}
