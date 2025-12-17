import express from 'express';
import { PrismaClient } from '@prisma/client';
import { normalizeRows } from '../lib/normalization-orchestrator.mjs';

const prisma = new PrismaClient();
const router = express.Router();

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureCategory(name, autoCreate, summary) {
  if (!name) {
    return null;
  }

  const slug = slugify(name);
  let existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing.id;
  }

  if (!autoCreate) {
    throw new Error(`Category "${name}" not found and auto-create disabled.`);
  }

  existing = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });
  summary.categoriesCreated.add(name);
  return existing.id;
}

async function ensureBrand(name, autoCreate, summary) {
  if (!name) {
    return null;
  }

  const slug = slugify(name);
  let existing = await prisma.brand.findFirst({
    where: { name },
  });

  if (existing) {
    return existing.id;
  }

  if (!autoCreate) {
    throw new Error(`Brand "${name}" not found and auto-create disabled.`);
  }

  existing = await prisma.brand.create({
    data: {
      name,
      logoUrl: null,
      description: null,
      displayOrder: 0,
    },
  });
  summary.brandsCreated.add(name);
  return existing.id;
}

function sanitizeNumber(value, fallback = 0) {
  if (value === null || value === undefined) {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

router.post('/', async (req, res, next) => {
  try {
    const { products = [], options = {} } = req.body ?? {};

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products provided.' });
    }

    const autoCreateCategories = options.auto_create_categories !== false;
    const autoCreateBrands = options.auto_create_brands !== false;

    const normalizedOutput = await normalizeRows(products, {
      supplier: options.supplier ?? null,
    });
    const normalizedProducts = normalizedOutput.products;

    const summary = {
      total: normalizedProducts.length,
      created: 0,
      updated: 0,
      failed: 0,
      categoriesCreated: new Set(),
      brandsCreated: new Set(),
    };

    const created = [];
    const errors = [];

    for (let index = 0; index < normalizedProducts.length; index += 1) {
      const product = normalizedProducts[index];

      try {
        const categoryId = await ensureCategory(product.category, autoCreateCategories, summary);
        const brandId = await ensureBrand(product.brand, autoCreateBrands, summary);

        const slug = slugify(product.slug ?? product.name ?? `product-${index}`);
        const payload = {
          name: product.name,
          slug,
          sku: product.sku ?? null,
          description: product.description ?? null,
          short_description: product.short_description ?? product.shortDescription ?? null,
          priceCase: product.priceCase !== undefined ? sanitizeNumber(product.priceCase, null) : null,
          vendor_price:
            product.vendor_price !== undefined
              ? sanitizeNumber(product.vendor_price, null)
              : product.vendorPrice !== undefined
              ? sanitizeNumber(product.vendorPrice, null)
              : null,
          cost_case:
            product.cost_case !== undefined
              ? sanitizeNumber(product.cost_case, null)
              : product.costCase !== undefined
              ? sanitizeNumber(product.costCase, null)
              : null,
          margin_percent:
            product.margin_percent !== undefined
              ? sanitizeNumber(product.margin_percent, null)
              : product.marginPercent !== undefined
              ? sanitizeNumber(product.marginPercent, null)
              : null,
          background_color: product.background_color ?? product.backgroundColor ?? null,
          background_gradient:
            product.background_gradient ?? product.backgroundGradient ?? null,
          inStock: product.inStock ?? true,
          stock: sanitizeNumber(product.stock, 0),
          minStock: sanitizeNumber(product.minStock, 10),
          supplier: product.supplier ?? 'PO Import',
          source: product.source ?? 'po_import',
          featured: Boolean(product.featured),
          units_per_case:
            product.units_per_case !== undefined
              ? sanitizeNumber(product.units_per_case, null)
              : sanitizeNumber(product.unitsPerCase, null),
          unit_type: product.unit_type ?? product.unitType ?? null,
          minOrderQty: sanitizeNumber(product.minOrderQty, 1),
          meta: product.meta ?? null,
          created_by: req.user?.sub ?? null,
        };

        if (categoryId) {
          payload.categoryId = categoryId;
        }
        if (brandId) {
          payload.brandId = brandId;
        }

        const existing = await prisma.product.findUnique({
          where: { slug },
        });

        const record = await prisma.product.upsert({
          where: { slug },
          update: payload,
          create: payload,
        });

        if (existing) {
          summary.updated += 1;
        } else {
          summary.created += 1;
        }

        if (Array.isArray(product.gallery) && product.gallery.length > 0) {
          await prisma.productImage.deleteMany({
            where: { product_id: record.id },
          });

          await prisma.productImage.createMany({
            data: product.gallery.map((image_url, idx) => ({
              product_id: record.id,
              image_url,
              sort_order: idx,
            })),
          });
        }

        created.push(record);
      } catch (error) {
        summary.failed += 1;
        errors.push({
          index,
          sku: product.sku,
          error: error.message ?? 'Unknown error',
        });
      }
    }

    if (req.body?.importId) {
      await prisma.pOImport
        .update({
          where: { id: req.body.importId },
          data: {
            status: errors.length ? 'FAILED' : 'COMPLETED',
          },
        })
        // eslint-disable-next-line no-empty
        .catch(() => {});
    }

    return res.json({
      success: errors.length === 0,
      created,
      errors,
      summary: {
        total: summary.total,
        created: summary.created,
        updated: summary.updated,
        failed: summary.failed,
        categoriesCreated: Array.from(summary.categoriesCreated),
        brandsCreated: Array.from(summary.brandsCreated),
        warnings: normalizedOutput.warnings,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

