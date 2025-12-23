const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTable() {
  try {
    // Check if table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "CustomerPriceOverride" LIMIT 1`
      console.log('✅ CustomerPriceOverride table already exists')
      return
    } catch (e) {
      console.log('Table does not exist, creating...')
    }

    // Create enum type
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "OverrideType" AS ENUM ('FIXED_PRICE', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'TIERED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
      console.log('✅ OverrideType enum created')
    } catch (e) {
      console.log('Enum may already exist:', e.message)
    }

    // Create table
    await prisma.$executeRaw`
      CREATE TABLE "CustomerPriceOverride" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "overrideType" "OverrideType" NOT NULL DEFAULT 'FIXED_PRICE',
        "fixedPrice" DECIMAL(10,2),
        "discountPercent" DECIMAL(5,2),
        "discountAmount" DECIMAL(10,2),
        "minQuantity" INTEGER,
        "maxQuantity" INTEGER,
        "contractNumber" TEXT,
        "notes" TEXT,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdById" TEXT NOT NULL,
        "approvedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CustomerPriceOverride_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ CustomerPriceOverride table created')

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_idx" ON "CustomerPriceOverride"("customerId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_productId_idx" ON "CustomerPriceOverride"("productId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_active_idx" ON "CustomerPriceOverride"("active")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_endDate_idx" ON "CustomerPriceOverride"("endDate")`
    console.log('✅ Indexes created')

    // Create unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_productId_minQuantity_key" 
      ON "CustomerPriceOverride"("customerId", "productId", COALESCE("minQuantity", -1))
    `
    console.log('✅ Unique constraint created')

    // Add foreign keys
    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
      `
      console.log('✅ Foreign key to Customer added')
    } catch (e) {
      console.log('Foreign key may already exist:', e.message)
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
      `
      console.log('✅ Foreign key to Product added')
    } catch (e) {
      console.log('Foreign key may already exist:', e.message)
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
      `
      console.log('✅ Foreign key to User (createdBy) added')
    } catch (e) {
      console.log('Foreign key may already exist:', e.message)
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_approvedById_fkey" 
        FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL
      `
      console.log('✅ Foreign key to User (approvedBy) added')
    } catch (e) {
      console.log('Foreign key may already exist:', e.message)
    }

    console.log('✅ All done! CustomerPriceOverride table is ready')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createTable()



