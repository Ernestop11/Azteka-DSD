# AI PO Suggestions API Specification

## Overview
Complete AI automation system for generating purchase order suggestions based on inventory levels, sales trends, and vendor analysis.

---

## API Endpoints

### 1. GET /api/automation/po-suggestions

**Purpose:** Retrieve all PO suggestions

**Request:**
```
Headers:
  Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: 'pending' | 'approved' | 'rejected' | 'all' (default: 'all')
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response (200):**
```typescript
{
  success: true;
  suggestions: POSuggestion[];
  total: number;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    critical: number;
  };
}

interface POSuggestion {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  vendor_id: string;
  vendor_name: string;
  suggested_cost: number;
  total_cost: number;
  reasoning: string;  // AI-generated explanation
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sales_velocity: number;  // units per day
  lead_time_days: number;
  estimated_delivery: string;  // ISO date
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  vendor_comparison?: VendorComparison[];
}
```

---

### 2. POST /api/automation/po-suggestions/generate

**Purpose:** Manually trigger AI PO suggestion generation

**Request:**
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
```

**Body (optional):**
```typescript
{
  productIds?: string[];  // Specific products to analyze (optional)
  forceRegenerate?: boolean;  // Regenerate even if recent suggestions exist
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "PO suggestions generated";
  generated: number;  // Number of suggestions created
  suggestions: POSuggestion[];
  analysis: {
    productsAnalyzed: number;
    lowStockProducts: number;
    suggestionsCreated: number;
    totalValue: number;
  };
}
```

**Implementation:**
```javascript
async function generatePOSuggestions() {
  // Step 1: Get all products with current stock
  const products = await db('products')
    .select('*')
    .where('in_stock', true);

  const suggestions = [];

  for (const product of products) {
    // Step 2: Calculate sales velocity
    const salesVelocity = await calculateSalesVelocity(product.id);

    // Step 3: Check if low stock
    const reorderPoint = salesVelocity * 7; // 1 week buffer
    if (product.stock > reorderPoint) continue;

    // Step 4: Get vendor options
    const vendors = await getVendorsForProduct(product.id);

    // Step 5: AI analysis for best vendor and quantity
    const aiAnalysis = await analyzeWithAI({
      product,
      salesVelocity,
      vendors,
      currentStock: product.stock,
      reorderPoint
    });

    // Step 6: Create suggestion
    const suggestion = await db('po_suggestions').insert({
      id: generateUUID(),
      product_id: product.id,
      current_stock: product.stock,
      reorder_point: reorderPoint,
      suggested_quantity: aiAnalysis.quantity,
      vendor_id: aiAnalysis.recommendedVendor.id,
      suggested_cost: aiAnalysis.recommendedVendor.price,
      total_cost: aiAnalysis.quantity * aiAnalysis.recommendedVendor.price,
      reasoning: aiAnalysis.reasoning,
      urgency: calculateUrgency(product.stock, reorderPoint, salesVelocity),
      sales_velocity: salesVelocity,
      lead_time_days: aiAnalysis.recommendedVendor.deliveryTime,
      estimated_delivery: calculateDeliveryDate(aiAnalysis.recommendedVendor.deliveryTime),
      status: 'pending',
      created_at: new Date()
    }).returning('*');

    suggestions.push(suggestion);
  }

  return {
    success: true,
    generated: suggestions.length,
    suggestions
  };
}

async function calculateSalesVelocity(productId) {
  // Get sales from last 30 days
  const sales = await db('order_items')
    .join('orders', 'order_items.order_id', 'orders.id')
    .where('order_items.product_id', productId)
    .where('orders.created_at', '>=', db.raw("NOW() - INTERVAL '30 days'"))
    .sum('order_items.quantity as total');

  const totalSold = sales[0].total || 0;
  return totalSold / 30; // units per day
}

function calculateUrgency(currentStock, reorderPoint, salesVelocity) {
  const daysRemaining = currentStock / salesVelocity;

  if (daysRemaining <= 3) return 'critical';
  if (daysRemaining <= 7) return 'high';
  if (daysRemaining <= 14) return 'medium';
  return 'low';
}
```

---

### 3. POST /api/automation/po-suggestions/:id/approve

**Purpose:** Approve suggestion and create PO draft

**Request:**
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
```

**Body (optional):**
```typescript
{
  adjustedQuantity?: number;  // Override suggested quantity
  notes?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Suggestion approved";
  suggestion: POSuggestion;
  po: {
    id: string;
    status: 'draft';
    vendor_id: string;
    total: number;
    items: POItem[];
  };
}
```

**Implementation:**
```javascript
async function approveSuggestion(suggestionId, userId, adjustedQuantity, notes) {
  const suggestion = await db('po_suggestions')
    .where('id', suggestionId)
    .first();

  if (!suggestion) throw new Error('Suggestion not found');

  // Update suggestion status
  await db('po_suggestions')
    .where('id', suggestionId)
    .update({
      status: 'approved',
      approved_at: new Date(),
      approved_by_user_id: userId
    });

  // Create PO draft
  const quantity = adjustedQuantity || suggestion.suggested_quantity;
  const total = quantity * suggestion.suggested_cost;

  const po = await db('purchase_orders').insert({
    id: generateUUID(),
    vendor_id: suggestion.vendor_id,
    status: 'draft',
    total: total,
    notes: notes || `Generated from AI suggestion ${suggestionId}`,
    created_by_user_id: userId,
    created_at: new Date()
  }).returning('*');

  // Create PO item
  await db('purchase_order_items').insert({
    id: generateUUID(),
    purchase_order_id: po[0].id,
    product_id: suggestion.product_id,
    quantity: quantity,
    cost: suggestion.suggested_cost,
    total: total
  });

  return {
    success: true,
    suggestion,
    po: po[0]
  };
}
```

---

### 4. POST /api/automation/po-suggestions/:id/reject

**Purpose:** Reject suggestion

**Request:**
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
```

**Body (optional):**
```typescript
{
  reason?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Suggestion rejected";
  suggestion: POSuggestion;
}
```

---

### 5. GET /api/automation/po-suggestions/history

**Purpose:** Get suggestion history with analytics

**Request:**
```
Headers:
  Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `limit`: number

**Response (200):**
```typescript
{
  success: true;
  history: POSuggestion[];
  analytics: {
    totalSuggestions: number;
    approvalRate: number;  // percentage
    totalValue: number;
    avgResponseTime: number;  // hours
    topProducts: { product_name: string; count: number }[];
  };
}
```

---

## AI Analysis with OpenAI

### Function: analyzeWithAI()

**Purpose:** Use OpenAI to analyze inventory and recommend vendor/quantity

**Implementation:**
```javascript
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

async function analyzeWithAI({ product, salesVelocity, vendors, currentStock, reorderPoint }) {
  const prompt = `You are an inventory management AI assistant. Analyze the following product and recommend:
1. Best vendor to order from
2. Optimal order quantity
3. Reasoning for your recommendation

Product: ${product.name}
Current Stock: ${currentStock} units
Reorder Point: ${reorderPoint} units
Sales Velocity: ${salesVelocity} units/day
Lead Time: 7-14 days typical

Available Vendors:
${vendors.map((v, i) => `
${i + 1}. ${v.name}
   - Price: $${v.price}/unit
   - Delivery Time: ${v.delivery_time_days} days
   - Quality Score: ${v.quality_score}/10
   - Payment Terms: ${v.payment_terms}
   - Last Order: ${v.last_order_date || 'Never'}
`).join('\n')}

Consider:
- Total cost vs quality
- Delivery speed (stock urgency)
- Payment terms
- Past reliability

Respond in JSON format:
{
  "recommendedVendorIndex": 0,
  "quantity": 100,
  "reasoning": "Detailed explanation..."
}`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an inventory management expert.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  const aiResponse = JSON.parse(response.data.choices[0].message.content);

  return {
    recommendedVendor: vendors[aiResponse.recommendedVendorIndex],
    quantity: aiResponse.quantity,
    reasoning: aiResponse.reasoning
  };
}
```

---

## Database Schema

### Table: po_suggestions

```sql
CREATE TABLE po_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  current_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  suggested_quantity INTEGER NOT NULL,
  vendor_id UUID NOT NULL,
  suggested_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  reasoning TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high', 'critical'
  sales_velocity DECIMAL(10,2) NOT NULL,
  lead_time_days INTEGER NOT NULL,
  estimated_delivery TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  approved_by_user_id UUID REFERENCES users(id),
  rejected_by_user_id UUID REFERENCES users(id),
  rejection_reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_po_suggestions_status ON po_suggestions(status);
CREATE INDEX idx_po_suggestions_urgency ON po_suggestions(urgency);
CREATE INDEX idx_po_suggestions_created_at ON po_suggestions(created_at);
CREATE INDEX idx_po_suggestions_product ON po_suggestions(product_id);
```

### Table: vendor_comparison

```sql
CREATE TABLE vendor_comparison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  vendor_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_time_days INTEGER NOT NULL,
  quality_score DECIMAL(3,2),  -- 0.00 to 10.00
  payment_terms VARCHAR(100),
  minimum_order_quantity INTEGER,
  last_order_date TIMESTAMP,
  reliability_score DECIMAL(3,2),  -- 0.00 to 10.00
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, vendor_id)
);

CREATE INDEX idx_vendor_comparison_product ON vendor_comparison(product_id);
CREATE INDEX idx_vendor_comparison_vendor ON vendor_comparison(vendor_id);
```

### Table: purchase_orders (if not exists)

```sql
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'sent', 'confirmed', 'received'
  total DECIMAL(10,2) NOT NULL,
  invoice_id UUID,
  notes TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  received_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);
```

---

## Cron Job - Daily Automation

### Setup (Node.js with node-cron)

```javascript
const cron = require('node-cron');

// Run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running daily PO suggestion generation...');

  try {
    // Generate suggestions
    const result = await generatePOSuggestions();

    // Send notifications if critical items found
    const criticalSuggestions = result.suggestions.filter(s => s.urgency === 'critical');

    if (criticalSuggestions.length > 0) {
      await sendNotifications(criticalSuggestions);
    }

    console.log(`Generated ${result.generated} PO suggestions`);
  } catch (error) {
    console.error('Failed to generate PO suggestions:', error);
  }
});

async function sendNotifications(criticalSuggestions) {
  // Email notification
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `URGENT: ${criticalSuggestions.length} Critical Stock Items`,
    html: `
      <h1>Critical Stock Alert</h1>
      <p>The following items require immediate attention:</p>
      <ul>
        ${criticalSuggestions.map(s => `
          <li>
            <strong>${s.product_name}</strong><br>
            Current Stock: ${s.current_stock}<br>
            Days Remaining: ${(s.current_stock / s.sales_velocity).toFixed(1)}<br>
            Suggested Order: ${s.suggested_quantity} units from ${s.vendor_name}<br>
            <a href="${process.env.APP_URL}/admin/po-suggestions">Review Now</a>
          </li>
        `).join('')}
      </ul>
    `
  });

  // SMS notification (optional, using Twilio)
  if (process.env.TWILIO_ENABLED === 'true') {
    await sendSMS({
      to: process.env.ADMIN_PHONE,
      body: `ALERT: ${criticalSuggestions.length} critical stock items need immediate attention. Check ${process.env.APP_URL}/admin/po-suggestions`
    });
  }

  // In-app notification
  await db('notifications').insert({
    user_id: process.env.ADMIN_USER_ID,
    type: 'critical_stock',
    title: 'Critical Stock Alert',
    message: `${criticalSuggestions.length} items need immediate attention`,
    link: '/admin/po-suggestions',
    created_at: new Date()
  });
}
```

---

## Vendor Analysis Logic

### Get Vendors for Product

```javascript
async function getVendorsForProduct(productId) {
  // Get all vendors who supply this product
  const vendors = await db('vendor_comparison')
    .where('product_id', productId)
    .orderBy('last_updated', 'desc');

  if (vendors.length === 0) {
    // Fallback: Get vendors who supplied similar products
    const product = await db('products').where('id', productId).first();

    vendors = await db('vendor_comparison')
      .join('products', 'vendor_comparison.product_id', 'products.id')
      .where('products.category_id', product.category_id)
      .select('vendor_comparison.*')
      .groupBy('vendor_comparison.vendor_id')
      .limit(5);
  }

  return vendors;
}
```

### Update Vendor Comparison Data

```javascript
async function updateVendorComparison(productId, vendorId, data) {
  await db('vendor_comparison')
    .insert({
      product_id: productId,
      vendor_id: vendorId,
      price: data.price,
      delivery_time_days: data.deliveryTime,
      quality_score: data.qualityScore,
      payment_terms: data.paymentTerms,
      minimum_order_quantity: data.minimumOrder,
      last_order_date: data.lastOrderDate,
      reliability_score: data.reliabilityScore,
      last_updated: new Date()
    })
    .onConflict(['product_id', 'vendor_id'])
    .merge();
}
```

---

## Notifications

### Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .critical { background: #fee; border-left: 4px solid #f00; padding: 15px; margin: 10px 0; }
    .high { background: #fff3cd; border-left: 4px solid #ff8800; padding: 15px; margin: 10px 0; }
    .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
  </style>
</head>
<body>
  <h1>Daily PO Suggestions</h1>
  <p>AI has generated {{total}} purchase order suggestions based on inventory analysis.</p>

  {{#if criticalItems}}
  <h2 style="color: #f00;">⚠️ Critical Items ({{criticalItems.length}})</h2>
  {{#each criticalItems}}
  <div class="critical">
    <h3>{{product_name}}</h3>
    <p>Current Stock: <strong>{{current_stock}}</strong> units</p>
    <p>Days Remaining: <strong style="color: #f00;">{{daysRemaining}}</strong></p>
    <p>Suggested Order: <strong>{{suggested_quantity}}</strong> units from {{vendor_name}}</p>
    <p>Cost: ${{total_cost}}</p>
  </div>
  {{/each}}
  {{/if}}

  <a href="{{appUrl}}/admin/po-suggestions" class="btn">Review All Suggestions</a>
</body>
</html>
```

---

## Testing

### Test AI Generation

```bash
curl -X POST http://localhost:3000/api/automation/po-suggestions/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Test Approval

```bash
curl -X POST http://localhost:3000/api/automation/po-suggestions/{id}/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"adjustedQuantity": 150}'
```

---

## Cost Estimate

**OpenAI GPT-4 Usage:**
- Average: 300 tokens per analysis
- Cost: ~$0.006 per product analysis
- Daily: If 50 products analyzed = $0.30/day = $9/month

**Twilio SMS (Optional):**
- $0.0075 per message
- If 5 critical alerts/month = $0.04/month

**Total Monthly Cost: ~$10**

---

## Security

1. **Authentication**: Require admin role
2. **Rate Limiting**: Max 10 manual generations/hour
3. **Input Validation**: Validate all product/vendor IDs
4. **SQL Injection Protection**: Use parameterized queries
5. **API Key Security**: Store OpenAI key in environment variables

This completes the AI PO Suggestions API specification!
