# Azteka DSD - Admin Menu Editor Overview

## Purpose

The Admin Menu Editor is the central management interface for controlling the entire Azteka DSD product catalog. It empowers administrators to:

1. **Manage Products**: Create, edit, delete, and organize wholesale products
2. **Design Catalog Experience**: Apply visual themes, gradients, and seasonal overlays to product cards
3. **Configure Smart DSD**: Set up bundles, promotions, and AI-powered reorder suggestions
4. **Control Visibility**: Manage what products appear to which customer segments
5. **Optimize Pricing**: Set base prices and customer-specific overrides
6. **Upload Media**: Manage product images with transparency and splash effects

**Target Users**: Super Admins, Admins, Sales Managers

**Access Level**: Requires authentication with `SUPER_ADMIN`, `ADMIN`, or `SALES_REP` role

---

## Three Admin Personas

### 1. Super Admin (SUPER_ADMIN)

**Access Level**: Full system control

**Capabilities**:
- ✅ All Admin capabilities (below)
- ✅ User management (create/edit/delete admin accounts)
- ✅ System configuration (API keys, integrations)
- ✅ Database management (backups, migrations)
- ✅ Access control configuration
- ✅ Audit log review
- ✅ Financial reporting
- ✅ Delete products and categories

**Use Cases**:
- Initial system setup
- Onboarding new admins
- Configuring QuickBooks integration
- Emergency database operations
- Security and compliance management

**Typical Workflow**:
```
Login → Admin Dashboard → User Management → Create Admin
                       → System Settings → Configure Integrations
                       → Audit Logs → Review Activity
```

---

### 2. Admin (ADMIN)

**Access Level**: Product and catalog management

**Capabilities**:
- ✅ Create, edit, update products
- ✅ Upload product images
- ✅ Manage categories and brands
- ✅ Configure bundles and promotions
- ✅ Set pricing (base prices)
- ✅ Design product card themes
- ✅ Apply seasonal overlays
- ✅ Manage product visibility
- ✅ Reorder products (display order)
- ✅ View sales analytics
- ❌ Cannot delete products (only hide)
- ❌ Cannot manage users
- ❌ Cannot access system settings

**Use Cases**:
- Daily catalog maintenance
- New product launches
- Seasonal campaign setup
- Price updates
- Product photography uploads
- Bundle creation

**Typical Workflow**:
```
Login → Menu Editor → Select Product → Edit Details → Upload Image
                                     → Apply Visual Preset → Preview
                                     → Save Changes → Publish
```

---

### 3. Sales Manager (SALES_REP with elevated permissions)

**Access Level**: Limited product management + sales tools

**Capabilities**:
- ✅ View all products
- ✅ Edit product descriptions and notes
- ✅ Flag products for promotion
- ✅ Request price overrides (requires approval)
- ✅ Create customer-specific bundles
- ✅ View sales analytics
- ✅ Generate reports
- ❌ Cannot create/delete products
- ❌ Cannot change base prices
- ❌ Cannot upload images
- ❌ Cannot manage categories

**Use Cases**:
- Customer-specific catalog customization
- Sales promotions management
- Field feedback on product descriptions
- Requesting new products from procurement
- Generating sales reports

**Typical Workflow**:
```
Login → Product List → Search Product → Edit Description → Flag as Promoted
                                      → Request Price Override → Submit for Approval
```

---

## Full Capabilities

### 1. Product Editing

**Core Fields**:
- Basic Info: Name, SKU, Description
- Pricing: Price per case, Units per case, Cost
- Categorization: Category, Brand, Subcategory
- Inventory: Stock level, Min stock, In stock status
- Visibility: Featured, Hidden, Business mode filters
- Ordering: Min order quantity, Display order

**Visual Fields**:
- Background color
- Gradient (start/end colors)
- Card theme preset
- Badge text and color
- Splash overlay selection
- Glow effects

**Media**:
- Primary image (800x800 PNG recommended)
- Thumbnail (auto-generated or custom)
- Additional images (gallery)
- Overlay graphics

---

### 2. Template Design

**Preset Library**: 25+ pre-designed visual templates

**Categories**:
- **Fiesta Gradients**: Vibrant Mexican-inspired colors (Fiesta-01 through Fiesta-08)
- **Candy Tones**: Sweet, playful pastel gradients (Candy-01 through Candy-06)
- **Beverage Splashes**: Dynamic, refreshing themes (Splash-01 through Splash-05)
- **Holiday Packs**: Seasonal overlays (Holiday-Winter, Holiday-Spring, etc.)
- **Premium Metallic**: Gold, silver, bronze accent themes

**Customization Options**:
- Adjust gradient angle
- Modify opacity levels
- Add/remove glow effects
- Apply multiple overlays
- Custom badge positioning

---

### 3. Smart DSD Configuration

**Bundle Builder**:
- Select products for bundle
- Set bundle discount percentage
- Design bundle card visual
- Configure "Add all" vs "Add missing items" logic

**Seasonal Engines**:
- Schedule promotions by date range
- Auto-apply holiday overlays
- Rotate featured products
- Seasonal price adjustments

**Smart Reorder AI**:
- Configure reorder frequency thresholds
- Set urgency levels (high/medium/low)
- Customize suggestion algorithms
- Review AI recommendations before enabling

**Competitor Price Matching**:
- Upload competitor price lists
- Set matching rules (match, beat by X%)
- Configure customer tier eligibility
- Review and approve automated matches

---

### 4. Bundles

**Bundle Types**:
1. **Fixed Bundles**: Predefined product sets with discount
2. **Mix & Match**: Customer chooses X items from Y options
3. **Tiered Bundles**: Buy more, save more (5-pack, 10-pack, 20-pack)
4. **Category Bundles**: All products in category with discount
5. **Brand Bundles**: All products from specific brand

**Bundle Configuration**:
```json
{
  "id": "bundle-001",
  "name": "Salsa Starter Pack",
  "type": "fixed",
  "discount_percent": 15,
  "items": [
    { "productId": "prod-001", "quantity": 2 },
    { "productId": "prod-002", "quantity": 3 },
    { "productId": "prod-003", "quantity": 1 }
  ],
  "visual": {
    "gradient": "Fiesta-03",
    "badge_text": "15% OFF",
    "badge_color": "red"
  }
}
```

---

## Page → Component → API Flow

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN INTERFACE                         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Admin Dashboard (Page)                     │    │
│  │  /admin                                           │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                         │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Menu Editor (Page Component)              │    │
│  │  /admin/menu-editor                               │    │
│  │                                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  Product     │  │   Editor     │               │    │
│  │  │   List       │  │   Drawer     │               │    │
│  │  │ (Component)  │  │ (Component)  │               │    │
│  │  └──────┬───────┘  └──────┬───────┘               │    │
│  │         │                  │                       │    │
│  │         │  Select Product  │                       │    │
│  │         └─────────►        │                       │    │
│  │                   │        │                       │    │
│  │                   │ ┌──────▼───────┐              │    │
│  │                   │ │   Product    │              │    │
│  │                   │ │ Form Fields  │              │    │
│  │                   │ └──────┬───────┘              │    │
│  │                   │        │                       │    │
│  │                   │ ┌──────▼───────┐              │    │
│  │                   │ │   Visual     │              │    │
│  │                   │ │   Preset     │              │    │
│  │                   │ │   Selector   │              │    │
│  │                   │ └──────┬───────┘              │    │
│  │                   │        │                       │    │
│  │                   │ ┌──────▼───────┐              │    │
│  │                   │ │   Image      │              │    │
│  │                   │ │   Uploader   │              │    │
│  │                   │ └──────┬───────┘              │    │
│  │                   │        │                       │    │
│  │                   │ ┌──────▼───────┐              │    │
│  │                   │ │   Preview    │              │    │
│  │                   │ │   Card       │              │    │
│  │                   │ └──────┬───────┘              │    │
│  │                   │        │                       │    │
│  │                   │   [Save Button]               │    │
│  │                   └────────┬───────               │    │
│  └────────────────────────────┼────────────────────────┘    │
└────────────────────────────────┼─────────────────────────────┘
                                 │
                        HTTP Request (PUT/POST)
                                 │
┌────────────────────────────────▼─────────────────────────────┐
│                        API LAYER                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │      Express.js Routes (server.mjs)                │    │
│  │                                                     │    │
│  │  /api/products/manage                              │    │
│  │     ├── GET /        (list products)               │    │
│  │     ├── GET /:id     (get single)                  │    │
│  │     ├── POST /       (create)                      │    │
│  │     ├── PUT /:id     (update)                      │    │
│  │     └── DELETE /:id  (delete)                      │    │
│  │                                                     │    │
│  │  /api/upload                                       │    │
│  │     └── POST /       (upload image)                │    │
│  │                                                     │    │
│  │  Middleware:                                       │    │
│  │     ├── verifyToken()                              │    │
│  │     ├── authorize('ADMIN')                         │    │
│  │     └── validateProductUpdate()                    │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Prisma ORM Layer                        │    │
│  │                                                     │    │
│  │  prisma.product.findMany()                         │    │
│  │  prisma.product.findUnique()                       │    │
│  │  prisma.product.create()                           │    │
│  │  prisma.product.update()                           │    │
│  │  prisma.product.delete()                           │    │
│  └────────────────────┬────────────────────────────────┘    │
└────────────────────────┼──────────────────────────────────────┘
                         │
                  SQL Queries
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                                                              │
│  Tables:                                                    │
│    ├── products                                             │
│    ├── categories                                           │
│    ├── brands                                               │
│    ├── product_images                                       │
│    └── product_bundles                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Flow

### 1. Product List Component

**Purpose**: Display searchable, filterable product grid

**Props**:
```tsx
interface ProductListProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onCreateNew: () => void;
}
```

**Features**:
- Search by name, SKU, description
- Filter by category, brand, featured, in stock
- Pagination (50 items per page)
- Sort by: Name, Price, Created Date, Display Order
- Bulk actions (future: bulk edit, bulk delete)

**API Calls**:
```typescript
// Initial load
GET /api/products/manage?page=1&limit=50

// Search
GET /api/products/manage?search=salsa&categoryId=cat-001

// Filter
GET /api/products/manage?featured=true&inStock=true
```

---

### 2. Editor Drawer Component

**Purpose**: Side panel for editing product details

**Structure**:
```tsx
<EditorDrawer>
  <DrawerHeader>
    <h2>{isNew ? 'Create Product' : 'Edit Product'}</h2>
    <CloseButton />
  </DrawerHeader>

  <DrawerBody>
    {/* Tabs */}
    <Tabs>
      <Tab name="Basic Info" />
      <Tab name="Visual Design" />
      <Tab name="Images" />
      <Tab name="Advanced" />
    </Tabs>

    {/* Tab Content */}
    {activeTab === 'basic' && <BasicInfoForm />}
    {activeTab === 'visual' && <VisualDesignPanel />}
    {activeTab === 'images' && <ImageUploader />}
    {activeTab === 'advanced' && <AdvancedSettings />}

    {/* Live Preview */}
    <PreviewCard product={formData} />
  </DrawerBody>

  <DrawerFooter>
    <Button onClick={handleCancel}>Cancel</Button>
    <Button onClick={handleSave} primary>Save Product</Button>
  </DrawerFooter>
</EditorDrawer>
```

**State Management**:
```typescript
const [formData, setFormData] = useState<ProductFormData>({
  // Basic fields
  name: '',
  sku: '',
  slug: '',
  description: '',
  priceCase: 0,
  unitsPerCase: 1,
  categoryId: '',
  brandId: '',

  // Visual fields
  backgroundColor: '#f3f4f6',
  gradientStart: '#10b981',
  gradientEnd: '#0d9488',
  cardTheme: 'default',
  badgeText: '',
  badgeColor: 'red',

  // Media
  imageUrl: '',
  thumbnailUrl: '',

  // Advanced
  featured: false,
  inStock: true,
  minOrderQty: 1,
  displayOrder: 0,
});
```

---

### 3. Visual Preset Selector Component

**Purpose**: Quick-apply pre-designed visual themes

**UI Layout**:
```tsx
<VisualPresetSelector>
  <h3>Choose a Preset</h3>

  <CategoryFilter>
    <button onClick={() => setCategory('fiesta')}>Fiesta</button>
    <button onClick={() => setCategory('candy')}>Candy</button>
    <button onClick={() => setCategory('splash')}>Beverage</button>
    <button onClick={() => setCategory('holiday')}>Holiday</button>
  </CategoryFilter>

  <PresetGrid>
    {presets.map(preset => (
      <PresetCard
        key={preset.id}
        preset={preset}
        onClick={() => applyPreset(preset)}
        selected={selectedPreset === preset.id}
      >
        <PresetPreview gradient={preset.gradient} />
        <PresetName>{preset.name}</PresetName>
      </PresetCard>
    ))}
  </PresetGrid>

  <CustomizeSection>
    <h4>Customize Colors</h4>
    <ColorPicker label="Background" value={backgroundColor} />
    <ColorPicker label="Gradient Start" value={gradientStart} />
    <ColorPicker label="Gradient End" value={gradientEnd} />
  </CustomizeSection>
</VisualPresetSelector>
```

**Preset Application**:
```typescript
function applyPreset(preset: VisualPreset) {
  setFormData(prev => ({
    ...prev,
    backgroundColor: preset.backgroundColor,
    gradientStart: preset.gradientStart,
    gradientEnd: preset.gradientEnd,
    cardTheme: preset.theme,
    splashOverlay: preset.overlay,
  }));
}
```

---

### 4. Image Uploader Component

**Purpose**: Upload and manage product images

**Features**:
- Drag & drop upload
- File type validation (PNG, JPG, WebP)
- Image preview before upload
- Automatic thumbnail generation
- Crop tool (future)
- Background removal (future)

**Upload Flow**:
```typescript
async function handleImageUpload(file: File) {
  // 1. Validate file
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // 2. Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // 3. Upload to server
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const { url } = await response.json();

  // 4. Update product form
  setFormData(prev => ({ ...prev, imageUrl: url }));
}
```

---

### 5. Preview Card Component

**Purpose**: Real-time preview of product card design

**Implementation**:
```tsx
<PreviewCard>
  <h4>Live Preview</h4>

  <ProductCardPreview
    style={{
      background: formData.gradientStart && formData.gradientEnd
        ? `linear-gradient(135deg, ${formData.gradientStart}, ${formData.gradientEnd})`
        : formData.backgroundColor,
    }}
  >
    {/* Badge */}
    {formData.badgeText && (
      <Badge color={formData.badgeColor}>
        {formData.badgeText}
      </Badge>
    )}

    {/* Image */}
    <ProductImage
      src={formData.imageUrl || '/placeholder.png'}
      alt={formData.name}
    />

    {/* Details */}
    <ProductName>{formData.name || 'Product Name'}</ProductName>
    <ProductPrice>${formData.priceCase.toFixed(2)}/case</ProductPrice>

    {/* Add to Cart Button */}
    <AddToCartButton>Add to Cart</AddToCartButton>
  </ProductCardPreview>

  <ViewToggle>
    <button onClick={() => setView('desktop')}>Desktop</button>
    <button onClick={() => setView('tablet')}>Tablet</button>
    <button onClick={() => setView('mobile')}>Mobile</button>
  </ViewToggle>
</PreviewCard>
```

---

## API Request/Response Flow

### Create Product Flow

```
User fills form → Clicks "Save" → Validation
                                      ↓
                            Form data serialized to JSON
                                      ↓
                            POST /api/products/manage
                            Headers: { Authorization: Bearer <token> }
                            Body: { name, sku, priceCase, ... }
                                      ↓
                            Server: verifyToken() middleware
                                      ↓
                            Server: authorize('ADMIN') middleware
                                      ↓
                            Server: Validation checks
                                      ↓
                            Server: prisma.product.create()
                                      ↓
                            Database: INSERT INTO products
                                      ↓
                            Server: Return created product
                                      ↓
                            Client: Update product list
                                      ↓
                            Client: Close drawer
                                      ↓
                            Client: Show success toast
```

---

### Update Product Flow

```
User selects product → Drawer opens → Load product data
                                           ↓
                            GET /api/products/manage/:id
                                           ↓
                            Server: Fetch product with relations
                                           ↓
                            Client: Populate form
                                           ↓
                            User edits → Clicks "Save"
                                           ↓
                            PUT /api/products/manage/:id
                            Body: { updated fields }
                                           ↓
                            Server: Validate changes
                                           ↓
                            Server: prisma.product.update()
                                           ↓
                            Database: UPDATE products SET ...
                                           ↓
                            Server: Return updated product
                                           ↓
                            Client: Refresh list item
                                           ↓
                            Client: Close drawer
```

---

## Security & Authorization

### Role-Based Access Control

```typescript
// Middleware stack
app.use('/api/products/manage',
  verifyToken,           // Check JWT
  authorize('ADMIN'),    // Check role
  productRouter          // Handle request
);

// Authorization logic
function authorize(...allowedRoles: Role[]) {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}
```

### Permission Matrix

| Action | SUPER_ADMIN | ADMIN | SALES_REP |
|--------|-------------|-------|-----------|
| View products | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ⚠️ (limited) |
| Delete product | ✅ | ❌ | ❌ |
| Upload images | ✅ | ✅ | ❌ |
| Manage categories | ✅ | ✅ | ❌ |
| Create bundles | ✅ | ✅ | ⚠️ (customer-specific) |
| Set prices | ✅ | ✅ | ❌ |
| Request price override | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ |

---

## Performance Considerations

### Optimizations

1. **Pagination**: Load 50 products at a time
2. **Lazy Loading**: Load images on scroll
3. **Debounced Search**: Wait 300ms after typing
4. **Optimistic Updates**: Show changes immediately, sync in background
5. **Image CDN**: Serve images from CDN (Cloudflare, AWS)
6. **Caching**: Cache product list for 5 minutes

### Database Queries

```typescript
// Optimized product list query
const products = await prisma.product.findMany({
  where: filters,
  include: {
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logoUrl: true } },
    images: { orderBy: { sort_order: 'asc' }, take: 1 }, // Only first image
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

---

## Error Handling

### Client-Side Validation

```typescript
function validateProductForm(data: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  if (!data.sku || !/^[A-Z0-9-]+$/.test(data.sku)) {
    errors.sku = 'SKU must contain only uppercase letters, numbers, and hyphens';
  }

  if (data.priceCase <= 0) {
    errors.priceCase = 'Price must be greater than 0';
  }

  if (data.unitsPerCase < 1) {
    errors.unitsPerCase = 'Units per case must be at least 1';
  }

  return errors;
}
```

### Server-Side Error Responses

```typescript
// Validation error
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "fields": {
    "name": "Name is required",
    "sku": "SKU must be unique"
  }
}

// Duplicate entry error
{
  "error": "DUPLICATE_ENTRY",
  "message": "Product with this SKU already exists",
  "field": "sku"
}

// Not found error
{
  "error": "NOT_FOUND",
  "message": "Product not found"
}

// Authorization error
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions to perform this action"
}
```

---

## Future Enhancements

See [future.md](./future.md) for detailed roadmap.

**Summary**:
- AI-powered image generation
- Bulk import/export (CSV, Excel)
- Version history and rollback
- Approval workflows
- Advanced analytics dashboard
- Mobile admin app
- Voice-controlled editing (experimental)

---

## Quick Reference

### Key Files
- `/src/api/products/manage.js` - Product management API
- `/src/components/admin/ProductEditor.tsx` - Editor UI (future)
- `/src/components/admin/VisualPresets.tsx` - Preset selector (future)

### Key Endpoints
- `GET /api/products/manage` - List products
- `POST /api/products/manage` - Create product
- `PUT /api/products/manage/:id` - Update product
- `DELETE /api/products/manage/:id` - Delete product
- `POST /api/upload` - Upload image

### Key Concepts
- **Visual Presets**: Pre-designed themes for quick styling
- **Smart DSD**: AI-powered reorder and bundle suggestions
- **Role-Based Access**: Different capabilities per admin persona
- **Live Preview**: Real-time card preview while editing

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Status**: Production Ready
