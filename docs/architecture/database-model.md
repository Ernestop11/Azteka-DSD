# Azteka DSD - Database Model Documentation

## Overview

The Azteka DSD database uses **PostgreSQL** with **Prisma ORM** for schema management and queries.

**Schema File**: `prisma/schema.prisma`

---

## Database Models

### 1. User

**Purpose**: Stores all user accounts across different roles

**Schema**:
```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  name        String?
  role        Role
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orders      Order[]
}
```

**Fields**:
- `id` - UUID primary key
- `email` - Unique email address for login
- `password` - Hashed password (bcrypt)
- `name` - Full name of user (optional)
- `role` - User role (enum: see Role below)
- `customerId` - Optional link to Customer record
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Belongs to one `Customer` (optional)
- Has many `Order` records

**Use Cases**:
- Authentication and login
- Role-based access control
- Linking customer users to their store/account

---

### 2. Role (Enum)

**Purpose**: Define user permission levels

**Values**:
```prisma
enum Role {
  SUPER_ADMIN   // Full system access
  ADMIN         // Product/order management
  SALES_REP     // Create orders for customers
  WAREHOUSE     // Fulfillment operations
  DRIVER        // Delivery operations
  CUSTOMER      // Browse and order products
}
```

**Hierarchy**:
```
SUPER_ADMIN > ADMIN > SALES_REP, WAREHOUSE, DRIVER > CUSTOMER
```

---

### 3. Customer

**Purpose**: Store customer (business) information

**Schema**:
```prisma
model Customer {
  id           String   @id @default(uuid())
  name         String
  storeName    String
  address      String?
  city         String?
  state        String?
  zip          String?
  phone        String?
  email        String?
  priceTier    String?

  users        User[]
  orders       Order[]
  priceOverrides CustomerPriceOverride[]
}
```

**Fields**:
- `id` - UUID primary key
- `name` - Business/owner name
- `storeName` - Name of the store/business
- `address`, `city`, `state`, `zip` - Delivery address
- `phone` - Contact phone number
- `email` - Contact email
- `priceTier` - Pricing tier (e.g., "bronze", "silver", "gold")

**Relationships**:
- Has many `User` accounts (store employees)
- Has many `Order` records
- Has many `CustomerPriceOverride` records

**Use Cases**:
- Customer account management
- Delivery address storage
- Custom pricing per customer
- Order history by customer

---

### 4. Product

**Purpose**: Store product catalog information

**Schema**:
```prisma
model Product {
  id           String   @id @default(uuid())
  name         String
  sku          String   @unique
  description  String?
  priceCase    Float
  unitsPerCase Int
  categoryId   String
  brandId      String
  imageUrl     String?
  thumbnailUrl String?

  category     Category @relation(fields: [categoryId], references: [id])
  brand        Brand    @relation(fields: [brandId], references: [id])

  orderItems   OrderItem[]
  priceOverrides CustomerPriceOverride[]
}
```

**Fields**:
- `id` - UUID primary key
- `name` - Product name
- `sku` - Stock keeping unit (unique)
- `description` - Product description (optional)
- `priceCase` - Price per case (decimal)
- `unitsPerCase` - Number of units in a case
- `categoryId` - Foreign key to Category
- `brandId` - Foreign key to Brand
- `imageUrl` - Full-size product image URL
- `thumbnailUrl` - Thumbnail image URL

**Relationships**:
- Belongs to one `Category`
- Belongs to one `Brand`
- Has many `OrderItem` records
- Has many `CustomerPriceOverride` records

**Indexes**:
- `sku` is unique for fast lookups
- `categoryId` and `brandId` for filtering

**Use Cases**:
- Product catalog display
- Order line items
- Price calculations
- Inventory management (future)

---

### 5. Category

**Purpose**: Organize products into categories

**Schema**:
```prisma
model Category {
  id       String    @id @default(uuid())
  name     String
  slug     String    @unique

  products Product[]
}
```

**Fields**:
- `id` - UUID primary key
- `name` - Display name (e.g., "Snacks")
- `slug` - URL-friendly identifier (e.g., "snacks")

**Relationships**:
- Has many `Product` records

**Use Cases**:
- Product filtering
- Navigation menus
- Category pages

**Example Data**:
```
id: "cat-001"
name: "Snacks"
slug: "snacks"
```

---

### 6. Brand

**Purpose**: Track product brands/manufacturers

**Schema**:
```prisma
model Brand {
  id       String    @id @default(uuid())
  name     String
  slug     String    @unique

  products Product[]
}
```

**Fields**:
- `id` - UUID primary key
- `name` - Brand name (e.g., "Herdez")
- `slug` - URL-friendly identifier (e.g., "herdez")

**Relationships**:
- Has many `Product` records

**Use Cases**:
- Brand filtering
- Brand showcase pages
- Supplier management

**Example Data**:
```
id: "brand-001"
name: "Herdez"
slug: "herdez"
```

---

### 7. CustomerPriceOverride

**Purpose**: Custom pricing for specific customers

**Schema**:
```prisma
model CustomerPriceOverride {
  id          String   @id @default(uuid())
  customerId  String
  productId   String
  priceCase   Float

  customer    Customer @relation(fields: [customerId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
}
```

**Fields**:
- `id` - UUID primary key
- `customerId` - Foreign key to Customer
- `productId` - Foreign key to Product
- `priceCase` - Override price for this customer

**Relationships**:
- Belongs to one `Customer`
- Belongs to one `Product`

**Use Cases**:
- Volume discounts
- Special customer pricing
- Contract pricing
- Loyalty rewards

**Query Example**:
```typescript
// Get custom price for customer
const override = await prisma.customerPriceOverride.findFirst({
  where: {
    customerId: 'customer-123',
    productId: 'product-456'
  }
});

const finalPrice = override?.priceCase || product.priceCase;
```

---

### 8. Order

**Purpose**: Track customer orders

**Schema**:
```prisma
model Order {
  id          String       @id @default(uuid())
  customerId  String
  userId      String?
  status      OrderStatus  @default(NEW)
  total       Float        @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  items       OrderItem[]
  customer    Customer     @relation(fields: [customerId], references: [id])
  user        User?        @relation(fields: [userId], references: [id])
}
```

**Fields**:
- `id` - UUID primary key
- `customerId` - Foreign key to Customer
- `userId` - Foreign key to User who placed order (optional)
- `status` - Current order status (enum)
- `total` - Total order amount
- `createdAt` - Order creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Belongs to one `Customer`
- Belongs to one `User` (optional - may be placed by customer or sales rep)
- Has many `OrderItem` records

**Use Cases**:
- Order tracking
- Order history
- Fulfillment workflow
- Sales reporting

---

### 9. OrderStatus (Enum)

**Purpose**: Track order lifecycle

**Values**:
```prisma
enum OrderStatus {
  NEW                  // Just created
  PICKING              // Warehouse is picking items
  PICKED               // Ready for delivery
  OUT_FOR_DELIVERY     // Driver has order
  DELIVERED            // Successfully delivered
  CANCELLED            // Order cancelled
}
```

**Workflow**:
```
NEW → PICKING → PICKED → OUT_FOR_DELIVERY → DELIVERED
         ↓
    CANCELLED (can cancel at any stage before delivery)
```

**Status Transitions**:
- `NEW → PICKING`: Warehouse starts fulfillment
- `PICKING → PICKED`: All items picked and packed
- `PICKED → OUT_FOR_DELIVERY`: Driver picks up order
- `OUT_FOR_DELIVERY → DELIVERED`: Customer receives order
- `ANY → CANCELLED`: Order cancellation

---

### 10. OrderItem

**Purpose**: Line items within an order

**Schema**:
```prisma
model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  productId String
  quantity  Int
  priceCase Float

  order     Order    @relation(fields: [orderId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}
```

**Fields**:
- `id` - UUID primary key
- `orderId` - Foreign key to Order
- `productId` - Foreign key to Product
- `quantity` - Number of cases ordered
- `priceCase` - Price per case at time of order

**Relationships**:
- Belongs to one `Order`
- Belongs to one `Product`

**Use Cases**:
- Order details
- Invoice line items
- Inventory deduction
- Sales analysis

**Why Store Price**:
- Prices may change over time
- Customer may have custom pricing
- Historical accuracy for invoices

---

## Entity Relationship Diagram (Text-Based)

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │───┐
│ email       │   │
│ password    │   │
│ name        │   │
│ role        │   │
│ customerId  │───┼──────────┐
└─────────────┘   │          │
                  │          │
                  │          ▼
                  │    ┌──────────────┐
                  │    │   Customer   │
                  │    ├──────────────┤
                  │    │ id (PK)      │◀────────┐
                  │    │ name         │         │
                  │    │ storeName    │         │
                  │    │ address      │         │
                  │    │ priceTier    │         │
                  │    └──────────────┘         │
                  │          │                  │
                  │          │                  │
                  ▼          ▼                  │
            ┌─────────────────────┐             │
            │       Order         │             │
            ├─────────────────────┤             │
            │ id (PK)             │             │
            │ customerId (FK)     │─────────────┘
            │ userId (FK)         │
            │ status              │
            │ total               │
            │ createdAt           │
            └─────────────────────┘
                      │
                      │ 1:N
                      │
                      ▼
            ┌─────────────────────┐
            │     OrderItem       │
            ├─────────────────────┤
            │ id (PK)             │
            │ orderId (FK)        │─────────┐
            │ productId (FK)      │─────┐   │
            │ quantity            │     │   │
            │ priceCase           │     │   │
            └─────────────────────┘     │   │
                                        │   │
                      ┌─────────────────┘   │
                      │                     │
                      ▼                     │
            ┌─────────────────────┐         │
            │      Product        │         │
            ├─────────────────────┤         │
            │ id (PK)             │◀────────┘
            │ name                │
            │ sku (UNIQUE)        │
            │ priceCase           │
            │ unitsPerCase        │
            │ categoryId (FK)     │────┐
            │ brandId (FK)        │────┼─┐
            │ imageUrl            │    │ │
            └─────────────────────┘    │ │
                      │                │ │
                      │                │ │
                      ▼                │ │
      ┌───────────────────────────┐   │ │
      │ CustomerPriceOverride     │   │ │
      ├───────────────────────────┤   │ │
      │ id (PK)                   │   │ │
      │ customerId (FK)           │   │ │
      │ productId (FK)            │   │ │
      │ priceCase                 │   │ │
      └───────────────────────────┘   │ │
                                      │ │
                    ┌─────────────────┘ │
                    │                   │
                    ▼                   │
          ┌─────────────────┐           │
          │    Category     │           │
          ├─────────────────┤           │
          │ id (PK)         │           │
          │ name            │           │
          │ slug (UNIQUE)   │           │
          └─────────────────┘           │
                                        │
                          ┌─────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │      Brand      │
                ├─────────────────┤
                │ id (PK)         │
                │ name            │
                │ slug (UNIQUE)   │
                └─────────────────┘
```

---

## Relationship Summary

### One-to-Many (1:N)

| Parent | Child | Relationship |
|--------|-------|-------------|
| Customer | User | One customer can have many user accounts |
| Customer | Order | One customer can place many orders |
| Customer | CustomerPriceOverride | One customer can have many price overrides |
| Product | OrderItem | One product can appear in many order items |
| Product | CustomerPriceOverride | One product can have many customer-specific prices |
| Category | Product | One category contains many products |
| Brand | Product | One brand has many products |
| Order | OrderItem | One order contains many items |
| User | Order | One user can create many orders |

### Many-to-Many (M:N)

| Entity A | Entity B | Through Table | Description |
|----------|----------|---------------|-------------|
| Customer | Product | CustomerPriceOverride | Customers can have custom prices for multiple products |

---

## Common Queries

### 1. Get Customer Orders with Items

```typescript
const customerOrders = await prisma.order.findMany({
  where: { customerId: 'customer-123' },
  include: {
    items: {
      include: {
        product: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

### 2. Get Products with Category and Brand

```typescript
const products = await prisma.product.findMany({
  include: {
    category: true,
    brand: true
  },
  where: {
    categoryId: 'category-id'
  }
});
```

---

### 3. Get Custom Price for Customer

```typescript
const getProductPrice = async (customerId: string, productId: string) => {
  const override = await prisma.customerPriceOverride.findFirst({
    where: { customerId, productId }
  });

  if (override) {
    return override.priceCase;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  return product?.priceCase || 0;
};
```

---

### 4. Create Order with Items

```typescript
const newOrder = await prisma.order.create({
  data: {
    customerId: 'customer-123',
    userId: 'user-456',
    status: 'NEW',
    total: 150.00,
    items: {
      create: [
        {
          productId: 'product-001',
          quantity: 5,
          priceCase: 30.00
        },
        {
          productId: 'product-002',
          quantity: 3,
          priceCase: 25.00
        }
      ]
    }
  },
  include: {
    items: true
  }
});
```

---

### 5. Update Order Status

```typescript
const updatedOrder = await prisma.order.update({
  where: { id: 'order-789' },
  data: { status: 'PICKING' }
});
```

---

### 6. Get Orders by Status for Warehouse

```typescript
const pickingOrders = await prisma.order.findMany({
  where: {
    status: {
      in: ['NEW', 'PICKING']
    }
  },
  include: {
    customer: true,
    items: {
      include: {
        product: true
      }
    }
  },
  orderBy: { createdAt: 'asc' }
});
```

---

## Database Indexes

### Existing Indexes (via Prisma)

- `User.email` - Unique index for login
- `Product.sku` - Unique index for product lookup
- `Category.slug` - Unique index for URL routing
- `Brand.slug` - Unique index for URL routing

### Recommended Additional Indexes

```prisma
// Add to schema for performance
@@index([customerId])          // On Order
@@index([status])              // On Order
@@index([createdAt])           // On Order
@@index([categoryId])          // On Product
@@index([brandId])             // On Product
@@index([orderId])             // On OrderItem
@@index([customerId, productId]) // On CustomerPriceOverride (composite)
```

---

## Data Integrity Rules

### Constraints

1. **Email Uniqueness**: Each user must have unique email
2. **SKU Uniqueness**: Each product must have unique SKU
3. **Slug Uniqueness**: Category and Brand slugs must be unique
4. **Referential Integrity**: Foreign keys enforce valid relationships

### Validation Rules

1. **Quantity**: Must be > 0 in OrderItem
2. **Price**: Must be >= 0
3. **Email**: Must be valid email format
4. **Status Transitions**: Follow defined workflow

---

## Migrations

### Running Migrations

```bash
# Development
DATABASE_URL="postgresql://user:pass@localhost:5432/azteka" \
  npx prisma migrate dev

# Production
DATABASE_URL="postgresql://user:pass@localhost:5432/azteka" \
  npx prisma migrate deploy
```

### Creating New Migration

```bash
npx prisma migrate dev --name add_inventory_table
```

---

## Prisma Client Generation

After schema changes:

```bash
npx prisma generate
```

This regenerates TypeScript types and Prisma Client API.

---

## Backup and Restore

### Backup Database

```bash
pg_dump -h localhost -U user azteka_dsd > backup.sql
```

### Restore Database

```bash
psql -h localhost -U user azteka_dsd < backup.sql
```

---

## Future Schema Enhancements

### Planned Additions

1. **Inventory Table**
   - Track stock levels
   - Low stock alerts
   - Warehouse locations

2. **ProductImage Table**
   - Multiple images per product
   - Sort order
   - Image metadata

3. **DeliveryRoute Table**
   - Route optimization
   - Driver assignments
   - GPS tracking

4. **Invoice Table**
   - Automated invoicing
   - Payment tracking
   - QuickBooks sync

5. **LoyaltyPoints Table**
   - Track points per customer
   - Points transactions
   - Redemption history

6. **Promotion Table**
   - Time-based promotions
   - Discount rules
   - Promotion tracking

---

## Performance Considerations

### Query Optimization

1. **Use `select` to limit returned fields**:
   ```typescript
   await prisma.product.findMany({
     select: { id: true, name: true, price: true }
   });
   ```

2. **Pagination for large datasets**:
   ```typescript
   await prisma.product.findMany({
     skip: (page - 1) * pageSize,
     take: pageSize
   });
   ```

3. **Use `include` strategically** - avoid deep nesting

4. **Implement caching** for frequently accessed data

---

## Security Best Practices

1. **Never expose User.password** in API responses
2. **Use Prisma's built-in SQL injection protection**
3. **Validate all input before database operations**
4. **Use transactions for multi-step operations**
5. **Implement row-level security for multi-tenant data**

---

## Database Connection

### Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Connection Pooling

Prisma automatically manages connection pooling. Configure in schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Useful Prisma Commands

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```
