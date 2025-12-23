import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'

// Temporary endpoint to create CustomerPriceOverride table
// This will be removed after migration is complete
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    // Check if table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "CustomerPriceOverride" LIMIT 1`
      return NextResponse.json({ 
        message: 'Table already exists',
        exists: true 
      })
    } catch (e) {
      // Table doesn't exist, create it
    }

    // Create enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "OverrideType" AS ENUM ('FIXED_PRICE', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'TIERED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

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

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_idx" ON "CustomerPriceOverride"("customerId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_productId_idx" ON "CustomerPriceOverride"("productId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_active_idx" ON "CustomerPriceOverride"("active")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "CustomerPriceOverride_endDate_idx" ON "CustomerPriceOverride"("endDate")`

    // Create unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPriceOverride_customerId_productId_minQuantity_key" 
      ON "CustomerPriceOverride"("customerId", "productId", COALESCE("minQuantity", -1))
    `

    // Add foreign keys (with error handling)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
      `
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
      `
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
      `
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "CustomerPriceOverride" 
        ADD CONSTRAINT "CustomerPriceOverride_approvedById_fkey" 
        FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL
      `
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e
    }

    return NextResponse.json({ 
      message: 'CustomerPriceOverride table created successfully',
      success: true 
    })
  } catch (error: any) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create table',
        details: error.message 
      },
      { status: 500 }
    )
  }
}




