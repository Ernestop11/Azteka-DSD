import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Counting bundles in database...\n');
  
  try {
    const totalBundles = await prisma.productBundle.count();
    const activeBundles = await prisma.productBundle.count({
      where: { active: true },
    });
    const featuredBundles = await prisma.productBundle.count({
      where: { featured: true },
    });
    const inStockBundles = await prisma.productBundle.count({
      where: { inStock: true },
    });
    
    const bundlesWithItems = await prisma.productBundle.findMany({
      include: {
        items: true,
      },
    });
    
    const avgItemsPerBundle = bundlesWithItems.length > 0
      ? bundlesWithItems.reduce((sum, b) => sum + b.items.length, 0) / bundlesWithItems.length
      : 0;
    
    console.log('📦 Bundle Statistics:');
    console.log(`   Total Bundles: ${totalBundles}`);
    console.log(`   Active Bundles: ${activeBundles}`);
    console.log(`   Featured Bundles: ${featuredBundles}`);
    console.log(`   In Stock: ${inStockBundles}`);
    console.log(`   Average Items per Bundle: ${avgItemsPerBundle.toFixed(1)}`);
    
    if (totalBundles >= 3) {
      console.log('\n✅ Good! Database has 3+ test bundles.');
    } else {
      console.log(`\n⚠️  Expected 3+ bundles, found ${totalBundles}`);
      console.log('   Run: npm run db:seed-bundles');
    }
    
    // List bundles
    if (totalBundles > 0) {
      console.log('\n📋 Bundle List:');
      const bundles = await prisma.productBundle.findMany({
        select: {
          id: true,
          name: true,
          active: true,
          featured: true,
          inStock: true,
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      bundles.forEach((bundle, index) => {
        const status = [
          bundle.active ? '✓' : '✗',
          bundle.featured ? '⭐' : '',
          bundle.inStock ? '📦' : '❌',
        ].filter(Boolean).join(' ');
        console.log(`   ${index + 1}. ${bundle.name} ${status} (${bundle._count.items} items)`);
      });
    }
  } catch (error) {
    console.error('❌ Error counting bundles:', error);
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

