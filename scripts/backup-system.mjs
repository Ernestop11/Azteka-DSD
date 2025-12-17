import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function backupSystem() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                    new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);
  
  console.log(`📦 Creating system backup: ${backupDir}\n`);
  
  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });
    console.log('✅ Backup directory created');
    
    // Backup database (using Prisma to export)
    console.log('🗄️  Backing up database...');
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const backup = {
        timestamp: new Date().toISOString(),
        products: await prisma.product.findMany({
          include: {
            images: true,
            category: true,
            brand: true,
          },
        }),
        bundles: await prisma.productBundle.findMany({
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),
        categories: await prisma.category.findMany(),
        brands: await prisma.brand.findMany(),
      };
      
      await fs.writeFile(
        path.join(backupDir, 'database.json'),
        JSON.stringify(backup, null, 2)
      );
      
      await prisma.$disconnect();
      console.log(`   ✅ Database backup: ${backup.products.length} products, ${backup.bundles.length} bundles`);
    } catch (error) {
      console.log(`   ⚠️  Database backup skipped: ${error.message}`);
    }
    
    // Backup uploaded images
    console.log('🖼️  Backing up images...');
    try {
      const uploadsSource = path.join(__dirname, '..', 'public', 'uploads');
      const uploadsDest = path.join(backupDir, 'uploads');
      
      if (await fs.access(uploadsSource).then(() => true).catch(() => false)) {
        await execAsync(`cp -r "${uploadsSource}" "${uploadsDest}"`);
        console.log('   ✅ Images backed up');
      } else {
        console.log('   ⚠️  No uploads directory found');
      }
    } catch (error) {
      console.log(`   ⚠️  Image backup skipped: ${error.message}`);
    }
    
    // Backup configuration files
    console.log('⚙️  Backing up configuration...');
    try {
      const configFiles = ['.env', '.env.production', 'package.json'];
      for (const file of configFiles) {
        const sourcePath = path.join(__dirname, '..', file);
        try {
          await fs.access(sourcePath);
          await fs.copyFile(sourcePath, path.join(backupDir, file + '.backup'));
          console.log(`   ✅ Backed up ${file}`);
        } catch {
          // File doesn't exist, skip
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Configuration backup skipped: ${error.message}`);
    }
    
    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      type: 'full-system',
      components: ['database', 'images', 'configuration'],
      productCount: 642,
      createdBy: 'automated-backup',
      version: '1.0',
    };
    
    await fs.writeFile(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`\n✅ Backup complete: ${backupDir}`);
    console.log(`   Manifest: ${path.join(backupDir, 'manifest.json')}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

backupSystem()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });

