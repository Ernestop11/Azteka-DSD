import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

interface ProductInput {
  id: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  isNewProduct: boolean
  existingProductId?: string
}

interface CustomerInput {
  businessName: string
  contactName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  existingId?: string
  isNew: boolean
}

// POST /api/rep/seed-invoice - Save parsed invoice data to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer,
      products,
      invoiceNumber,
      invoiceDate,
      total,
      repId,
    } = body as {
      customer: CustomerInput
      products: ProductInput[]
      invoiceNumber?: string
      invoiceDate?: string
      total?: number
      repId?: string
    }

    if (!customer || !products || products.length === 0) {
      return NextResponse.json({ error: 'Customer and products required' }, { status: 400 })
    }

    // Validate repId exists in Employee table if provided
    let validRepId: string | null = null
    if (repId) {
      const rep = await prisma.employee.findUnique({
        where: { id: repId },
        select: { id: true }
      })
      if (rep) {
        validRepId = rep.id
      }
    }

    // Get or create customer
    let customerId: string

    if (customer.existingId) {
      customerId = customer.existingId
      // Update existing customer with any new info from invoice (Ship To address)
      // Only update fields that have actual values (don't overwrite with empty strings)
      const updateData: Record<string, unknown> = { updatedAt: new Date() }
      // Update businessName if it's different and meaningful (not generic placeholder)
      if (customer.businessName && customer.businessName.trim() &&
          !customer.businessName.toLowerCase().includes('unknown') &&
          customer.businessName.trim().length > 2) {
        updateData.businessName = customer.businessName.trim()
      }
      if (customer.contactName && customer.contactName.trim()) updateData.contactName = customer.contactName
      if (customer.email && customer.email.includes('@') && !customer.email.includes('@customer.local')) updateData.email = customer.email
      if (customer.phone && customer.phone.trim()) updateData.phone = customer.phone
      if (customer.address && customer.address.trim()) updateData.address = customer.address
      if (customer.city && customer.city.trim()) updateData.city = customer.city
      if (customer.state && customer.state.trim()) updateData.state = customer.state
      if (customer.zipCode && customer.zipCode.trim()) updateData.zipCode = customer.zipCode

      await prisma.customer.update({
        where: { id: customerId },
        data: updateData
      })
      console.log(`[Seed Invoice] Updated customer ${customerId} with data:`, updateData)
    } else {
      // Create new customer
      const newCustomer = await prisma.customer.create({
        data: {
          id: randomUUID(),
          businessName: customer.businessName,
          contactName: customer.contactName || '',
          phone: customer.phone || '',
          email: customer.email || `${customer.businessName.toLowerCase().replace(/\s+/g, '')}@customer.local`,
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || 'CA',
          zipCode: customer.zipCode || '',
          priceTier: 'B', // Default tier, can be adjusted
          salesRepId: validRepId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
      customerId = newCustomer.id
    }

    // Process products - create new ones and track price overrides
    let productsCreated = 0
    let priceOverrides = 0
    const createdProductIds: string[] = []
    const orderItems: { productId: string; quantity: number; price: number }[] = []

    for (const product of products) {
      let productId: string

      if (product.existingProductId) {
        productId = product.existingProductId

        // Check if this price differs from base - create override if needed
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId },
          select: { price: true }
        })

        if (existingProduct) {
          const basePrice = Number(existingProduct.price)
          const priceDiff = Math.abs(product.unitPrice - basePrice)

          // If price differs by more than 1%, create an override
          if (priceDiff / basePrice > 0.01 && validRepId) {
            // Check if override already exists for this customer/product (no min quantity)
            const existingOverride = await prisma.customerPriceOverride.findFirst({
              where: {
                customerId,
                productId,
                minQuantity: null,
              }
            })

            if (existingOverride) {
              // Update existing override
              await prisma.customerPriceOverride.update({
                where: { id: existingOverride.id },
                data: {
                  fixedPrice: product.unitPrice,
                  updatedAt: new Date(),
                }
              })
            } else {
              // Create new override
              await prisma.customerPriceOverride.create({
                data: {
                  customerId,
                  productId,
                  overrideType: 'FIXED_PRICE',
                  fixedPrice: product.unitPrice,
                  minQuantity: null,
                  active: true,
                  createdById: validRepId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              })
            }
            priceOverrides++
          }
        }
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            id: randomUUID(),
            name: product.name,
            sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            price: product.unitPrice,
            inStock: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
        productId = newProduct.id
        createdProductIds.push(newProduct.id)
        productsCreated++
      }

      orderItems.push({
        productId,
        quantity: product.quantity,
        price: product.unitPrice,
      })
    }

    // Create historical order from this invoice
    const orderTotal = total || products.reduce((sum, p) => sum + p.total, 0)

    // Check for duplicate invoice to prevent double-seeding
    if (invoiceNumber) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          customerId,
          notes: { contains: invoiceNumber }
        }
      })
      if (existingOrder) {
        return NextResponse.json({
          success: false,
          error: `Invoice #${invoiceNumber} has already been seeded for this customer`,
          existingOrderId: existingOrder.id
        }, { status: 409 })
      }
    }

    const order = await prisma.order.create({
      data: {
        id: randomUUID(),
        customerName: customer.businessName,
        customerId,
        total: orderTotal,
        status: 'DELIVERED', // Historical order, already fulfilled
        notes: invoiceNumber ? `Invoice #${invoiceNumber}` : undefined,
        createdAt: invoiceDate ? new Date(invoiceDate) : new Date(),
        updatedAt: new Date(),
        OrderItem: {
          create: orderItems.map(item => ({
            id: randomUUID(),
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        }
      },
      include: {
        Customer: { select: { businessName: true } }
      }
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        businessName: customer.businessName,
        isNew: customer.isNew,
      },
      productsCreated,
      createdProductIds,
      priceOverrides,
      invoiceNumber: invoiceNumber || null,
      orderId: order.id,
    })
  } catch (error) {
    console.error('[Seed Invoice API] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to save invoice data'
    }, { status: 500 })
  }
}
