// PO SKU Matcher - stub implementation
// TODO: Implement SKU matching against inventory

interface SkuMatch {
  productId?: string
  productName?: string
  confidence: number
}

export const poSkuMatcher = {
  match(sku: string): SkuMatch | undefined {
    // Stub - no matches
    return undefined
  }
}
