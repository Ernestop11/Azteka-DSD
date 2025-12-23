const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDatabase() {
  try {
    console.log('🔧 Creating OverrideType enum...')
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "OverrideType" AS ENUM ('FIXED_PRICE', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'TIERED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    console.log('✅ Enum created/verified')

    console.log('🔧 Creating CustomerPriceOverride table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CustomerPriceOverride" (
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
      );
    `
    console.log('✅ Table created/verified')

    console.log('🔧 Creating indexes...')
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_idx" ON "CustomerPriceOverride"("customerId");`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_productId_idx" ON "CustomerPriceOverride"("productId");`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_active_idx" ON "CustomerPriceOverride"("active");`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_endDate_idx" ON "CustomerPriceOverride"("endDate");`
    console.log('✅ Indexes created/verified')

    console.log('🔧 Creating unique constraint...')
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_productId_minQuantity_key" 
        ON "CustomerPriceOverride"("customerId", "productId", COALESCE("minQuantity", -1));
    `
    console.log('✅ Unique constraint created/verified')

    console.log('🔧 Adding foreign key constraints...')
    const fks = [
      { name: 'customerId', table: 'Customer', onDelete: 'CASCADE' },
      { name: 'productId', table: 'Product', onDelete: 'CASCADE' },
      { name: 'createdById', table: 'User', onDelete: 'RESTRICT' },
      { name: 'approvedById', table: 'User', onDelete: 'SET NULL' },
    ]

    for (const fk of fks) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "CustomerPriceOverride" 
          ADD CONSTRAINT IF NOT EXISTS "CustomerPriceOverride_${fk.name}_fkey" 
          FOREIGN KEY ("${fk.name}") REFERENCES "${fk.table}"("id") ON DELETE ${fk.onDelete};
        `)
        console.log(`  ✅ FK ${fk.name} added/verified`)
      } catch (e) {
        if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
          console.log(`  ✅ FK ${fk.name} already exists`)
        } else {
          console.log(`  ⚠️  FK ${fk.name}: ${e.message}`)
        }
      }
    }

    console.log('🔍 Verifying table...')
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'CustomerPriceOverride';
    `
    
    if (result.length > 0) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'CustomerPriceOverride'
        ORDER BY ordinal_position;
      `
      console.log(`✅ Table verified: ${columns.length} columns`)
    } else {
      console.log('❌ Table not found!')
    }

    console.log('\n✅ Database fix complete!')
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

fixDatabase()



