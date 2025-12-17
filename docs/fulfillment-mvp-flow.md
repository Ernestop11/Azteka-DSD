# Fulfillment MVP Flow

**LAP W1: Warehouse Auto-Print Engine - MVP Integration Complete**

Complete end-to-end flow from order confirmation to warehouse fulfillment.

---

## Table of Contents

1. [Flow Overview](#flow-overview)
2. [Order → Print Pipeline](#order--print-pipeline)
3. [Pick List Generation](#pick-list-generation)
4. [Queue Management](#queue-management)
5. [Worker Processing](#worker-processing)
6. [Retry Logic](#retry-logic)
7. [Complete Integration](#complete-integration)

---

## Flow Overview

The fulfillment MVP connects order management to warehouse operations with automated print job queueing, optimized pick list generation, and real-time queue monitoring.

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER CONFIRMED                              │
│  Customer places order → Sales rep confirms → Status: NEW       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ORDER MAPPER (orderMapper.ts)                  │
│  buildPrintPayload(orderId)                                     │
│  - Fetch order from Prisma                                      │
│  - Map to PackingSlipOrder format                               │
│  - Validate payload shape                                       │
│  - Generate warehouse locations                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              PRINT ENDPOINT (/api/warehouse/print-slip)         │
│  POST { orderId, priority, copies }                             │
│  - Validate request                                             │
│  - Build print payload                                          │
│  - Render PDF                                                   │
│  - Queue print job                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRINT QUEUE (printEngine.ts)                 │
│  queuePrintJob()                                                │
│  - Create job entry (in-memory)                                 │
│  - Set priority (urgent/high/normal/low)                        │
│  - Return jobId                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKGROUND WORKER (processPrintQueue)             │
│  Polls every 2 seconds                                          │
│  - Get next pending job (by priority)                           │
│  - Lock job                                                     │
│  - Fetch order data                                             │
│  - Generate PDF                                                 │
│  - Send to printer                                              │
│  - Mark completed/failed                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─ SUCCESS ─────────────┐
                             │                        │
                             │                        ▼
                             │              ┌─────────────────┐
                             │              │ Job: COMPLETED  │
                             │              └─────────────────┘
                             │
                             └─ FAILURE ─────────────┐
                                                      │
                                                      ▼
                                            ┌─────────────────────┐
                                            │ Job: FAILED         │
                                            │ Retry if enabled    │
                                            │ (exponential back.) │
                                            └─────────────────────┘

PARALLEL FLOW: PICK LIST GENERATION

┌─────────────────────────────────────────────────────────────────┐
│           PICK LIST BUILDER (pickListBuilder.ts)                │
│  buildPickList(orderId)                                         │
│  - Fetch order items                                            │
│  - Assign warehouse locations                                   │
│  - Group by zone (A-F)                                          │
│  - Optimize pick sequence (serpentine path)                     │
│  - Calculate estimated pick time                                │
│  - Return optimized pick list                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         PICK LIST API (/api/warehouse/pick-list/[orderId])      │
│  GET /api/warehouse/pick-list/{orderId}?format=json|text        │
│  Returns:                                                        │
│  - Zone breakdown                                               │
│  - Optimized sequence                                           │
│  - Time estimates                                               │
│  - Formatted for printing (text)                                │
└─────────────────────────────────────────────────────────────────┘

MONITORING: WAREHOUSE PANEL

┌─────────────────────────────────────────────────────────────────┐
│               QUEUE API (/api/warehouse/queue)                  │
│  GET /api/warehouse/queue?status=pending&limit=50               │
│  Returns:                                                        │
│  - jobs[] (with status, errors, retry count)                    │
│  - summary (totals, success rate, avg time)                     │
│  - worker status (running, workerId)                            │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          WAREHOUSE PANEL (/warehouse/print-queue)               │
│  React UI with auto-refresh (5s)                                │
│  - Queue summary cards                                          │
│  - Jobs table                                                   │
│  - Actions (retry, cancel, reprint)                             │
│  - Real-time status updates                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Order → Print Pipeline

### 1. Order Mapper (`orderMapper.ts`)

**Purpose:** Transform Prisma order structure to packing slip format

**Main Function:**

```typescript
buildPrintPayload(orderId: string): Promise<PackingSlipOrder | null>
```

**Process:**

1. **Fetch Order:**
   ```typescript
   const order = await prisma.order.findUnique({
     where: { id: orderId },
     include: {
       customer: true,
       user: true,
       items: {
         include: {
           product: {
             include: { brand: true, category: true },
           },
         },
       },
     },
   })
   ```

2. **Validate Order:**
   - Order exists
   - Has customer
   - Has items
   - Status is printable (NEW, PICKING, PICKED, OUT_FOR_DELIVERY)

3. **Map to Packing Slip Format:**
   ```typescript
   {
     orderId: order.id,
     orderNumber: "ORD-20240120-ABC123",
     orderDate: order.createdAt,
     status: "confirmed",
     store: {
       id: customer.id,
       name: customer.businessName,
       code: "TC", // Auto-generated
       address: { street, city, state, zipCode },
       phone: customer.phone,
       email: customer.email,
     },
     items: [
       {
         productId: item.productId,
         productName: item.product.name,
         brand: item.product.brand?.name,
         sku: item.product.sku,
         quantity: item.quantity,
         unitType: "case",
         unitPrice: Number(item.priceCase),
         totalPrice: Number(item.priceCase) * item.quantity,
         warehouseLocation: "A1-01", // Auto-generated
       },
     ],
     totals: {
       subtotal: Number(order.total),
       total: Number(order.total),
       itemCount: order.items.length,
       totalUnits: sum(items * unitsPerCase),
     },
   }
   ```

4. **Validate Payload Shape:**
   - All required fields present
   - Store information complete
   - Items array not empty
   - Totals calculated correctly

**Usage in Print Endpoint:**

```typescript
// app/api/warehouse/print-slip/route.ts
const payload = await buildPrintPayload(req.orderId)

if (!payload) {
  throw new PrintError('ORDER_NOT_FOUND', `Order ${req.orderId} not found`)
}

const validation = validatePayloadShape(payload)
if (!validation.valid) {
  throw new PrintError('INVALID_PAYLOAD', validation.errors.join(', '))
}

// Generate PDF
const pdfBuffer = await renderPackingSlip(payload, config)
```

---

## Pick List Generation

### 2. Pick List Builder (`pickListBuilder.ts`)

**Purpose:** Generate optimized warehouse pick sequences

**Main Function:**

```typescript
buildPickList(orderId: string): Promise<PickList | null>
```

**Algorithm:**

**Step 1: Zone Assignment**
```typescript
// Map categories to warehouse zones
const CATEGORY_TO_ZONE = {
  'Beverages': 'A',
  'Snacks': 'B',
  'Candy': 'C',
  'Household': 'D',
  'Seasonal': 'E',
  'Bulk': 'F',
}

function getProductZone(product): string {
  return CATEGORY_TO_ZONE[product.category?.name] || 'A'
}
```

**Step 2: Location Generation**
```typescript
// Generate slot: Zone + Aisle + Bin
// Example: A1-01, B2-05, C3-10

function generateSlotLocation(product, index) {
  const zone = getProductZone(product)
  const aisle = String(Math.floor(index / 10) + 1)
  const bin = String((index % 10) + 1).padStart(2, '0')

  return {
    full: `${zone}${aisle}-${bin}`,
    zone,
    aisle,
    bin,
  }
}
```

**Step 3: Zone Grouping**
```typescript
function groupByZone(items: PickListItem[]): PickZone[] {
  // Group items by zone
  const zoneMap = new Map<string, PickListItem[]>()

  items.forEach(item => {
    const existing = zoneMap.get(item.zone) || []
    existing.push(item)
    zoneMap.set(item.zone, existing)
  })

  // Sort items within each zone by slot
  zoneMap.forEach((items, zone) => {
    items.sort((a, b) => {
      if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle)
      return a.bin.localeCompare(b.bin)
    })
  })

  return Array.from(zoneMap.entries()).map(([zone, items]) => ({
    zone,
    zoneName: WAREHOUSE_ZONES[zone].name,
    items,
    totalItems: items.length,
    totalUnits: sum(items.totalUnits),
    estimatedPickTime: WAREHOUSE_ZONES[zone].avgPickTime * items.length,
  }))
}
```

**Step 4: Sequence Optimization (Serpentine Path)**
```typescript
function optimizePickSequence(items: PickListItem[]): PickListItem[] {
  // Group by zone
  const zones = groupByZone(items)

  // Sort zones alphabetically (A → F)
  const sortedZones = zones.sort((a, b) => a.zone.localeCompare(b.zone))

  // Build serpentine path
  const sequence = []
  let reverse = false

  sortedZones.forEach(zone => {
    const sorted = zone.items.sort((a, b) => a.slot.localeCompare(b.slot))

    // Reverse every other zone for serpentine
    if (reverse) sorted.reverse()

    sequence.push(...sorted)
    reverse = !reverse
  })

  return sequence
}
```

**Example: Serpentine Path**
```
Zone A (forward):  A1-01 → A1-02 → A1-03 → A2-01 → A2-02
Zone B (reverse):  B3-05 → B3-04 → B2-03 → B1-02 → B1-01
Zone C (forward):  C1-01 → C1-02 → C2-01 → C2-02
```

**Step 5: Time Estimation**
```typescript
function calculatePickTime(zones: PickZone[]): number {
  const ZONE_TRANSITION_TIME = 60 // seconds

  // Sum all zone pick times
  const zoneTime = zones.reduce((sum, zone) => sum + zone.estimatedPickTime, 0)

  // Add transition time between zones
  const transitionTime = (zones.length - 1) * ZONE_TRANSITION_TIME

  return zoneTime + transitionTime
}
```

**Output:**

```typescript
{
  orderId: "abc123",
  orderNumber: "ORD-20240120-ABC123",
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
        { lineNumber: 1, productName: "Coca-Cola 355ml", sku: "CC-355", quantity: 24, slot: "A1-01", ... },
        { lineNumber: 2, productName: "Sprite 355ml", sku: "SP-355", quantity: 12, slot: "A1-02", ... },
      ],
    },
    {
      zone: "B",
      zoneName: "Snacks / Botanas",
      totalItems: 4,
      totalUnits: 96,
      estimatedPickTime: 100,
      items: [...],
    },
  ],
  pickSequence: [
    // Optimized serpentine sequence
    { lineNumber: 1, productName: "Coca-Cola 355ml", slot: "A1-01", zone: "A" },
    { lineNumber: 2, productName: "Sprite 355ml", slot: "A1-02", zone: "A" },
    { lineNumber: 7, productName: "Doritos", slot: "B3-05", zone: "B" }, // Reversed
    { lineNumber: 6, productName: "Cheetos", slot: "B2-03", zone: "B" }, // Reversed
    ...
  ],
}
```

---

## Queue Management

### 3. Print Queue (`printEngine.ts`)

**Queue Entry Structure:**

```typescript
interface PrintQueueEntry {
  id: string                    // "pj_1234567890_ord123_abc"
  orderId: string
  orderNumber: string
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies: number
  attemptCount: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  scheduledFor?: Date           // For delayed retry
  lockedAt?: Date               // When worker picked up
  lockedBy?: string             // Worker ID
  errorMessage?: string
  metadata?: {
    storeId: string
    storeName: string
    itemCount: number
    totalUnits: number
  }
}
```

**Queue Operations:**

```typescript
// Add to queue
const { jobId } = await queuePrintJob({
  orderId: 'ord_123',
  orderNumber: 'ORD-20240120-ABC123',
  priority: 'high',
  copies: 2,
  metadata: {
    storeId: 'store_456',
    storeName: 'Tienda Central',
    itemCount: 12,
    totalUnits: 288,
  },
})

// Get jobs
const jobs = await getPrintJobs({
  status: ['pending', 'printing'],
  priority: 'high',
  limit: 50,
  sortBy: 'priority',
  sortOrder: 'desc',
})

// Get summary
const summary = await getQueueSummary()
// {
//   totalJobs: 150,
//   pendingJobs: 5,
//   printingJobs: 1,
//   completedJobs: 140,
//   failedJobs: 3,
//   successRate: 97.9,
//   averageCompletionTime: 3200, // ms
// }

// Cancel job
await cancelPrintJob(jobId)
```

---

## Worker Processing

### 4. Background Worker

**Worker Lifecycle:**

```typescript
// Start worker
processPrintQueue('worker-1')

// Worker loop (every 2 seconds):
while (running) {
  // 1. Get next job (by priority)
  const job = await getNextJob() // urgent > high > normal > low

  if (!job) continue

  // 2. Lock job
  const locked = await lockJob(job.id, 'worker-1')
  if (!locked) continue // Another worker got it

  // 3. Fetch order
  const order = await fetchOrderForPrinting(job.orderId)
  if (!order) {
    await updatePrintJob(job.id, {
      status: 'failed',
      errorMessage: 'Order not found',
    })
    continue
  }

  // 4. Generate PDF
  const pdf = await renderPackingSlip(order)

  // 5. Send to printer
  const result = await sendToPrinter(pdf, {
    printerId: job.printerId,
    copies: job.copies,
  })

  // 6. Update job status
  if (result.success) {
    await updatePrintJob(job.id, {
      status: 'completed',
      completedAt: new Date(),
    })
  } else {
    await updatePrintJob(job.id, {
      status: 'failed',
      errorMessage: result.error,
    })

    // 7. Retry if enabled
    if (autoRetry && job.attemptCount < job.maxAttempts) {
      await retryJob(job)
    }
  }

  // 8. Unlock job
  await unlockJob(job.id)

  await sleep(2000) // 2 second poll interval
}
```

---

## Retry Logic

### 5. Exponential Backoff

**Retry Algorithm:**

```typescript
async function retryJob(job: PrintQueueEntry) {
  if (job.attemptCount >= job.maxAttempts) {
    // Max retries exceeded
    await updatePrintJob(job.id, {
      status: 'failed',
      errorMessage: `Max retries (${job.maxAttempts}) exceeded`,
    })
    return
  }

  // Calculate backoff delay
  const BASE_DELAY = 5000 // 5 seconds
  const backoffMultiplier = Math.pow(2, job.attemptCount)
  const delayMs = BASE_DELAY * backoffMultiplier

  // Schedule for future retry
  setTimeout(async () => {
    await updatePrintJob(job.id, {
      status: 'pending',
      attemptCount: job.attemptCount + 1,
      scheduledFor: new Date(Date.now() + delayMs),
    })
  }, delayMs)
}
```

**Retry Schedule Example:**

```
Attempt 1: Immediate (0s)
Attempt 2: 5s delay  (2^0 * 5s = 5s)
Attempt 3: 10s delay (2^1 * 5s = 10s)
Attempt 4: 20s delay (2^2 * 5s = 20s)
```

---

## Complete Integration

### End-to-End Example

**Scenario:** Order confirmed → Auto-print packing slip + pick list

**Step 1: Order Confirmation**

```typescript
// In your order confirmation handler
async function confirmOrder(orderId: string) {
  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'NEW' },
  })

  // Trigger print
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
}
```

**Step 2: Order Mapper Builds Payload**

```typescript
// orderMapper.ts automatically:
// - Fetches order with customer + items + products
// - Generates order number (ORD-20240120-ABC123)
// - Maps customer to store info
// - Assigns warehouse locations (A1-01, B2-03, etc.)
// - Calculates totals
// - Validates payload shape
```

**Step 3: PDF Rendered**

```typescript
// packingSlipRenderer.ts generates:
// - Branded header (Azteka DSD / SurtiRico)
// - Order info + barcode
// - Store destination
// - Items table with warehouse locations
// - Totals (items: 12, units: 288)
// - Signature box
```

**Step 4: Job Queued**

```typescript
// printEngine.ts creates job:
{
  id: "pj_1234567890_ord123_abc",
  orderId: "ord_123",
  orderNumber: "ORD-20240120-ABC123",
  status: "pending",
  priority: "normal",
  copies: 1,
  attemptCount: 0,
  maxAttempts: 3,
  metadata: {
    storeId: "store_456",
    storeName: "Tienda Central",
    itemCount: 12,
    totalUnits: 288,
  },
}
```

**Step 5: Worker Processes**

```typescript
// Background worker (2s poll):
// - Picks up job
// - Locks it
// - Fetches order
// - Generates PDF
// - Sends to printer
// - Marks completed
```

**Step 6: Pick List Generated (Parallel)**

```typescript
// Warehouse can request pick list
const response = await fetch('/api/warehouse/pick-list/ord_123')
const { pickList } = await response.json()

// Returns optimized sequence:
// Zone A: 5 items (150s) → A1-01, A1-02, A1-03, A2-01, A2-02
// Zone B: 4 items (100s) → B3-05, B3-04, B2-03, B1-01 (reversed)
// Zone C: 3 items (60s)  → C1-01, C1-02, C2-01
// Total: 12 items, 288 units, 12 minutes estimated
```

**Step 7: Warehouse Panel Monitors**

```typescript
// React UI polls queue API every 5s
const response = await fetch('/api/warehouse/queue?status=pending&limit=50')
const { jobs, summary, worker } = await response.json()

// Displays:
// - Pending: 5 jobs
// - Printing: 1 job
// - Completed: 140 jobs
// - Success rate: 97.9%
// - Worker status: running
```

---

## API Reference

### Print Slip

```
POST /api/warehouse/print-slip
Body: { orderId, priority?, copies?, printerId?, includePricing? }
Response: { success, jobId, message, printStatus }
```

### Queue State

```
GET /api/warehouse/queue?status=pending&limit=50
Response: { jobs[], summary, worker }
```

### Job Details

```
GET /api/warehouse/queue/{jobId}
Response: { job }

DELETE /api/warehouse/queue/{jobId}
Response: { success, message }
```

### Pick List

```
GET /api/warehouse/pick-list/{orderId}?format=json|text
Response: { pickList, summary }
```

---

## Summary

The fulfillment MVP provides:

✅ **Order → Print:** Normalized transformation from Prisma orders to packing slips
✅ **Pick Lists:** Zone-based optimization with serpentine path
✅ **Queue Management:** Priority-based processing with retry logic
✅ **Worker Processing:** Background polling with job locking
✅ **Warehouse Panel:** Real-time monitoring via REST API

**Integration Points:**
- Order mapper: `buildPrintPayload(orderId)`
- Pick list: `buildPickList(orderId)`
- Queue state: `GET /api/warehouse/queue`
- Print trigger: `POST /api/warehouse/print-slip`

**All flows are additive** - no changes to existing order system required.
