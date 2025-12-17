import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying bundle database consistency...\n');
  
  let errors = 0;
  let warnings = 0;
  
  try {
    // Check 1: All bundles have items
    console.log('1️⃣ Checking bundles have items...');
    const bundlesWithoutItems = await prisma.productBundle.findMany({
      where: {
        items: {
          none: {},
        },
      },
    });
    
    if (bundlesWithoutItems.length > 0) {
      console.log(`   ⚠️  Found ${bundlesWithoutItems.length} bundles without items:`);
      bundlesWithoutItems.forEach(b => console.log(`      - ${b.name} (ID: ${b.id})`));
      warnings += bundlesWithoutItems.length;
    } else {
      console.log('   ✅ All bundles have items');
    }
    
    // Check 2: All bundle items reference valid products
    console.log('\n2️⃣ Checking bundle items reference valid products...');
    const allBundleItems = await prisma.bundleItem.findMany({
      include: {
        product: true,
      },
    });
    
    const invalidItems = allBundleItems.filter(item => !item.product);
    if (invalidItems.length > 0) {
      console.log(`   ❌ Found ${invalidItems.length} bundle items with invalid product references:`);
      invalidItems.forEach(item => console.log(`      - BundleItem ${item.id} → Product ${item.productId} (not found)`));
      errors += invalidItems.length;
    } else {
      console.log(`   ✅ All ${allBundleItems.length} bundle items reference valid products`);
    }
    
    // Check 3: Bundle prices are reasonable
    console.log('\n3️⃣ Checking bundle prices...');
    const allBundles = await prisma.productBundle.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    for (const bundle of allBundles) {
      const calculatedPrice = bundle.items.reduce((sum, item) => {
        const productPrice = item.product?.priceCase || 0;
        return sum + (productPrice * item.quantity);
      }, 0);
      
      const expectedPrice = calculatedPrice * (1 - (bundle.discountPercent / 100));
      const priceDiff = Math.abs(Number(bundle.price) - expectedPrice);
      const priceDiffPercent = (priceDiff / expectedPrice) * 100;
      
      if (priceDiffPercent > 5) { // More than 5% difference
        console.log(`   ⚠️  Bundle "${bundle.name}" price mismatch:`);
        console.log(`      Current: $${bundle.price}`);
        console.log(`      Expected: $${expectedPrice.toFixed(2)} (${priceDiffPercent.toFixed(1)}% difference)`);
        warnings++;
      }
    }
    
    if (warnings === 0) {
      console.log('   ✅ All bundle prices are consistent');
    }
    
    // Check 4: Foreign key relationships
    console.log('\n4️⃣ Checking foreign key relationships...');
    const bundlesWithInvalidRelations = await prisma.productBundle.findMany({
      where: {
        OR: [
          { categoryId: { not: null } },
          { brandId: { not: null } },
        ],
      },
      include: {
        category: true,
        brand: true,
      },
    });
    
    const invalidCategoryRefs = bundlesWithInvalidRelations.filter(b => 
      b.categoryId && !b.category
    );
    const invalidBrandRefs = bundlesWithInvalidRelations.filter(b => 
      b.brandId && !b.brand
    );
    
    if (invalidCategoryRefs.length > 0) {
      console.log(`   ❌ Found ${invalidCategoryRefs.length} bundles with invalid category references`);
      errors += invalidCategoryRefs.length;
    }
    if (invalidBrandRefs.length > 0) {
      console.log(`   ❌ Found ${invalidBrandRefs.length} bundles with invalid brand references`);
      errors += invalidBrandRefs.length;
    }
    if (invalidCategoryRefs.length === 0 && invalidBrandRefs.length === 0) {
      console.log('   ✅ All foreign key relationships are valid');
    }
    
    // Summary
    console.log('\n📊 Verification Summary:');
    console.log(`   Total bundles: ${allBundles.length}`);
    console.log(`   Total bundle items: ${allBundleItems.length}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    
    if (errors === 0 && warnings === 0) {
      console.log('\n✅ Database consistency check passed!');
    } else if (errors === 0) {
      console.log('\n⚠️  Database consistency check passed with warnings');
    } else {
      console.log('\n❌ Database consistency check failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error verifying bundle consistency:', error);
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

