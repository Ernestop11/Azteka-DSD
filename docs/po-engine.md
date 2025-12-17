# PO Auto-Extraction Engine

## Modules
- `poParser.ts` + `poTextExtractor.ts` — parse raw text into line items.
- `poSkuMatcher.ts` + `poSupplierMap.ts` — map supplier SKUs to internal SKUs.
- `poNewProductDetector.ts` — flag new products with placeholder metadata.
- `poInventoryUpdater.ts` — build inventory adjustments.
- `poValidator.ts` — detect missing/invalid entries.
- API route `app/api/po/upload/route.ts` — accepts `FormData` file upload and returns parsed results with confidence scores.

## API Output
```json
{
  "supplierDetected": "unknown",
  "parsedItems": [{ "sku": "...", "quantity": 12, "match": { "internalSku": "...", "confidence": 0.95 } }],
  "newProducts": [{ "sku": "NEW", "description": "New Product" }],
  "inventoryUpdate": [{ "sku": "...", "quantityDelta": 12 }],
  "validationIssues": [],
  "confidence": 0.8
}
```

Cursor can use these outputs in future LAPs to populate UI flows.
