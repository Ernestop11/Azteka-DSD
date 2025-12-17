# Product Manager - Final Production Documentation

## Overview

The Azteka DSD Admin Product Manager is a comprehensive, production-ready administrative interface for managing products, categories, brands, and front-page layouts with advanced features including CSV import, real-time validation, toast notifications, and configurable settings.

## Table of Contents

1. [Features](#features)
2. [Module Structure](#module-structure)
3. [Installation & Setup](#installation--setup)
4. [Components](#components)
5. [API Integration](#api-integration)
6. [Validation System](#validation-system)
7. [Toast Notifications](#toast-notifications)
8. [CSV Import](#csv-import)
9. [Settings Management](#settings-management)
10. [Production Deployment](#production-deployment)

---

## Features

### Core Features

✅ **Product Management**
- Full CRUD operations with comprehensive validation
- Image upload with size and type validation (max 5MB, PNG/JPEG)
- Support for pricing, inventory, categories, and brands
- Dual field naming support (camelCase/snake_case)
- Product search and filtering

✅ **Category & Brand Management**
- Simple CRUD interfaces
- Real-time toast notifications for all operations

✅ **Front-Page Layout Editor**
- Drag-and-drop section ordering
- 5 section types: Hero, Two-Column Grid, Brand Row, Bundle Block, Scrolling Section
- Live device preview (Galaxy Tab S9 FE simulation)

✅ **CSV Import**
- Bulk product import from CSV files
- Template download for correct formatting
- Validation and error reporting
- Progress feedback with toast notifications

✅ **Settings Page**
- Featured products limit configuration
- Default product sorting
- Brand display order management
- Homepage category selection
- Product reviews toggle
- Out-of-stock purchase settings

✅ **User Experience**
- Toast notifications for success/error feedback
- Form validation with inline error messages
- Loading states for async operations
- Responsive design with Tailwind CSS

---

## Module Structure

```
src/modules/product-manager/
├── index.tsx                          # Main component with state management
├── types/index.ts                     # TypeScript type definitions
├── api/
│   ├── products.ts                    # Product API (CRUD + CSV import)
│   ├── categories.ts                  # Category API
│   ├── brands.ts                      # Brand API
│   └── sections.ts                    # Front-page layout API
└── components/
    ├── ProductForm.tsx                # Product create/edit form with validation
    ├── ProductList.tsx                # Product grid with search and CSV import
    ├── CategoryManager.tsx            # Category CRUD UI
    ├── BrandManager.tsx               # Brand CRUD UI
    ├── LayoutEditor.tsx               # Drag-and-drop layout editor
    ├── SortableSection.tsx            # Draggable section component
    ├── SectionEditor.tsx              # Section configuration modal
    ├── LayoutPreview.tsx              # Device preview modal
    ├── Toast.tsx                      # Toast notification system
    └── SettingsPage.tsx               # Admin configuration UI
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Add Route in `src/main.tsx`

```typescript
import ProductManager from './modules/product-manager';

// Inside your router:
<Route path="/admin/products" element={<ProductManager />} />
```

### 3. Backend Requirements

Ensure these API endpoints are implemented:

#### Products
- `GET /api/products` - Fetch all products
- `POST /api/products/manage` - Create product (requires ADMIN auth)
- `PUT /api/products/manage/:id` - Update product (requires ADMIN auth)
- `DELETE /api/products/manage/:id` - Delete product (requires ADMIN auth)
- `POST /api/products/import` - CSV import (requires ADMIN auth)
- `POST /api/upload` - Image upload

#### Categories
- `GET /api/categories` - Fetch all categories (requires ADMIN auth)
- `POST /api/categories` - Create category (requires ADMIN auth)
- `PUT /api/categories/:id` - Update category (requires ADMIN auth)
- `DELETE /api/categories/:id` - Delete category (requires ADMIN auth)

#### Brands
- `GET /api/brands` - Fetch all brands (requires ADMIN auth)
- `POST /api/brands` - Create brand (requires ADMIN auth)
- `PUT /api/brands/:id` - Update brand (requires ADMIN auth)
- `DELETE /api/brands/:id` - Delete brand (requires ADMIN auth)

#### Front-Page Layout (Optional)
- `GET /api/front-page/layouts/active` - Get active layout
- `PUT /api/front-page/layouts/:id` - Update layout (requires ADMIN auth)

---

## Components

### ProductForm Component

**Location:** `src/modules/product-manager/components/ProductForm.tsx`

**Features:**
- Comprehensive validation for all fields
- Image upload with preview
- Real-time error display
- Support for product variants and pricing

**Validation Rules:**
- **Name:** Required, min 3 characters
- **SKU:** Required, min 2 characters
- **Price:** Required, > 0, < $999,999
- **Cost:** Optional, ≥ 0, ≤ price
- **Stock:** ≥ 0, < 999,999
- **Units per Case:** 1-1,000
- **Min Order Qty:** 1-1,000
- **Image:** PNG/JPEG only, max 5MB

**Usage:**
```tsx
<ProductForm
  product={editingProduct}
  categories={categories}
  brands={brands}
  onSubmit={handleCreateOrUpdate}
  onCancel={handleCancel}
/>
```

### ProductList Component

**Location:** `src/modules/product-manager/components/ProductList.tsx`

**Features:**
- Product search by name/SKU
- Category filtering
- CSV import button and modal
- Edit/Delete actions with confirmation

**Usage:**
```tsx
<ProductList
  products={products}
  onEdit={setEditingProduct}
  onDelete={handleDeleteProduct}
  onImportCSV={handleImportCSV}
/>
```

### Toast Component

**Location:** `src/modules/product-manager/components/Toast.tsx`

**Types:** `success`, `error`, `warning`

**Usage:**
```typescript
showToast('Product created successfully!', 'success');
showToast('Failed to delete product', 'error');
```

### SettingsPage Component

**Location:** `src/modules/product-manager/components/SettingsPage.tsx`

**Configuration Options:**
1. Featured Products Limit (1-50)
2. Default Sorting (name, price-asc, price-desc, newest, popular)
3. Brand Display Order (drag to reorder)
4. Homepage Categories (multi-select)
5. Enable Product Reviews (checkbox)
6. Allow Out-of-Stock Purchase (checkbox)

**Storage:** Settings are stored in localStorage as `productManagerSettings`

---

## API Integration

### Authentication

All admin endpoints require JWT token authentication:

```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

### Products API

#### Create Product
```typescript
const handleCreateProduct = async (formData: FormData) => {
  const result = await productsApi.create(formData);
  // result: Product object
};
```

#### Update Product
```typescript
const handleUpdateProduct = async (id: string, formData: FormData) => {
  const result = await productsApi.update(id, formData);
  // result: Updated Product object
};
```

#### Delete Product
```typescript
const handleDeleteProduct = async (id: string) => {
  await productsApi.delete(id);
};
```

#### Import CSV
```typescript
const handleImportCSV = async (file: File) => {
  const result = await productsApi.importCSV(file);
  // result: { success: boolean, imported: number, errors?: string[] }
};
```

### Image Upload

**Two-Step Process:**
1. Upload image file to `/api/upload`
2. Receive image URL
3. Include URL in product data

```typescript
// Handled automatically by productsApi.create() and productsApi.update()
const imageFormData = new FormData();
imageFormData.append('image', imageFile);

const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: imageFormData,
});

const { url } = await uploadResponse.json();
```

---

## Validation System

### Form-Level Validation

The ProductForm component validates on submit:

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Required fields
  if (!formData.name.trim()) {
    newErrors.name = 'Product name is required';
  }

  // Numeric validations
  if (formData.price <= 0) {
    newErrors.price = 'Price must be greater than 0';
  }

  if (formData.cost > formData.price) {
    newErrors.cost = 'Cost should not exceed price';
  }

  // Image validation
  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    newErrors.image = 'Image must be less than 5MB';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Real-Time Error Clearing

Errors are cleared as the user corrects them:

```typescript
onChange={(e) => {
  setFormData({ ...formData, name: e.target.value });
  if (errors.name) setErrors({ ...errors, name: '' });
}}
```

---

## Toast Notifications

### Toast System Architecture

**Components:**
- `Toast`: Individual toast message with auto-dismiss
- `ToastContainer`: Manages multiple toasts

**Features:**
- Auto-dismiss after 4 seconds
- Manual dismiss button
- Stacked display (top-right)
- Slide-in animation

### Implementation

**In Main Component:**
```typescript
const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

const showToast = (message: string, type: ToastType) => {
  const id = `toast-${Date.now()}`;
  setToasts((prev) => [...prev, { id, message, type }]);
};

const removeToast = (id: string) => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
};

// In JSX:
<ToastContainer toasts={toasts} onRemove={removeToast} />
```

### Usage Examples

```typescript
// Success
showToast('Product created successfully!', 'success');

// Error
showToast('Failed to update product. Please try again.', 'error');

// Warning
showToast('This action cannot be undone', 'warning');
```

---

## CSV Import

### CSV Format

**Template Header:**
```csv
name,sku,description,price,cost,stock,categoryId,brandId,inStock,featured
```

**Example Row:**
```csv
Example Product,SKU001,Product description,99.99,50.00,100,cat-id,brand-id,true,false
```

### Import Process

1. **User clicks "Import CSV"** button in ProductList
2. **Modal opens** with:
   - Template download link
   - File selection input
3. **User selects CSV file**
4. **Validation** occurs client-side:
   - Must be `.csv` file
   - Size limits apply
5. **File uploaded** to `/api/products/import`
6. **Backend processes** CSV and returns result
7. **Toast notification** shows success/failure
8. **Product list reloads** if successful

### Backend CSV Import Route

**Expected:** `POST /api/products/import`

**Request:** FormData with `csv` file

**Response:**
```json
{
  "success": true,
  "imported": 25,
  "errors": []
}
```

---

## Settings Management

### Settings Schema

```typescript
interface SettingsConfig {
  featuredProductsLimit: number;
  defaultSorting: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'popular';
  defaultBrandOrder: string[];
  homePageCategories: string[];
  enableProductReviews: boolean;
  enableOutOfStockPurchase: boolean;
}
```

### Storage

Settings are stored in `localStorage` under the key `productManagerSettings`:

```typescript
// Save
localStorage.setItem('productManagerSettings', JSON.stringify(settings));

// Load
const settings = JSON.parse(localStorage.getItem('productManagerSettings') || '{}');
```

### Future Backend Integration

When backend settings endpoint is implemented:

**Endpoint:** `PUT /api/settings/product-manager`

**Request Body:**
```json
{
  "featuredProductsLimit": 6,
  "defaultSorting": "newest",
  "defaultBrandOrder": ["brand-1", "brand-2"],
  "homePageCategories": ["cat-1", "cat-2"],
  "enableProductReviews": true,
  "enableOutOfStockPurchase": false
}
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All TypeScript compilation errors resolved
- [ ] Backend API endpoints implemented
- [ ] Authentication middleware configured
- [ ] Image upload endpoint configured with proper storage
- [ ] Database migrations run (if using Prisma schema from README)
- [ ] Environment variables configured
- [ ] CORS settings configured for admin domain

### Environment Variables

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
UPLOAD_DIR="/path/to/uploads"
MAX_FILE_SIZE="5242880"  # 5MB in bytes

# Frontend (if needed)
VITE_API_BASE_URL="https://api.yourdomain.com"
```

### Security Considerations

1. **Authentication:** All admin routes require JWT token
2. **Authorization:** ADMIN role required for product management
3. **File Upload:** Validate file types and sizes server-side
4. **SQL Injection:** Use Prisma ORM for safe database queries
5. **XSS Protection:** All user input is sanitized by React
6. **CSRF Protection:** Implement CSRF tokens for state-changing operations

### Performance Optimization

1. **Image Optimization:**
   - Resize images on upload
   - Use WebP format when supported
   - Implement lazy loading for product grid

2. **Data Fetching:**
   - Implement pagination for large product lists
   - Add caching headers for product images
   - Use React Query or SWR for data fetching (optional)

3. **Bundle Size:**
   - Code splitting for Product Manager module
   - Tree shaking for icon libraries
   - Lazy load preview components

### Monitoring & Analytics

**Recommended tracking:**
- Product CRUD operation metrics
- CSV import success/failure rates
- Image upload performance
- User interaction with settings
- Error rates by operation type

---

## Troubleshooting

### Common Issues

**1. CSV Import Fails**
- **Check:** Backend `/api/products/import` endpoint exists
- **Check:** CSV format matches template
- **Check:** Authentication token is valid

**2. Images Not Uploading**
- **Check:** Backend `/api/upload` endpoint configured
- **Check:** File size < 5MB
- **Check:** File type is PNG or JPEG
- **Check:** Upload directory has write permissions

**3. Toast Notifications Not Showing**
- **Check:** `ToastContainer` is rendered in Product Manager
- **Check:** Tailwind animation classes are compiled
- **Check:** `slideIn` animation is in CSS/Tailwind config

**4. Validation Not Working**
- **Check:** Form submission triggers `validateForm()`
- **Check:** Error state is initialized
- **Check:** Input fields have proper onChange handlers

### Debug Mode

Enable debug logging:

```typescript
// In api files
if (process.env.NODE_ENV === 'development') {
  console.log('API Request:', endpoint, data);
  console.log('API Response:', response);
}
```

---

## API Reference Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/products` | GET | No | List all products |
| `/api/products/manage` | POST | ADMIN | Create product |
| `/api/products/manage/:id` | PUT | ADMIN | Update product |
| `/api/products/manage/:id` | DELETE | ADMIN | Delete product |
| `/api/products/import` | POST | ADMIN | Import CSV |
| `/api/upload` | POST | No | Upload image |
| `/api/categories` | GET | ADMIN | List categories |
| `/api/categories` | POST | ADMIN | Create category |
| `/api/categories/:id` | PUT | ADMIN | Update category |
| `/api/categories/:id` | DELETE | ADMIN | Delete category |
| `/api/brands` | GET | ADMIN | List brands |
| `/api/brands` | POST | ADMIN | Create brand |
| `/api/brands/:id` | PUT | ADMIN | Update brand |
| `/api/brands/:id` | DELETE | ADMIN | Delete brand |
| `/api/front-page/layouts/active` | GET | No | Get active layout |
| `/api/front-page/layouts/:id` | PUT | ADMIN | Update layout |

---

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Features**
   - [ ] Product variants (size, color, etc.)
   - [ ] Bulk edit multiple products
   - [ ] Product duplication
   - [ ] Advanced search with filters
   - [ ] Product analytics dashboard

2. **Inventory Management**
   - [ ] Low stock alerts
   - [ ] Automated reordering
   - [ ] Inventory history tracking
   - [ ] Multi-warehouse support

3. **UI/UX Improvements**
   - [ ] Keyboard shortcuts
   - [ ] Undo/redo functionality
   - [ ] Product preview before save
   - [ ] Drag-and-drop image upload
   - [ ] Mobile-optimized admin view

4. **Integration**
   - [ ] QuickBooks sync for product data
   - [ ] Shopify/WooCommerce import
   - [ ] Barcode scanning for SKU
   - [ ] Automated image optimization

---

## Support

For issues or questions:
- Check [PRODUCT_MANAGER_README.md](./PRODUCT_MANAGER_README.md) for basic implementation
- Review this document for production features
- Check backend API documentation
- Contact development team

---

## License

MIT

---

## Version History

**v2.0.0** (Production Release)
- ✅ Added comprehensive form validation
- ✅ Implemented toast notification system
- ✅ Added CSV import functionality
- ✅ Created settings management page
- ✅ Enhanced error handling and user feedback
- ✅ Production-ready code with full documentation

**v1.0.0** (Initial Release)
- Basic CRUD operations
- Layout editor
- Category and brand management

---

**Document Generated:** 2025-01-14
**Last Updated:** 2025-01-14
**Status:** Production Ready ✅
