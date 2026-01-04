import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// POST - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessName,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      priceTier,
      taxId,
      groupId,
      notes
    } = body

    // Only require business name, address, and city
    if (!businessName) {
      return NextResponse.json(
        { error: 'Nombre del negocio es requerido' },
        { status: 400 }
      )
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Dirección es requerida' },
        { status: 400 }
      )
    }

    if (!city) {
      return NextResponse.json(
        { error: 'Ciudad es requerida' },
        { status: 400 }
      )
    }

    // Check for duplicate phone if provided
    if (phone) {
      const existingPhone = await prisma.customer.findFirst({
        where: { phone }
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este número de teléfono' },
          { status: 400 }
        )
      }
    }

    // Generate unique email if not provided (required by schema)
    const customerId = uuidv4()
    const customerEmail = email || `customer-${customerId.slice(0, 8)}@azteka.local`

    // Check for duplicate email if a real one was provided
    if (email) {
      const existingEmail = await prisma.customer.findFirst({
        where: { email }
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este email' },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.create({
      data: {
        id: customerId,
        businessName,
        contactName: contactName || businessName,
        email: customerEmail,
        phone: phone || '',
        address,
        city,
        state: state || '',
        zipCode: zipCode || '',
        priceTier: priceTier || 'B',
        taxId: taxId || null,
        groupId: groupId || null,
        active: true,
        role: 'STANDARD'
      }
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        businessName: customer.businessName,
        contactName: customer.contactName,
        phone: customer.phone
      }
    })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
