import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

import { syncBrands } from './sync-brands'
import { syncCategories } from './sync-categories'

const prisma = new PrismaClient()

const OptionsSchema = z.object({
  brands: z.string().optional(),
  categories: z.string().optional(),
})

function parseArgs(argv: string[]) {
  const options: Record<string, string> = {}
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [key, value] = arg.slice(2).split('=')
    if (key) {
      options[key] = value ?? ''
    }
  }
  return OptionsSchema.parse(options)
}

async function runSyncAll() {
  const { brands, categories } = parseArgs(process.argv.slice(2))
  const brandsPath = path.resolve(brands ?? path.join('data', 'brands.csv'))
  const categoriesPath = path.resolve(categories ?? path.join('data', 'categories.csv'))

  await syncBrands(brandsPath, prisma)
  await syncCategories(categoriesPath, prisma)
}

const isEntryPoint = import.meta.url === pathToFileURL(process.argv[1] ?? '').href

if (isEntryPoint) {
  try {
    await runSyncAll()
  } finally {
    await prisma.$disconnect()
  }
}

export { runSyncAll }
