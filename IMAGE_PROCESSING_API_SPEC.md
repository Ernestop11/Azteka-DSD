# AI Image Processing API Specification

## Overview
Complete API specification for auto image search, background removal, and AI splash image generation.

---

## 1. POST /api/images/search

### Purpose
Search Google for product image using Custom Search API

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  productName: string;    // Product name
  brand?: string;         // Brand name (optional)
}
```

**Example:**
```json
{
  "productName": "Coca-Cola 12oz Can",
  "brand": "Coca-Cola"
}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  imageUrl: string;       // URL of best matching image
  source: string;         // Source website
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}
```

**Error (400/500):**
```typescript
{
  success: false;
  message: string;
  error?: string;
}
```

### Implementation

```javascript
// Google Custom Search API setup
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

async function searchProductImage(productName, brand) {
  const searchQuery = brand ? `${brand} ${productName}` : productName;

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?` +
    `key=${GOOGLE_API_KEY}&` +
    `cx=${SEARCH_ENGINE_ID}&` +
    `q=${encodeURIComponent(searchQuery)}&` +
    `searchType=image&` +
    `imgSize=large&` +
    `num=5`
  );

  const data = await response.json();

  // Return best match (first result)
  const bestMatch = data.items[0];

  return {
    success: true,
    imageUrl: bestMatch.link,
    source: bestMatch.displayLink,
    metadata: {
      width: bestMatch.image.width,
      height: bestMatch.image.height,
      format: bestMatch.mime
    }
  };
}
```

---

## 2. POST /api/images/remove-background

### Purpose
Remove background from image using Remove.bg API

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  productId: string;      // Product ID
  imageUrl: string;       // Image URL to process
}
```

**Example:**
```json
{
  "productId": "prod_123",
  "imageUrl": "https://example.com/product.jpg"
}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  processedImageUrl: string;  // URL of transparent PNG
  originalImageUrl: string;   // Original image URL
  metadata: {
    fileSize: number;
    width: number;
    height: number;
  };
}
```

**Error (400/500):**
```typescript
{
  success: false;
  message: string;
  error?: string;
}
```

### Implementation

```javascript
const removeBackgroundApi = require('remove.bg');
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

async function removeBackground(productId, imageUrl) {
  // Download image
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.buffer();

  // Remove background
  const result = await removeBackgroundApi.removeBackgroundFromImageBuffer({
    apiKey: REMOVE_BG_API_KEY,
    imageBuffer: imageBuffer,
    size: 'regular',
    type: 'product',
    crop: false,
    scale: '100%'
  });

  // Save transparent PNG
  const fileName = `${productId}_nobg.png`;
  const filePath = `/public/products/${fileName}`;

  fs.writeFileSync(filePath, result.base64img, 'base64');

  // Update product
  await db('products')
    .where('id', productId)
    .update({
      image_url: `/products/${fileName}`,
      background_removed: true,
      updated_at: new Date()
    });

  return {
    success: true,
    processedImageUrl: `/products/${fileName}`,
    originalImageUrl: imageUrl,
    metadata: {
      fileSize: result.base64img.length,
      width: result.width,
      height: result.height
    }
  };
}
```

---

## 3. POST /api/images/process

### Purpose
Complete workflow: search + download + remove background

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  productId: string;
  productName: string;
  brand?: string;
}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  imageUrl: string;           // Final transparent PNG URL
  steps: {
    search: { success: boolean; imageUrl?: string; };
    download: { success: boolean; };
    removeBackground: { success: boolean; imageUrl?: string; };
  };
}
```

### Implementation

```javascript
async function processProductImage(productId, productName, brand) {
  const steps = {
    search: { success: false },
    download: { success: false },
    removeBackground: { success: false }
  };

  try {
    // Step 1: Search for image
    const searchResult = await searchProductImage(productName, brand);
    steps.search = { success: true, imageUrl: searchResult.imageUrl };

    // Step 2: Download image
    const imageUrl = searchResult.imageUrl;
    steps.download = { success: true };

    // Step 3: Remove background
    const bgResult = await removeBackground(productId, imageUrl);
    steps.removeBackground = {
      success: true,
      imageUrl: bgResult.processedImageUrl
    };

    return {
      success: true,
      imageUrl: bgResult.processedImageUrl,
      steps
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      steps
    };
  }
}
```

---

## 4. POST /api/images/ai/splash-image (NEW)

### Purpose
Generate AI splash/showcase image for special products

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  productId: string;
  productImageUrl: string;    // Product image (background removed)
  style: 'modern' | 'classic' | 'bold' | 'elegant';
  text: string;               // Main text overlay
  tagline?: string;           // Optional tagline
}
```

**Example:**
```json
{
  "productId": "prod_123",
  "productImageUrl": "/products/prod_123_nobg.png",
  "style": "modern",
  "text": "Coca-Cola 12oz",
  "tagline": "The Original Taste"
}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  splashImageUrl: string;     // Generated splash image URL
  style: string;
  metadata: {
    width: number;
    height: number;
    generatedAt: string;
  };
}
```

### Implementation

```javascript
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

async function generateSplashImage(productId, productImageUrl, style, text, tagline) {
  // Option 1: Use DALL-E to generate promotional image
  const prompt = `Create a professional product showcase banner for "${text}".
    Style: ${style}.
    Include the product prominently displayed.
    Add gradient background: ${getStyleGradient(style)}.
    Add promotional text: "${text}".
    ${tagline ? `Add tagline: "${tagline}".` : ''}
    Make it eye-catching and suitable for e-commerce.
    Size: 1200x630px.`;

  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'url'
  });

  const generatedImageUrl = response.data.data[0].url;

  // Download and save
  const imageResponse = await fetch(generatedImageUrl);
  const imageBuffer = await imageResponse.buffer();

  const fileName = `${productId}_splash.png`;
  const filePath = `/public/products/${fileName}`;

  fs.writeFileSync(filePath, imageBuffer);

  // Update product
  await db('products')
    .where('id', productId)
    .update({
      splash_image_url: `/products/${fileName}`,
      updated_at: new Date()
    });

  return {
    success: true,
    splashImageUrl: `/products/${fileName}`,
    style: style,
    metadata: {
      width: 1024,
      height: 1024,
      generatedAt: new Date().toISOString()
    }
  };
}

// Option 2: Use Canvas/Sharp to composite image
async function generateSplashImageWithComposite(productId, productImageUrl, style, text, tagline) {
  const sharp = require('sharp');

  // Create gradient background
  const gradient = getStyleGradientSVG(style);

  // Load product image
  const productImage = await sharp(productImageUrl)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create text overlay
  const textSVG = `
    <svg width="1200" height="630">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradient}
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <text x="600" y="100" font-family="Arial Black" font-size="72" fill="white" text-anchor="middle" font-weight="bold">
        ${text}
      </text>
      ${tagline ? `
      <text x="600" y="550" font-family="Arial" font-size="36" fill="white" text-anchor="middle">
        ${tagline}
      </text>
      ` : ''}
    </svg>
  `;

  // Composite image
  const splash = await sharp(Buffer.from(textSVG))
    .composite([
      { input: productImage, gravity: 'center' }
    ])
    .png()
    .toBuffer();

  const fileName = `${productId}_splash.png`;
  const filePath = `/public/products/${fileName}`;

  fs.writeFileSync(filePath, splash);

  return {
    success: true,
    splashImageUrl: `/products/${fileName}`,
    style: style,
    metadata: {
      width: 1200,
      height: 630,
      generatedAt: new Date().toISOString()
    }
  };
}

function getStyleGradient(style) {
  const gradients = {
    modern: 'vibrant blue to purple gradient',
    classic: 'elegant gold to black gradient',
    bold: 'bright red to orange gradient',
    elegant: 'soft pink to lavender gradient'
  };
  return gradients[style] || gradients.modern;
}

function getStyleGradientSVG(style) {
  const gradients = {
    modern: `
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    `,
    classic: `
      <stop offset="0%" style="stop-color:#DAA520;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    `,
    bold: `
      <stop offset="0%" style="stop-color:#FF512F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DD2476;stop-opacity:1" />
    `,
    elegant: `
      <stop offset="0%" style="stop-color:#fccb90;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d57eeb;stop-opacity:1" />
    `
  };
  return gradients[style] || gradients.modern;
}
```

---

## 5. GET /api/images/ai/splash-image/:productId

### Purpose
Get splash image for product

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `productId`: Product ID

### Response

**Success (200):**
```typescript
{
  success: true;
  splashImageUrl: string;
  product: {
    id: string;
    name: string;
    special: boolean;
  };
}
```

---

## 6. POST /api/products/:id/process-image

### Purpose
Trigger auto image processing for specific product

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Product ID

### Response

**Success (200):**
```typescript
{
  success: true;
  message: "Image processing started";
  jobId: string;
}
```

---

## Database Schema Updates

### Add to `products` table:

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS background_removed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS splash_image_url TEXT,
  ADD COLUMN IF NOT EXISTS special BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_products_background_removed
  ON products(background_removed);

CREATE INDEX IF NOT EXISTS idx_products_special
  ON products(special);
```

### Create `image_processing_jobs` table:

```sql
CREATE TABLE image_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  step VARCHAR(50),                      -- 'search', 'download', 'remove-bg', 'generate-splash'
  original_image_url TEXT,
  processed_image_url TEXT,
  splash_image_url TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_image_processing_jobs_product
  ON image_processing_jobs(product_id);

CREATE INDEX idx_image_processing_jobs_status
  ON image_processing_jobs(status);
```

---

## Environment Variables

Add to `.env`:

```bash
# Google Custom Search API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Remove.bg API
REMOVE_BG_API_KEY=your_remove_bg_api_key

# OpenAI API (for splash image generation)
OPENAI_API_KEY=your_openai_api_key
```

---

## Automatic Processing Triggers

### On Product Creation (from PO Invoice):

```javascript
// In POST /api/invoices/upload handler
async function handleInvoiceUpload(file) {
  // ... parse invoice ...

  for (const item of parsedItems) {
    const product = await createProduct(item);

    // Trigger auto image processing
    if (!product.image_url) {
      await processProductImage(
        product.id,
        product.name,
        product.brand
      );
    }
  }
}
```

### On Product Update:

```javascript
// In PUT /api/products/:id handler
async function handleProductUpdate(productId, updates) {
  await db('products').where('id', productId).update(updates);

  const product = await db('products').where('id', productId).first();

  // If marked as special, generate splash image
  if (updates.special === true && product.image_url && product.background_removed) {
    await generateSplashImage(
      product.id,
      product.image_url,
      'modern',
      product.name,
      'Premium Quality'
    );
  }
}
```

---

## Bulk Processing

### POST /api/images/bulk-process

**Request:**
```typescript
{
  productIds: string[];      // Array of product IDs
  operation: 'search' | 'remove-bg' | 'generate-splash';
}
```

**Response:**
```typescript
{
  success: true;
  jobIds: string[];          // Background job IDs
  totalProducts: number;
}
```

**Implementation:**
```javascript
async function bulkProcessImages(productIds, operation) {
  const jobs = [];

  for (const productId of productIds) {
    const product = await db('products').where('id', productId).first();

    let jobId;

    if (operation === 'search') {
      jobId = await queueJob('search-image', {
        productId,
        productName: product.name,
        brand: product.brand
      });
    } else if (operation === 'remove-bg') {
      jobId = await queueJob('remove-background', {
        productId,
        imageUrl: product.image_url
      });
    } else if (operation === 'generate-splash') {
      jobId = await queueJob('generate-splash', {
        productId,
        productImageUrl: product.image_url,
        style: 'modern',
        text: product.name
      });
    }

    jobs.push(jobId);
  }

  return {
    success: true,
    jobIds: jobs,
    totalProducts: productIds.length
  };
}
```

---

## Error Handling

1. **Google Search Fails**: Retry 3 times, then mark as failed
2. **Remove.bg Fails**: Try alternative service or mark as failed
3. **DALL-E Fails**: Use fallback composite method
4. **Image Download Fails**: Retry with exponential backoff
5. **Rate Limits**: Queue jobs and process with delays

---

## Testing

### Test Image Search:
```bash
curl -X POST http://localhost:3000/api/images/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Coca-Cola 12oz Can",
    "brand": "Coca-Cola"
  }'
```

### Test Background Removal:
```bash
curl -X POST http://localhost:3000/api/images/remove-background \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "imageUrl": "https://example.com/product.jpg"
  }'
```

### Test Splash Image Generation:
```bash
curl -X POST http://localhost:3000/api/images/ai/splash-image \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "productImageUrl": "/products/prod_123_nobg.png",
    "style": "modern",
    "text": "Coca-Cola 12oz",
    "tagline": "The Original Taste"
  }'
```

---

## Frontend Integration

The frontend (`ImageProcessing.tsx`) calls these endpoints:

1. **Search**: `/api/images/search`
2. **Remove BG**: `/api/images/remove-background`
3. **Generate Splash**: `/api/images/ai/splash-image`
4. **Bulk Process**: `/api/images/bulk-process`

All endpoints require authentication and admin role.

---

## Cost Estimates

- **Google Custom Search**: $5 per 1000 queries (free tier: 100/day)
- **Remove.bg**: $0.20 per image (free tier: 50/month)
- **OpenAI DALL-E**: $0.020 per image (1024x1024)

**Example Cost for 1000 Products:**
- Search: $5
- Background Removal: $200
- Splash Images (10% special): $2
- **Total**: ~$207

---

## Performance Optimization

1. **Caching**: Cache search results for 7 days
2. **CDN**: Use CDN for processed images
3. **Compression**: Compress PNG images with TinyPNG
4. **Lazy Loading**: Process images in background queue
5. **Batch Processing**: Process multiple images in parallel (max 5 concurrent)

---

## Security

1. **API Key Protection**: Store in environment variables
2. **Input Validation**: Sanitize all product names and URLs
3. **File Upload Limits**: Max 10MB per image
4. **Rate Limiting**: Max 100 requests/hour per user
5. **CORS**: Only allow from authorized domains

This completes the AI Image Processing API specification!
