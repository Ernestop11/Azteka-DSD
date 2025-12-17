function keyFromRow(row = {}) {
  if (row.sku) {
    return String(row.sku).toLowerCase();
  }
  if (row.name) {
    return String(row.name).toLowerCase();
  }
  return null;
}

export function mergeMultiRowProducts(rows = []) {
  const byKey = new Map();
  const withoutKey = [];

  rows.forEach((row) => {
    const key = keyFromRow(row);
    if (!key) {
      withoutKey.push({ ...row });
      return;
    }

    if (!byKey.has(key)) {
      byKey.set(key, { ...row });
      return;
    }

    const existing = byKey.get(key);
    byKey.set(key, {
      ...existing,
      ...row,
      quantity:
        (existing.quantity ?? existing.stock ?? 0) + (row.quantity ?? row.stock ?? 0) || undefined,
      notes: [existing.notes, row.notes].filter(Boolean).join(' | ') || undefined,
    });
  });

  return [...byKey.values(), ...withoutKey];
}

