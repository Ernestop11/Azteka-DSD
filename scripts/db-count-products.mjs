import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Counting products in database...\n');
  
  try {
    const totalProducts = await prisma.product.count();
    const csvProducts = await prisma.product.count({
      where: {
        OR: [
          { source: 'csv' },
          { source: 'CSV' },
          { source: 'seed-script' },
        ],
      },
    });
    const externalProducts = await prisma.product.count({
      where: {
        AND: [
          { source: { not: 'csv' } },
          { source: { not: 'CSV' } },
          { source: { not: 'seed-script' } },
        ],
      },
    });
    
    const inStockProducts = await prisma.product.count({
      where: { inStock: true },
    });
    
    const bundles = await prisma.productBundle.count();
    
    console.log('📦 Product Statistics:');
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   CSV Products: ${csvProducts}`);
    console.log(`   External Products: ${externalProducts}`);
    console.log(`   In Stock: ${inStockProducts}`);
    console.log(`   Out of Stock: ${totalProducts - inStockProducts}`);
    console.log(`\n📦 Bundles: ${bundles}`);
    
    if (totalProducts === 642) {
      console.log('\n✅ Perfect! Database has exactly 642 products.');
    } else {
      console.log(`\n⚠️  Expected 642 products, found ${totalProducts}`);
      if (totalProducts > 642) {
        console.log(`   Need to delete ${totalProducts - 642} products`);
      } else {
        console.log(`   Missing ${642 - totalProducts} products`);
      }
    }
  } catch (error) {
    console.error('❌ Error counting products:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

