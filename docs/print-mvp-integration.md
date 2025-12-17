# Print MVP Integration Guide

**LAP W1: Warehouse Auto-Print Engine - Complete Integration Reference**

Quick reference for integrating the warehouse print system into your application.

---

## Table of Contents

1. [Integration Checklist](#integration-checklist)
2. [Order Mapper](#order-mapper)
3. [Pick List Builder](#pick-list-builder)
4. [Queue APIs](#queue-apis)
5. [Testing](#testing)
6. [Common Patterns](#common-patterns)

---

## Integration Checklist

### MVP Ready ✅

- [x] Order mapper (`orderMapper.ts`) - Maps Prisma orders to packing slip format
- [x] Pick list builder (`pickListBuilder.ts`) - Zone-based pick optimization
- [x] Print endpoint (`/api/warehouse/print-slip`) - Queue print jobs
- [x] Queue API (`/api/warehouse/queue`) - Monitor queue state
- [x] Job details API (`/api/warehouse/queue/[jobId]`) - Get/delete individual jobs
- [x] Pick list API (`/api/warehouse/pick-list/[orderId]`) - Generate pick lists
- [x] Background worker (`printEngine.ts`) - Process jobs with retry logic

### Integration Points

**1. Trigger Print on Order Confirmation** ⏳

```typescript
// Add to your order confirmation handler
import { buildPrintPayload } from '@/warehouse/print/orderMapper'

async function confirmOrder(orderId: string) {
  // ... existing confirmation logic ...

  // Trigger print
  try {
    const response = await fetch('/api/warehouse/print-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        priority: 'normal',
        copies: 1,
      }),
    })

    const result = await response.json()
    console.log(`Print job queued: ${result.jobId}`)
  } catch (error) {
    console.error('Auto-print failed:', error)
    // Don't fail order confirmation if print fails
  }
}
```

**2. Start Background Worker** ⏳

```javascript
// In server.mjs or your main server file
import { processPrintQueue } from './src/warehouse/print/printEngine.js'

if (process.env.ENABLE_PRINT_WORKER !== 'false') {
  processPrintQueue('server-worker')
  console.log('✅ Print queue worker started')
}
```

**3. Connect Warehouse Panel** ⏳

```typescript
// In warehouse UI component
const [queueState, setQueueState] = useState(null)

// Poll queue every 5s
useEffect(() => {
  const fetchQueue = async () => {
    const response = await fetch('/api/warehouse/queue?status=pending&limit=50')
    const data = await response.json()
    setQueueState(data.data)
  }

  fetchQueue()
  const interval = setInterval(fetchQueue, 5000)
  return () => clearInterval(interval)
}, [])
```

---

## Order Mapper

### Purpose

Transform Prisma `Order` structure to `PackingSlipOrder` format for PDF rendering.

### Main Function

```typescript
import { buildPrintPayload } from '@/warehouse/print/orderMapper'

const payload = await buildPrintPayload(orderId)
```

### What It Does

1. **Fetches Order:**
   - Order + Customer + Items + Products + Brands + Categories

2. **Generates Order Number:**
   - Format: `ORD-YYYYMMDD-SHORTID`
   - Example: `ORD-20240120-ABC12345`

3. **Maps Customer → Store:**
   ```typescript
   {
     id: customer.id,
     name: customer.businessName || customer.contactName,
     code: "TC", // Auto-generated from business name
     address: { street, city, state, zipCode },
     phone: customer.phone,
     email: customer.email,
   }
   ```

4. **Assigns Warehouse Locations:**
   - Based on product category
   - Format: `{Zone}{Aisle}-{Bin}`
   - Example: `A1-01` (Zone A, Aisle 1, Bin 01)

5. **Calculates Totals:**
   ```typescript
   {
     subtotal: order.total,
     total: order.total,
     itemCount: items.length,
     totalUnits: sum(quantity * unitsPerCase),
   }
   ```

6. **Validates Payload:**
   - All required fields present
   - Store info complete
   - Items array not empty
   - Totals calculated

### Usage in Print Endpoint

```typescript
// app/api/warehouse/print-slip/route.ts (already integrated)
async function fetchOrder(orderId: string): Promise<PackingSlipOrder | null> {
  const payload = await buildPrintPayload(orderId)

  if (!payload) {
    console.warn(`Failed to build payload for order ${orderId}`)
    return null
  }

  const validation = validatePayloadShape(payload)
  if (!validation.valid) {
    console.error('Invalid payload:', validation.errors)
    return null
  }

  return payload
}
```

### Customization

**Add Warehouse Location Field (Future):**

```prisma
// In schema.prisma
model Product {
  // ... existing fields ...
  warehouseZone     String?  // "A", "B", "C", etc.
  warehouseAisle    String?  // "1", "2", "3", etc.
  warehouseBin      String?  // "01", "02", "03", etc.
  warehouseLocation String?  // Full: "A1-01"
}
```

Then update `orderMapper.ts`:

```typescript
warehouseLocation: item.product.warehouseLocation || generateWarehouseLocation(item.product, index)
```

---

## Pick List Builder

### Purpose

Generate optimized warehouse pick sequences with zone grouping and serpentine path traversal.

### Main Function

```typescript
import { buildPickList } from '@/warehouse/print/pickListBuilder'

const pickList = await buildPickList(orderId)
```

### Algorithm Overview

**1. Zone Assignment:**

```typescript
const CATEGORY_TO_ZONE = {
  'Beverages': 'A',
  'Snacks': 'B',
  'Candy': 'C',
  'Household': 'D',
  'Seasonal': 'E',
  'Bulk': 'F',
}
```

**2. Location Generation:**

```
Format: {Zone}{Aisle}-{Bin}

Examples:
- A1-01 (Zone A, Aisle 1, Bin 01)
- B2-05 (Zone B, Aisle 2, Bin 05)
- C3-10 (Zone C, Aisle 3, Bin 10)
```

**3. Zone Grouping:**

```typescript
{
  zones: [
    {
      zone: "A",
      zoneName: "Beverages / Bebidas",
      totalItems: 5,
      totalUnits: 120,
      estimatedPickTime: 150, // seconds
      items: [sorted by slot],
    },
    {
      zone: "B",
      zoneName: "Snacks / Botanas",
      totalItems: 4,
      totalUnits: 96,
      estimatedPickTime: 100,
      items: [sorted by slot],
    },
  ],
}
```

**4. Serpentine Optimization:**

```
Zone A (forward):  A1-01 → A1-02 → A1-03 → A2-01 → A2-02
Zone B (reverse):  B3-05 → B3-04 → B2-03 → B1-02 → B1-01
Zone C (forward):  C1-01 → C1-02 → C2-01 → C2-02

This minimizes travel distance between zones
```

**5. Time Estimation:**

```typescript
// Base time per item in each zone
const WAREHOUSE_ZONES = {
  A: { avgPickTime: 30 }, // 30s per item
  B: { avgPickTime: 25 },
  C: { avgPickTime: 20 },
}

// Zone transition time
const ZONE_TRANSITION_TIME = 60 // 60s to move between zones

// Total time = sum(zone times) + transitions
```

### Output Structure

```typescript
{
  orderId: "abc123",
  orderNumber: "ORD-20240120-ABC123",
  customerId: "customer_456",
  customerName: "Tienda Central",
  totalItems: 12,
  totalUnits: 288,
  estimatedPickTime: 720, // 12 minutes
  zones: [
    {
      zone: "A",
      zoneName: "Beverages / Bebidas",
      totalItems: 5,
      totalUnits: 120,
      estimatedPickTime: 150,
      items: [
        {
          lineNumber: 1,
          productName: "Coca-Cola 355ml",
          sku: "CC-355",
          brand: "Coca-Cola",
          quantity: 24,
          unitType: "case",
          totalUnits: 24,
          slot: "A1-01",
          zone: "A",
          aisle: "1",
          bin: "01",
        },
      ],
    },
  ],
  pickSequence: [
    // Optimized order (serpentine)
    { lineNumber: 1, productName: "Coca-Cola 355ml", slot: "A1-01", zone: "A" },
    { lineNumber: 2, productName: "Sprite 355ml", slot: "A1-02", zone: "A" },
    // ...
  ],
  generatedAt: "2024-01-20T10:30:00.000Z",
}
```

### Usage Examples

**Generate Pick List for API:**

```typescript
// app/api/warehouse/pick-list/[orderId]/route.ts (already created)
export async function GET(request, { params }) {
  const pickList = await buildPickList(params.orderId)

  return NextResponse.json({
    success: true,
    data: {
      pickList,
      summary: getPickListSummary(pickList),
    },
  })
}
```

**Format for Printing:**

```typescript
import { formatPickListForPrint } from '@/warehouse/print/pickListBuilder'

const pickList = await buildPickList(orderId)
const text = formatPickListForPrint(pickList)

// Returns formatted text:
// ================================================================================
// PICK LIST / LISTA DE RECOLECCIÓN
// ================================================================================
//
// Order / Pedido: ORD-20240120-ABC123
// Customer / Cliente: Tienda Central
// Total Items / Artículos: 12
// Total Units / Unidades: 288
// Est. Time / Tiempo Est.: 12m
// Generated / Generado: 1/20/2024, 10:30:00 AM
//
// ================================================================================
// PICK BY ZONE / RECOLECTAR POR ZONA
// ================================================================================
//
// Zone A: Beverages / Bebidas
// Items: 5 | Units: 120 | Time: 2m 30s
// --------------------------------------------------------------------------------
//   [A1-01] Coca-Cola 355ml (CC-355) - 24 case (24 units)
//   [A1-02] Sprite 355ml (SP-355) - 12 case (12 units)
// ...
```

**Batch Picking:**

```typescript
import { buildBatchPickLists, consolidatePickLists } from '@/warehouse/print/pickListBuilder'

// Build pick lists for multiple orders
const pickLists = await buildBatchPickLists(['ord_1', 'ord_2', 'ord_3'])

// Consolidate into single pick list
const consolidated = consolidatePickLists(pickLists)

// Result:
// {
//   orderNumber: "BATCH-ORD-001,ORD-002,ORD-003",
//   customerName: "3 Orders / Pedidos",
//   totalItems: 36,
//   totalUnits: 864,
//   estimatedPickTime: 2160, // 36 minutes
//   zones: [...], // Combined and optimized
//   pickSequence: [...], // Optimized for all orders
// }
```

---

## Queue APIs

### 1. Get Queue State

```
GET /api/warehouse/queue
Query params: status, priority, limit, offset, sortBy, sortOrder
```

**Example:**

```typescript
const response = await fetch('/api/warehouse/queue?status=pending&limit=50')
const { data } = await response.json()

console.log(data)
// {
//   jobs: [
//     {
//       id: "pj_1234567890_ord123_abc",
//       orderId: "ord_123",
//       orderNumber: "ORD-20240120-ABC123",
//       status: "pending",
//       priority: "normal",
//       attemptCount: 0,
//       maxAttempts: 3,
//       errorMessage: null,
//       createdAt: "2024-01-20T10:30:00.000Z",
//       metadata: {
//         storeId: "store_456",
//         storeName: "Tienda Central",
//         itemCount: 12,
//         totalUnits: 288,
//       },
//     },
//   ],
//   summary: {
//     totalJobs: 150,
//     pendingJobs: 5,
//     printingJobs: 1,
//     completedJobs: 140,
//     failedJobs: 3,
//     successRate: 97.9,
//     averageCompletionTime: 3200,
//   },
//   worker: {
//     running: true,
//     workerId: "server-worker",
//   },
// }
```

### 2. Get Job Details

```
GET /api/warehouse/queue/{jobId}
```

**Example:**

```typescript
const response = await fetch('/api/warehouse/queue/pj_1234567890_ord123_abc')
const { data } = await response.json()

console.log(data.job)
// {
//   id: "pj_1234567890_ord123_abc",
//   orderId: "ord_123",
//   status: "failed",
//   errorMessage: "Printer offline",
//   attemptCount: 2,
//   maxAttempts: 3,
//   scheduledFor: "2024-01-20T10:35:00.000Z", // Retry scheduled
// }
```

### 3. Delete/Cancel Job

```
DELETE /api/warehouse/queue/{jobId}
```

**Example:**

```typescript
await fetch('/api/warehouse/queue/pj_1234567890_ord123_abc', {
  method: 'DELETE',
})

// Job marked as cancelled
```

### 4. Get Pick List

```
GET /api/warehouse/pick-list/{orderId}?format=json|text
```

**Examples:**

```typescript
// Get JSON
const response = await fetch('/api/warehouse/pick-list/ord_123')
const { data } = await response.json()
console.log(data.pickList.zones)

// Get formatted text
const response = await fetch('/api/warehouse/pick-list/ord_123?format=text')
const text = await response.text()
console.log(text) // Formatted pick list
```

---

## Testing

### Manual Testing

**1. Queue a Print Job:**

```bash
curl -X POST http://localhost:3000/api/warehouse/print-slip \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "your-order-id",
    "priority": "high",
    "copies": 2
  }'
```

Expected:

```json
{
  "success": true,
  "jobId": "pj_1234567890_ord123_abc",
  "message": "Packing slip queued for order ORD-20240120-ABC123",
  "printStatus": "queued"
}
```

**2. Check Queue:**

```bash
curl http://localhost:3000/api/warehouse/queue?status=pending&limit=10
```

**3. Get Pick List:**

```bash
curl http://localhost:3000/api/warehouse/pick-list/your-order-id
```

### Automated Testing

```typescript
// Test order mapper
import { buildPrintPayload, validatePayloadShape } from '@/warehouse/print/orderMapper'

const payload = await buildPrintPayload('test-order-id')
expect(payload).toBeTruthy()
expect(payload.orderNumber).toMatch(/ORD-\d{8}-[A-Z0-9]+/)

const validation = validatePayloadShape(payload)
expect(validation.valid).toBe(true)
expect(validation.errors).toHaveLength(0)

// Test pick list builder
import { buildPickList } from '@/warehouse/print/pickListBuilder'

const pickList = await buildPickList('test-order-id')
expect(pickList).toBeTruthy()
expect(pickList.zones.length).toBeGreaterThan(0)
expect(pickList.pickSequence.length).toBe(pickList.totalItems)

// Test queue operations
import { queuePrintJob, getPrintJob } from '@/warehouse/print/printEngine'

const { jobId } = await queuePrintJob({
  orderId: 'test-order',
  orderNumber: 'ORD-TEST-001',
  priority: 'high',
})

const job = await getPrintJob(jobId)
expect(job.status).toBe('pending')
expect(job.priority).toBe('high')
```

---

## Common Patterns

### Pattern 1: Auto-Print on Confirmation

```typescript
// Order confirmation handler
async function handleOrderConfirmation(orderId: string) {
  // Update order
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'NEW' },
  })

  // Trigger print (non-blocking)
  fetch('/api/warehouse/print-slip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, priority: 'normal' }),
  }).catch(err => console.error('Print failed:', err))

  return { success: true }
}
```

### Pattern 2: Batch Printing

```typescript
// Print multiple orders at once
async function printMultipleOrders(orderIds: string[]) {
  const results = await Promise.allSettled(
    orderIds.map(orderId =>
      fetch('/api/warehouse/print-slip', {
        method: 'POST',
        body: JSON.stringify({ orderId, priority: 'high' }),
      })
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  console.log(`Queued ${succeeded}/${orderIds.length} print jobs`)
}
```

### Pattern 3: Pick List + Print Combined

```typescript
// Generate pick list and queue print in parallel
async function prepareOrder(orderId: string) {
  const [pickList, printResult] = await Promise.all([
    fetch(`/api/warehouse/pick-list/${orderId}`).then(r => r.json()),
    fetch('/api/warehouse/print-slip', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }).then(r => r.json()),
  ])

  return {
    pickList: pickList.data.pickList,
    printJobId: printResult.jobId,
  }
}
```

### Pattern 4: Queue Monitoring Dashboard

```typescript
// React component for warehouse panel
function QueueDashboard() {
  const [state, setState] = useState(null)

  useEffect(() => {
    const poll = async () => {
      const res = await fetch('/api/warehouse/queue?limit=50')
      const data = await res.json()
      setState(data.data)
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h2>Print Queue</h2>
      <div>
        Pending: {state?.summary.pendingJobs}
        Printing: {state?.summary.printingJobs}
        Failed: {state?.summary.failedJobs}
      </div>
      <table>
        {state?.jobs.map(job => (
          <tr key={job.id}>
            <td>{job.orderNumber}</td>
            <td>{job.status}</td>
            <td>{job.errorMessage}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}
```

---

## Summary

### What's Integrated ✅

- ✅ Order mapper maps Prisma orders to packing slip format
- ✅ Pick list builder generates zone-optimized sequences
- ✅ Print endpoint queues jobs with validation
- ✅ Queue APIs provide real-time monitoring
- ✅ Background worker processes jobs with retry logic

### What's Next ⏳

1. **Trigger print on order confirmation** (add to your confirmation handler)
2. **Start background worker** (add to server.mjs)
3. **Connect warehouse panel** (add API calls to UI)

### Quick Start

```bash
# 1. Test print endpoint
curl -X POST http://localhost:3000/api/warehouse/print-slip \
  -d '{"orderId":"test"}'

# 2. Check queue
curl http://localhost:3000/api/warehouse/queue

# 3. Get pick list
curl http://localhost:3000/api/warehouse/pick-list/test
```

All systems ready for production integration!
