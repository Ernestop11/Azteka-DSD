const DEFAULT_CATEGORY = 'General Merchandise';

export function normalizeCategoryName(name) {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function inferCategoryName(rawCategory, { supplier } = {}) {
  if (rawCategory && typeof rawCategory === 'string') {
    const normalized = normalizeCategoryName(rawCategory);
    if (normalized) {
      return normalized;
    }
  }

  if (supplier) {
    const normalized = normalizeCategoryName(`${supplier} Assortment`);
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_CATEGORY;
}

export function createCategorySlug(name) {
  return String(name ?? DEFAULT_CATEGORY)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

