# Azteka DSD - Product Fields Specification

## Complete Product Model

This document provides the authoritative specification for all product fields in the Azteka DSD system.

---

## Field Categories

1. **Core Identity** - Essential product information
2. **Pricing & Commerce** - Financial and ordering data
3. **Categorization** - Organization and filtering
4. **Inventory** - Stock management
5. **Visual Design** - Card appearance and theming
6. **Media** - Images and graphics
7. **Metadata** - System and tracking fields
8. **Advanced** - Special configurations

---

## 1. Core Identity Fields

### `id`
- **Type**: `String` (UUID)
- **Required**: Yes (auto-generated)
- **Unique**: Yes
- **Database**: `@id @default(uuid())`
- **Description**: Unique identifier for the product
- **Example**: `"550e8400-e29b-41d4-a716-446655440000"`
- **Validation**: Auto-generated, immutable
- **API**: Read-only

---

### `name`
- **Type**: `String`
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 200 characters
- **Database**: `String`
- **Description**: Display name of the product
- **Example**: `"Salsa Verde Herdez 16oz"`
- **Validation**:
  ```typescript
  if (!name || name.trim().length < 3) {
    throw new Error('Name must be at least 3 characters');
  }
  if (name.length > 200) {
    throw new Error('Name too long (max 200 characters)');
  }
  ```
- **API**: Required in POST, optional in PUT/PATCH

---

### `slug`
- **Type**: `String`
- **Required**: Yes
- **Unique**: Yes
- **Pattern**: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- **Database**: `String @unique`
- **Description**: URL-friendly product identifier
- **Example**: `"salsa-verde-herdez-16oz"`
- **Validation**:
  ```typescript
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    throw new Error('Slug must be lowercase letters, numbers, and hyphens only');
  }
  ```
- **Auto-Generation**:
  ```typescript
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  ```

---

### `sku`
- **Type**: `String`
- **Required**: Yes
- **Unique**: Yes
- **Pattern**: `^[A-Z0-9-]+$`
- **Database**: `String @unique`
- **Description**: Stock Keeping Unit - internal product code
- **Example**: `"SAL-HER-16"`
- **Validation**:
  ```typescript
  const skuRegex = /^[A-Z0-9-]+$/;
  if (!skuRegex.test(sku)) {
    throw new Error('SKU must contain only uppercase letters, numbers, and hyphens');
  }
  if (sku.length < 2 || sku.length > 50) {
    throw new Error('SKU must be 2-50 characters');
  }
  ```

---

### `description`
- **Type**: `String` (nullable)
- **Required**: No
- **Max Length**: 1000 characters
- **Database**: `String?`
- **Description**: Detailed product description
- **Example**: `"Authentic Mexican salsa verde made with tomatillos and jalapeños"`
- **Validation**: Optional, max 1000 chars
- **API**: Optional in all operations

---

## 2. Pricing & Commerce Fields

### `priceCase`
- **Type**: `Float` (Decimal)
- **Required**: Yes
- **Min Value**: 0.01
- **Precision**: 2 decimal places
- **Database**: `Float`
- **Description**: Price per case in USD
- **Example**: `25.50`
- **Validation**:
  ```typescript
  if (priceCase <= 0) {
    throw new Error('Price must be greater than 0');
  }
  if (!Number.isFinite(priceCase)) {
    throw new Error('Price must be a valid number');
  }
  // Round to 2 decimals
  priceCase = Math.round(priceCase * 100) / 100;
  ```
- **Display**: `$${priceCase.toFixed(2)}`

---

### `vendorPrice`
- **Type**: `Float` (nullable)
- **Required**: No
- **Database**: `Float?` (future schema addition)
- **Description**: Vendor/wholesale cost per case
- **Example**: `18.75`
- **Validation**: Same as priceCase
- **Use Case**: Margin calculation, internal reporting
- **Privacy**: Not exposed to customers

---

### `costCase`
- **Type**: `Float` (nullable)
- **Required**: No
- **Database**: `Float?` (future schema addition)
- **Description**: Internal cost including shipping
- **Example**: `20.00`
- **Use Case**: Profit margin analysis

---

### `unitsPerCase`
- **Type**: `Integer`
- **Required**: Yes
- **Min Value**: 1
- **Database**: `Int`
- **Description**: Number of individual units in one case
- **Example**: `12` (12 bottles per case)
- **Validation**:
  ```typescript
  if (unitsPerCase < 1) {
    throw new Error('Units per case must be at least 1');
  }
  if (!Number.isInteger(unitsPerCase)) {
    throw new Error('Units per case must be a whole number');
  }
  ```

---

### `unitType`
- **Type**: `String` (enum)
- **Required**: No
- **Default**: `"case"`
- **Options**: `case`, `pack`, `box`, `pallet`, `each`
- **Database**: `String?` (future)
- **Description**: Type of unit being sold
- **Example**: `"case"`
- **Validation**:
  ```typescript
  const validTypes = ['case', 'pack', 'box', 'pallet', 'each'];
  if (unitType && !validTypes.includes(unitType)) {
    throw new Error('Invalid unit type');
  }
  ```

---

### `minOrderQty`
- **Type**: `Integer`
- **Required**: No
- **Default**: `1`
- **Min Value**: 1
- **Database**: `Int?` (future)
- **Description**: Minimum order quantity in cases
- **Example**: `5`
- **Use Case**: Enforce minimum purchase quantities

---

## 3. Categorization Fields

### `categoryId`
- **Type**: `String` (UUID)
- **Required**: Yes
- **Database**: `String` (foreign key)
- **Description**: Reference to product category
- **Example**: `"cat-001-snacks"`
- **Validation**:
  ```typescript
  // Must reference existing category
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new Error('Category not found');
  }
  ```
- **Relation**: `@relation(fields: [categoryId], references: [id])`

---

### `brandId`
- **Type**: `String` (UUID)
- **Required**: Yes
- **Database**: `String` (foreign key)
- **Description**: Reference to product brand
- **Example**: `"brand-herdez"`
- **Validation**: Same as categoryId
- **Relation**: `@relation(fields: [brandId], references: [id])`

---

### `subcategoryId`
- **Type**: `String` (UUID, nullable)
- **Required**: No
- **Database**: `String?` (foreign key, future)
- **Description**: Optional subcategory for finer filtering
- **Example**: `"subcat-hot-salsas"`
- **Use Case**: Multi-level category trees

---

### `tags`
- **Type**: `String[]` (array)
- **Required**: No
- **Database**: `String[]` (future)
- **Description**: Searchable tags for the product
- **Example**: `["organic", "gluten-free", "spicy", "vegan"]`
- **Max Tags**: 10
- **Max Length per Tag**: 30 characters
- **Validation**:
  ```typescript
  if (tags && tags.length > 10) {
    throw new Error('Maximum 10 tags allowed');
  }
  tags = tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);
  ```

---

## 4. Inventory Fields

### `inStock`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `true`
- **Database**: `Boolean?` (future)
- **Description**: Whether product is available for purchase
- **Example**: `true`
- **Display**: Shows "In Stock" or "Out of Stock" badge

---

### `stock`
- **Type**: `Integer`
- **Required**: No
- **Default**: `0`
- **Min Value**: 0
- **Database**: `Int?` (future)
- **Description**: Current inventory count
- **Example**: `150`
- **Use Case**: Real-time inventory tracking

---

### `minStock`
- **Type**: `Integer`
- **Required**: No
- **Default**: `10`
- **Min Value**: 0
- **Database**: `Int?` (future)
- **Description**: Minimum stock threshold for reorder alerts
- **Example**: `25`
- **Use Case**: Automated reorder notifications

---

## 5. Visual Design Fields

### `backgroundColor`
- **Type**: `String` (hex color)
- **Required**: No
- **Default**: `"#f3f4f6"` (gray-100)
- **Pattern**: `^#[0-9A-Fa-f]{6}$`
- **Database**: `String?` (future)
- **Description**: Solid background color for product card
- **Example**: `"#fef3c7"` (yellow-100)
- **Validation**:
  ```typescript
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (backgroundColor && !hexRegex.test(backgroundColor)) {
    throw new Error('Background color must be a valid hex code');
  }
  ```

---

### `gradientStart`
- **Type**: `String` (hex color, nullable)
- **Required**: No
- **Pattern**: `^#[0-9A-Fa-f]{6}$`
- **Database**: `String?` (future)
- **Description**: Starting color for gradient background
- **Example**: `"#10b981"` (emerald-500)
- **Use Case**: Overrides backgroundColor when set

---

### `gradientEnd`
- **Type**: `String` (hex color, nullable)
- **Required**: No
- **Pattern**: `^#[0-9A-Fa-f]{6}$`
- **Database**: `String?` (future)
- **Description**: Ending color for gradient background
- **Example**: `"#0d9488"` (teal-600)
- **Note**: Must be used with gradientStart

---

### `gradientAngle`
- **Type**: `Integer` (degrees)
- **Required**: No
- **Default**: `135`
- **Min Value**: 0
- **Max Value**: 360
- **Database**: `Int?` (future)
- **Description**: Gradient direction in degrees
- **Example**: `135` (diagonal top-left to bottom-right)

---

### `cardTheme`
- **Type**: `String` (enum)
- **Required**: No
- **Default**: `"default"`
- **Options**: `default`, `elevated`, `flat`, `outlined`, `glass`, `neon`
- **Database**: `String?` (future)
- **Description**: Pre-defined card style preset
- **Example**: `"elevated"`

---

### `badgeText`
- **Type**: `String` (nullable)
- **Required**: No
- **Max Length**: 20 characters
- **Database**: `String?` (future)
- **Description**: Text to display on product badge
- **Example**: `"20% OFF"`, `"NEW"`, `"SALE"`
- **Validation**: Max 20 chars, all caps recommended

---

### `badgeColor`
- **Type**: `String` (enum)
- **Required**: No
- **Default**: `"red"`
- **Options**: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`
- **Database**: `String?` (future)
- **Description**: Color theme for badge
- **Example**: `"red"`

---

### `badgePosition`
- **Type**: `String` (enum)
- **Required**: No
- **Default**: `"top-right"`
- **Options**: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- **Database**: `String?` (future)
- **Description**: Where badge appears on card
- **Example**: `"top-right"`

---

### `splashOverlay`
- **Type**: `String` (enum, nullable)
- **Required**: No
- **Options**: `none`, `confetti`, `sparkles`, `snow`, `leaves`, `hearts`
- **Database**: `String?` (future)
- **Description**: Decorative overlay effect
- **Example**: `"sparkles"`
- **Use Case**: Seasonal and promotional styling

---

### `glowEffect`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `false`
- **Database**: `Boolean?` (future)
- **Description**: Enable glowing shadow behind product image
- **Example**: `true`
- **CSS**: `box-shadow: 0 0 20px rgba(color, 0.5)`

---

### `displayOrder`
- **Type**: `Integer`
- **Required**: No
- **Default**: `0`
- **Database**: `Int?` (future)
- **Description**: Sort order for displaying products (lower = first)
- **Example**: `10`
- **Use Case**: Manual product ordering, featured placement

---

## 6. Media Fields

### `imageUrl`
- **Type**: `String` (URL, nullable)
- **Required**: No
- **Max Length**: 500 characters
- **Database**: `String?`
- **Description**: Primary product image URL
- **Example**: `"https://aztekafoods.com/uploads/salsa-verde.png"`
- **Recommended**: 800x800px PNG with transparency
- **Validation**:
  ```typescript
  if (imageUrl && !isValidUrl(imageUrl)) {
    throw new Error('Invalid image URL');
  }
  ```

---

### `thumbnailUrl`
- **Type**: `String` (URL, nullable)
- **Required**: No
- **Database**: `String?`
- **Description**: Thumbnail version of primary image
- **Example**: `"https://aztekafoods.com/uploads/salsa-verde-thumb.png"`
- **Recommended**: 200x200px PNG
- **Note**: Auto-generated if not provided

---

### `images`
- **Type**: Relation (ProductImage[])
- **Required**: No
- **Database**: `ProductImage[]` (future model)
- **Description**: Gallery of additional product images
- **Structure**:
  ```typescript
  interface ProductImage {
    id: string;
    productId: string;
    url: string;
    sortOrder: number;
    altText?: string;
  }
  ```

---

## 7. Metadata Fields

### `createdAt`
- **Type**: `DateTime`
- **Required**: Yes (auto-generated)
- **Database**: `DateTime @default(now())`
- **Description**: Timestamp when product was created
- **Example**: `"2025-11-18T12:00:00.000Z"`
- **API**: Read-only

---

### `updatedAt`
- **Type**: `DateTime`
- **Required**: Yes (auto-updated)
- **Database**: `DateTime @updatedAt`
- **Description**: Timestamp of last update
- **Example**: `"2025-11-18T14:30:00.000Z"`
- **API**: Read-only

---

### `supplier`
- **Type**: `String` (nullable)
- **Required**: No
- **Database**: `String?` (future)
- **Description**: Supplier or vendor name
- **Example**: `"Herdez Wholesale"`
- **Use Case**: Supply chain tracking

---

## 8. Advanced Fields

### `featured`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `false`
- **Database**: `Boolean?` (future)
- **Description**: Mark as featured product (shows in hero sections)
- **Example**: `true`

---

### `isHidden`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `false`
- **Database**: `Boolean?` (future)
- **Description**: Hide from customer view (soft delete)
- **Example**: `false`
- **Use Case**: Temporarily disable products

---

### `businessModes`
- **Type**: `String[]` (enum array)
- **Required**: No
- **Default**: `[]` (visible to all)
- **Options**: `MEXICAN_STORE`, `CONVENIENCE_STORE`, `GAS_STATION`
- **Database**: `String[]` (future)
- **Description**: Which business types can see this product
- **Example**: `["MEXICAN_STORE", "CONVENIENCE_STORE"]`
- **Validation**:
  ```typescript
  const validModes = ['MEXICAN_STORE', 'CONVENIENCE_STORE', 'GAS_STATION'];
  businessModes = businessModes.filter(mode => validModes.includes(mode));
  ```

---

### `seasonal`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `false`
- **Database**: `Boolean?` (future)
- **Description**: Mark as seasonal product
- **Example**: `true`
- **Use Case**: Holiday/seasonal filtering

---

### `seasonalDates`
- **Type**: `Object` (nullable)
- **Required**: No
- **Database**: `Json?` (future)
- **Description**: Date range when seasonal product is active
- **Structure**:
  ```typescript
  {
    start: "2025-11-01",
    end: "2025-12-31"
  }
  ```

---

### `promoted`
- **Type**: `Boolean`
- **Required**: No
- **Default**: `false`
- **Database**: `Boolean?` (future)
- **Description**: Currently on promotion
- **Example**: `true`

---

### `promotionId`
- **Type**: `String` (UUID, nullable)
- **Required**: No
- **Database**: `String?` (foreign key, future)
- **Description**: Active promotion reference
- **Example**: `"promo-blackfriday-2025"`

---

## Complete Prisma Schema (Enhanced)

```prisma
model Product {
  // Core Identity
  id           String   @id @default(uuid())
  name         String
  slug         String   @unique
  sku          String   @unique
  description  String?

  // Pricing & Commerce
  priceCase    Float
  vendorPrice  Float?
  costCase     Float?
  unitsPerCase Int
  unitType     String?  @default("case")
  minOrderQty  Int?     @default(1)

  // Categorization
  categoryId   String
  brandId      String
  subcategoryId String?
  tags         String[]

  // Inventory
  inStock      Boolean? @default(true)
  stock        Int?     @default(0)
  minStock     Int?     @default(10)

  // Visual Design
  backgroundColor String?  @default("#f3f4f6")
  gradientStart   String?
  gradientEnd     String?
  gradientAngle   Int?     @default(135)
  cardTheme       String?  @default("default")
  badgeText       String?
  badgeColor      String?  @default("red")
  badgePosition   String?  @default("top-right")
  splashOverlay   String?
  glowEffect      Boolean? @default(false)
  displayOrder    Int?     @default(0)

  // Media
  imageUrl     String?
  thumbnailUrl String?

  // Metadata
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  supplier     String?

  // Advanced
  featured     Boolean? @default(false)
  isHidden     Boolean? @default(false)
  businessModes String[]
  seasonal     Boolean? @default(false)
  seasonalDates Json?
  promoted     Boolean? @default(false)
  promotionId  String?

  // Relations
  category     Category    @relation(fields: [categoryId], references: [id])
  brand        Brand       @relation(fields: [brandId], references: [id])
  subcategory  Subcategory? @relation(fields: [subcategoryId], references: [id])
  images       ProductImage[]
  orderItems   OrderItem[]
  priceOverrides CustomerPriceOverride[]
  bundles      BundleItem[]
  promotion    Promotion?  @relation(fields: [promotionId], references: [id])
}
```

---

## TypeScript Interface

```typescript
interface Product {
  // Core Identity
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;

  // Pricing & Commerce
  priceCase: number;
  vendorPrice?: number;
  costCase?: number;
  unitsPerCase: number;
  unitType?: 'case' | 'pack' | 'box' | 'pallet' | 'each';
  minOrderQty?: number;

  // Categorization
  categoryId: string;
  brandId: string;
  subcategoryId?: string;
  tags?: string[];

  // Inventory
  inStock?: boolean;
  stock?: number;
  minStock?: number;

  // Visual Design
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  cardTheme?: 'default' | 'elevated' | 'flat' | 'outlined' | 'glass' | 'neon';
  badgeText?: string;
  badgeColor?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  splashOverlay?: 'none' | 'confetti' | 'sparkles' | 'snow' | 'leaves' | 'hearts';
  glowEffect?: boolean;
  displayOrder?: number;

  // Media
  imageUrl?: string;
  thumbnailUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  supplier?: string;

  // Advanced
  featured?: boolean;
  isHidden?: boolean;
  businessModes?: ('MEXICAN_STORE' | 'CONVENIENCE_STORE' | 'GAS_STATION')[];
  seasonal?: boolean;
  seasonalDates?: {
    start: string;
    end: string;
  };
  promoted?: boolean;
  promotionId?: string;

  // Relations (populated)
  category?: Category;
  brand?: Brand;
  subcategory?: Subcategory;
  images?: ProductImage[];
  promotion?: Promotion;
}
```

---

## Validation Summary

| Field | Required | Type | Min | Max | Pattern |
|-------|----------|------|-----|-----|---------|
| name | ✅ | String | 3 | 200 | - |
| slug | ✅ | String | 2 | 100 | `^[a-z0-9-]+$` |
| sku | ✅ | String | 2 | 50 | `^[A-Z0-9-]+$` |
| description | ❌ | String | - | 1000 | - |
| priceCase | ✅ | Float | 0.01 | - | - |
| unitsPerCase | ✅ | Integer | 1 | - | - |
| categoryId | ✅ | UUID | - | - | UUID v4 |
| brandId | ✅ | UUID | - | - | UUID v4 |
| backgroundColor | ❌ | String | - | - | `^#[0-9A-Fa-f]{6}$` |
| badgeText | ❌ | String | - | 20 | - |
| imageUrl | ❌ | URL | - | 500 | Valid URL |

---

## Default Values

```typescript
const PRODUCT_DEFAULTS = {
  unitType: 'case',
  minOrderQty: 1,
  inStock: true,
  stock: 0,
  minStock: 10,
  backgroundColor: '#f3f4f6',
  gradientAngle: 135,
  cardTheme: 'default',
  badgeColor: 'red',
  badgePosition: 'top-right',
  glowEffect: false,
  displayOrder: 0,
  featured: false,
  isHidden: false,
  businessModes: [],
  seasonal: false,
  promoted: false,
};
```

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Schema Version**: 2.0 (future enhancements)
