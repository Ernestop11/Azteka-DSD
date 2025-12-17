const DEFAULT_BRAND = 'Unbranded';

export function normalizeBrandName(name) {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function inferBrandName(rawBrand, { supplier } = {}) {
  if (rawBrand && typeof rawBrand === 'string') {
    const normalized = normalizeBrandName(rawBrand);
    if (normalized) {
      return normalized;
    }
  }

  if (supplier) {
    const normalized = normalizeBrandName(`${supplier} Select`);
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_BRAND;
}

export function createBrandSlug(name) {
  return String(name ?? DEFAULT_BRAND)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

