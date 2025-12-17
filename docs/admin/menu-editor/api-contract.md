# Admin Menu Editor API Contract

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Define complete API contracts for all product management endpoints

---

## Overview

This document specifies the exact API format for all admin menu editor operations:
- Request/response JSON schemas
- Authentication requirements
- Validation rules
- Error codes and messages
- Example payloads

**Base URL**: `/api/products/manage`

**Authentication**: All endpoints require JWT token with appropriate role:
- SUPER_ADMIN: Full access
- ADMIN: Create, read, update (no delete)
- SALES_REP: Read-only + customer price overrides

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [List Products (GET)](#2-list-products-get)
3. [Get Single Product (GET)](#3-get-single-product-get)
4. [Create Product (POST)](#4-create-product-post)
5. [Update Product (PUT)](#5-update-product-put)
6. [Delete Product (DELETE)](#6-delete-product-delete)
7. [Bulk Import (POST)](#7-bulk-import-post)
8. [Image Upload (POST)](#8-image-upload-post)
9. [Error Codes Reference](#9-error-codes-reference)
10. [Rate Limiting & Performance](#10-rate-limiting--performance)

---

## 1. Authentication & Authorization

### Headers Required

All requests must include:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### JWT Token Payload

```json
{
  "userId": "uuid-here",
  "email": "admin@azteka.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Authorization Matrix

| Endpoint | SUPER_ADMIN | ADMIN | SALES_REP |
|----------|-------------|-------|-----------|
| GET /api/products/manage | ✅ | ✅ | ✅ |
| GET /api/products/manage/:id | ✅ | ✅ | ✅ |
| POST /api/products/manage | ✅ | ✅ | ❌ |
| PUT /api/products/manage/:id | ✅ | ✅ | 🔶 Limited* |
| DELETE /api/products/manage/:id | ✅ | ❌ | ❌ |

*SALES_REP can only update customer-specific price overrides, not core product data.

---

## 2. List Products (GET)

**Endpoint**: `GET /api/products/manage`

**Purpose**: Retrieve paginated list of products with filtering and sorting

### Request

**Query Parameters**:

```typescript
interface ListProductsQuery {
  page?: number;           // Default: 1
  limit?: number;          // Default: 50, Max: 100
  search?: string;         // Search in name, SKU, description
  category?: string;       // Filter by category ID
  brand?: string;          // Filter by brand ID
  active?: boolean;        // Filter by active status
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';  // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc';  // Default: 'desc'
}
```

**Example Request**:

```http
GET /api/products/manage?page=1&limit=20&category=beverages&sortBy=name&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_abc123",
        "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
        "slug": "coca-cola-classic-12oz-cans-24-pack",
        "sku": "COKE-12OZ-24",
        "description": "Classic Coca-Cola in convenient 12oz cans",
        "priceCase": 24.99,
        "unitsPerCase": 24,
        "unitType": "can",
        "active": true,
        "categoryId": "cat_beverages",
        "category": {
          "id": "cat_beverages",
          "name": "Beverages",
          "slug": "beverages"
        },
        "brandId": "brand_cocacola",
        "brand": {
          "id": "brand_cocacola",
          "name": "Coca-Cola",
          "logoUrl": "https://cdn.azteka.com/brands/cocacola.png"
        },
        "imageUrl": "https://cdn.azteka.com/products/coke-12oz-24.png",
        "backgroundColor": "#FF6B35",
        "gradientStart": "#FF6B35",
        "gradientEnd": "#F7931E",
        "cardTheme": "elevated",
        "badgeText": "BESTSELLER",
        "badgeColor": "red",
        "featured": true,
        "trackInventory": true,
        "currentStock": 150,
        "lowStockAlert": 30,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:45:00Z"
      },
      // ... more products
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Error (401 Unauthorized)**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## 3. Get Single Product (GET)

**Endpoint**: `GET /api/products/manage/:id`

**Purpose**: Retrieve complete details for a single product

### Request

**Path Parameters**:
- `id` (string, required): Product ID

**Example Request**:

```http
GET /api/products/manage/prod_abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
    "slug": "coca-cola-classic-12oz-cans-24-pack",
    "sku": "COKE-12OZ-24",
    "description": "Classic Coca-Cola in convenient 12oz cans, perfect for individual serving.",

    // Pricing
    "priceCase": 24.99,
    "unitsPerCase": 24,
    "unitType": "can",
    "msrp": 29.99,
    "minimumOrderQuantity": 1,

    // Categorization
    "categoryId": "cat_beverages",
    "category": {
      "id": "cat_beverages",
      "name": "Beverages",
      "slug": "beverages"
    },
    "brandId": "brand_cocacola",
    "brand": {
      "id": "brand_cocacola",
      "name": "Coca-Cola",
      "logoUrl": "https://cdn.azteka.com/brands/cocacola.png"
    },
    "tags": ["bestseller", "summer-favorite"],

    // Inventory
    "trackInventory": true,
    "currentStock": 150,
    "lowStockAlert": 30,
    "supplierInfo": "Coca-Cola Bottling Co - Route 42",

    // Visual Design
    "imageUrl": "https://cdn.azteka.com/products/coke-12oz-24.png",
    "additionalImages": [
      "https://cdn.azteka.com/products/coke-12oz-24-alt1.png",
      "https://cdn.azteka.com/products/coke-12oz-24-alt2.png"
    ],
    "backgroundColor": "#FF6B35",
    "gradientStart": "#FF6B35",
    "gradientEnd": "#F7931E",
    "gradientDirection": "to-br",
    "cardTheme": "elevated",
    "badgeText": "BESTSELLER",
    "badgeColor": "red",
    "badgePosition": "top-right",

    // Advanced
    "metaDescription": "Buy Coca-Cola Classic 12oz cans in bulk. 24-pack case at wholesale prices.",
    "featured": true,
    "bundleEligible": true,
    "seasonalOverride": null,
    "active": true,

    // Metadata
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "createdBy": {
      "id": "user_admin1",
      "name": "Admin User",
      "email": "admin@azteka.com"
    },
    "lastUpdatedBy": {
      "id": "user_admin1",
      "name": "Admin User",
      "email": "admin@azteka.com"
    }
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 'prod_abc123' not found"
  }
}
```

---

## 4. Create Product (POST)

**Endpoint**: `POST /api/products/manage`

**Purpose**: Create a new product

**Authorization**: SUPER_ADMIN, ADMIN

### Request

**Body (application/json)**:

```json
{
  // Required fields
  "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
  "sku": "COKE-12OZ-24",
  "priceCase": 24.99,
  "unitsPerCase": 24,
  "unitType": "can",
  "categoryId": "cat_beverages",
  "brandId": "brand_cocacola",
  "imageUrl": "https://cdn.azteka.com/products/coke-12oz-24.png",

  // Optional fields
  "description": "Classic Coca-Cola in convenient 12oz cans",
  "msrp": 29.99,
  "minimumOrderQuantity": 1,
  "tags": ["bestseller", "summer-favorite"],

  // Inventory (optional)
  "trackInventory": true,
  "currentStock": 150,
  "lowStockAlert": 30,
  "supplierInfo": "Coca-Cola Bottling Co - Route 42",

  // Visual Design (optional)
  "additionalImages": [
    "https://cdn.azteka.com/products/coke-12oz-24-alt1.png"
  ],
  "backgroundColor": "#FF6B35",
  "gradientStart": "#FF6B35",
  "gradientEnd": "#F7931E",
  "gradientDirection": "to-br",
  "cardTheme": "elevated",
  "badgeText": "BESTSELLER",
  "badgeColor": "red",
  "badgePosition": "top-right",

  // Advanced (optional)
  "metaDescription": "Buy Coca-Cola Classic 12oz cans in bulk",
  "featured": true,
  "bundleEligible": true,
  "active": true
}
```

### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
    "slug": "coca-cola-classic-12oz-cans-24-pack",
    "sku": "COKE-12OZ-24",
    // ... all product fields
    "createdAt": "2024-01-20T15:30:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  },
  "message": "Product created successfully"
}
```

**Error (400 Bad Request) - Validation Failure**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product validation failed",
    "details": [
      {
        "field": "name",
        "message": "Product name is required"
      },
      {
        "field": "sku",
        "message": "SKU must be unique"
      },
      {
        "field": "priceCase",
        "message": "Price must be greater than 0"
      }
    ]
  }
}
```

**Error (409 Conflict) - Duplicate SKU**:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SKU",
    "message": "A product with SKU 'COKE-12OZ-24' already exists",
    "existingProduct": {
      "id": "prod_xyz789",
      "name": "Coca-Cola Classic 12oz - 24 Pack",
      "sku": "COKE-12OZ-24"
    }
  }
}
```

---

## 5. Update Product (PUT)

**Endpoint**: `PUT /api/products/manage/:id`

**Purpose**: Update existing product

**Authorization**: SUPER_ADMIN, ADMIN (full update), SALES_REP (price overrides only)

### Request

**Path Parameters**:
- `id` (string, required): Product ID

**Body (application/json)**:

```json
{
  // Any fields to update (all optional)
  "name": "Coca-Cola Classic 12oz Cans - 24 Pack (Updated)",
  "priceCase": 23.99,
  "currentStock": 200,
  "badgeText": "ON SALE",
  "badgeColor": "orange",
  "active": true
}
```

**Note**: Only include fields you want to update. Omitted fields remain unchanged.

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Coca-Cola Classic 12oz Cans - 24 Pack (Updated)",
    "priceCase": 23.99,
    "currentStock": 200,
    // ... all product fields with updates applied
    "updatedAt": "2024-01-21T10:15:00Z"
  },
  "message": "Product updated successfully"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 'prod_abc123' not found"
  }
}
```

**Error (403 Forbidden) - SALES_REP Attempting Full Update**:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "SALES_REP role can only update customer price overrides",
    "allowedFields": ["customerPriceOverrides"]
  }
}
```

**Error (400 Bad Request) - Invalid Data**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product validation failed",
    "details": [
      {
        "field": "priceCase",
        "message": "Price must be a positive number",
        "received": -10
      }
    ]
  }
}
```

---

## 6. Delete Product (DELETE)

**Endpoint**: `DELETE /api/products/manage/:id`

**Purpose**: Soft delete a product (sets active = false, preserves data)

**Authorization**: SUPER_ADMIN only

### Request

**Path Parameters**:
- `id` (string, required): Product ID

**Query Parameters** (optional):
- `permanent` (boolean): If true, permanently deletes record (dangerous!)

**Example Request**:

```http
DELETE /api/products/manage/prod_abc123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response

**Success (200 OK) - Soft Delete**:

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "name": "Coca-Cola Classic 12oz Cans - 24 Pack",
    "active": false,
    "deletedAt": "2024-01-22T09:00:00Z"
  },
  "message": "Product soft-deleted successfully. Can be restored from admin panel."
}
```

**Success (200 OK) - Permanent Delete**:

```http
DELETE /api/products/manage/prod_abc123?permanent=true
```

```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "deletedPermanently": true
  },
  "message": "Product permanently deleted. This action cannot be undone.",
  "warning": "All associated orders will show 'Product Deleted' in historical records."
}
```

**Error (403 Forbidden) - Not SUPER_ADMIN**:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only SUPER_ADMIN can delete products",
    "yourRole": "ADMIN"
  }
}
```

**Error (409 Conflict) - Product in Active Orders**:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_IN_USE",
    "message": "Cannot delete product with active orders",
    "details": {
      "activeOrders": 5,
      "suggestion": "Consider marking as inactive instead of deleting"
    }
  }
}
```

---

## 7. Bulk Import (POST)

**Endpoint**: `POST /api/products/manage/bulk`

**Purpose**: Import multiple products from CSV/JSON

**Authorization**: SUPER_ADMIN, ADMIN

### Request

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file` (file): CSV or JSON file
- `skipDuplicates` (boolean, optional): Skip products with existing SKUs instead of failing

**CSV Format**:

```csv
name,sku,priceCase,unitsPerCase,unitType,category,brand,imageUrl,active,description
"Coca-Cola Classic 12oz - 24pk","COKE-12OZ-24",24.99,24,"can","Beverages","Coca-Cola","https://...","true","Classic Coca-Cola"
"Pepsi 20oz - 12pk","PEPSI-20OZ-12",19.99,12,"bottle","Beverages","Pepsi","https://...","true","Refreshing Pepsi"
```

**JSON Format**:

```json
{
  "products": [
    {
      "name": "Coca-Cola Classic 12oz - 24pk",
      "sku": "COKE-12OZ-24",
      "priceCase": 24.99,
      "unitsPerCase": 24,
      "unitType": "can",
      "categoryId": "cat_beverages",
      "brandId": "brand_cocacola",
      "imageUrl": "https://...",
      "active": true
    },
    {
      "name": "Pepsi 20oz - 12pk",
      "sku": "PEPSI-20OZ-12",
      "priceCase": 19.99,
      "unitsPerCase": 12,
      "unitType": "bottle",
      "categoryId": "cat_beverages",
      "brandId": "brand_pepsi",
      "imageUrl": "https://...",
      "active": true
    }
  ]
}
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "imported": 45,
    "skipped": 3,
    "failed": 2,
    "total": 50,
    "details": {
      "imported": [
        {
          "sku": "COKE-12OZ-24",
          "id": "prod_abc123",
          "name": "Coca-Cola Classic 12oz - 24pk"
        }
        // ... more
      ],
      "skipped": [
        {
          "sku": "SPRITE-12OZ-24",
          "reason": "SKU already exists",
          "existingId": "prod_xyz789"
        }
        // ... more
      ],
      "failed": [
        {
          "row": 47,
          "sku": "INVALID-SKU",
          "errors": [
            "Price must be greater than 0",
            "Category 'Invalid Category' not found"
          ]
        }
        // ... more
      ]
    }
  },
  "message": "Bulk import completed: 45 imported, 3 skipped, 2 failed"
}
```

**Error (400 Bad Request) - File Validation**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "File must be CSV or JSON format",
    "receivedType": "application/pdf"
  }
}
```

---

## 8. Image Upload (POST)

**Endpoint**: `POST /api/products/manage/upload-image`

**Purpose**: Upload product images to CDN

**Authorization**: SUPER_ADMIN, ADMIN

### Request

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `image` (file, required): Image file (PNG, JPG, WEBP)
- `productId` (string, optional): Associate with existing product
- `type` (string, optional): "primary" or "additional", default "primary"

**File Requirements**:
- **Max size**: 5MB
- **Formats**: PNG, JPG, JPEG, WEBP
- **Recommended dimensions**: 800x800px (1:1 ratio)

**Example Request** (using FormData):

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('productId', 'prod_abc123');
formData.append('type', 'primary');

fetch('/api/products/manage/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "url": "https://cdn.azteka.com/products/coke-12oz-24_1705842600.png",
    "filename": "coke-12oz-24_1705842600.png",
    "size": 245680,
    "dimensions": {
      "width": 800,
      "height": 800
    },
    "optimized": true,
    "productId": "prod_abc123"
  },
  "message": "Image uploaded successfully"
}
```

**Error (400 Bad Request) - File Too Large**:

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit",
    "fileSize": 6291456,
    "maxSize": 5242880
  }
}
```

**Error (400 Bad Request) - Invalid Format**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File must be PNG, JPG, or WEBP",
    "receivedType": "image/gif",
    "allowedTypes": ["image/png", "image/jpeg", "image/webp"]
  }
}
```

**Error (413 Payload Too Large)**:

```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload exceeds server limit"
  }
}
```

---

## 9. Error Codes Reference

### Complete Error Code List

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token | Login again, check token expiration |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role lacks required permissions | Contact admin for role upgrade |
| `PRODUCT_NOT_FOUND` | 404 | Product ID does not exist | Verify product ID, check if deleted |
| `VALIDATION_ERROR` | 400 | Request data failed validation | Fix validation errors listed in details |
| `DUPLICATE_SKU` | 409 | SKU already exists | Use unique SKU or update existing product |
| `INVALID_FILE_FORMAT` | 400 | Uploaded file format not supported | Use PNG, JPG, or WEBP |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit | Compress image, max 5MB |
| `CATEGORY_NOT_FOUND` | 404 | Category ID does not exist | Select valid category from list |
| `BRAND_NOT_FOUND` | 404 | Brand ID does not exist | Select valid brand or create new |
| `PRODUCT_IN_USE` | 409 | Cannot delete product with active orders | Mark as inactive instead |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying |
| `SERVER_ERROR` | 500 | Internal server error | Contact support if persists |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional context
    }
  }
}
```

### Field Validation Error Format

For validation errors on specific fields:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "priceCase",
        "message": "Price must be greater than 0",
        "received": -10,
        "expected": "number > 0"
      },
      {
        "field": "sku",
        "message": "SKU must be unique",
        "received": "COKE-12OZ-24",
        "conflictingId": "prod_xyz789"
      }
    ]
  }
}
```

---

## 10. Rate Limiting & Performance

### Rate Limits

**Standard Limits** (per API key/user):
- **Read operations** (GET): 300 requests/minute
- **Write operations** (POST/PUT): 60 requests/minute
- **Delete operations**: 30 requests/minute
- **Bulk import**: 10 requests/hour
- **Image upload**: 50 requests/hour

**Rate Limit Headers** (included in all responses):

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1705842660
```

**Rate Limit Exceeded Response (429)**:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 45,
    "limit": 300,
    "resetAt": "2024-01-21T10:31:00Z"
  }
}
```

### Performance Benchmarks

**Expected Response Times** (95th percentile):

- GET list products: <200ms
- GET single product: <100ms
- POST create product: <300ms
- PUT update product: <250ms
- DELETE product: <150ms
- POST bulk import (50 products): <5s
- POST image upload: <2s

**Optimization Tips**:

1. **Pagination**: Use reasonable `limit` values (20-50) to reduce payload size
2. **Field Selection**: Future feature to request only needed fields
3. **Caching**: GET responses cached for 60 seconds (use `Cache-Control` headers)
4. **Concurrent Requests**: Batch independent operations in parallel
5. **Bulk Import**: Use for >10 products instead of individual POSTs

---

## 11. Webhook Notifications (Future Feature)

**Purpose**: Notify external systems when products change

### Webhook Events

```json
{
  "event": "product.created",
  "timestamp": "2024-01-21T10:30:00Z",
  "data": {
    "productId": "prod_abc123",
    "name": "Coca-Cola Classic 12oz - 24pk",
    "sku": "COKE-12OZ-24",
    "active": true
  }
}
```

**Available Events**:
- `product.created`
- `product.updated`
- `product.deleted`
- `product.stock_low` (when stock hits low alert threshold)
- `product.out_of_stock`

---

## 12. API Versioning

**Current Version**: v1

**Version Header**:
```http
API-Version: v1
```

**Deprecation Policy**:
- Breaking changes require new version (v2, v3, etc.)
- Old versions supported for minimum 12 months
- Deprecation warnings sent via email and headers

**Deprecation Warning Example**:

```http
Deprecated: true
Sunset: 2025-06-01T00:00:00Z
Link: <https://docs.azteka.com/api/v2>; rel="successor-version"
```

---

## Summary

This API contract provides:

- Complete endpoint specifications for all product management operations
- Request/response JSON schemas with examples
- Authentication and authorization requirements
- Comprehensive error codes and solutions
- Rate limiting and performance guidelines
- Webhook notification system (future)
- API versioning policy

**Related Documentation**:
- [Product Fields Reference](./product-fields.md)
- [Editor Workflow](./editor-workflow.md)
- [Visual Presets Library](./visual-presets.md)

---

**API Support**:
- Email: dev@azteka.com
- Slack: #api-support
- Status: https://status.azteka.com
