export function suggestCaseQuantity(quantity: number, unitsPerCase: number): number {
  if (unitsPerCase <= 0) return quantity

  const cases = quantity / unitsPerCase
  return Math.round(cases) * unitsPerCase
}
