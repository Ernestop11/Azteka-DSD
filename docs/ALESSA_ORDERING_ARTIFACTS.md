# Alessa Ordering - Builder Artifacts & Documentation

## Project Overview

**Alessa Ordering** is a multi-tenant restaurant ordering platform built with Next.js 14, Prisma, PostgreSQL, and Stripe. It supports multiple restaurants (tenants) with their own menus, branding, and order management.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS |
| State | Zustand |
| Payments | Stripe |
| Auth | NextAuth.js + JWT |
| Icons | Lucide React |
| Animations | Framer Motion |

---

## Project Structure

```
/srv/alessa-ordering/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Customer dashboard
│   ├── admin/            # Tenant admin panel
│   ├── super-admin/      # Platform super admin
│   ├── order/            # Customer ordering flow
│   ├── api/              # API routes
│   │   ├── admin/        # Admin APIs
│   │   ├── auth/         # Auth APIs
│   │   ├── customer/     # Customer APIs
│   │   ├── delivery/     # Delivery integration
│   │   ├── menu/         # Menu management
│   │   ├── orders/       # Order management
│   │   ├── payments/     # Payment processing
│   │   ├── stripe/       # Stripe webhooks
│   │   └── super/        # Super admin APIs
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── admin/            # Admin UI components
│   ├── fulfillment/      # Order fulfillment
│   ├── order/            # Customer order UI
│   ├── super/            # Super admin components
│   ├── Cart.tsx          # Shopping cart
│   └── CartLauncher.tsx  # Cart trigger button
├── lib/                  # Utilities & helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
├── integrations/         # Third-party integrations
├── fulfillment/          # Fulfillment logic
├── print/                # Receipt printing
└── notifications/        # Push notifications
```

---

## Database Schema (Key Models)

### Tenant (Restaurant)
```prisma
model Tenant {
  id               String           @id @default(uuid())
  name             String
  slug             String           @unique    // URL slug: domain.com/{slug}
  domain           String?                     // Custom domain
  contactEmail     String?
  contactPhone     String?
  addressLine1     String?
  city             String?
  state            String?
  postalCode       String?
  logoUrl          String?
  heroImageUrl     String?
  heroTitle        String?
  heroSubtitle     String?
  primaryColor     String?          @default("#dc2626")
  secondaryColor   String?          @default("#f59e0b")
  status           TenantStatus     @default(PENDING_REVIEW)
  featureFlags     String[]         @default([])
  // Relations
  menuItems        MenuItem[]
  orders           Order[]
  customers        Customer[]
  settings         TenantSettings?
  integrations     TenantIntegration?
}

enum TenantStatus {
  PENDING_REVIEW
  READY_FOR_APPROVAL
  APPROVED
  LIVE
  PAUSED
  ARCHIVED
}
```

### MenuItem
```prisma
model MenuItem {
  id             String        @id @default(uuid())
  tenantId       String
  menuSectionId  String?
  name           String
  description    String
  price          Float
  category       String        @default("general")
  image          String?
  gallery        Json?
  available      Boolean       @default(true)
  isFeatured     Boolean       @default(false)
  tags           String[]      @default([])
  tenant         Tenant        @relation(...)
  section        MenuSection?  @relation(...)
  orders         OrderItem[]
}
```

### Order
```prisma
model Order {
  id               String        @id @default(uuid())
  tenantId         String
  customerId       String?
  subtotalAmount   Float?
  taxAmount        Float?        @default(0)
  deliveryFee      Float?        @default(0)
  tipAmount        Float?        @default(0)
  platformFee      Float?        @default(0)
  totalAmount      Float
  paymentIntentId  String?       @unique
  status           String        @default("pending")
  fulfillmentMethod String       @default("pickup")
  deliveryPartner  String?       // doordash, uber, etc.
  paymentMethod    String?
  customerName     String?
  customerEmail    String?
  customerPhone    String?
  notes            String?
  acknowledgedAt   DateTime?
  tenant           Tenant        @relation(...)
  customer         Customer?     @relation(...)
  items            OrderItem[]
}
```

### Customer
```prisma
model Customer {
  id           String    @id @default(uuid())
  tenantId     String
  email        String?
  phone        String?
  name         String?
  passwordHash String?
  loyaltyPoints Int      @default(0)
  tenant       Tenant    @relation(...)
  orders       Order[]
  sessions     CustomerSession[]

  @@unique([tenantId, email])
  @@unique([tenantId, phone])
}
```

---

## API Endpoints

### Menu APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu?tenantId={id}` | Get menu for tenant |
| GET | `/api/menu/sections?tenantId={id}` | Get menu sections |
| POST | `/api/admin/menu` | Create menu item (admin) |
| PUT | `/api/admin/menu/{id}` | Update menu item |
| DELETE | `/api/admin/menu/{id}` | Delete menu item |

### Order APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders?tenantId={id}` | Get orders (admin) |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/{id}/status` | Update order status |
| GET | `/api/orders/{id}` | Get order details |

### Customer APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customer/login` | Customer login |
| POST | `/api/customer/register` | Customer registration |
| GET | `/api/customer/profile` | Get customer profile |
| GET | `/api/customer/orders` | Get customer order history |

### Payment APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/stripe/webhook` | Stripe webhook handler |
| GET | `/api/payments/session/{id}` | Get payment session |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| PUT | `/api/admin/settings` | Update tenant settings |
| GET | `/api/admin/customers` | List customers |
| GET | `/api/admin/reports` | Sales reports |

### Super Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/super/tenants` | List all tenants |
| POST | `/api/super/tenants` | Create tenant |
| PUT | `/api/super/tenants/{id}/status` | Update tenant status |
| GET | `/api/super/analytics` | Platform analytics |

---

## Component Library

### Cart Components
```tsx
// CartLauncher.tsx - Floating cart button
<CartLauncher itemCount={3} onClick={openCart} />

// Cart.tsx - Full cart drawer
<Cart
  items={cartItems}
  onUpdateQuantity={(id, qty) => ...}
  onRemove={(id) => ...}
  onCheckout={() => ...}
/>
```

### Order Components
```tsx
// Menu display
<MenuSection section={section} items={items} onAddToCart={...} />
<MenuItemCard item={item} onAdd={...} />

// Checkout flow
<CheckoutForm customer={customer} cart={cart} onSubmit={...} />
<PaymentForm clientSecret={secret} onSuccess={...} />
<OrderConfirmation order={order} />
```

### Admin Components
```tsx
// Dashboard
<DashboardStats orders={orders} revenue={revenue} />
<OrderList orders={orders} onStatusChange={...} />
<MenuEditor items={items} onSave={...} />

// Settings
<TenantSettings settings={settings} onSave={...} />
<BrandingEditor colors={colors} logo={logo} onSave={...} />
```

### Fulfillment Components
```tsx
// Order management
<FulfillmentDashboard />
<OrderCard order={order} onAcknowledge={...} onComplete={...} />
<PrintReceipt order={order} />
```

---

## Theming System

Each tenant has customizable branding:

```tsx
// TenantThemeProvider.tsx
<TenantThemeProvider
  primaryColor="#dc2626"
  secondaryColor="#f59e0b"
  logoUrl="/logo.png"
>
  {children}
</TenantThemeProvider>
```

CSS Variables set by theme:
```css
:root {
  --primary: #dc2626;
  --primary-light: #fee2e2;
  --secondary: #f59e0b;
  --secondary-light: #fef3c7;
}
```

---

## Order Flow

```
1. Customer visits /{tenant-slug}
2. Browse menu → Add items to cart
3. Cart opens → Review order
4. Checkout → Enter details + payment
5. Stripe processes payment
6. Order created with status "pending"
7. Webhook confirms payment → status "confirmed"
8. Admin sees order → Acknowledges → Prepares → Completes
9. Customer notified at each step
```

---

## Order Statuses

| Status | Description |
|--------|-------------|
| `pending` | Order created, awaiting payment |
| `confirmed` | Payment received |
| `preparing` | Kitchen is preparing |
| `ready` | Ready for pickup/delivery |
| `out_for_delivery` | Driver en route |
| `completed` | Order fulfilled |
| `cancelled` | Order cancelled |
| `refunded` | Payment refunded |

---

## Fulfillment Methods

| Method | Description |
|--------|-------------|
| `pickup` | Customer picks up at location |
| `delivery` | In-house delivery |
| `doordash` | DoorDash Drive integration |
| `uber` | Uber Direct integration |
| `dine_in` | Dine-in (table service) |

---

## Integrations

### Stripe (Payments)
- Payment intents for orders
- Webhook for payment confirmation
- Refunds via dashboard

### DoorDash Drive (Delivery)
- Create delivery quotes
- Dispatch drivers
- Track delivery status

### Clover (POS)
- Sync menu items
- Push orders to Clover
- Inventory sync

### DAVO (Tax)
- Automatic sales tax calculation
- Tax remittance

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/alessa"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# DoorDash
DOORDASH_DEVELOPER_ID="..."
DOORDASH_KEY_ID="..."
DOORDASH_SIGNING_SECRET="..."

# Clover
CLOVER_API_KEY="..."
CLOVER_MERCHANT_ID="..."
```

---

## Deployment

### VPS Details
| Item | Value |
|------|-------|
| Host | `72.62.162.163` |
| Path | `/srv/alessa-ordering` |
| PM2 Process | `alessa-ordering` |
| Port | `3000` (behind nginx) |

### Deploy Commands
```bash
# SSH to VPS
ssh root@72.62.162.163
cd /srv/alessa-ordering

# Pull latest
git pull origin main

# Install & build
npm install
npm run build

# Restart
pm2 restart alessa-ordering
pm2 save
```

### Check Status
```bash
pm2 list
pm2 logs alessa-ordering --lines 50
```

---

## Common Patterns

### Fetching with Tenant Context
```typescript
// All queries should include tenantId
const orders = await prisma.order.findMany({
  where: { tenantId: tenant.id },
  include: { items: true }
})
```

### API Route with Auth
```typescript
// app/api/admin/orders/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { tenantId: session.user.tenantId }
  })

  return NextResponse.json({ data: orders })
}
```

### Cart State (Zustand)
```typescript
// lib/store/cartStore.ts
interface CartState {
  items: CartItem[]
  addItem: (item: MenuItem, quantity: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}
```

---

## Feature Flags

Tenants can have feature flags enabled:

| Flag | Description |
|------|-------------|
| `delivery` | Enable delivery orders |
| `dine_in` | Enable dine-in |
| `loyalty` | Enable loyalty points |
| `coupons` | Enable discount codes |
| `tips` | Enable tipping |
| `scheduling` | Enable scheduled orders |
| `doordash` | Enable DoorDash integration |
| `clover` | Enable Clover POS sync |

Check flags:
```typescript
if (tenant.featureFlags.includes('delivery')) {
  // Show delivery option
}
```

---

## Error Handling

Standard API error response:
```typescript
return NextResponse.json(
  { error: 'Error message', details: error.message },
  { status: 400 | 401 | 404 | 500 }
)
```

Success response:
```typescript
return NextResponse.json({
  data: result,
  message: 'Success message'
})
```

---

## Testing Checklist

- [ ] Create new tenant
- [ ] Add menu items
- [ ] Place test order (pickup)
- [ ] Place test order (delivery)
- [ ] Complete payment flow
- [ ] Admin order management
- [ ] Customer login/register
- [ ] Order history
- [ ] Receipt printing
- [ ] Stripe webhook handling
