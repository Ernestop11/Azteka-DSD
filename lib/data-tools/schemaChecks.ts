import { promises as fs } from 'node:fs'
import path from 'node:path'

type SchemaReport = {
  file: string
  ok: boolean
  columns: string[]
  missing: string[]
  extra: string[]
  message: string
}

const EXPECTED_SCHEMAS: Record<string, string[]> = {
  'categories.csv': ['id', 'name', 'slug', 'description'],
  'brands.csv': ['id', 'name', 'slug', 'tagline'],
  'products.csv': ['id', 'name', 'slug', 'sku', 'category', 'brand', 'priceCase', 'unitsPerCase'],
  'customers.csv': ['id', 'name', 'email', 'region', 'salesRep'],
}

async function readCsvHeader(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, 'utf8')
  const [headerLine] = content.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (!headerLine) {
    return []
  }

  return headerLine.split(',').map((column) => column.trim())
}

function compareColumns(columns: string[], expected: string[]): SchemaReport {
  const missing = expected.filter((col) => !columns.includes(col))
  const extra = columns.filter((col) => !expected.includes(col))

  const ok = missing.length === 0 && extra.length === 0

  const messageParts = [`- Required: ${expected.join(', ')}`, `- Found: ${columns.join(', ')}`]

  if (missing.length) {
    messageParts.push(`- Missing: ${missing.join(', ')}`)
  }

  if (extra.length) {
    messageParts.push(`- Extra: ${extra.join(', ')}`)
  }

  return {
    file: '',
    ok,
    columns,
    missing,
    extra,
    message: messageParts.join('\n'),
  }
}

async function checkCsvSchema(filePath: string, expected: string[]): Promise<SchemaReport> {
  try {
    const columns = await readCsvHeader(filePath)
    const result = compareColumns(columns, expected)
    return { ...result, file: path.basename(filePath) }
  } catch (error) {
    return {
      file: path.basename(filePath),
      ok: false,
      columns: [],
      missing: expected,
      extra: [],
      message: `Failed to read ${filePath}: ${(error as Error).message}`,
    }
  }
}

function printReport(report: SchemaReport) {
  const status = report.ok ? '✅' : '⚠️'
  console.log(`${status} ${report.file}`)
  console.log(report.message)
  console.log('')
}

export async function checkAllCSVs(baseDir = path.resolve(process.cwd(), 'data')) {
  const reports: SchemaReport[] = []

  for (const [fileName, columns] of Object.entries(EXPECTED_SCHEMAS)) {
    const filePath = path.join(baseDir, fileName)
    const report = await checkCsvSchema(filePath, columns)
    reports.push(report)
    printReport(report)
  }

  return reports
}
