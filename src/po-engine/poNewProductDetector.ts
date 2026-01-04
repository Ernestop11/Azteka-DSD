// PO New Product Detector - stub implementation
// TODO: Implement detection of new products from PO

interface NewProduct {
  sku?: string
  description?: string
  suggestedCategory?: string
}

export const poNewProductDetector = {
  detect(items: any[]): NewProduct[] {
    // Stub - no new products detected
    return []
  }
}
