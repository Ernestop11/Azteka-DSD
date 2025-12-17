# Packing Slip Template Guide

**LAP W1: Warehouse Auto-Print Engine**

Complete guide to the packing slip PDF template system.

---

## Table of Contents

1. [Overview](#overview)
2. [Template Structure](#template-structure)
3. [Configuration](#configuration)
4. [Customization](#customization)
5. [Rendering](#rendering)
6. [Examples](#examples)

---

## Overview

The packing slip template system generates beautiful, branded PDF documents for warehouse order fulfillment. The system uses **PDFKit** to render professional-looking packing slips with bilingual labels (Spanish/English).

### Features

- ✅ Branded header with company name and logo space
- ✅ Order information with barcode/QR code support
- ✅ Store destination details
- ✅ Itemized product table with warehouse locations
- ✅ Item counts and totals
- ✅ Signature box for delivery confirmation
- ✅ Footer with warehouse notes and contact info
- ✅ Bilingual labels (Spanish/English)
- ✅ Configurable pricing display
- ✅ Professional typography and layout

---

## Template Structure

A packing slip PDF consists of the following sections:

```
┌─────────────────────────────────────────────────┐
│                   HEADER                        │
│  Company Name: Azteka DSD / SurtiRico          │
│  Tagline: "Distribución al por mayor"          │
│  Document Title: ORDEN DE ENTREGA               │
├─────────────────────────────────────────────────┤
│              ORDER INFO | BARCODE               │
│  Pedido #: ORD-2024-001   [Barcode Image]     │
│  Fecha: 2024-01-20                             │
│  Confirmado: 2024-01-20                        │
│  Estado: Confirmado                            │
│  Vendedor: Carlos Mendez                       │
├─────────────────────────────────────────────────┤
│              STORE DESTINATION                  │
│  Tienda Central (TC-001)                       │
│  Calle Principal 123, Ciudad                   │
│  555-1234 | tienda@example.com                │
├─────────────────────────────────────────────────┤
│                ITEMS TABLE                      │
│  # │ Producto │ SKU │ Cantidad │ Ubicación    │
│  1 │ Coca-Cola │ CC1 │ 24 cajas │ A1-01       │
│  2 │ Sprite    │ SP1 │ 12 cajas │ A1-02       │
│  ...                                           │
├─────────────────────────────────────────────────┤
│                  TOTALS                         │
│  Total de artículos: 5                         │
│  Total de unidades: 48                         │
│  (Optional: Subtotal, IVA, Total)              │
├─────────────────────────────────────────────────┤
│              SIGNATURE BOX                      │
│  Firma: _____________  Fecha: _____________   │
│  Nombre: ____________                          │
├─────────────────────────────────────────────────┤
│                   FOOTER                        │
│  Notas: Verificar cantidad y condición         │
│  Almacén Central - 555-WAREHOUSE               │
└─────────────────────────────────────────────────┘
```

---

## Configuration

### Default Configuration

```typescript
import { DEFAULT_PACKING_SLIP_CONFIG } from '@/warehouse/print/packingSlipTypes'

console.log(DEFAULT_PACKING_SLIP_CONFIG)
// {
//   companyName: 'Azteka DSD / SurtiRico',
//   companyTagline: 'Distribución al por mayor',
//   warehouseAddress: 'Calle Almacén 456, Ciudad Industrial',
//   warehousePhone: '555-WAREHOUSE',
//   warehouseEmail: 'almacen@azteka.com',
//   includeBarcode: true,
//   includeQRCode: true,
//   includePricing: false,  // Hide prices by default
//   primaryColor: '#dc2626',  // Red
//   secondaryColor: '#1e40af',  // Blue
//   pageSize: 'letter',
//   margins: { top: 50, bottom: 50, left: 50, right: 50 },
//   headerFontSize: 18,
//   bodyFontSize: 10,
// }
```

### Custom Configuration

```typescript
import { renderPackingSlip } from '@/warehouse/print/packingSlipRenderer'

const pdfBuffer = await renderPackingSlip(order, {
  // Override defaults
  companyName: 'SurtiRico Premium',
  includePricing: true,  // Show prices
  primaryColor: '#059669',  // Green
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  headerFontSize: 20,
})
```

---

## Customization

### Brand Colors

```typescript
const config = {
  primaryColor: '#dc2626',    // Red - headers, lines
  secondaryColor: '#1e40af',  // Blue - table headers
}
```

### Page Layout

```typescript
const config = {
  pageSize: 'letter',  // or 'legal', 'a4'
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
}
```

### Typography

```typescript
const config = {
  headerFontSize: 18,  // Header text size
  bodyFontSize: 10,    // Body text size
}
```

### Content Options

```typescript
const config = {
  includeBarcode: true,   // Show barcode
  includeQRCode: true,    // Show QR code
  includePricing: false,  // Show/hide prices
  includeSignature: true, // Show signature box
}
```

### Labels

All labels are bilingual (Spanish/English):

```typescript
const LABELS = {
  documentTitle: 'ORDEN DE ENTREGA / PACKING SLIP',
  orderNumber: 'Pedido # / Order #',
  orderDate: 'Fecha / Date',
  confirmationDate: 'Confirmado / Confirmed',
  status: 'Estado / Status',
  salesRep: 'Vendedor / Sales Rep',
  destination: 'DESTINO / DESTINATION',
  items: 'ARTÍCULOS / ITEMS',
  signature: 'Firma / Signature',
  name: 'Nombre / Name',
  date: 'Fecha / Date',
}
```

To customize, edit `src/warehouse/print/packingSlipTemplate.ts`.

---

## Rendering

### Basic Usage

```typescript
import { renderPackingSlip } from '@/warehouse/print/packingSlipRenderer'
import type { PackingSlipOrder } from '@/warehouse/print/packingSlipTypes'

const order: PackingSlipOrder = {
  orderId: 'ord_123',
  orderNumber: 'ORD-2024-001',
  orderDate: new Date('2024-01-20'),
  confirmationDate: new Date('2024-01-20'),
  status: 'confirmed',
  salesRep: 'Carlos Mendez',
  store: {
    id: 'store_456',
    name: 'Tienda Central',
    code: 'TC-001',
    address: {
      street: 'Calle Principal 123',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
    },
    phone: '555-1234',
    email: 'tienda@example.com',
  },
  items: [
    {
      productId: 'prod_1',
      productName: 'Coca-Cola 355ml',
      brand: 'Coca-Cola',
      sku: 'CC-355',
      quantity: 24,
      unitType: 'case',
      unitsPerCase: 24,
      unitPrice: 18.50,
      totalPrice: 444.00,
      warehouseLocation: 'A1-01',
    },
    // ... more items
  ],
  totals: {
    subtotal: 1500.00,
    tax: 240.00,
    discount: 0,
    total: 1740.00,
    itemCount: 5,
    totalUnits: 48,
  },
}

// Render PDF
const pdfBuffer = await renderPackingSlip(order)

// Save to file
import fs from 'fs'
fs.writeFileSync('packing-slip.pdf', pdfBuffer)
```

### With Custom Config

```typescript
const pdfBuffer = await renderPackingSlip(order, {
  companyName: 'SurtiRico Premium',
  companyTagline: 'Calidad y servicio',
  includePricing: true,
  primaryColor: '#059669',
  includeQRCode: false,
})
```

### Validation

The renderer validates the template before rendering:

```typescript
import { validateTemplate, generatePackingSlipTemplate } from '@/warehouse/print/packingSlipTemplate'

const template = generatePackingSlipTemplate(order, config)
const validation = validateTemplate(template)

if (!validation.valid) {
  console.error('Template validation failed:', validation.errors)
  // [
  //   'Missing required field: orderInfo.orderNumber',
  //   'Items table has no rows',
  // ]
}
```

---

## Examples

### Example 1: Standard Packing Slip (No Pricing)

```typescript
const pdfBuffer = await renderPackingSlip(order, {
  includePricing: false,  // Default - no prices
  includeBarcode: true,
  includeQRCode: true,
})
```

**Output:**
- Order information
- Store destination
- Items table (no prices)
- Item counts only (no monetary totals)
- Signature box

### Example 2: Invoice-Style (With Pricing)

```typescript
const pdfBuffer = await renderPackingSlip(order, {
  includePricing: true,  // Show prices
  companyName: 'Azteka DSD',
  primaryColor: '#dc2626',
})
```

**Output:**
- Order information
- Store destination
- Items table with unit prices and totals
- Subtotal, tax, discount, grand total
- Signature box

### Example 3: Simple Picking List

```typescript
const pdfBuffer = await renderPackingSlip(order, {
  includePricing: false,
  includeBarcode: false,
  includeQRCode: false,
  includeSignature: false,  // No signature needed
})
```

**Output:**
- Order information
- Items table with warehouse locations
- Item counts
- No signature box (for internal use)

### Example 4: Custom Branding

```typescript
const pdfBuffer = await renderPackingSlip(order, {
  companyName: 'Mi Tienda Mayorista',
  companyTagline: 'Tu mejor opción en distribución',
  warehouseAddress: 'Bodega Principal, Zona Industrial',
  warehousePhone: '555-BODEGA',
  warehouseEmail: 'bodega@mitienda.com',
  primaryColor: '#0891b2',  // Cyan
  secondaryColor: '#7c3aed',  // Purple
  headerFontSize: 20,
  bodyFontSize: 11,
})
```

---

## Template Data Structure

### Full Type Definition

```typescript
interface PackingSlipOrder {
  // Order identification
  orderId: string
  orderNumber: string
  orderDate: Date
  confirmationDate?: Date
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered'
  salesRep?: string

  // Store information
  store: {
    id: string
    name: string
    code?: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    phone?: string
    email?: string
  }

  // Line items
  items: Array<{
    productId: string
    productName: string
    brand?: string
    sku?: string
    quantity: number
    unitType: 'unit' | 'case' | 'box' | 'pack'
    unitsPerCase?: number
    unitPrice?: number
    totalPrice?: number
    warehouseLocation?: string
  }>

  // Totals
  totals: {
    subtotal: number
    tax?: number
    discount?: number
    total: number
    itemCount: number
    totalUnits: number
  }
}
```

### Items Table Columns

When `includePricing: false` (default):

| Column | Description |
|--------|-------------|
| # | Line number |
| Producto | Product name + brand |
| SKU | Product SKU |
| Cantidad | Quantity + unit type |
| Ubicación | Warehouse location |

When `includePricing: true`:

| Column | Description |
|--------|-------------|
| # | Line number |
| Producto | Product name + brand |
| SKU | Product SKU |
| Cantidad | Quantity + unit type |
| Precio Unit. | Unit price |
| Total | Line total |

---

## Advanced Features

### Barcode Generation

Currently shows barcode data as text. To add actual barcode images:

```bash
npm install bwip-js
```

Update `renderCodesSection()` in `packingSlipRenderer.ts`:

```typescript
import bwipjs from 'bwip-js'

// Generate barcode image
const barcodeBuffer = await bwipjs.toBuffer({
  bcid: 'code128',
  text: barcode.data,
  scale: 3,
  height: 10,
})

// Add to PDF
doc.image(barcodeBuffer, startX, startY, { width: 150 })
```

### QR Code Generation

Install QR code library:

```bash
npm install qrcode
```

Update `renderCodesSection()`:

```typescript
import QRCode from 'qrcode'

// Generate QR code
const qrCodeUrl = await QRCode.toDataURL(qrCode.data)

// Add to PDF (PDFKit supports data URLs)
doc.image(qrCodeUrl, startX, startY, { width: 80 })
```

### Multi-page Support

If order has many items, PDFKit will automatically create multiple pages. To add page numbers:

```typescript
// In createPDF function
doc.on('pageAdded', () => {
  const pageNumber = doc.bufferedPageRange().count
  doc.fontSize(8).text(
    `Página ${pageNumber}`,
    50,
    doc.page.height - 30,
    { align: 'right' }
  )
})
```

---

## Best Practices

### 1. Always Validate

```typescript
const template = generatePackingSlipTemplate(order, config)
const validation = validateTemplate(template)

if (!validation.valid) {
  throw new Error(`Invalid template: ${validation.errors.join(', ')}`)
}

const pdfBuffer = await createPDF(template, config)
```

### 2. Handle Missing Data Gracefully

The template uses optional chaining and defaults:

```typescript
store.code || 'N/A'
salesRep || 'Sin asignar'
item.warehouseLocation || '—'
```

### 3. Use Appropriate Unit Types

```typescript
items: [
  { quantity: 24, unitType: 'case', unitsPerCase: 24 },  // "24 cajas (24 u/caja)"
  { quantity: 12, unitType: 'unit' },                    // "12 unidades"
  { quantity: 6, unitType: 'box' },                      // "6 cajas"
]
```

### 4. Test with Different Data

```typescript
// Test with minimal data
const minimalOrder = { /* required fields only */ }

// Test with maximal data
const maximalOrder = { /* all optional fields */ }

// Test with many items
const largeOrder = { items: Array(100).fill(sampleItem) }
```

---

## Summary

The packing slip template system provides:

✅ Beautiful, professional PDF generation
✅ Bilingual labels (Spanish/English)
✅ Flexible configuration
✅ Warehouse-optimized layout
✅ Validation and error handling
✅ Extensible design for barcodes/QR codes

For integration details, see:
- [Warehouse Print Engine Guide](./warehouse-print-engine.md)
- [Print Integration Flow](./print-integration-flow.md)
