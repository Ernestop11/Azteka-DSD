import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function optimizeDatabase() {
  console.log('🚀 Optimizing database for 642 products...\n');
  
  try {
    // Check existing indexes
    console.log('📊 Checking existing indexes...');
    const existingIndexes = await prisma.$queryRaw`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'Product' 
      AND schemaname = 'public';
    `;
    console.log(`   Found ${existingIndexes.length} existing indexes\n`);
    
    // Add database indexes for better performance
    console.log('🔧 Creating performance indexes...');
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_category_id ON "Product"("categoryId");`;
      console.log('   ✅ Index: categoryId');
    } catch (e) {
      console.log('   ⚠️  Index categoryId already exists or error:', e.message);
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_brand_id ON "Product"("brandId");`;
      console.log('   ✅ Index: brandId');
    } catch (e) {
      console.log('   ⚠️  Index brandId already exists or error:', e.message);
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_in_stock ON "Product"("inStock");`;
      console.log('   ✅ Index: inStock');
    } catch (e) {
      console.log('   ⚠️  Index inStock already exists or error:', e.message);
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_stock ON "Product"(stock);`;
      console.log('   ✅ Index: stock');
    } catch (e) {
      console.log('   ⚠️  Index stock already exists or error:', e.message);
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_featured ON "Product"(featured);`;
      console.log('   ✅ Index: featured');
    } catch (e) {
      console.log('   ⚠️  Index featured already exists or error:', e.message);
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_products_is_hidden ON "Product"("isHidden");`;
      console.log('   ✅ Index: isHidden');
    } catch (e) {
      console.log('   ⚠️  Index isHidden already exists or error:', e.message);
    }
    
    // Test query performance
    console.log('\n⚡ Testing query performance...');
    
    console.time('  Filtered products query');
    const filteredProducts = await prisma.product.findMany({
      where: {
        inStock: true,
        isHidden: false,
      },
      select: {
        id: true,
        name: true,
        priceCase: true,
        images: {
          take: 1,
          select: {
            thumbnail_url: true,
            medium_url: true,
          },
        },
      },
      take: 50,
    });
    console.timeEnd('  Filtered products query');
    console.log(`   Found ${filteredProducts.length} products with filters`);
    
    // Test pagination performance
    console.time('  Pagination query');
    const paginatedProducts = await prisma.product.findMany({
      skip: 100,
      take: 50,
      select: {
        id: true,
        name: true,
        priceCase: true,
        images: {
          take: 1,
          select: {
            thumbnail_url: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    console.timeEnd('  Pagination query');
    console.log(`   Paginated query returned ${paginatedProducts.length} products`);
    
    // Test category filtering
    console.time('  Category filter query');
    const categoryProducts = await prisma.product.findMany({
      where: {
        categoryId: { not: null },
        inStock: true,
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      take: 50,
    });
    console.timeEnd('  Category filter query');
    console.log(`   Found ${categoryProducts.length} products with categories`);
    
    console.log('\n✅ Database optimization complete');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  }
}

optimizeDatabase()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

