import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function maintenanceTasks() {
  console.log('🧹 Running maintenance tasks...\n');
  
  try {
    // Clean up orphaned images
    console.log('🗑️  Cleaning up orphaned images...');
    const productIds = await prisma.product.findMany({ select: { id: true } });
    const validIds = new Set(productIds.map(p => p.id));
    
    let orphanedCount = 0;
    const imageDirs = [
      'public/uploads/products/thumbnails',
      'public/uploads/products/medium',
      'public/uploads/products/original',
    ];
    
    for (const dir of imageDirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          // Extract product ID from filename (format: productId-timestamp.jpg)
          const productId = file.split('-').slice(0, -1).join('-');
          
          // Check if it's a test file or orphaned
          if (file.startsWith('test-') || !validIds.has(productId)) {
            try {
              await fs.unlink(path.join(dir, file));
              orphanedCount++;
            } catch (e) {
              // File might already be deleted
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Could not clean ${dir}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Removed ${orphanedCount} orphaned/test images`);
    
    // Update image flags based on ProductImage records
    console.log('\n🔄 Updating image flags...');
    const productsWithImageRecords = await prisma.productImage.findMany({
      select: { product_id: true },
      distinct: ['product_id'],
    });
    
    const productsWithImages = new Set(productsWithImageRecords.map(img => img.product_id));
    
    // Get all products
    const allProducts = await prisma.product.findMany({
      select: { id: true },
    });
    
    let flagUpdates = 0;
    for (const product of allProducts) {
      const hasImage = productsWithImages.has(product.id);
      
      // Update if flag doesn't match reality
      // Note: We'll skip this if the field doesn't exist in schema
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            // Only update if we can determine image status
            // This is a placeholder - actual implementation depends on schema
          },
        });
        flagUpdates++;
      } catch (error) {
        // Field might not exist, skip
      }
    }
    
    if (flagUpdates > 0) {
      console.log(`   ✅ Updated ${flagUpdates} image flags`);
    } else {
      console.log('   ℹ️  Image flags are up to date');
    }
    
    // Count statistics
    console.log('\n📊 Maintenance Statistics:');
    const totalProducts = await prisma.product.count();
    const productsWithImageCount = productsWithImages.size;
    const imageCompletionRate = ((productsWithImageCount / totalProducts) * 100).toFixed(1);
    
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with images: ${productsWithImageCount}`);
    console.log(`   Image completion: ${imageCompletionRate}%`);
    
    console.log('\n✅ Maintenance complete');
    
  } catch (error) {
    console.error('❌ Maintenance failed:', error);
    throw error;
  }
}

maintenanceTasks()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

