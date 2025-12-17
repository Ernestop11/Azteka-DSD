import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Assign placeholder images to products
 * Uses category-based placeholders for visual consistency
 */
async function assignPlaceholderImages() {
  console.log('🖼️  Assigning placeholder images to products...\n');
  
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    
    console.log(`📦 Found ${products.length} products to process\n`);
    
    // Category-based placeholder images
    const imageCategories = {
      'beverages': 'https://via.placeholder.com/300x300/2563eb/ffffff?text=Beverage',
      'snacks': 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Snack',
      'candy': 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Candy',
      'cookies': 'https://via.placeholder.com/300x300/ea580c/ffffff?text=Cookie',
      'coffee': 'https://via.placeholder.com/300x300/78350f/ffffff?text=Coffee',
      'default': 'https://via.placeholder.com/300x300/6b7280/ffffff?text=Product',
    };
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      // Check if product already has images
      const existingImages = await prisma.productImage.findMany({
        where: { product_id: product.id },
      });
      
      if (existingImages.length > 0) {
        skipped++;
        continue;
      }
      
      // Determine category for image selection
      const categoryName = product.category?.name?.toLowerCase() || 'default';
      let imageUrl = imageCategories['default'];
      
      // Match category
      for (const [key, url] of Object.entries(imageCategories)) {
        if (categoryName.includes(key) || product.name.toLowerCase().includes(key)) {
          imageUrl = url;
          break;
        }
      }
      
      // Create placeholder image record
      const imageData = {
        product_id: product.id,
        image_url: imageUrl,
        sort_order: 0,
      };
      
      // Add optional fields if they exist in schema
      try {
        imageData.thumbnail_url = imageUrl;
        imageData.medium_url = imageUrl;
      } catch (e) {
        // Fields don't exist yet, skip
      }
      
      await prisma.productImage.create({
        data: imageData,
      });
      
      updated++;
      
      if (updated % 50 === 0) {
        console.log(`   Processed ${updated} products...`);
      }
    }
    
    console.log(`\n✅ Image assignment complete!`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products (already have images)`);
    console.log(`   Total: ${products.length} products`);
    
  } catch (error) {
    console.error('❌ Error assigning placeholder images:', error);
    throw error;
  }
}

assignPlaceholderImages()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

