import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Seeding test bundles for Carlos\'s business...\n');
  
  try {
    // Get some sample products to use in bundles
    const allProducts = await prisma.product.findMany({
      where: { inStock: true },
      take: 50, // Get first 50 products
      orderBy: { name: 'asc' },
    });
    
    if (allProducts.length < 20) {
      console.error('❌ Not enough products in database. Need at least 20 products.');
      process.exit(1);
    }
    
    console.log(`📦 Found ${allProducts.length} products to use in bundles\n`);
    
    // Bundle 1: "La Molienda Starter Pack" (5 products)
    console.log('1️⃣ Creating "La Molienda Starter Pack"...');
    const bundle1Products = allProducts.slice(0, 5);
    const bundle1Price = bundle1Products.reduce((sum, p) => sum + (p.priceCase || 0), 0);
    
    const bundle1 = await prisma.productBundle.create({
      data: {
        name: 'La Molienda Starter Pack',
        slug: generateSlug('La Molienda Starter Pack'),
        description: 'Perfect starter pack for La Molienda products - includes our most popular items',
        price: bundle1Price * 0.9, // 10% discount
        discountPercent: 10,
        inStock: true,
        active: true,
        featured: true,
        items: {
          create: bundle1Products.map((product, index) => ({
            productId: product.id,
            quantity: 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    console.log(`   ✅ Created bundle: ${bundle1.name}`);
    console.log(`   Products: ${bundle1.items.length}`);
    console.log(`   Price: $${bundle1.price} (${bundle1.discountPercent}% discount)\n`);
    
    // Bundle 2: "Marinela Sweet Bundle" (8 products)
    console.log('2️⃣ Creating "Marinela Sweet Bundle"...');
    const bundle2Products = allProducts.slice(5, 13);
    const bundle2Price = bundle2Products.reduce((sum, p) => sum + (p.priceCase || 0), 0);
    
    const bundle2 = await prisma.productBundle.create({
      data: {
        name: 'Marinela Sweet Bundle',
        slug: generateSlug('Marinela Sweet Bundle'),
        description: 'Sweet treats bundle featuring Marinela products - great for convenience stores',
        price: bundle2Price * 0.85, // 15% discount
        discountPercent: 15,
        inStock: true,
        active: true,
        featured: true,
        items: {
          create: bundle2Products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    console.log(`   ✅ Created bundle: ${bundle2.name}`);
    console.log(`   Products: ${bundle2.items.length}`);
    console.log(`   Price: $${bundle2.price} (${bundle2.discountPercent}% discount)\n`);
    
    // Bundle 3: "Gamesa Cookie Mix" (6 products)
    console.log('3️⃣ Creating "Gamesa Cookie Mix"...');
    const bundle3Products = allProducts.slice(13, 19);
    const bundle3Price = bundle3Products.reduce((sum, p) => sum + (p.priceCase || 0), 0);
    
    const bundle3 = await prisma.productBundle.create({
      data: {
        name: 'Gamesa Cookie Mix',
        slug: generateSlug('Gamesa Cookie Mix'),
        description: 'Variety pack of Gamesa cookies - perfect for gas stations and convenience stores',
        price: bundle3Price * 0.88, // 12% discount
        discountPercent: 12,
        inStock: true,
        active: true,
        featured: true,
        items: {
          create: bundle3Products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    console.log(`   ✅ Created bundle: ${bundle3.name}`);
    console.log(`   Products: ${bundle3.items.length}`);
    console.log(`   Price: $${bundle3.price} (${bundle3.discountPercent}% discount)\n`);
    
    // Summary
    console.log('✅ Test bundles seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   1. ${bundle1.name} - ${bundle1.items.length} products`);
    console.log(`   2. ${bundle2.name} - ${bundle2.items.length} products`);
    console.log(`   3. ${bundle3.name} - ${bundle3.items.length} products`);
    console.log(`\n   Total bundles: 3`);
    console.log(`   Total bundle items: ${bundle1.items.length + bundle2.items.length + bundle3.items.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding bundles:', error);
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

