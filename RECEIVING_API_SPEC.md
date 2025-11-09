# Receiving Flow API Specification

## Overview
This document specifies the backend API endpoint needed to complete the PO receiving flow.

## Endpoint: POST /api/invoices/receive

### Purpose
Mark invoice as received and update inventory (quantities, costs, stock status).

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  invoiceId: string;       // Invoice ID from upload response
  items: Array<{
    type: 'new' | 'existing';
    productId: string;
    name: string;
    imageUrl?: string;
    quantity: number;      // Units to add to inventory
    cost: string;          // New cost per unit
  }>;
}
```

### Response

**Success (200):**
```typescript
{
  success: true;
  message: "Invoice received and inventory updated";
  invoice: {
    id: string;
    status: "received";
    receivedAt: string;    // ISO date
  };
  inventoryUpdates: {
    productsUpdated: number;
    totalUnitsAdded: number;
    totalValue: number;
  };
  transactionId: string;   // Inventory transaction log ID
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

## Backend Implementation Requirements

### 1. Database Updates

#### Update `products` table:
```sql
UPDATE products
SET
  stock = stock + :quantity,           -- Add quantity
  price = :cost,                       -- Update cost
  in_stock = true,                     -- Mark as available
  updated_at = NOW()
WHERE id = :productId;
```

#### Update `purchase_orders` table (if exists):
```sql
UPDATE purchase_orders
SET
  status = 'received',
  received_at = NOW(),
  updated_at = NOW()
WHERE invoice_id = :invoiceId;
```

#### Create `inventory_transactions` record:
```sql
INSERT INTO inventory_transactions (
  id,
  product_id,
  transaction_type,
  quantity,
  cost_per_unit,
  total_value,
  reference_type,
  reference_id,
  notes,
  created_at
) VALUES (
  gen_random_uuid(),
  :productId,
  'RECEIVING',
  :quantity,
  :cost,
  :quantity * :cost,
  'PO_INVOICE',
  :invoiceId,
  'Received from invoice: ' || :supplier,
  NOW()
);
```

#### Create `receiving_logs` record (optional):
```sql
INSERT INTO receiving_logs (
  id,
  invoice_id,
  received_by_user_id,
  total_items,
  total_units,
  total_value,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  :invoiceId,
  :userId,
  :itemCount,
  :totalUnits,
  :totalValue,
  'completed',
  NOW()
);
```

### 2. Business Logic

```typescript
// Pseudo-code for backend handler
async function handleInvoiceReceive(req, res) {
  const { invoiceId, items } = req.body;
  const userId = req.user.id; // From auth token

  // Start transaction
  await db.transaction(async (trx) => {
    let totalUnitsAdded = 0;
    let totalValue = 0;

    // Process each item
    for (const item of items) {
      const quantity = Number(item.quantity);
      const cost = Number(item.cost);

      // Update product
      await trx('products')
        .where('id', item.productId)
        .update({
          stock: trx.raw('stock + ?', [quantity]),
          price: cost,
          in_stock: true,
          updated_at: new Date(),
        });

      // Create inventory transaction
      await trx('inventory_transactions').insert({
        id: generateUUID(),
        product_id: item.productId,
        transaction_type: 'RECEIVING',
        quantity: quantity,
        cost_per_unit: cost,
        total_value: quantity * cost,
        reference_type: 'PO_INVOICE',
        reference_id: invoiceId,
        created_at: new Date(),
      });

      totalUnitsAdded += quantity;
      totalValue += quantity * cost;
    }

    // Update invoice/PO status
    await trx('purchase_orders')
      .where('invoice_id', invoiceId)
      .update({
        status: 'received',
        received_at: new Date(),
        updated_at: new Date(),
      });

    // Create receiving log
    const receivingLog = await trx('receiving_logs').insert({
      id: generateUUID(),
      invoice_id: invoiceId,
      received_by_user_id: userId,
      total_items: items.length,
      total_units: totalUnitsAdded,
      total_value: totalValue,
      status: 'completed',
      created_at: new Date(),
    }).returning('id');

    return {
      success: true,
      message: 'Invoice received and inventory updated',
      invoice: {
        id: invoiceId,
        status: 'received',
        receivedAt: new Date().toISOString(),
      },
      inventoryUpdates: {
        productsUpdated: items.length,
        totalUnitsAdded,
        totalValue,
      },
      transactionId: receivingLog[0].id,
    };
  });
}
```

### 3. Catalog Sync

After receiving, products should automatically appear in the catalog:
- Products with `in_stock = true` are shown
- Products with `in_stock = false` are hidden
- Stock levels are displayed on product cards
- Out-of-stock products can optionally show "Coming Soon"

The catalog should automatically refresh to show newly received products.

## Database Schema (Suggested)

### `inventory_transactions` table:
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'RECEIVING', 'SALE', 'ADJUSTMENT'
  quantity INTEGER NOT NULL,
  cost_per_unit DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reference_type VARCHAR(50),            -- 'PO_INVOICE', 'ORDER', 'MANUAL'
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id)
);

CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at);
```

### `receiving_logs` table:
```sql
CREATE TABLE receiving_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  received_by_user_id UUID REFERENCES users(id),
  total_items INTEGER NOT NULL,
  total_units INTEGER NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receiving_logs_invoice ON receiving_logs(invoice_id);
CREATE INDEX idx_receiving_logs_date ON receiving_logs(created_at);
```

### Update `products` table (if not already):
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
```

### Update `purchase_orders` table (if not already):
```sql
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;
```

## Testing the Flow

### 1. Upload Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@invoice.pdf"
```

### 2. Receive Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/receive \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "type": "existing",
        "productId": "prod_123",
        "name": "Coca-Cola 12oz",
        "quantity": 100,
        "cost": "0.50"
      }
    ]
  }'
```

### 3. Verify Inventory
```bash
curl http://localhost:3000/api/products/prod_123 \
  -H "Authorization: Bearer <token>"
```

Expected: Stock increased by 100, price updated to $0.50, in_stock = true

## Security Considerations

1. **Authentication**: Require valid JWT token
2. **Authorization**: Only admins can receive inventory
3. **Idempotency**: Prevent double-receiving same invoice
4. **Validation**:
   - Validate all quantities are positive
   - Validate all costs are positive decimals
   - Validate productId exists
   - Validate invoiceId exists and not already received
5. **Audit Trail**: Log who received what and when

## Error Handling

- **Invoice already received**: Return 400 with message
- **Product not found**: Return 400 with message
- **Invalid quantity/cost**: Return 400 with validation errors
- **Database error**: Return 500, rollback transaction
- **Unauthorized**: Return 401

## Next Steps for Backend Developer

1. Create `/api/invoices/receive` endpoint
2. Implement database transaction logic
3. Add inventory_transactions table if not exists
4. Add receiving_logs table if not exists
5. Update products table schema if needed
6. Test with sample data
7. Add error handling and validation
8. Add audit logging
9. Deploy to production

## Frontend → Backend Contract

The frontend sends:
- `invoiceId`: From upload response
- `items[]`: Editable array of products with quantities/costs

The backend must:
- Update product stock (+quantity)
- Update product cost (new value)
- Set in_stock = true
- Create transaction log
- Mark invoice as received
- Return success confirmation

This completes the PO → Receiving → Inventory → Catalog flow!
