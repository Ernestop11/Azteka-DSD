const DEFAULT_UNITS_PER_CASE = 1;
const DEFAULT_UNIT_TYPE = 'case';

function parseUnits(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(
    String(value)
      .replace(/[^0-9.]/g, '')
      .trim(),
  );
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : null;
}

export function extractPackAndCase(row = {}) {
  const unitsPerCase =
    parseUnits(row.unitsPerCase ?? row.units_per_case ?? row.caseQty ?? row.quantityPerCase) ??
    DEFAULT_UNITS_PER_CASE;

  const unitType =
    String(row.unitType ?? row.unit_type ?? row.packType ?? row.unit)
      .trim()
      .toLowerCase() || DEFAULT_UNIT_TYPE;

  const packSize =
    row.packSize ??
    `${unitsPerCase} ${unitType}${unitsPerCase !== 1 && !unitType.endsWith('s') ? 's' : ''}`;

  return {
    unitsPerCase,
    unitType,
    packSize,
  };
}

