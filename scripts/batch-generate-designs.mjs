#!/usr/bin/env node
/**
 * Batch Design Generation Script
 * Generates design assets for all products, categories, bundles, and brands
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import templateRenderer from '../src/services/design/templateRenderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.production') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Check if Canva is configured
if (!process.env.CANVA_API_KEY) {
  console.error('❌ CANVA_API_KEY not configured. Please set it in .env.production');
  process.exit(1);
}

const stats = {
  heroes: { generated: 0, failed: 0 },
  products: { generated: 0, failed: 0 },
  bundles: { generated: 0, failed: 0 },
  brands: { generated: 0, failed: 0 },
};

/**
 * Generate hero banners for all categories
 */
async function generateHeroBanners() {
  console.log('\n📸 Generating hero banners for categories...');

  try {
    const categories = await prisma.category.findMany({
      where: { imageUrl: null }, // Only generate for categories without images
    });

    for (const category of categories) {
      try {
        const result = await templateRenderer.renderHero({
          title: category.name,
          subtitle: category.description || `Shop ${category.name}`,
          backgroundColor: '#f3f4f6',
        });

        if (result.imageUrl) {
          await prisma.category.update({
            where: { id: category.id },
            data: { imageUrl: result.imageUrl },
          });
          stats.heroes.generated++;
          console.log(`   ✅ Generated hero for: ${category.name}`);
        } else if (result.jobId) {
          console.log(`   ⏳ Queued hero job for: ${category.name} (jobId: ${result.jobId})`);
        }
      } catch (error) {
        stats.heroes.failed++;
        console.error(`   ❌ Failed for ${category.name}:`, error.message);
      }

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error generating hero banners:', error);
  }
}

/**
 * Generate product cards for all products
 */
async function generateProductCards() {
  console.log('\n📦 Generating product cards...');

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' },
        ],
      },
      include: {
        brand: { select: { name: true, logoUrl: true } },
        category: { select: { name: true } },
        images: { orderBy: { sort_order: 'asc' }, take: 1 },
      },
      take: 100, // Limit to 100 at a time to avoid rate limits
    });

    for (const product of products) {
      try {
        const result = await templateRenderer.renderProductCard({
          name: product.name,
          description: product.description || product.short_description,
          price: product.priceCase || product.price,
          imageUrl: product.images[0]?.image_url || product.imageUrl,
          backgroundColor: product.background_color || product.backgroundColor,
          brandName: product.brand?.name,
          brandLogo: product.brand?.logoUrl,
          categoryName: product.category?.name,
        });

        if (result.imageUrl) {
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: result.imageUrl },
          });
          stats.products.generated++;
          console.log(`   ✅ Generated card for: ${product.name}`);
        } else if (result.jobId) {
          console.log(`   ⏳ Queued product job for: ${product.name} (jobId: ${result.jobId})`);
        }
      } catch (error) {
        stats.products.failed++;
        console.error(`   ❌ Failed for ${product.name}:`, error.message);

        // Handle rate limits
        if (error.message.includes('API_RATE_LIMIT')) {
          console.log('   ⏸️  Rate limit hit, waiting 60 seconds...');
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.error('Error generating product cards:', error);
  }
}

/**
 * Generate bundle graphics
 */
async function generateBundleGraphics() {
  console.log('\n🎁 Generating bundle graphics...');

  try {
    const bundles = await prisma.productBundle.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' },
        ],
        active: true,
      },
      include: {
        products: {
          where: { isHidden: false, inStock: true },
          include: {
            images: { orderBy: { sort_order: 'asc' }, take: 1 },
          },
        },
      },
    });

    for (const bundle of bundles) {
      try {
        const result = await templateRenderer.renderBundle({
          name: bundle.name,
          description: bundle.description,
          price: bundle.price,
          discount: bundle.discountPercent,
          badgeText: bundle.badgeText,
          badgeColor: bundle.badgeColor,
          products: bundle.products.map((p) => ({
            imageUrl: p.images[0]?.image_url || p.imageUrl,
          })),
        });

        if (result.imageUrl) {
          await prisma.productBundle.update({
            where: { id: bundle.id },
            data: { imageUrl: result.imageUrl },
          });
          stats.bundles.generated++;
          console.log(`   ✅ Generated graphic for: ${bundle.name}`);
        } else if (result.jobId) {
          console.log(`   ⏳ Queued bundle job for: ${bundle.name} (jobId: ${result.jobId})`);
        }
      } catch (error) {
        stats.bundles.failed++;
        console.error(`   ❌ Failed for ${bundle.name}:`, error.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error generating bundle graphics:', error);
  }
}

/**
 * Generate brand row images
 */
async function generateBrandRows() {
  console.log('\n🏷️  Generating brand row images...');

  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    for (const brand of brands) {
      try {
        const result = await templateRenderer.renderBrandRow({
          brandName: brand.name,
          brandLogo: brand.logoUrl,
          description: brand.description,
          productCount: brand._count.products,
        });

        if (result.imageUrl) {
          // Update brand logo or create banner field
          await prisma.brand.update({
            where: { id: brand.id },
            data: { logoUrl: result.imageUrl },
          });
          stats.brands.generated++;
          console.log(`   ✅ Generated row for: ${brand.name}`);
        } else if (result.jobId) {
          console.log(`   ⏳ Queued brand job for: ${brand.name} (jobId: ${result.jobId})`);
        }
      } catch (error) {
        stats.brands.failed++;
        console.error(`   ❌ Failed for ${brand.name}:`, error.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error generating brand rows:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const types = args.length > 0 ? args : ['heroes', 'products', 'bundles', 'brands'];

  console.log('🎨 Starting batch design generation...');
  console.log(`📋 Types to generate: ${types.join(', ')}\n`);

  try {
    if (types.includes('heroes')) {
      await generateHeroBanners();
    }

    if (types.includes('products')) {
      await generateProductCards();
    }

    if (types.includes('bundles')) {
      await generateBundleGraphics();
    }

    if (types.includes('brands')) {
      await generateBrandRows();
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Generation Summary:');
    console.log('='.repeat(50));
    console.log(`Heroes:    ${stats.heroes.generated} generated, ${stats.heroes.failed} failed`);
    console.log(`Products:  ${stats.products.generated} generated, ${stats.products.failed} failed`);
    console.log(`Bundles:   ${stats.bundles.generated} generated, ${stats.bundles.failed} failed`);
    console.log(`Brands:    ${stats.brands.generated} generated, ${stats.brands.failed} failed`);
    console.log('='.repeat(50));

    const totalGenerated = Object.values(stats).reduce((sum, s) => sum + s.generated, 0);
    const totalFailed = Object.values(stats).reduce((sum, s) => sum + s.failed, 0);

    if (totalFailed === 0) {
      console.log('\n✅ All designs generated successfully!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  Generated ${totalGenerated} designs with ${totalFailed} failures`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

