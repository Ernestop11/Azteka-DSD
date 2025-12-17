import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateImageData() {
  console.log('🔄 Migrating ProductImage data to Product direct fields...\n');
  
  try {
    // Get all products with images
    const productsWithImages = await prisma.product.findMany({
      include: {
        images: {
          orderBy: [
            { sort_order: 'asc' }, // Primary images first (sort_order 0)
          ],
        },
      },
    });
    
    console.log(`📦 Found ${productsWithImages.length} products to check\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const product of productsWithImages) {
      if (product.images.length > 0) {
        // Use first image (primary or lowest sort_order)
        const primaryImage = product.images[0];
        
        // Update product with direct image fields
        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrl: primaryImage.image_url,
            thumbnailUrl: primaryImage.thumbnail_url || primaryImage.image_url,
            mediumUrl: primaryImage.medium_url || primaryImage.image_url,
            hasImage: true,
          },
        });
        
        // Mark this image as primary if not already
        if (!primaryImage.isPrimary) {
          await prisma.productImage.update({
            where: { id: primaryImage.id },
            data: { isPrimary: true },
          });
        }
        
        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`   Migrated ${migratedCount} products...`);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migratedCount} products`);
    console.log(`   Skipped: ${skippedCount} products (no images)`);
    
    // Verify migration
    const productsWithDirectImages = await prisma.product.count({
      where: { hasImage: true },
    });
    
    console.log(`\n📊 Verification:`);
    console.log(`   Products with direct image fields: ${productsWithDirectImages}`);
    console.log(`   Products with image relations: ${await prisma.productImage.count()}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateImageData()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });

