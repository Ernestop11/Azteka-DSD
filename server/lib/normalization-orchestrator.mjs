import { mergeMultiRowProducts } from './multi-row-merging.mjs';
import { runValidationPipeline } from './validation-pipeline.mjs';
import { ensureUniqueSku, inferSku } from './sku-inference.mjs';

export async function normalizeRows(rows = [], context = {}) {
  const mergedRows = mergeMultiRowProducts(rows);
  const warnings = [];
  const products = [];
  const skuRegistry = new Set(context.existingSkus ?? []);

  for (let index = 0; index < mergedRows.length; index += 1) {
    const row = mergedRows[index] ?? {};

    if (!row.sku) {
      row.sku = inferSku({ name: row.name, index });
    }

    row.sku = ensureUniqueSku(skuRegistry, row.sku, index);

    const normalized = await runValidationPipeline(row, {
      ...context,
      index,
    });

    products.push(normalized.product);

    if (normalized.warnings?.length) {
      normalized.warnings.forEach((warning) => {
        warnings.push({
          index,
          warning,
        });
      });
    }
  }

  return { products, warnings };
}

