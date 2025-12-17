import path from 'path';

function deriveNameFromFilename(filename) {
  if (!filename) {
    return 'Imported Product';
  }
  return path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function applyFallbackStrategies({ filePath, originalName, supplier } = {}) {
  const name = deriveNameFromFilename(originalName || filePath);

  return [
    {
      name,
      sku: '',
      priceCase: 0,
      quantity: 0,
      category: supplier ? `${supplier} Specials` : null,
      brand: supplier ?? null,
      supplier,
      sourceFile: filePath,
    },
  ];
}

