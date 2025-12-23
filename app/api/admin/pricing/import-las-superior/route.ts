import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'
import * as XLSX from 'xlsx'

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

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records = XLSX.utils.sheet_to_json(worksheet) as PriceOverrideRow[]

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No records found in file' },
        { status: 400 }
      )
    }

    // Process records
    const results = []
    let successful = 0
    let failed = 0

    for (const record of records) {
      try {
        // Find customer by email
        const customer = await prisma.customer.findUnique({
          where: { email: record.customerEmail },
        })

        if (!customer) {
          results.push({
            email: record.customerEmail,
            sku: record.productSku,
            success: false,
            error: `Customer not found: ${record.customerEmail}`,
          })
          failed++
          continue
        }

        // Find product by SKU
        const product = await prisma.product.findUnique({
          where: { sku: record.productSku },
        })

        if (!product) {
          results.push({
            email: record.customerEmail,
            sku: record.productSku,
            success: false,
            error: `Product not found: ${record.productSku}`,
          })
          failed++
          continue
        }

        // Prepare override data
        const overrideData: any = {
          customerId: customer.id,
          productId: product.id,
          overrideType: record.overrideType,
          createdById: user.id,
          active:
            record.active?.toLowerCase() === 'true' ||
            record.active === undefined ||
            record.active === '',
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

        // Upsert override
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

        results.push({
          email: record.customerEmail,
          sku: record.productSku,
          success: true,
        })
        successful++
      } catch (error) {
        results.push({
          email: record.customerEmail,
          sku: record.productSku,
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      }
    }

    return NextResponse.json({
      data: {
        total: records.length,
        successful,
        failed,
        results,
      },
    })
  } catch (error) {
    console.error('Error importing Las Superior pricing:', error)
    return NextResponse.json(
      {
        error: 'Failed to import pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}




