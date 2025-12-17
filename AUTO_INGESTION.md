# AI Auto-PO + Auto-Image Ingestion Pipeline

## Overview

The Auto-Ingestion Pipeline automatically processes purchase orders (PDF, CSV, Excel, Images) and:
1. Extracts product data using OCR + GPT-4o Vision
2. Searches for product images online
3. Removes backgrounds from images
4. Optimizes and enhances images
5. Matches products to existing catalog
6. Creates draft products or updates existing ones

## Setup

### Required Environment Variables

Add to `.env.production`:

```env
# OpenAI (for OCR + AI parsing)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Image Search APIs
BING_SEARCH_API_KEY=xxxxxxxxxxxxx
SERP_API_KEY=xxxxxxxxxxxxx

# Background Removal APIs
REMOVE_BG_API_KEY=xxxxxxxxxxxxx
CLIPDROP_API_KEY=xxxxxxxxxxxxx

# Canva (optional, for background removal fallback)
CANVA_API_KEY=xxxxxxxxxxxxx
```

### Required Dependencies

```bash
npm install openai pdf-parse xlsx csv-parse sharp string-similarity
```

## API Endpoints

All endpoints require Admin authentication.

### 1. Ingest Purchase Order

**POST** `/api/auto/ingest-po`

Upload a purchase order file (PDF, CSV, Excel, or Image) for parsing.

**Request:**
- `file` (multipart/form-data): Purchase order file
- `autoProcess` (optional): Set to `"true"` to automatically process products after parsing

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "product_name": "Sabritas Chips 50g",
      "sku": "SAB-50G",
      "vendor_code": "VEND-001",
      "size": "50g",
      "quantity": 100,
      "brand": "Sabritas",
      "category": "Snacks",
      "price": 15.50
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/ingest-po \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@purchase_order.pdf" \
  -F "autoProcess=true"
```

### 2. Search Product Image

**POST** `/api/auto/search-image`

Search for product images online using Bing/SerpAPI.

**Request:**
```json
{
  "productName": "Sabritas Chips 50g",
  "sku": "SAB-50G",
  "brand": "Sabritas",
  "size": "50g",
  "category": "Snacks"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://example.com/product-image.jpg"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/search-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sabritas Chips 50g",
    "brand": "Sabritas"
  }'
```

### 3. Remove Background

**POST** `/api/auto/bg-remove`

Remove background from product image.

**Request:**
- `image` (multipart/form-data): Image file

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://aztekafoods.com/uploads/products/image_nobg.png"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/bg-remove \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@product.jpg"
```

### 4. Enhance Image

**POST** `/api/auto/enhance`

Optimize, resize, and enhance product image.

**Request:**
- `image` (multipart/form-data): Image file
- `size` (optional): Target size in pixels (default: 1024)
- `sharpen` (optional): Enable sharpening (default: "true")
- `format` (optional): Output format: "png", "jpeg", "webp" (default: "png")
- `createThumbnail` (optional): Create thumbnail (default: "false")

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://aztekafoods.com/uploads/products/image_enhanced.png",
  "thumbnailUrl": "https://aztekafoods.com/uploads/products/image_thumb.jpg"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/enhance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@product.jpg" \
  -F "size=1024" \
  -F "createThumbnail=true"
```

### 5. Match Product

**POST** `/api/auto/match-product`

Match extracted product to existing catalog product.

**Request:**
```json
{
  "product_name": "Sabritas Chips 50g",
  "sku": "SAB-50G",
  "vendor_code": "VEND-001",
  "brand": "Sabritas",
  "size": "50g",
  "category": "Snacks"
}
```

**Response:**
```json
{
  "success": true,
  "match": {
    "id": "product-uuid",
    "name": "Sabritas Chips 50g",
    "sku": "SAB-50G",
    "brand": "Sabritas",
    "category": "Snacks"
  },
  "confidence": 0.95,
  "method": "sku_exact"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/match-product \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Sabritas Chips 50g",
    "sku": "SAB-50G"
  }'
```

### 6. Batch Ingestion

**POST** `/api/auto/ingest-batch`

Process multiple products through the full pipeline.

**Request:**
```json
{
  "products": [
    {
      "product_name": "Sabritas Chips 50g",
      "sku": "SAB-50G",
      "vendor_code": "VEND-001",
      "size": "50g",
      "quantity": 100,
      "brand": "Sabritas",
      "category": "Snacks",
      "price": 15.50
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 1,
    "updated": 1,
    "created": 0,
    "failed": 0
  },
  "items": [
    {
      "product": "Sabritas Chips 50g",
      "imageUrl": "https://aztekafoods.com/uploads/products/image.png",
      "match": {
        "id": "product-uuid",
        "name": "Sabritas Chips 50g"
      },
      "created": false,
      "updated": true,
      "errors": []
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auto/ingest-batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "product_name": "Sabritas Chips 50g",
        "sku": "SAB-50G",
        "brand": "Sabritas"
      }
    ]
  }'
```

## Pipeline Flow

### Full Auto-Ingestion Process

1. **Upload PO** → `/api/auto/ingest-po` with `autoProcess=true`
2. **Parse File** → Extract products using OCR + GPT-4o
3. **For each product:**
   - Search for image → `/api/auto/search-image`
   - Download image
   - Remove background → `/api/auto/bg-remove`
   - Enhance image → `/api/auto/enhance`
   - Upload to storage
   - Match product → `/api/auto/match-product`
   - Update existing OR create draft

### Manual Step-by-Step Process

1. **Parse PO:**
   ```bash
   curl -X POST /api/auto/ingest-po -F "file=@po.pdf"
   ```

2. **Search Images:**
   ```bash
   curl -X POST /api/auto/search-image -d '{"productName": "..."}'
   ```

3. **Process Images:**
   ```bash
   curl -X POST /api/auto/bg-remove -F "image=@product.jpg"
   curl -X POST /api/auto/enhance -F "image=@product.jpg"
   ```

4. **Match Products:**
   ```bash
   curl -X POST /api/auto/match-product -d '{"product_name": "..."}'
   ```

5. **Batch Process:**
   ```bash
   curl -X POST /api/auto/ingest-batch -d '{"products": [...]}'
   ```

## Error Codes

### Parsing Errors
- `PDF_PARSING_ERROR` - Failed to parse PDF
- `CSV_PARSING_ERROR` - Failed to parse CSV
- `EXCEL_PARSING_ERROR` - Failed to parse Excel
- `IMAGE_PARSING_ERROR` - Failed to parse image with GPT-4o
- `UNSUPPORTED_FILE_TYPE` - File type not supported

### Search Errors
- `BING_SEARCH_ERROR` - Bing API error
- `SERPAPI_SEARCH_ERROR` - SerpAPI error
- `IMAGE_NOT_FOUND` - No image found

### Processing Errors
- `BG_REMOVAL_ERROR` - Background removal failed
- `REMOVE_BG_ERROR` - Remove.bg API error
- `CLIPDROP_ERROR` - ClipDrop API error
- `ENHANCEMENT_ERROR` - Image enhancement failed
- `IMAGE_ENHANCEMENT_ERROR` - Sharp processing error
- `THUMBNAIL_ERROR` - Thumbnail creation failed

### Matching Errors
- `MATCHING_ERROR` - Product matching failed
- `EMBEDDING_ERROR` - Embedding generation failed

### General Errors
- `MISSING_FILE` - No file uploaded
- `MISSING_FIELDS` - Required fields missing
- `INGESTION_ERROR` - General ingestion error
- `BATCH_INGESTION_ERROR` - Batch processing error
- `PROCESSING_ERROR` - Product processing error

## Product Matching

The system uses multiple strategies to match products:

1. **Exact SKU Match** - Highest confidence (1.0)
2. **Vendor Code Match** - High confidence (0.85)
3. **Name + Brand Match** - Medium-high confidence (0.7-0.95)
4. **Embedding Similarity** - Medium confidence (0.7+)
5. **Name Similarity** - Medium confidence (0.7+)

**Confidence Threshold:** 0.7 (70% similarity required)

## Draft Products

When no match is found, the system creates a **draft product** with:
- `isHidden: true` - Hidden from catalog until reviewed
- `inStock: false` - Not available until approved
- `sku: "DRAFT-{timestamp}"` - Temporary SKU
- Auto-generated description and tags (if OpenAI available)

Admin must review and approve draft products before they appear in the catalog.

## Image Processing

### Supported Formats
- **Input:** JPEG, PNG, WebP
- **Output:** PNG (with transparency), JPEG, WebP

### Processing Steps
1. **Download** - Fetch image from URL
2. **Background Removal** - Remove.bg → ClipDrop → Canva
3. **Resize** - Resize to 1024px (maintain aspect ratio)
4. **Sharpen** - Apply sharpening filter
5. **Denoise** - Remove artifacts
6. **Add Padding** - Add transparent padding (10%)
7. **Create Thumbnail** - Generate 300px thumbnail

## Domain-Prioritized Search

The system prioritizes images from trusted domains:
- `sabritas.com`
- `gamesa.com.mx`
- `ricolino.com.mx`
- `barcel.com.mx`
- `marinela.com.mx`
- `pepsico.com`
- `grupo-bimbo.com`

## Rate Limiting

- Image search: 500ms delay between requests
- Background removal: Sequential processing
- Batch processing: 1 second delay between products

## File Size Limits

- **PO Files:** 50MB max
- **Images:** 20MB max

## Force Regeneration Endpoints

### Regenerate Single Product Image

**POST** `/api/products/:id/force-regenerate`

Force regenerate image for a specific product.

**Request:**
- `regenerateDesign` (optional): Set to `"true"` to also generate Canva design asset

**Response:**
```json
{
  "success": true,
  "message": "Product image regenerated successfully",
  "result": {
    "productId": "uuid",
    "productName": "Product Name",
    "imageUrl": "https://aztekafoods.com/uploads/products/image.png",
    "designAssetUrl": "https://aztekafoods.com/uploads/products/design.png",
    "steps": {
      "imageSearch": "https://...",
      "bgRemoval": "success",
      "enhancement": "success",
      "upload": "https://...",
      "designGeneration": "https://..."
    }
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products/PRODUCT_ID/force-regenerate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerateDesign": "true"}'
```

### Regenerate All Product Images

**POST** `/api/products/force-regenerate-all`

Regenerate images for all products in batches (non-blocking, async).

**Request:**
```json
{
  "batchSize": 20,
  "delay": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch regeneration started",
  "job": {
    "totalProducts": 150,
    "batches": 8,
    "batchSize": 20,
    "logFile": "/path/to/logs/regen/regen-1234567890.log",
    "summaryFile": "/path/to/logs/regen/regen-summary-1234567890.json"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products/force-regenerate-all \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 20, "delay": 2000}'
```

**Progress Tracking:**
- Check log file: `logs/regen/regen-{timestamp}.log`
- Check summary: `logs/regen/regen-summary-{timestamp}.json`

## Full Test Pipeline

### Running End-to-End Tests

The test harness runs the complete ingestion pipeline:

```bash
# Set test token (optional, defaults to 'test-token')
export ADMIN_TEST_TOKEN=your_admin_token

# Set API base URL (optional, defaults to http://localhost:3000)
export API_BASE_URL=http://localhost:3000

# Run full test
node scripts/run-full-ingestion-test.mjs
```

### Test Process

1. **PO Parsing** - Parses sample PO files (CSV, Excel, PDF)
2. **Image Search** - Searches for product images
3. **Image Processing** - Removes backgrounds, enhances images
4. **Product Matching** - Matches to existing catalog
5. **Design Generation** - Generates Canva design assets
6. **Database Updates** - Updates or creates products

### Test Output

Test results are saved to:
- **Log File:** `logs/testing/YYYY-MM-DD.log`
- **Summary:** `logs/testing/test-summary-{timestamp}.json`

**Summary Format:**
```json
{
  "testRun": {
    "startTime": "2025-11-14T...",
    "endTime": "2025-11-14T...",
    "duration": 45000
  },
  "poFiles": {
    "processed": 3,
    "totalProductsParsed": 15
  },
  "products": {
    "processed": 15,
    "updated": 10,
    "created": 3,
    "draftItems": 2
  },
  "assets": {
    "imagesGenerated": 12,
    "designAssetsGenerated": 8
  },
  "errors": {
    "count": 2,
    "details": [...]
  },
  "draftItems": [...]
}
```

### Sample PO Files

Test PO files are located in `tests/po-samples/`:
- `sabritas_po.csv` - Sabritas products
- `gamesa_po.csv` - Gamesa products
- `surti_rico_po.csv` - Ricolino/Marinela products

### QA Testing Instructions

1. **Setup:**
   ```bash
   # Install dependencies
   npm install

   # Configure API keys in .env.production
   OPENAI_API_KEY=...
   BING_SEARCH_API_KEY=...
   REMOVE_BG_API_KEY=...
   CANVA_API_KEY=...

   # Start server
   npm run server
   ```

2. **Run Tests:**
   ```bash
   # Full end-to-end test
   node scripts/run-full-ingestion-test.mjs

   # Check logs
   cat logs/testing/$(date +%Y-%m-%d).log

   # Check summary
   cat logs/testing/test-summary-*.json | jq
   ```

3. **Verify Results:**
   - Check database for updated/created products
   - Verify images in `/uploads/products/`
   - Review draft products in admin panel
   - Check error logs for failures

4. **Test Individual Endpoints:**
   ```bash
   # Test PO parsing
   curl -X POST http://localhost:3000/api/auto/ingest-po \
     -H "Authorization: Bearer TOKEN" \
     -F "file=@tests/po-samples/sabritas_po.csv"

   # Test image search
   curl -X POST http://localhost:3000/api/auto/search-image \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"productName": "Sabritas Chips 50g", "brand": "Sabritas"}'

   # Test force regenerate
   curl -X POST http://localhost:3000/api/products/PRODUCT_ID/force-regenerate \
     -H "Authorization: Bearer TOKEN"
   ```

## Notes

- All endpoints require Admin authentication
- Images are stored in `/uploads/products/`
- Temp files are cleaned up automatically
- Draft products require admin review
- AI features require OpenAI API key
- Background removal requires Remove.bg or ClipDrop API key
- Test logs are written to `logs/testing/` and `logs/regen/`

## Troubleshooting

### "OPENAI_API_KEY not configured"
- Add `OPENAI_API_KEY` to `.env.production`
- Restart server

### "No image found"
- Check Bing/SerpAPI API keys
- Verify product name is searchable
- Try different search terms

### "Background removal failed"
- Check Remove.bg/ClipDrop API keys
- Verify image format is supported
- Check API rate limits

### "Product matching failed"
- Verify product data is complete
- Check database connection
- Review matching confidence threshold

