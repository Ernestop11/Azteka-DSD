#!/usr/bin/env node
/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const prismaModulePath = resolve(__dirname, '../remote_azteka_dsd/node_modules/@prisma/client/index.js');
let PrismaClient;
try {
  ({ PrismaClient } = await import(prismaModulePath));
} catch (error) {
  console.error('❌ Unable to load Prisma Client. Did you run `npx prisma generate --schema=remote_azteka_dsd/prisma/schema.prisma`?');
  console.error(error);
  process.exit(1);
}

const prisma = new PrismaClient();

function toSlug(value) {
  if (!value || typeof value !== 'string') return null;
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);
}

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

async function ensureCategory(name) {
  if (!name) return null;
  const slug = toSlug(name);
  if (!slug) return null;

  const category = await prisma.category.upsert({
    where: { slug },
    update: { name },
    create: {
      name,
      slug,
      description: null,
      imageUrl: null,
      displayOrder: 999,
    },
  });
  return category.id;
}

async function ensureBrand(name) {
  if (!name) return null;
  const normalized = name.trim();
  if (!normalized) return null;

  const brand = await prisma.brand.upsert({
    where: { name: normalized },
    update: { description: null },
    create: {
      name: normalized,
      description: null,
      isFeatured: false,
      displayOrder: 999,
    },
  });
  return brand.id;
}

function normalizeProduct(product, index) {
  if (!product || typeof product !== 'object') {
    throw new Error(`Product at index ${index} is not an object`);
  }

  const name = product.name ?? product.title;
  if (!name) {
    throw new Error(`Product at index ${index} is missing a name`);
  }

  const slug = product.slug ?? toSlug(name);
  if (!slug) {
    throw new Error(`Product "${name}" could not generate a slug`);
  }

  const businessModes = Array.isArray(product.businessModes ?? product.business_modes)
    ? [...new Set(product.businessModes ?? product.business_modes)]
    : [];

  const priceCase = toNumber(product.priceCase ?? product.price_case ?? product.price);
  const vendorPrice = toNumber(product.vendor_price ?? product.vendorPrice ?? product.vendor_cost);
  const costCase = toNumber(product.cost_case ?? product.costCase ?? product.cost_per_case ?? product.cost);
  const marginPercent =
    toNumber(product.margin_percent ?? product.marginPercent) ??
    (priceCase && costCase ? Number((((priceCase - costCase) / priceCase) * 100).toFixed(2)) : null);

  const unitsPerCase = toNumber(product.units_per_case ?? product.unitsPerCase ?? product.caseSize);
  const stock = toNumber(product.stock ?? product.quantity ?? product.qty_on_hand ?? 0, 0);
  const minOrderQty = toNumber(product.minOrderQty ?? product.min_order_quantity ?? 1, 1);

  const imageSources = Array.isArray(product.images ?? product.imageUrls ?? product.gallery)
    ? (product.images ?? product.imageUrls ?? product.gallery).filter(Boolean)
    : [];

  return {
    slug,
    dbData: {
      name,
      slug,
      sku: product.sku ?? product.upc ?? null,
      priceCase,
      vendor_price: vendorPrice,
      cost_case: costCase,
      units_per_case: unitsPerCase,
      unit_type: product.unit_type ?? product.unitType ?? null,
      margin_percent: marginPercent,
      short_description: product.short_description ?? product.shortDescription ?? null,
      background_color: product.background_color ?? product.backgroundColor ?? null,
      background_gradient: product.background_gradient ?? product.backgroundGradient ?? null,
      source: product.source ?? 'seed-script',
      created_by: product.created_by ?? null,
      description: product.description ?? null,
      inStock: product.inStock ?? stock > 0,
      stock,
      minStock: toNumber(product.minStock ?? 10, 10),
      supplier: product.supplier ?? product.vendor ?? 'Seed Import',
      featured: Boolean(product.featured),
      minOrderQty,
      meta: product.meta ?? {},
      businessModes,
      isHidden: Boolean(product.isHidden),
    },
    categoryName: product.category ?? product.categoryName ?? null,
    brandName: product.brand ?? product.brandName ?? null,
    imageSources,
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node prisma/seed-real-products.mjs <path-to-products.json>');
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), inputPath);
  const fileContents = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(fileContents);
  const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed.products) ? parsed.products : null;

  if (!items || items.length === 0) {
    console.error('❌ No products found in the provided JSON file.');
    process.exit(1);
  }

  console.log(`🌱 Seeding ${items.length} products from ${absolutePath}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const failures = [];

  for (let index = 0; index < items.length; index += 1) {
    const rawProduct = items[index];
    try {
      const normalized = normalizeProduct(rawProduct, index);
      const categoryId = await ensureCategory(normalized.categoryName);
      const brandId = await ensureBrand(normalized.brandName);

      const imagesPayload = normalized.imageSources.map((src, order) => ({
        image_url: src,
        sort_order: order,
      }));

      const createData = {
        ...normalized.dbData,
        categoryId,
        brandId,
        images: imagesPayload.length ? { create: imagesPayload } : undefined,
      };

      const updateData = {
        ...normalized.dbData,
        categoryId,
        brandId,
      };

      if (imagesPayload.length) {
        updateData.images = {
          deleteMany: {},
          create: imagesPayload,
        };
      }

      const result = await prisma.product.upsert({
        where: { slug: normalized.slug },
        create: createData,
        update: updateData,
        include: { images: true },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created += 1;
      } else {
        updated += 1;
      }
    } catch (error) {
      skipped += 1;
      const sku = rawProduct?.sku ?? rawProduct?.upc ?? 'unknown-sku';
      failures.push({ index, sku, name: rawProduct?.name ?? 'unknown', error: error.message });
      console.error(`⚠️  Failed to process product at index ${index}:`, error.message);
    }
  }

  console.log('✅ Seed complete');
  console.table([{ created, updated, skipped, total: items.length }]);

  if (failures.length) {
    console.log('⚠️  Failures:');
    console.table(failures);
  }
}

try {
  await main();
} catch (error) {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}







