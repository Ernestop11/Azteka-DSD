import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

export async function seedCustomers() {
  console.log('🌱 Seeding customers...')

  const csvPath = './data/customers.csv'
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Customers CSV not found at: ${csvPath}`)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let created = 0
  let skipped = 0

  for (const record of records) {
    const businessName = record['Business Name']?.trim() || record.businessName?.trim() || record.storeName?.trim()
    const contactName = businessName || record.name?.trim() || record.Name?.trim() || 'N/A'
    const address = record['Street Address']?.trim() || record.address?.trim() || record.Address?.trim() || 'N/A'
    const city = record.City?.trim() || record.city?.trim() || 'N/A'
    const state = record.State?.trim() || record.state?.trim() || 'N/A'
    const zipCode = record['Zip Code']?.trim() || record.zip?.trim() || record.zipCode?.trim() || 'N/A'
    const phone = record['Phone Number']?.trim() || record.phone?.trim() || record.Phone?.trim() || 'N/A'
    const email = record.User?.trim() || record.email?.trim() || record.Email?.trim() || `customer-${Date.now()}@placeholder.com`

    if (!businessName) {
      skipped++
      continue
    }

    // Generate unique email if missing
    let finalEmail = email
    if (!email || email === 'N/A') {
      finalEmail = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}@placeholder.com`
    }

    try {
      await prisma.customer.create({
        data: {
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          phone: phone.trim(),
          email: finalEmail.trim(),
        },
      })
      created++
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation (email already exists)
        skipped++
      } else {
        console.error(`Error creating customer "${businessName}":`, error.message)
        skipped++
      }
    }
  }

  console.log(`✅ Customers seeded: ${created} created, ${skipped} skipped`)
  return { created, skipped }
}

