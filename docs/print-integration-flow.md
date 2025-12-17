# Print Integration Flow

**LAP W1: Warehouse Auto-Print Engine**

Step-by-step integration guide for connecting the warehouse print system to your application.

---

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Phase 1: Database Setup](#phase-1-database-setup)
3. [Phase 2: Order Fetching](#phase-2-order-fetching)
4. [Phase 3: Printer Setup](#phase-3-printer-setup)
5. [Phase 4: Auto-Print Hooks](#phase-4-auto-print-hooks)
6. [Phase 5: Worker Deployment](#phase-5-worker-deployment)
7. [Testing](#testing)
8. [Monitoring](#monitoring)

---

## Integration Overview

The warehouse print system is designed to be **fully additive** with clean integration points. No existing code needs to be modified - only new connections need to be made.

### Integration Points

```
┌─────────────────────────────────────────────────────────┐
│              YOUR EXISTING APPLICATION                  │
│                                                         │
│  ┌──────────────┐     ┌──────────────┐                │
│  │ Order System │────→│ Confirmation │                │
│  └──────────────┘     └──────┬───────┘                │
│                               │                         │
└───────────────────────────────┼─────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  INTEGRATION POINT 1  │
                    │  autoPrintOnConfirm() │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  INTEGRATION POINT 2  │
                    │  fetchOrder()         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Print Queue Engine  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  INTEGRATION POINT 3  │
                    │  sendToPrinter()      │
                    └───────────────────────┘
```

### Integration Checklist

- [ ] Phase 1: Database setup (Prisma schema + migrations)
- [ ] Phase 2: Order fetching (wire to Prisma)
- [ ] Phase 3: Printer setup (IPP configuration)
- [ ] Phase 4: Auto-print hooks (order confirmation)
- [ ] Phase 5: Worker deployment (background process)
- [ ] Testing (end-to-end flow)
- [ ] Monitoring (queue health checks)

---

## Phase 1: Database Setup

### Step 1.1: Add Print Queue Table

Add to your Prisma schema:

```prisma
// prisma/schema.prisma

model PrintQueue {
  id            String    @id @default(cuid())
  orderId       String
  orderNumber   String
  status        String    // pending | printing | completed | failed | cancelled
  priority      String    // low | normal | high | urgent
  printerId     String?
  copies        Int       @default(1)
  attemptCount  Int       @default(0)
  maxAttempts   Int       @default(3)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  completedAt   DateTime?
  scheduledFor  DateTime?
  lockedAt      DateTime?
  lockedBy      String?
  errorMessage  String?
  errorStack    String?   @db.Text
  metadata      Json?

  @@index([status, priority])
  @@index([orderId])
  @@index([createdAt])
  @@map("print_queue")
}

model PrinterConfig {
  id           String   @id @default(cuid())
  name         String
  type         String   // ipp | cups | windows | network
  url          String?
  host         String?
  port         Int?
  queue        String?
  isDefault    Boolean  @default(false)
  enabled      Boolean  @default(true)
  location     String?
  capabilities Json?
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("printer_config")
}
```

### Step 1.2: Run Migration

```bash
npx prisma migrate dev --name add_print_queue
```

### Step 1.3: Update Print Engine to Use Prisma

Replace in-memory queue in `src/warehouse/print/printEngine.ts`:

```typescript
import { prisma } from '@/lib/prisma'

// Replace: const printQueue: Map<string, PrintQueueEntry> = new Map()
// With Prisma queries:

export async function queuePrintJob(params: {
  orderId: string
  orderNumber: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  printerId?: string
  copies?: number
  maxAttempts?: number
  metadata?: Partial<PrintJobMetadata>
}): Promise<{ jobId: string }> {
  // Check for duplicate
  const existing = await prisma.printQueue.findFirst({
    where: {
      orderId: params.orderId,
      status: 'pending',
    },
  })

  if (existing) {
    throw new PrintError(
      PrintErrorCode.DUPLICATE_JOB,
      `Print job already queued for order ${params.orderId}`,
      { existingJobId: existing.id }
    )
  }

  // Create queue entry
  const entry = await prisma.printQueue.create({
    data: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      status: 'pending',
      priority: params.priority || 'normal',
      printerId: params.printerId,
      copies: params.copies || 1,
      attemptCount: 0,
      maxAttempts: params.maxAttempts || DEFAULT_MAX_RETRIES,
      metadata: params.metadata as any,
    },
  })

  return { jobId: entry.id }
}

export async function getPrintJob(jobId: string): Promise<PrintQueueEntry | null> {
  return await prisma.printQueue.findUnique({
    where: { id: jobId },
  }) as PrintQueueEntry | null
}

export async function getPrintJobs(filters: PrintQueueFilters = {}): Promise<PrintQueueEntry[]> {
  const where: any = {}

  if (filters.status) {
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status
  }

  if (filters.priority) {
    where.priority = Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority
  }

  if (filters.orderId) {
    where.orderId = filters.orderId
  }

  // ... more filters

  const jobs = await prisma.printQueue.findMany({
    where,
    orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
    skip: filters.offset,
    take: filters.limit,
  })

  return jobs as PrintQueueEntry[]
}

// ... similar updates for other queue functions
```

---

## Phase 2: Order Fetching

### Step 2.1: Create Order Mapping Function

Create `src/warehouse/print/orderMapper.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import type { PackingSlipOrder } from './packingSlipTypes'

export async function fetchOrderForPrint(orderId: string): Promise<PackingSlipOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: true,
      items: {
        include: {
          product: true,
        },
      },
      salesRep: true,
    },
  })

  if (!order) return null

  // Map Prisma order to PackingSlipOrder
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    confirmationDate: order.confirmedAt || undefined,
    status: mapOrderStatus(order.status),
    salesRep: order.salesRep?.name,
    store: {
      id: order.store.id,
      name: order.store.name,
      code: order.store.code || undefined,
      address: {
        street: order.store.street,
        city: order.store.city,
        state: order.store.state,
        zipCode: order.store.zipCode,
      },
      phone: order.store.phone || undefined,
      email: order.store.email || undefined,
    },
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      brand: item.product.brand || undefined,
      sku: item.product.sku || undefined,
      quantity: item.quantity,
      unitType: item.unitType as any,
      unitsPerCase: item.product.unitsPerCase || undefined,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      warehouseLocation: item.product.warehouseLocation || undefined,
    })),
    totals: {
      subtotal: order.subtotal,
      tax: order.tax || undefined,
      discount: order.discount || 0,
      total: order.total,
      itemCount: order.items.length,
      totalUnits: order.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  }
}

function mapOrderStatus(status: string): PackingSlipOrder['status'] {
  switch (status) {
    case 'PENDING': return 'pending'
    case 'CONFIRMED': return 'confirmed'
    case 'PACKED': return 'packed'
    case 'SHIPPED': return 'shipped'
    case 'DELIVERED': return 'delivered'
    default: return 'pending'
  }
}
```

### Step 2.2: Wire to API Endpoint

Update `app/api/warehouse/print-slip/route.ts`:

```typescript
import { fetchOrderForPrint } from '@/warehouse/print/orderMapper'

// Replace stub:
async function fetchOrder(orderId: string): Promise<PackingSlipOrder | null> {
  return await fetchOrderForPrint(orderId)
}
```

### Step 2.3: Wire to Print Engine

Update `src/warehouse/print/printEngine.ts`:

```typescript
import { fetchOrderForPrint } from './orderMapper'

// Replace stub:
async function fetchOrderForPrinting(orderId: string): Promise<PackingSlipOrder | null> {
  return await fetchOrderForPrint(orderId)
}
```

---

## Phase 3: Printer Setup

### Step 3.1: Install IPP Library

```bash
npm install ipp
```

### Step 3.2: Configure Printer

Add printer to database:

```typescript
// scripts/setup-printer.ts
import { prisma } from '@/lib/prisma'

await prisma.printerConfig.create({
  data: {
    name: 'Warehouse Main Printer',
    type: 'ipp',
    url: 'ipp://192.168.1.100:631/printers/warehouse',
    isDefault: true,
    enabled: true,
    location: 'Warehouse Station 1',
    capabilities: {
      color: false,
      duplex: false,
      paperSizes: ['letter', 'legal'],
      maxCopies: 10,
    },
  },
})
```

Run setup:

```bash
npx tsx scripts/setup-printer.ts
```

### Step 3.3: Create IPP Client

Create `src/warehouse/print/ippClient.ts`:

```typescript
import ipp from 'ipp'
import { prisma } from '@/lib/prisma'
import type { IppPrintOptions, IppPrintResult } from './printTypes'

export async function printViaPP(
  pdfBuffer: Buffer,
  options: IppPrintOptions
): Promise<IppPrintResult> {
  return new Promise((resolve) => {
    const printer = ipp.Printer(options.printerUrl)

    const msg = {
      operation: 'Print-Job',
      'operation-attributes-tag': {
        'requesting-user-name': 'warehouse-system',
        'job-name': options.jobName,
        'document-format': 'application/pdf',
        'copies': options.copies || 1,
        'sides': options.sides || 'one-sided',
        'orientation-requested': options.orientation === 'landscape' ? 4 : 3,
        'media': options.mediaSize || 'na_letter_8.5x11in',
        'print-quality': options.quality === 'high' ? 5 : 4,
      },
      data: pdfBuffer,
    }

    printer.execute(msg, (err, res) => {
      if (err) {
        resolve({
          success: false,
          errorMessage: err.message,
          errorCode: err.code,
        })
        return
      }

      resolve({
        success: true,
        jobId: res['job-attributes-tag']['job-id'],
        jobUri: res['job-attributes-tag']['job-uri'],
        jobState: mapJobState(res['job-attributes-tag']['job-state']),
      })
    })
  })
}

function mapJobState(state: number): IppPrintResult['jobState'] {
  switch (state) {
    case 3: return 'pending'
    case 4:
    case 5: return 'processing'
    case 9: return 'completed'
    case 7: return 'cancelled'
    case 8: return 'aborted'
    default: return 'pending'
  }
}

export async function getPrinterConfig(printerId: string) {
  return await prisma.printerConfig.findUnique({
    where: { id: printerId },
  })
}

export async function getDefaultPrinter() {
  return await prisma.printerConfig.findFirst({
    where: { isDefault: true, enabled: true },
  })
}
```

### Step 3.4: Wire to Print Engine

Update `src/warehouse/print/printEngine.ts`:

```typescript
import { printViaIPP, getPrinterConfig, getDefaultPrinter } from './ippClient'

// Replace stub:
async function sendToPrinter(
  pdfBuffer: Buffer,
  options: { printerId?: string; copies: number; jobName: string }
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const printer = options.printerId
      ? await getPrinterConfig(options.printerId)
      : await getDefaultPrinter()

    if (!printer || !printer.url) {
      return { success: false, error: 'Printer not configured' }
    }

    const result = await printViaIPP(pdfBuffer, {
      printerUrl: printer.url,
      jobName: options.jobName,
      copies: options.copies,
      mediaSize: 'letter',
      quality: 'normal',
    })

    return {
      success: result.success,
      jobId: result.jobId?.toString(),
      error: result.errorMessage,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Print failed',
    }
  }
}
```

---

## Phase 4: Auto-Print Hooks

### Step 4.1: Find Order Confirmation Point

Locate where orders are confirmed in your codebase:

```typescript
// Example: app/api/orders/[orderId]/confirm/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  // ... existing confirmation logic ...

  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  })

  // ADD AUTO-PRINT HOOK HERE
  // (See Step 4.2)

  return NextResponse.json({ success: true, order })
}
```

### Step 4.2: Add Auto-Print Hook

```typescript
import { autoPrintOnConfirm } from '@/warehouse/print/printEngine'
import { fetchOrderForPrint } from '@/warehouse/print/orderMapper'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  // ... existing confirmation logic ...

  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  })

  // 🚀 AUTO-PRINT HOOK
  try {
    const printOrder = await fetchOrderForPrint(order.id)
    if (printOrder) {
      const result = await autoPrintOnConfirm(printOrder)
      if (result.jobId) {
        console.log(`Auto-queued print job: ${result.jobId}`)
      }
    }
  } catch (error) {
    // Don't fail order confirmation if print fails
    console.error('Auto-print failed:', error)
  }

  return NextResponse.json({ success: true, order })
}
```

### Step 4.3: Configure Auto-Print Settings

```typescript
// scripts/configure-auto-print.ts
import { updateAutoPrintSettings } from '@/warehouse/print/printEngine'

updateAutoPrintSettings({
  enabled: true,
  triggers: {
    onOrderConfirmed: true,
    onOrderPacked: false,
    onOrderShipped: false,
  },
  defaultPriority: 'normal',
  defaultCopies: 1,
  autoRetry: true,
  maxRetries: 3,
  retryDelayMs: 5000,
  includePricing: false,
  filters: {
    minOrderValue: 50,  // Only auto-print orders >= $50
    storeIds: undefined,  // All stores
    excludeStoreIds: [],
  },
})

console.log('✅ Auto-print settings configured')
```

---

## Phase 5: Worker Deployment

### Step 5.1: Add Worker to Server Startup

Update `server.mjs`:

```javascript
import { processPrintQueue } from './src/warehouse/print/printEngine.js'

// ... existing server setup ...

// Start print queue worker
if (process.env.ENABLE_PRINT_WORKER !== 'false') {
  processPrintQueue('server-worker')
  console.log('✅ Print queue worker started')
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down print queue worker...')
  stopPrintQueue()
  process.exit(0)
})
```

### Step 5.2: Environment Variables

Add to `.env`:

```bash
# Print System
ENABLE_PRINT_WORKER=true
WAREHOUSE_PRINTER_URL=ipp://192.168.1.100:631/printers/warehouse
AUTO_PRINT_ENABLED=true
AUTO_PRINT_MAX_RETRIES=3
```

### Step 5.3: Deploy

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## Testing

### Test 1: Manual Print Request

```bash
curl -X POST http://localhost:3000/api/warehouse/print-slip \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ord_test_123",
    "priority": "high",
    "copies": 1
  }'
```

Expected response:

```json
{
  "success": true,
  "jobId": "pj_1234567890_ord_test_123_abc123",
  "message": "Packing slip queued for order ORD-2024-001",
  "printStatus": "queued"
}
```

### Test 2: Verify Queue

```typescript
import { getPrintJobs } from '@/warehouse/print/printEngine'

const jobs = await getPrintJobs({ status: 'pending' })
console.log(jobs)
```

### Test 3: Worker Processing

Watch logs:

```bash
tail -f logs/print-worker.log
```

Expected:

```
[PrintEngine] Starting worker server-worker
[PrintEngine] Queued job pj_123... for order ORD-2024-001
[PrintEngine] Processing job pj_123... for order ORD-2024-001
[PrintEngine] Successfully printed job pj_123...
```

### Test 4: Auto-Print on Confirmation

```typescript
// Confirm an order (via your existing flow)
const response = await fetch('/api/orders/ord_456/confirm', {
  method: 'POST',
})

// Check print queue
const jobs = await getPrintJobs({ orderId: 'ord_456' })
expect(jobs.length).toBe(1)
expect(jobs[0].status).toBe('pending')
```

### Test 5: End-to-End

```typescript
// 1. Create order
const order = await createTestOrder()

// 2. Confirm order
await confirmOrder(order.id)

// 3. Wait for print job
await sleep(1000)

// 4. Verify job was created
const jobs = await getPrintJobs({ orderId: order.id })
expect(jobs.length).toBe(1)

// 5. Wait for processing
await sleep(5000)

// 6. Verify job completed
const job = await getPrintJob(jobs[0].id)
expect(job.status).toBe('completed')
```

---

## Monitoring

### Health Check Endpoint

Add to your health check:

```typescript
// app/api/health/route.ts
import { getWorkerStatus, getQueueSummary } from '@/warehouse/print/printEngine'

export async function GET() {
  const worker = getWorkerStatus()
  const queue = await getQueueSummary()

  return Response.json({
    status: 'ok',
    printSystem: {
      worker: {
        running: worker.running,
        workerId: worker.workerId,
      },
      queue: {
        total: queue.totalJobs,
        pending: queue.pendingJobs,
        failed: queue.failedJobs,
        successRate: queue.successRate,
      },
    },
  })
}
```

### Alerts

Set up alerts for:

```typescript
// Monitor failed jobs
const summary = await getQueueSummary()
if (summary.failedJobs > 10) {
  await sendAlert('High print failure rate', summary)
}

// Monitor queue backup
if (summary.pendingJobs > 50) {
  await sendAlert('Print queue backing up', summary)
}

// Monitor worker status
const worker = getWorkerStatus()
if (!worker.running) {
  await sendAlert('Print worker not running', worker)
}
```

### Logs

Add structured logging:

```typescript
import { logger } from '@/lib/logger'

logger.info('Print job queued', {
  jobId,
  orderId,
  priority,
})

logger.error('Print job failed', {
  jobId,
  error: error.message,
  attemptCount,
})

logger.warn('Print queue backing up', {
  pendingJobs: summary.pendingJobs,
})
```

---

## Summary

Integration complete! The warehouse print system should now:

✅ Automatically queue print jobs on order confirmation
✅ Process jobs in background with priority and retry
✅ Print to configured warehouse printer
✅ Provide admin UI for queue management
✅ Monitor system health

**Integration Timeline:**

- Phase 1 (Database): 1-2 hours
- Phase 2 (Order fetching): 1 hour
- Phase 3 (Printer setup): 2-3 hours
- Phase 4 (Auto-print hooks): 30 minutes
- Phase 5 (Deployment): 1 hour
- Testing: 2-3 hours

**Total: 8-12 hours**

For troubleshooting and support, see:
- [Warehouse Print Engine Guide](./warehouse-print-engine.md)
- [Packing Slip Template Guide](./packing-slip-template.md)
