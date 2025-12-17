import { processProductImage, processBundleImage, validateImage } from './image-processor.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImageProcessing() {
  console.log('🧪 Testing image processing system...\n');
  
  try {
    // Test image validation first
    console.log('1️⃣ Testing image validation...');
    const validJpeg = await validateImage('test-images/test-product.jpg');
    console.log(`   JPEG validation: ${validJpeg ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!validJpeg) {
      throw new Error('Image validation failed');
    }
    
    // Test product image processing
    console.log('\n2️⃣ Testing product image processing...');
    const productId = `test-product-${Date.now()}`;
    const productResult = await processProductImage('test-images/test-product.jpg', productId);
    
    console.log('   Product image result:');
    console.log(`   - Thumbnail: ${productResult.thumbnail}`);
    console.log(`   - Medium: ${productResult.medium}`);
    console.log(`   - Original: ${productResult.original}`);
    
    // Verify files were created (paths are relative to public/)
    const thumbnailPath = path.join(__dirname, '..', 'public', productResult.thumbnail);
    const mediumPath = path.join(__dirname, '..', 'public', productResult.medium);
    const originalPath = path.join(__dirname, '..', 'public', productResult.original);
    
    await fs.access(thumbnailPath);
    await fs.access(mediumPath);
    await fs.access(originalPath);
    
    // Check file sizes
    const thumbnailStats = await fs.stat(thumbnailPath);
    const mediumStats = await fs.stat(mediumPath);
    const originalStats = await fs.stat(originalPath);
    
    console.log(`   ✅ Product images created successfully`);
    console.log(`   - Thumbnail size: ${(thumbnailStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Medium size: ${(mediumStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Original size: ${(originalStats.size / 1024).toFixed(2)} KB`);
    
    // Test bundle image processing  
    console.log('\n3️⃣ Testing bundle image processing...');
    const bundleId = `test-bundle-${Date.now()}`;
    const bundleResult = await processBundleImage('test-images/test-bundle.jpg', bundleId);
    
    console.log('   Bundle image result:');
    console.log(`   - Thumbnail: ${bundleResult.thumbnail}`);
    console.log(`   - Original: ${bundleResult.original}`);
    
    // Verify bundle files (paths are relative to public/)
    const bundleThumbnailPath = path.join(__dirname, '..', 'public', bundleResult.thumbnail);
    const bundleOriginalPath = path.join(__dirname, '..', 'public', bundleResult.original);
    
    await fs.access(bundleThumbnailPath);
    await fs.access(bundleOriginalPath);
    
    const bundleThumbnailStats = await fs.stat(bundleThumbnailPath);
    const bundleOriginalStats = await fs.stat(bundleOriginalPath);
    
    console.log(`   ✅ Bundle images created successfully`);
    console.log(`   - Thumbnail size: ${(bundleThumbnailStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Original size: ${(bundleOriginalStats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n✅ All image processing tests passed!');
    
  } catch (error) {
    console.error('\n❌ Image processing test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testImageProcessing();

