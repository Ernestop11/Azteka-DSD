import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper function to generate slug (same as seeding script)
function toSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

async function main() {
  console.log('🧹 Clearing external products (keeping only CSV imports)...');

  // Step 1: Read CSV to get list of CSV product slugs
  // Try multiple possible CSV locations
  const possibleCsvPaths = [
    process.argv[2], // User-provided path
    path.join(__dirname, '../data/products-master.csv'),
    path.join(__dirname, '../tests/products-master.csv'),
    path.join(__dirname, '../remote_azteka_dsd/data/products-master.csv'),
  ].filter(Boolean);
  
  let csvPath = null;
  for (const testPath of possibleCsvPaths) {
    if (fs.existsSync(testPath)) {
      csvPath = testPath;
      break;
    }
  }
  
  if (!csvPath) {
    console.error('❌ CSV file not found. Tried:');
    possibleCsvPaths.forEach(p => console.error(`   - ${p}`));
    console.error('\n💡 Usage: node scripts/clean-external-products.mjs [path-to-csv]');
    process.exit(1);
  }

  console.log(`📂 Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Create set of CSV product slugs
  const csvProductSlugs = new Set();
  records.forEach(record => {
    const productName = record['Product Name']?.trim() || record['product_name']?.trim() || record['name']?.trim();
    if (productName) {
      csvProductSlugs.add(toSlug(productName));
    }
  });

  console.log(`📊 Found ${csvProductSlugs.size} products in CSV`);

  // Step 2: Get all products from database
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      source: true,
    },
  });

  console.log(`📦 Found ${allProducts.length} products in database`);

  // Step 3: Identify products to delete (not in CSV)
  // Also check source field - keep products with source='csv' or source='seed-script'
  const productsToDelete = allProducts.filter(product => {
    const isInCsv = csvProductSlugs.has(product.slug);
    const isCsvSource = product.source === 'csv' || product.source === 'seed-script' || product.source === 'CSV';
    
    // Delete if not in CSV AND not from CSV source
    return !isInCsv && !isCsvSource;
  });

  console.log(`🗑️  Found ${productsToDelete.length} external products to delete`);
  console.log(`✅ Will keep ${allProducts.length - productsToDelete.length} CSV products`);

  if (productsToDelete.length === 0) {
    console.log('✅ No external products to delete. Database is already clean.');
    return;
  }

  // Show sample of products to be deleted
  console.log('\n📋 Sample products to be deleted:');
  productsToDelete.slice(0, 5).forEach(p => {
    console.log(`   - ${p.name} (${p.slug}) [source: ${p.source || 'none'}]`);
  });
  if (productsToDelete.length > 5) {
    console.log(`   ... and ${productsToDelete.length - 5} more`);
  }

  // Step 4: Delete product images first (foreign key constraint)
  const productIdsToDelete = productsToDelete.map(p => p.id);
  
  console.log('\n🗑️  Deleting product images...');
  const deletedImages = await prisma.productImage.deleteMany({
    where: {
      product_id: {
        in: productIdsToDelete,
      },
    },
  });
  console.log(`   Deleted ${deletedImages.count} product images`);

  // Step 5: Delete bundle items that reference these products
  console.log('\n🗑️  Cleaning up bundle items...');
  const deletedBundleItems = await prisma.bundleItem.deleteMany({
    where: {
      productId: {
        in: productIdsToDelete,
      },
    },
  });
  console.log(`   Deleted ${deletedBundleItems.count} bundle items`);

  // Step 6: Delete products
  console.log('\n🗑️  Deleting external products...');
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      id: {
        in: productIdsToDelete,
      },
    },
  });
  console.log(`   Deleted ${deletedProducts.count} products`);

  console.log('\n✅ External products cleared successfully!');
  console.log(`   Kept: ${allProducts.length - deletedProducts.count} CSV products`);
  console.log(`   Deleted: ${deletedProducts.count} external products`);
}

main()
  .catch((e) => {
    console.error('❌ Error clearing external products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

