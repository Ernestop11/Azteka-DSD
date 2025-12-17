function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(
    String(value)
      .replace(/[^0-9.,-]/g, '')
      .replace(/,/g, ''),
  );
  return Number.isFinite(numeric) ? numeric : null;
}

export function extractPricing(row = {}) {
  const warnings = [];
  const priceCase =
    toNumber(row.priceCase ?? row.casePrice ?? row.price) ??
    (() => {
      warnings.push('Missing case price; defaulted to 0.');
      return 0;
    })();

  const vendorPrice = toNumber(row.vendorPrice ?? row.vendor_price);
  const costCase =
    toNumber(row.costCase ?? row.cost_case ?? row.costPerCase ?? row.cost) ?? vendorPrice ?? priceCase;

  let marginPercent = toNumber(row.marginPercent ?? row.margin);
  if (marginPercent === null && priceCase && costCase !== null) {
    const computed = ((priceCase - costCase) / (priceCase || 1)) * 100;
    marginPercent = Number.isFinite(computed) ? Number(computed.toFixed(2)) : null;
  }

  return {
    priceCase,
    vendorPrice,
    costCase,
    marginPercent,
    warnings,
  };
}

