export async function generateDescription({
  name,
  brand,
  category,
  baseDescription,
  packSize,
  supplier,
} = {}) {
  if (baseDescription && typeof baseDescription === 'string' && baseDescription.trim().length >= 8) {
    return baseDescription.trim();
  }

  const segments = [];

  if (name) {
    segments.push(`${name} wholesale case`);
  }

  if (brand) {
    segments.push(`from ${brand}`);
  }

  if (category) {
    segments.push(`ideal for ${category.toLowerCase()} aisles`);
  }

  if (packSize) {
    segments.push(`pack size: ${packSize}`);
  }

  if (supplier) {
    segments.push(`sourced from ${supplier}`);
  }

  segments.push('ready to ship for retailers and distributors.');

  return segments.join(' ');
}

