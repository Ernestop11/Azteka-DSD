#!/usr/bin/env node
/**
 * Seed Verification Script
 * Verifies product count, brand count, category count in database
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.production') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const EXPECTED_MINIMUMS = {
  products: parseInt(process.env.MIN_PRODUCTS || '10', 10),
  categories: parseInt(process.env.MIN_CATEGORIES || '3', 10),
  brands: parseInt(process.env.MIN_BRANDS || '3', 10),
};

async function verifySeed() {
  console.log('🔍 Verifying seed data...\n');

  const results = {
    products: { count: 0, status: 'unknown', issues: [] },
    categories: { count: 0, status: 'unknown', issues: [] },
    brands: { count: 0, status: 'unknown', issues: [] },
    overall: { status: 'unknown', passed: false },
  };

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection: OK\n');

    // Verify Products
    try {
      const productCount = await prisma.product.count();
      results.products.count = productCount;
      
      if (productCount === 0) {
        results.products.status = 'error';
        results.products.issues.push('No products found');
      } else if (productCount < EXPECTED_MINIMUMS.products) {
        results.products.status = 'warning';
        results.products.issues.push(
          `Only ${productCount} products found (expected at least ${EXPECTED_MINIMUMS.products})`
        );
      } else {
        results.products.status = 'ok';
      }

      // Check for products without categories
      const productsWithoutCategory = await prisma.product.count({
        where: { categoryId: null },
      });
      if (productsWithoutCategory > 0) {
        results.products.issues.push(
          `${productsWithoutCategory} product(s) without category`
        );
      }

      // Check for products without images
      const productsWithoutImages = await prisma.product.count({
        where: {
          images: {
            none: {},
          },
        },
      });
      if (productsWithoutImages > 0) {
        results.products.issues.push(
          `${productsWithoutImages} product(s) without images`
        );
      }

      console.log(`📦 Products: ${productCount} (${results.products.status})`);
      if (results.products.issues.length > 0) {
        results.products.issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
      }
    } catch (error) {
      results.products.status = 'error';
      results.products.issues.push(`Error: ${error.message}`);
      console.error('❌ Error checking products:', error.message);
    }

    // Verify Categories
    try {
      const categoryCount = await prisma.category.count();
      results.categories.count = categoryCount;

      if (categoryCount === 0) {
        results.categories.status = 'error';
        results.categories.issues.push('No categories found');
      } else if (categoryCount < EXPECTED_MINIMUMS.categories) {
        results.categories.status = 'warning';
        results.categories.issues.push(
          `Only ${categoryCount} categories found (expected at least ${EXPECTED_MINIMUMS.categories})`
        );
      } else {
        results.categories.status = 'ok';
      }

      // Check for categories without products
      const categoriesWithoutProducts = await prisma.category.findMany({
        where: {
          products: {
            none: {},
          },
        },
        select: { id: true, name: true },
      });
      if (categoriesWithoutProducts.length > 0) {
        results.categories.issues.push(
          `${categoriesWithoutProducts.length} category/categories without products: ${categoriesWithoutProducts.map((c) => c.name).join(', ')}`
        );
      }

      console.log(`\n📁 Categories: ${categoryCount} (${results.categories.status})`);
      if (results.categories.issues.length > 0) {
        results.categories.issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
      }
    } catch (error) {
      results.categories.status = 'error';
      results.categories.issues.push(`Error: ${error.message}`);
      console.error('❌ Error checking categories:', error.message);
    }

    // Verify Brands
    try {
      const brandCount = await prisma.brand.count();
      results.brands.count = brandCount;

      if (brandCount === 0) {
        results.brands.status = 'error';
        results.brands.issues.push('No brands found');
      } else if (brandCount < EXPECTED_MINIMUMS.brands) {
        results.brands.status = 'warning';
        results.brands.issues.push(
          `Only ${brandCount} brands found (expected at least ${EXPECTED_MINIMUMS.brands})`
        );
      } else {
        results.brands.status = 'ok';
      }

      // Check for brands without products
      const brandsWithoutProducts = await prisma.brand.findMany({
        where: {
          products: {
            none: {},
          },
        },
        select: { id: true, name: true },
      });
      if (brandsWithoutProducts.length > 0) {
        results.brands.issues.push(
          `${brandsWithoutProducts.length} brand(s) without products: ${brandsWithoutProducts.map((b) => b.name).join(', ')}`
        );
      }

      console.log(`\n🏷️  Brands: ${brandCount} (${results.brands.status})`);
      if (results.brands.issues.length > 0) {
        results.brands.issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
      }
    } catch (error) {
      results.brands.status = 'error';
      results.brands.issues.push(`Error: ${error.message}`);
      console.error('❌ Error checking brands:', error.message);
    }

    // Determine overall status
    const hasErrors = Object.values(results).some(
      (r) => r.status === 'error' && r !== results.overall
    );
    const hasWarnings = Object.values(results).some(
      (r) => r.status === 'warning' && r !== results.overall
    );

    if (hasErrors) {
      results.overall.status = 'error';
      results.overall.passed = false;
    } else if (hasWarnings) {
      results.overall.status = 'warning';
      results.overall.passed = true;
    } else {
      results.overall.status = 'ok';
      results.overall.passed = true;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Overall Status: ${results.overall.status.toUpperCase()}`);
    console.log('='.repeat(50));

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Products: ${results.products.count} (min: ${EXPECTED_MINIMUMS.products})`);
    console.log(`   Categories: ${results.categories.count} (min: ${EXPECTED_MINIMUMS.categories})`);
    console.log(`   Brands: ${results.brands.count} (min: ${EXPECTED_MINIMUMS.brands})`);

    if (results.overall.passed) {
      console.log('\n✅ Seed verification PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Seed verification FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();

