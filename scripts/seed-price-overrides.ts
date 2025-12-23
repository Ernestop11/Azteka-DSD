/**
 * Seed script for importing customer price overrides from CSV/Excel
 * 
 * Usage:
 *   ts-node scripts/seed-price-overrides.ts --file prices.csv
 *   ts-node scripts/seed-price-overrides.ts --file prices.xlsx
 * 
 * CSV Format (with headers):
 *   customerEmail,productSku,overrideType,fixedPrice,discountPercent,discountAmount,minQuantity,maxQuantity,contractNumber,notes,startDate,endDate,active
 * 
 * Example:
 *   customer@example.com,SKU-001,FIXED_PRICE,22.99,,,,,CONTRACT-123,Volume discount,,,,true
 *   customer@example.com,SKU-002,PERCENTAGE_DISCOUNT,,10,,,,,10% off,,,,true
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

interface PriceOverrideRow {
  customerEmail: string
  productSku: string
  overrideType: 'FIXED_PRICE' | 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'TIERED'
  fixedPrice?: string
  discountPercent?: string
  discountAmount?: string
  minQuantity?: string
  maxQuantity?: string
  contractNumber?: string
  notes?: string
  startDate?: string
  endDate?: string
  active?: string
}

async function seedFromCSV(filePath: string) {
  console.log(`📄 Reading CSV file: ${filePath}`)
  
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PriceOverrideRow[]

  console.log(`📊 Found ${records.length} price override records`)
  
  return records
}

async function seedFromExcel(filePath: string) {
  console.log(`📄 Reading Excel file: ${filePath}`)
  
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const records = XLSX.utils.sheet_to_json(worksheet) as PriceOverrideRow[]

  console.log(`📊 Found ${records.length} price override records`)
  
  return records
}

async function seedPriceOverrides(records: PriceOverrideRow[], createdByEmail: string = 'system@azteka.com') {
  // Get admin user for createdById
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: createdByEmail },
        { role: 'SUPER_ADMIN' },
      ],
    },
  })

  if (!adminUser) {
    throw new Error(`Admin user not found. Please create a user with email ${createdByEmail} or SUPER_ADMIN role.`)
  }

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ row: number; error: string }> = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const rowNumber = i + 2 // +2 because row 1 is header, and arrays are 0-indexed

    try {
      // Find customer by email
      const customer = await prisma.customer.findUnique({
        where: { email: record.customerEmail },
      })

      if (!customer) {
        throw new Error(`Customer not found: ${record.customerEmail}`)
      }

      // Find product by SKU
      const product = await prisma.product.findUnique({
        where: { sku: record.productSku },
      })

      if (!product) {
        throw new Error(`Product not found: ${record.productSku}`)
      }

      // Prepare override data
      const overrideData: any = {
        customerId: customer.id,
        productId: product.id,
        overrideType: record.overrideType,
        createdById: adminUser.id,
        active: record.active?.toLowerCase() === 'true' || record.active === undefined || record.active === '',
      }

      // Set override type specific fields
      if (record.fixedPrice) {
        overrideData.fixedPrice = parseFloat(record.fixedPrice)
      }
      if (record.discountPercent) {
        overrideData.discountPercent = parseFloat(record.discountPercent)
      }
      if (record.discountAmount) {
        overrideData.discountAmount = parseFloat(record.discountAmount)
      }
      if (record.minQuantity) {
        overrideData.minQuantity = parseInt(record.minQuantity)
      }
      if (record.maxQuantity) {
        overrideData.maxQuantity = parseInt(record.maxQuantity)
      }
      if (record.contractNumber) {
        overrideData.contractNumber = record.contractNumber
      }
      if (record.notes) {
        overrideData.notes = record.notes
      }
      if (record.startDate) {
        overrideData.startDate = new Date(record.startDate)
      }
      if (record.endDate) {
        overrideData.endDate = new Date(record.endDate)
      }

      // Upsert override (update if exists, create if not)
      await prisma.customerPriceOverride.upsert({
        where: {
          customerId_productId_minQuantity: {
            customerId: customer.id,
            productId: product.id,
            minQuantity: overrideData.minQuantity || null,
          },
        },
        create: overrideData,
        update: overrideData,
      })

      successCount++
      if (successCount % 10 === 0) {
        console.log(`✅ Processed ${successCount} records...`)
      }
    } catch (error) {
      errorCount++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ row: rowNumber, error: errorMessage })
      console.error(`❌ Row ${rowNumber}: ${errorMessage}`)
    }
  }

  return { successCount, errorCount, errors }
}

async function main() {
  const args = process.argv.slice(2)
  const fileIndex = args.indexOf('--file')
  
  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error('Usage: ts-node scripts/seed-price-overrides.ts --file <path-to-csv-or-xlsx>')
    process.exit(1)
  }

  const filePath = args[fileIndex + 1]
  const createdByEmail = args.indexOf('--created-by') !== -1 
    ? args[args.indexOf('--created-by') + 1]
    : 'system@azteka.com'

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  try {
    let records: PriceOverrideRow[]

    // Determine file type
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.csv') {
      records = await seedFromCSV(filePath)
    } else if (ext === '.xlsx' || ext === '.xls') {
      records = await seedFromExcel(filePath)
    } else {
      console.error(`❌ Unsupported file type: ${ext}. Please use .csv or .xlsx`)
      process.exit(1)
    }

    console.log(`\n🚀 Starting price override import...`)
    const result = await seedPriceOverrides(records, createdByEmail)

    console.log(`\n✅ Import complete!`)
    console.log(`   Success: ${result.successCount}`)
    console.log(`   Errors: ${result.errorCount}`)

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors:`)
      result.errors.forEach(({ row, error }) => {
        console.log(`   Row ${row}: ${error}`)
      })
    }
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedPriceOverrides, seedFromCSV, seedFromExcel }




