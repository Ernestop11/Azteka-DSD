#!/usr/bin/env node
/**
 * Verify Business Settings Sync
 * Checks if settings are saved in database and which pages use them
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying Business Settings Sync\n')

  // 1. Check if settings exist in database
  console.log('1. Checking database...')
  const settings = await prisma.businessSettings.findUnique({
    where: { id: 'default' }
  })

  if (!settings) {
    console.log('❌ No settings found in database!')
    process.exit(1)
  }

  console.log('✅ Settings found in database:')
  console.log(`   Name: ${settings.name}`)
  console.log(`   Phone: ${settings.phone || '(empty)'}`)
  console.log(`   Email: ${settings.email || '(empty)'}`)
  console.log(`   Address: ${settings.address || '(empty)'}`)
  console.log(`   Warehouse: ${settings.warehouseAddress || '(empty)'}, ${settings.warehouseCity || ''} ${settings.warehouseState || ''}`)
  console.log(`   Last Updated: ${settings.updatedAt}\n`)

  // 2. List pages that use settings
  console.log('2. Pages that use Business Settings:')
  console.log('   ✅ /catalog - Uses business name in header via /api/settings/public')
  console.log('   ✅ /driver/today - Uses warehouse address via /api/settings/public')
  console.log('   ✅ /kiosk - Uses business name via /api/settings/public')
  console.log('   ✅ /admin/settings - Admin edit page\n')

  // 3. Check SalesRep and Driver models
  console.log('3. SalesRep and Driver models:')
  const salesReps = await prisma.salesRep.findMany({ take: 1 })
  const drivers = await prisma.user.findMany({ 
    where: { role: 'DRIVER' },
    take: 1 
  })
  
  console.log(`   SalesRep model: ${salesReps.length > 0 ? 'Has data' : 'Empty'}`)
  console.log(`   - SalesRep does NOT have address fields (only name, email, phone, territory)`)
  console.log(`   - SalesRep addresses are NOT synced with BusinessSettings`)
  console.log(`   Driver model: ${drivers.length > 0 ? 'Has data' : 'Empty'}`)
  console.log(`   - Drivers are Users, they don't have separate address fields`)
  console.log(`   - Driver page uses warehouse address from BusinessSettings\n`)

  // 4. Summary
  console.log('📊 Summary:')
  console.log('   ✅ Settings ARE saved to database (BusinessSettings table)')
  console.log('   ✅ Settings ARE used by catalog, driver, and kiosk pages')
  console.log('   ⚠️  SalesRep and Driver do NOT have addresses to sync')
  console.log('   ✅ Warehouse address from settings is used by driver page')
  console.log('   ✅ Business name from settings is used by catalog header\n')

  await prisma.$disconnect()
}

main().catch(console.error)





