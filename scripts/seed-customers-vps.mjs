#!/usr/bin/env node
/**
 * VPS Customer & Sales Rep Seed Script
 *
 * Run on VPS: DATABASE_URL="postgresql://azteka_user:azteka_pass_2024@localhost:5432/azteka_dsd" node scripts/seed-customers-vps.mjs
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Sample customers with realistic data
const customers = [
  {
    businessName: 'La Tiendita Market',
    contactName: 'Maria Garcia',
    email: 'maria@latiendita.com',
    phone: '(323) 555-0101',
    address: '1234 Cesar Chavez Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90033',
    priceTier: 'A',
    visitFrequency: 'WEEKLY',
    preferredDays: ['MONDAY', 'THURSDAY'],
    latitude: 34.0522,
    longitude: -118.2137,
  },
  {
    businessName: 'El Mercado Central',
    contactName: 'Jose Rodriguez',
    email: 'jose@elmercado.com',
    phone: '(323) 555-0102',
    address: '5678 Whittier Blvd',
    city: 'East Los Angeles',
    state: 'CA',
    zipCode: '90022',
    priceTier: 'B',
    visitFrequency: 'WEEKLY',
    preferredDays: ['TUESDAY', 'FRIDAY'],
    latitude: 34.0232,
    longitude: -118.1687,
  },
  {
    businessName: 'Supermercado Azteca',
    contactName: 'Carlos Hernandez',
    email: 'carlos@superazteca.com',
    phone: '(562) 555-0103',
    address: '9012 Pacific Blvd',
    city: 'Huntington Park',
    state: 'CA',
    zipCode: '90255',
    priceTier: 'A',
    visitFrequency: 'BI_WEEKLY',
    preferredDays: ['WEDNESDAY'],
    latitude: 33.9817,
    longitude: -118.2251,
  },
  {
    businessName: 'Carniceria Los Primos',
    contactName: 'Roberto Sanchez',
    email: 'roberto@losprimos.com',
    phone: '(323) 555-0104',
    address: '3456 Soto St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90023',
    priceTier: 'B',
    visitFrequency: 'WEEKLY',
    preferredDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    latitude: 34.0195,
    longitude: -118.2103,
  },
  {
    businessName: 'Tienda El Sol',
    contactName: 'Ana Martinez',
    email: 'ana@tiendasol.com',
    phone: '(213) 555-0105',
    address: '7890 Broadway',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90003',
    priceTier: 'C',
    visitFrequency: 'MONTHLY',
    preferredDays: ['TUESDAY'],
    latitude: 33.9892,
    longitude: -118.2615,
  },
  {
    businessName: 'Mercado La Esperanza',
    contactName: 'Pedro Lopez',
    email: 'pedro@laesperanza.com',
    phone: '(323) 555-0106',
    address: '2345 Atlantic Blvd',
    city: 'Commerce',
    state: 'CA',
    zipCode: '90040',
    priceTier: 'A',
    visitFrequency: 'WEEKLY',
    preferredDays: ['THURSDAY'],
    latitude: 33.9970,
    longitude: -118.1520,
  },
  {
    businessName: 'Super Fresco',
    contactName: 'Luis Ramirez',
    email: 'luis@superfresco.com',
    phone: '(562) 555-0107',
    address: '6789 Florence Ave',
    city: 'Bell Gardens',
    state: 'CA',
    zipCode: '90201',
    priceTier: 'B',
    visitFrequency: 'BI_WEEKLY',
    preferredDays: ['MONDAY', 'FRIDAY'],
    latitude: 33.9653,
    longitude: -118.1514,
  },
  {
    businessName: 'Abarrotes Don Jose',
    contactName: 'Miguel Torres',
    email: 'miguel@abarrotesdonjose.com',
    phone: '(323) 555-0108',
    address: '1111 Olympic Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90015',
    priceTier: 'C',
    visitFrequency: 'WEEKLY',
    preferredDays: ['WEDNESDAY'],
    latitude: 34.0395,
    longitude: -118.2686,
  },
]

// Additional sales reps to add (will be generated with proper fields)
function getSalesReps() {
  const now = new Date()
  return [
    {
      id: randomUUID(),
      name: 'Miguel Fernandez',
      email: 'miguel.f@azteka.com',
      password: '$2b$10$rQZ5QJBxMDh6CQZC3Q4j8OxoXUvNq3rM.mQZ5QJBxMDh6CQZC3Q4j', // azteka123
      role: 'SALES_REP',
      updatedAt: now,
    },
    {
      id: randomUUID(),
      name: 'Rosa Delgado',
      email: 'rosa.d@azteka.com',
      password: '$2b$10$rQZ5QJBxMDh6CQZC3Q4j8OxoXUvNq3rM.mQZ5QJBxMDh6CQZC3Q4j', // azteka123
      role: 'SALES_REP',
      updatedAt: now,
    },
  ]
}

async function main() {
  console.log('🌱 Starting VPS seed...\n')

  // Get existing sales rep
  const existingSalesRep = await prisma.user.findFirst({
    where: { role: 'SALES_REP' }
  })
  console.log(`📋 Found existing sales rep: ${existingSalesRep?.name || 'None'}`)

  // Create additional sales reps
  console.log('\n👥 Creating sales reps...')
  const createdReps = []
  const salesReps = getSalesReps()
  for (const rep of salesReps) {
    const existing = await prisma.user.findUnique({ where: { email: rep.email } })
    if (!existing) {
      const created = await prisma.user.create({ data: rep })
      createdReps.push(created)
      console.log(`  ✅ Created: ${created.name} (${created.email})`)
    } else {
      createdReps.push(existing)
      console.log(`  ⏭️  Exists: ${existing.name} (${existing.email})`)
    }
  }

  // Get all users with SALES_REP role (to create SalesRep entries)
  const salesRepUsers = await prisma.user.findMany({
    where: { role: 'SALES_REP' },
    select: { id: true, name: true, email: true }
  })
  console.log(`\n📊 Total sales rep users: ${salesRepUsers.length}`)

  // Create SalesRep entries for each user with SALES_REP role
  console.log('\n🎯 Creating SalesRep entries...')
  const territories = ['Downtown LA', 'East LA', 'South Bay']
  for (let i = 0; i < salesRepUsers.length; i++) {
    const user = salesRepUsers[i]
    const existing = await prisma.salesRep.findFirst({
      where: { userId: user.id }
    })
    if (!existing) {
      await prisma.salesRep.create({
        data: {
          id: randomUUID(),
          name: user.name,
          email: user.email,
          phone: '(323) 555-' + String(200 + i).padStart(4, '0'),
          territory: territories[i % territories.length],
          uniqueLinkCode: `REP-${user.name.split(' ')[0].toUpperCase()}-${Date.now()}`,
          active: true,
          userId: user.id,
          updatedAt: new Date(),
        }
      })
      console.log(`  ✅ Created SalesRep: ${user.name} (${territories[i % territories.length]})`)
    } else {
      console.log(`  ⏭️  Exists: ${user.name}`)
    }
  }

  // Get all SalesRep entries for customer assignment
  const allSalesReps = await prisma.salesRep.findMany({
    where: { active: true },
    select: { id: true, name: true }
  })
  console.log(`\n📊 Total active sales reps: ${allSalesReps.length}`)
  allSalesReps.forEach(rep => console.log(`   - ${rep.name}: ${rep.id}`))

  // Create customers and assign to sales reps
  console.log('\n🏪 Creating customers...')
  const createdCustomers = []
  for (let i = 0; i < customers.length; i++) {
    const customerData = customers[i]
    const salesRep = allSalesReps[i % allSalesReps.length] // Round-robin assignment

    const existing = await prisma.customer.findFirst({
      where: { email: customerData.email }
    })

    if (!existing) {
      const created = await prisma.customer.create({
        data: {
          id: randomUUID(),
          ...customerData,
          salesRepId: salesRep.id,
          active: true,
          updatedAt: new Date(),
        }
      })
      createdCustomers.push(created)
      console.log(`  ✅ Created: ${created.businessName} → Rep: ${salesRep.name} (Tier ${created.priceTier})`)
    } else {
      // Update sales rep assignment if not set
      if (!existing.salesRepId) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: { salesRepId: salesRep.id }
        })
        console.log(`  🔄 Updated: ${existing.businessName} → Rep: ${salesRep.name}`)
      } else {
        console.log(`  ⏭️  Exists: ${existing.businessName}`)
      }
      createdCustomers.push(existing)
    }
  }

  // Create sample price overrides
  console.log('\n💰 Creating sample price overrides...')
  const products = await prisma.product.findMany({ take: 5 })
  const tierACustomers = createdCustomers.filter(c => c.priceTier === 'A')

  // Get an admin user for createdBy
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  })

  if (tierACustomers.length > 0 && products.length > 0) {
    for (const customer of tierACustomers.slice(0, 2)) {
      for (const product of products.slice(0, 2)) {
        const existing = await prisma.customerPriceOverride.findFirst({
          where: { customerId: customer.id, productId: product.id }
        })

        if (!existing && adminUser) {
          const basePrice = Number(product.price)
          const discountPercent = 10 // 10% discount for Tier A

          await prisma.customerPriceOverride.create({
            data: {
              id: randomUUID(),
              customer: { connect: { id: customer.id } },
              product: { connect: { id: product.id } },
              createdBy: { connect: { id: adminUser.id } },
              overrideType: 'PERCENTAGE_DISCOUNT',
              discountPercent: discountPercent,
              active: true,
              notes: 'Tier A loyalty discount',
              updatedAt: new Date(),
            }
          })
          console.log(`  ✅ Override: ${customer.businessName} → ${product.name} (-${discountPercent}%)`)
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SEED SUMMARY')
  console.log('='.repeat(50))

  const finalCounts = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM "Customer") as customers,
      (SELECT COUNT(*) FROM "User" WHERE role = 'SALES_REP') as sales_reps,
      (SELECT COUNT(*) FROM "CustomerPriceOverride") as price_overrides
  `

  console.log(`  Customers: ${finalCounts[0].customers}`)
  console.log(`  Sales Reps: ${finalCounts[0].sales_reps}`)
  console.log(`  Price Overrides: ${finalCounts[0].price_overrides}`)
  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
