const SKU_MAX_LENGTH = 40;

function sanitize(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, SKU_MAX_LENGTH)
    .replace(/^-+|-+$/g, '');
}

function fallbackSku(index = 0) {
  const suffix = String(index + 1).padStart(3, '0');
  return `SKU-${suffix}-${Date.now()}`;
}

export function inferSku({ sku, name, index = 0 } = {}) {
  if (sku && typeof sku === 'string') {
    const cleaned = sanitize(sku);
    if (cleaned) {
      return cleaned;
    }
  }

  if (name && typeof name === 'string') {
    const cleaned = sanitize(name);
    if (cleaned) {
      return cleaned.slice(0, SKU_MAX_LENGTH - 4) + `-${String(index + 1).padStart(2, '0')}`;
    }
  }

  return fallbackSku(index);
}

export function ensureUniqueSku(existingSkus, candidate, index = 0) {
  let sku = candidate;
  while (existingSkus.has(sku)) {
    sku = sanitize(`${candidate}-${index + existingSkus.size + 1}`);
  }
  existingSkus.add(sku);
  return sku;
}

