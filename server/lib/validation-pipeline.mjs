import { inferSku } from './sku-inference.mjs';
import { inferCategoryName } from './category-inference.mjs';
import { inferBrandName } from './brand-inference.mjs';
import { extractPricing } from './pricing-extraction.mjs';
import { extractPackAndCase } from './pack-case-extraction.mjs';
import { correctOcrArtifacts } from './ocr-correction.mjs';
import { generateDescription } from './description-generation.mjs';
import { searchForProductImage } from './image-search-ai.mjs';

export async function runValidationPipeline(rawRow = {}, context = {}) {
  const warnings = [];
  const name = correctOcrArtifacts(rawRow.name ?? 'New Product');
  const sku = inferSku({ sku: rawRow.sku, name, index: context.index ?? 0 });
  const category = inferCategoryName(rawRow.category, { supplier: context.supplier });
  const brand = inferBrandName(rawRow.brand, { supplier: context.supplier });
  const pricing = extractPricing(rawRow);
  const pack = extractPackAndCase(rawRow);
  const description = await generateDescription({
    name,
    brand,
    category,
    baseDescription: rawRow.description,
    packSize: pack.packSize,
    supplier: context.supplier,
  });
  const imagery = await searchForProductImage({
    name,
    brand,
    category,
    currentImage: rawRow.imageUrl,
  });

  warnings.push(...pricing.warnings);

  return {
    product: {
      name,
      sku,
      category,
      brand,
      shortDescription: rawRow.shortDescription ?? rawRow.description ?? null,
      priceCase: pricing.priceCase,
      vendorPrice: pricing.vendorPrice,
      costCase: pricing.costCase,
      marginPercent: pricing.marginPercent,
      unitsPerCase: pack.unitsPerCase,
      unitType: pack.unitType,
      packSize: pack.packSize,
      minOrderQty: rawRow.minOrderQty ?? Math.max(1, pack.unitsPerCase),
      stock: rawRow.stock ?? rawRow.quantity ?? 0,
      inStock: rawRow.inStock ?? (rawRow.stock ?? rawRow.quantity ?? 0) > 0,
      imageUrl: imagery.primaryImageUrl,
      gallery: imagery.gallery,
      description,
      backgroundColor: rawRow.backgroundColor ?? rawRow.background_color ?? null,
      backgroundGradient: rawRow.backgroundGradient ?? rawRow.background_gradient ?? null,
      supplier: rawRow.supplier ?? context.supplier ?? null,
      source: rawRow.source ?? 'po_upload',
      featured: Boolean(rawRow.featured),
      meta: rawRow.meta ?? {},
    },
    warnings,
  };
}

