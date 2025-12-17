import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('💾 Creating full database backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  const backupFile = path.join(backupDir, `backup-full-${timestamp}.json`);
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Backup all tables
    const backup = {
      timestamp: new Date().toISOString(),
      products: await prisma.product.findMany({
        include: {
          images: true,
          category: true,
          brand: true,
        },
      }),
      categories: await prisma.category.findMany(),
      brands: await prisma.brand.findMany(),
      bundles: await prisma.productBundle.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      orders: await prisma.order.findMany({
        include: {
          items: true,
        },
      }),
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    const stats = {
      products: backup.products.length,
      categories: backup.categories.length,
      brands: backup.brands.length,
      bundles: backup.bundles.length,
      orders: backup.orders.length,
    };
    
    console.log('\n✅ Backup created successfully!');
    console.log(`   File: ${backupFile}`);
    console.log('\n📊 Backup contents:');
    console.log(`   Products: ${stats.products}`);
    console.log(`   Categories: ${stats.categories}`);
    console.log(`   Brands: ${stats.brands}`);
    console.log(`   Bundles: ${stats.bundles}`);
    console.log(`   Orders: ${stats.orders}`);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
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

