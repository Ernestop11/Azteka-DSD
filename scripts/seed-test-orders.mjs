/**
 * Seed Test Customers and Orders
 * Creates test data for the "Previously Ordered" feature in cart
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test customers and orders...\n')

  // Get some products to use in orders
  const products = await prisma.product.findMany({
    take: 20,
    where: {
      inStock: true,
      price: { gt: 0 }
    },
    orderBy: { name: 'asc' }
  })

  if (products.length === 0) {
    console.log('❌ No products found! Please seed products first.')
    return
  }

  console.log(`Found ${products.length} products to use in orders`)

  // Create test customers
  const testCustomers = [
    {
      id: 'test-customer-maria',
      businessName: "Maria's Market",
      contactName: 'Maria Garcia',
      email: 'maria@test.com',
      phone: '555-0101',
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      priceTier: 'A',
    },
    {
      id: 'test-customer-carlos',
      businessName: "Carlos VIP Stores",
      contactName: 'Carlos Rodriguez',
      email: 'carlos@test.com',
      phone: '555-0102',
      address: '456 Oak Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      priceTier: 'A',
    },
    {
      id: 'test-customer-tienda',
      businessName: 'Tienda La Esperanza',
      contactName: 'Rosa Mendez',
      email: 'rosa@test.com',
      phone: '555-0103',
      address: '789 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77003',
      priceTier: 'B',
    },
  ]

  // Upsert customers
  for (const customer of testCustomers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: {
        ...customer,
        updatedAt: new Date(),
      },
    })
    console.log(`✓ Customer: ${customer.businessName}`)
  }

  // Create orders for each customer
  const orderStatuses = ['DELIVERED', 'PICKED'] // Only completed orders for reorder template

  for (const customer of testCustomers) {
    console.log(`\nCreating orders for ${customer.businessName}...`)

    // Create 3-5 orders per customer
    const numOrders = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < numOrders; i++) {
      const orderId = randomUUID()
      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() - (i * 7 + Math.floor(Math.random() * 7))) // Spread over weeks

      // Pick 3-8 random products for this order
      const numItems = 3 + Math.floor(Math.random() * 6)
      const shuffled = [...products].sort(() => Math.random() - 0.5)
      const orderProducts = shuffled.slice(0, numItems)

      // Calculate total
      const items = orderProducts.map(p => ({
        id: randomUUID(),
        productId: p.id,
        quantity: 1 + Math.floor(Math.random() * 6), // 1-6 cases
        price: Number(p.price),
      }))

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Create order
      await prisma.order.create({
        data: {
          id: orderId,
          customerId: customer.id,
          customerName: customer.businessName,
          status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          total,
          createdAt: orderDate,
          updatedAt: orderDate,
          OrderItem: {
            create: items.map(item => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              createdAt: orderDate,
              updatedAt: orderDate,
            }))
          }
        }
      })

      console.log(`  ✓ Order ${i + 1}: ${items.length} items, $${total.toFixed(2)}`)
    }
  }

  // Summary
  const orderCount = await prisma.order.count({
    where: {
      customerId: { in: testCustomers.map(c => c.id) }
    }
  })

  console.log('\n✅ Seeding complete!')
  console.log(`   Customers: ${testCustomers.length}`)
  console.log(`   Orders: ${orderCount}`)
  console.log('\nTest customer IDs:')
  testCustomers.forEach(c => {
    console.log(`   ${c.businessName}: ${c.id}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
