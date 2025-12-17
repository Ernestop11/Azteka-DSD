# Future Enhancements - Admin Menu Editor

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Document upcoming features, enhancements, and dependencies for the admin menu editor

---

## Overview

This document outlines planned enhancements to the admin menu editor system, organized by priority and implementation timeline. Each feature includes:

- Feature description and business value
- Technical dependencies
- Implementation complexity
- Estimated timeline
- Success metrics

---

## Table of Contents

1. [Bundle Builder System](#1-bundle-builder-system)
2. [Seasonal Promotion Engine](#2-seasonal-promotion-engine)
3. [Smart Reorder AI](#3-smart-reorder-ai)
4. [Brand Promo Generator](#4-brand-promo-generator)
5. [Customer-Specific Pricing Matrix](#5-customer-specific-pricing-matrix)
6. [Advanced Analytics Dashboard](#6-advanced-analytics-dashboard)
7. [Multi-Language Support](#7-multi-language-support)
8. [Mobile Admin App](#8-mobile-admin-app)
9. [Inventory Forecasting](#9-inventory-forecasting)
10. [QuickBooks Integration](#10-quickbooks-integration)

---

## 1. Bundle Builder System

**Priority**: HIGH
**Timeline**: Q2 2025 (3-4 months)
**Complexity**: High

### Description

Allow admins to create product bundles (multi-product packages) with special pricing, custom visuals, and smart recommendations.

### Business Value

- **Increase Average Order Value**: Bundles encourage customers to buy more
- **Move Slow-Moving Inventory**: Pair slow sellers with bestsellers
- **Seasonal Promotions**: Create holiday-themed bundles
- **Customer Convenience**: Pre-configured product sets

**Example Bundles**:
- "Taco Tuesday Kit": Tortillas + Salsa + Chips + Guacamole
- "Office Essentials": Coffee + Creamer + Sugar + Cups
- "Party Pack": Sodas + Chips + Candy + Napkins

### Feature Specifications

#### Bundle Configuration

**Fields**:
```typescript
interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;

  // Products in bundle
  items: {
    productId: string;
    quantity: number;
    substituteOptions?: string[];  // Alternative products
  }[];

  // Pricing
  totalMsrp: number;           // Sum of individual prices
  bundlePrice: number;         // Discounted bundle price
  savingsAmount: number;       // Auto-calculated
  savingsPercentage: number;   // Auto-calculated

  // Visual
  bundleImageUrl: string;      // Custom bundle image
  gradientStart?: string;
  gradientEnd?: string;
  badgeText?: string;
  badgeColor?: string;

  // Availability
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  stockAvailable: number;      // Based on component products

  // Metadata
  categoryId: string;
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Admin UI: Bundle Builder Workflow

```
Step 1: Create Bundle
  ↓
  - Enter bundle name and description
  - Select category

Step 2: Add Products
  ↓
  - Search and select products
  - Set quantity for each product
  - (Optional) Add substitute options
  - Visual: See running total of MSRP

Step 3: Set Bundle Pricing
  ↓
  - System shows: Total MSRP = $120
  - Admin enters: Bundle Price = $99
  - System calculates: You save $21 (17.5%)
  - Validation: Bundle price must be < total MSRP

Step 4: Design Bundle Card
  ↓
  - Upload custom bundle image OR
  - Auto-generate collage from product images
  - Apply visual preset
  - Set badge (e.g., "BUNDLE DEAL", "SAVE 20%")

Step 5: Set Availability
  ↓
  - Active status toggle
  - Optional: Set start/end dates for limited-time offers
  - System tracks stock based on component products

Step 6: Preview & Save
  ↓
  - Live preview of bundle card in catalog
  - Save bundle
  - Appears in customer catalog with "Bundle" filter tag
```

### Technical Dependencies

**Database**:
- New `Bundle` model in Prisma schema
- `BundleItem` junction table (Bundle ↔ Product)
- Migration to add tables

**API**:
- `POST /api/bundles/manage` - Create bundle
- `GET /api/bundles/manage` - List bundles
- `PUT /api/bundles/manage/:id` - Update bundle
- `DELETE /api/bundles/manage/:id` - Delete bundle
- `GET /api/bundles/:id/stock-check` - Real-time stock availability

**Frontend**:
- `BundleBuilder.tsx` - Main bundle creation component
- `BundleCard.tsx` - Display bundle in catalog
- `BundleDetail.tsx` - Bundle detail view for customers
- Update cart logic to handle bundles

**Logic**:
- Stock calculation: Bundle stock = MIN(product1.stock/qty1, product2.stock/qty2, ...)
- Substitute handling: If primary product out of stock, suggest substitute
- Cart validation: Ensure all bundle items still in stock at checkout

### Success Metrics

- **Adoption**: 30% of customers purchase at least one bundle within first month
- **AOV Increase**: 25% higher average order value for orders with bundles
- **Inventory Movement**: 40% reduction in slow-moving inventory through bundles
- **Admin Usage**: 80% of admins create at least 3 bundles within first week

---

## 2. Seasonal Promotion Engine

**Priority**: HIGH
**Timeline**: Q2 2025 (2-3 months)
**Complexity**: Medium

### Description

Automated system to apply seasonal overlays, badges, and pricing adjustments based on calendar dates and events.

### Business Value

- **Timely Marketing**: Auto-activate holiday themes without manual work
- **Sales Boost**: Seasonal promotions drive urgency and increase conversions
- **Reduced Admin Workload**: Set once, runs automatically
- **Consistent Branding**: Ensure catalog reflects current season/holiday

### Feature Specifications

#### Seasonal Campaign Configuration

**Fields**:
```typescript
interface SeasonalCampaign {
  id: string;
  name: string;
  type: 'holiday' | 'seasonal' | 'custom';

  // Schedule
  startDate: Date;
  endDate: Date;
  timezone: string;

  // Visual Changes
  applyOverlay: boolean;
  overlayPreset: string;          // e.g., "Holiday-Winter"
  applyBadge: boolean;
  badgeText: string;              // e.g., "Holiday Special"
  badgeColor: string;

  // Pricing
  applyDiscount: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;

  // Targeting
  applyToAll: boolean;
  categories?: string[];          // Only apply to these categories
  brands?: string[];              // Only apply to these brands
  products?: string[];            // Only apply to specific products
  tags?: string[];                // Only apply to tagged products

  // Status
  active: boolean;
  priority: number;               // Higher priority wins if campaigns overlap

  createdAt: Date;
  updatedAt: Date;
}
```

#### Pre-Configured Seasonal Templates

**Winter Holidays** (Dec 1 - Jan 5):
- Overlay: `Holiday-Christmas` → `Holiday-NewYear`
- Badge: "Holiday Special"
- Discount: 10% off select items

**Valentine's Day** (Feb 1 - Feb 14):
- Overlay: `Holiday-Valentine`
- Badge: "Valentine's"
- Target: Candy, chocolate, romantic gift items

**Spring Refresh** (Mar 1 - May 31):
- Overlay: `Holiday-Spring`
- Badge: "Spring Fresh"
- Target: Fresh produce, beverages, outdoor items

**Summer Splash** (Jun 1 - Aug 31):
- Overlay: `Holiday-Summer`
- Badge: "Summer Hit"
- Discount: 15% off beverages

**Fall Harvest** (Sep 1 - Nov 30):
- Overlay: `Holiday-Fall`
- Badge: "Fall Favorite"
- Target: Seasonal items, pumpkin spice, comfort foods

**Halloween** (Oct 1 - Oct 31):
- Overlay: `Holiday-Halloween`
- Badge: "Spooky!"
- Target: Candy, party items

### Admin Workflow

```
Step 1: Navigate to Seasonal Campaigns
  ↓
Step 2: Choose Template or Create Custom
  ↓
  [Winter Holidays] [Valentine's] [Summer] [Custom]
  ↓
Step 3: Configure Campaign
  ↓
  - Name: "Winter Wonderland Sale"
  - Dates: Dec 1, 2025 - Jan 5, 2026
  - Visual: Select overlay preset
  - Discount: 10% off
  - Target: All beverages and snacks
  ↓
Step 4: Preview
  ↓
  - See product cards with campaign applied
  - Toggle between "Before" and "After" views
  ↓
Step 5: Schedule Campaign
  ↓
  - Save campaign
  - System automatically activates on start date
  - Sends admin notification when live
  - Auto-deactivates on end date
```

### Technical Dependencies

**Database**:
- New `SeasonalCampaign` model
- `CampaignProduct` junction table

**Backend**:
- Cron job to check and activate/deactivate campaigns daily
- API endpoints for campaign CRUD
- Campaign priority resolver (if multiple campaigns overlap)

**Frontend**:
- Campaign manager UI
- Product card logic to apply seasonal overlays
- Preview mode for testing campaigns

**Logic**:
```javascript
// Pseudo-code for campaign application
function applySeasonalCampaigns(product) {
  const activeCampaigns = getCampaignsForDate(new Date());
  const applicableCampaigns = activeCampaigns.filter(c =>
    c.applyToAll ||
    c.categories.includes(product.categoryId) ||
    c.products.includes(product.id)
  );

  if (applicableCampaigns.length === 0) return product;

  // Apply highest priority campaign
  const campaign = applicableCampaigns.sort((a, b) => b.priority - a.priority)[0];

  return {
    ...product,
    overlayPreset: campaign.applyOverlay ? campaign.overlayPreset : product.overlayPreset,
    badgeText: campaign.applyBadge ? campaign.badgeText : product.badgeText,
    badgeColor: campaign.applyBadge ? campaign.badgeColor : product.badgeColor,
    priceCase: campaign.applyDiscount ?
      calculateDiscount(product.priceCase, campaign) :
      product.priceCase,
    isOnSale: campaign.applyDiscount
  };
}
```

### Success Metrics

- **Campaign Adoption**: 90% of admins use at least one seasonal template
- **Sales Increase**: 35% increase in sales during seasonal campaigns
- **Time Saved**: 80% reduction in manual product updates for holidays
- **Customer Engagement**: 50% increase in catalog visits during campaigns

---

## 3. Smart Reorder AI

**Priority**: MEDIUM
**Timeline**: Q3 2025 (4-5 months)
**Complexity**: Very High

### Description

AI-powered system that analyzes customer order history and suggests optimal reorder quantities, frequencies, and products.

### Business Value

- **Increase Repeat Orders**: Proactive reorder suggestions drive repeat purchases
- **Reduce Stockouts**: Predict when customers will run out
- **Personalized Experience**: Tailored suggestions per customer
- **Sales Rep Efficiency**: Pre-filled orders save time

### Feature Specifications

#### AI Model Training Data

**Input Features**:
- Customer order history (product, quantity, frequency)
- Seasonal patterns (summer = more beverages)
- Day-of-week patterns (Fridays = more party items)
- Product category consumption rates
- Competitor pricing data (future)
- Local events calendar (future)

**Output Predictions**:
- **Next Reorder Date**: When customer likely needs to reorder
- **Suggested Quantity**: How much to order based on consumption rate
- **Confidence Score**: Model confidence (0-100%)
- **Trend**: Increasing/decreasing/stable consumption

#### Example AI Suggestions

**Customer**: "Joe's Corner Store"
**Last Order**: Jan 1, 2025 (100 cases Coca-Cola)
**Order Frequency**: Every 14 days
**Average Consumption**: 7 cases/day

**AI Prediction**:
```json
{
  "customerId": "cust_joe123",
  "suggestions": [
    {
      "productId": "prod_coke_12oz",
      "productName": "Coca-Cola 12oz - 24pk",
      "suggestedQuantity": 100,
      "confidenceScore": 92,
      "reasoning": "Based on 14-day reorder cycle and 7 cases/day consumption",
      "nextReorderDate": "2025-01-15",
      "daysUntilReorder": 3,
      "trend": "stable",
      "alertType": "upcoming_reorder"
    },
    {
      "productId": "prod_lays_1oz",
      "productName": "Lay's Chips 1oz - 50pk",
      "suggestedQuantity": 40,
      "confidenceScore": 87,
      "reasoning": "Historical pairing with Coca-Cola orders",
      "nextReorderDate": "2025-01-16",
      "daysUntilReorder": 4,
      "trend": "increasing",
      "alertType": "upsell_opportunity"
    },
    {
      "productId": "prod_doritos_1oz",
      "productName": "Doritos 1oz - 50pk",
      "suggestedQuantity": 0,
      "confidenceScore": 65,
      "reasoning": "Not ordered in last 3 cycles, may have switched suppliers",
      "nextReorderDate": null,
      "trend": "declining",
      "alertType": "lost_product"
    }
  ],
  "generatedAt": "2025-01-12T10:00:00Z"
}
```

### Admin Features

#### Reorder Dashboard

**View**:
```
┌───────────────────────────────────────────┐
│  Smart Reorder Suggestions                │
│                                           │
│  Joe's Corner Store                       │
│  Last Order: 3 days ago                   │
│  Next Predicted Reorder: Tomorrow         │
│  Confidence: 92%                          │
│                                           │
│  Suggested Products:                      │
│  ┌─────────────────────────────────────┐ │
│  │ Coca-Cola 12oz - 24pk               │ │
│  │ Suggested: 100 cases                │ │
│  │ Based on 7 cases/day consumption    │ │
│  │ [Add to Draft Order]                │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Lay's Chips 1oz - 50pk              │ │
│  │ Suggested: 40 cases                 │ │
│  │ Often ordered with Coca-Cola        │ │
│  │ [Add to Draft Order]                │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  [Create Order from Suggestions]          │
└───────────────────────────────────────────┘
```

#### Sales Rep Notifications

**Email Alert**:
```
Subject: Reorder Reminder - Joe's Corner Store

Hi [Sales Rep],

Our AI predicts Joe's Corner Store will need to reorder soon:

• Coca-Cola 12oz - 24pk: 100 cases (92% confidence)
• Lay's Chips 1oz - 50pk: 40 cases (87% confidence)

Next predicted order date: Tomorrow

[Create Pre-Filled Order] [View Full Suggestions]
```

### Technical Dependencies

**AI/ML Stack**:
- Python backend with scikit-learn or TensorFlow
- Time-series forecasting (ARIMA, Prophet, or LSTM)
- Feature engineering pipeline
- Model retraining scheduler (weekly)

**Data**:
- Historical order data (minimum 6 months for training)
- Product consumption rates
- Seasonal adjustment factors

**API**:
- `GET /api/ai/reorder-suggestions/:customerId` - Get suggestions
- `POST /api/ai/retrain-model` - Trigger model retraining (admin only)
- `GET /api/ai/model-metrics` - Model performance metrics

**Frontend**:
- Reorder dashboard component
- One-click "Create Order from Suggestions" button
- Confidence score visualization

### Success Metrics

- **Model Accuracy**: 85%+ prediction accuracy for reorder dates
- **Adoption**: 60% of sales reps use AI suggestions for at least 50% of orders
- **Repeat Order Increase**: 40% increase in repeat orders
- **Time Saved**: 70% reduction in time spent creating routine reorder orders

---

## 4. Brand Promo Generator

**Priority**: MEDIUM
**Timeline**: Q3 2025 (2-3 months)
**Complexity**: Medium

### Description

Tool for brand manufacturers to create promotional campaigns for their products, including custom visuals, pricing, and limited-time offers.

### Business Value

- **Co-Marketing**: Share marketing burden with brand partners
- **Exclusive Deals**: Attract customers with brand-sponsored promotions
- **Revenue**: Charge brands for premium promo placement
- **Relationship Building**: Deepen partnerships with brands

### Feature Specifications

#### Brand Partner Dashboard

**Access**:
- New user role: `BRAND_PARTNER`
- Login portal: `app.azteka.com/brands/login`
- Permissions: Can create promos for own products only

**Features**:
```typescript
interface BrandPromo {
  id: string;
  brandId: string;
  name: string;
  description: string;

  // Targeting
  productIds: string[];         // Which products to promote
  categoryIds?: string[];       // Or promote entire categories

  // Promotion Details
  promoType: 'discount' | 'bogo' | 'rebate' | 'contest';
  discountPercentage?: number;
  discountAmount?: number;
  bogoDetails?: {
    buyQuantity: number;
    getQuantity: number;
    getFree: boolean;
  };
  rebateDetails?: {
    amount: number;
    rebateUrl: string;
  };

  // Visual
  bannerImageUrl: string;       // Hero banner for promo page
  badgeText: string;            // e.g., "20% OFF"
  badgeColor: string;

  // Schedule
  startDate: Date;
  endDate: Date;
  budget?: number;              // Max budget for promo
  currentSpend?: number;        // Track spending against budget

  // Status
  active: boolean;
  approved: boolean;            // Azteka admin must approve

  createdAt: Date;
  updatedAt: Date;
}
```

#### Brand Workflow

```
Step 1: Brand Partner Logs In
  ↓
Step 2: Navigate to "Create Promotion"
  ↓
Step 3: Configure Promo
  ↓
  - Name: "Coca-Cola Summer Splash"
  - Type: Discount (20% off)
  - Products: Select all Coca-Cola products
  - Dates: June 1 - Aug 31, 2025
  - Budget: $10,000 in discounts
  ↓
Step 4: Design Promo
  ↓
  - Upload hero banner image
  - Set badge: "20% OFF"
  - Preview how products will appear in catalog
  ↓
Step 5: Submit for Approval
  ↓
  - Brand submits promo
  - Azteka admin receives notification
  - Admin reviews and approves/rejects
  ↓
Step 6: Promo Goes Live (if approved)
  ↓
  - Promo activates on start date
  - Products display discount badge
  - Promo page created: /promos/coca-cola-summer-splash
  - Customers can browse all Coca-Cola products with discount
```

#### Admin Approval Workflow

**Azteka Admin**:
```
Notification: "New promo from Coca-Cola pending approval"
  ↓
Review Promo:
  - Promo name and description
  - Discount details
  - Affected products
  - Dates and budget
  - Preview of visual elements
  ↓
Decision:
  [Approve] → Promo scheduled to go live
  [Request Changes] → Send feedback to brand
  [Reject] → Promo denied with reason
```

### Technical Dependencies

**Database**:
- New `BrandPromo` model
- `PromoProduct` junction table
- Add `BRAND_PARTNER` role to User model

**API**:
- `POST /api/brand-promos` - Create promo (brand partner)
- `GET /api/brand-promos` - List promos (filtered by brand for partners)
- `PUT /api/brand-promos/:id/approve` - Approve promo (admin only)
- `GET /api/brand-promos/:id/metrics` - Track promo performance

**Frontend**:
- Brand partner portal
- Promo creation wizard
- Admin approval interface
- Customer-facing promo pages

**Accounting**:
- Track discount spend against budget
- Invoice brands for promo placement fees (if applicable)

### Success Metrics

- **Brand Participation**: 40% of brands create at least one promo in first 6 months
- **Sales Impact**: 50% increase in sales for promoted products
- **Customer Engagement**: 30% of customers click through to promo pages
- **Revenue**: $50K annual revenue from promo placement fees

---

## 5. Customer-Specific Pricing Matrix

**Priority**: HIGH
**Timeline**: Q2 2025 (2 months)
**Complexity**: Medium

### Description

Allow admins and sales reps to set custom pricing for individual customers based on volume, relationship, or negotiated contracts.

### Business Value

- **Competitive Advantage**: Offer personalized pricing to win large accounts
- **Volume Discounts**: Reward high-volume customers
- **Contract Management**: Honor negotiated pricing agreements
- **Flexibility**: Sales reps can adjust pricing in the field

### Feature Specifications

#### Price Override System

**Data Model**:
```typescript
interface CustomerPriceOverride {
  id: string;
  customerId: string;
  productId: string;

  // Pricing
  overrideType: 'fixed' | 'percentage_discount' | 'tiered';
  fixedPrice?: number;              // e.g., $22.99 instead of $24.99
  percentageDiscount?: number;      // e.g., 10% off
  tieredPricing?: {
    minQuantity: number;
    priceCase: number;
  }[];                              // e.g., 10-49 cases = $24, 50+ = $22

  // Contract
  contractNumber?: string;
  notes?: string;
  startDate?: Date;
  endDate?: Date;                   // Optional expiration

  // Status
  active: boolean;

  // Audit
  createdBy: string;                // Admin or sales rep
  approvedBy?: string;              // Supervisor approval for large discounts
  createdAt: Date;
  updatedAt: Date;
}
```

#### Admin Workflow

**Option 1: Single Product Override**:
```
Admin views product detail page
  ↓
Click "Set Customer Pricing"
  ↓
Modal opens:
  - Search and select customer
  - Select override type: Fixed price
  - Enter new price: $22.99 (was $24.99)
  - (Optional) Set expiration date
  - (Optional) Add notes: "Volume discount - 50+ cases/month"
  ↓
Save override
  ↓
Customer now sees $22.99 when browsing this product
```

**Option 2: Bulk Customer Pricing**:
```
Admin navigates to customer detail page
  ↓
Click "Manage Pricing Overrides"
  ↓
Table shows:
  - All products
  - Standard price
  - Override price (if set)
  - Override type
  - Actions (Edit, Remove)
  ↓
Click "Add Override" for a product
  ↓
Configure override and save
  ↓
All overrides apply when customer logs in
```

#### Sales Rep Mobile Workflow

**Field Pricing Adjustment**:
```
Sales rep visits customer on-site
  ↓
Customer: "Can you do $22.99 on Coca-Cola if I order 100 cases?"
  ↓
Sales rep opens mobile app
  ↓
Navigate to customer account → Products → Coca-Cola
  ↓
Click "Request Price Override"
  ↓
Enter:
  - New price: $22.99
  - Justification: "100 case commitment"
  - Duration: 6 months
  ↓
Submit request
  ↓
Notification sent to admin for approval
  ↓
If approved: Price override goes live
Customer can immediately order at $22.99
```

### Technical Dependencies

**Database**:
- New `CustomerPriceOverride` model
- Index on `customerId + productId` for fast lookups

**API**:
- `POST /api/price-overrides` - Create override
- `GET /api/price-overrides?customerId=X` - List customer overrides
- `PUT /api/price-overrides/:id` - Update override
- `DELETE /api/price-overrides/:id` - Remove override
- `POST /api/price-overrides/:id/approve` - Approve pending override (admin)

**Frontend**:
- Price override management UI (admin)
- Customer-specific catalog with override prices (customer view)
- Mobile interface for sales rep field adjustments

**Business Logic**:
```javascript
function getCustomerPrice(productId, customerId) {
  // Check for active override
  const override = getActiveOverride(productId, customerId);

  if (!override) {
    return product.priceCase;  // Standard price
  }

  if (override.type === 'fixed') {
    return override.fixedPrice;
  }

  if (override.type === 'percentage_discount') {
    return product.priceCase * (1 - override.percentageDiscount / 100);
  }

  if (override.type === 'tiered') {
    const cartQuantity = getCartQuantity(productId, customerId);
    const tier = override.tieredPricing
      .filter(t => cartQuantity >= t.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    return tier ? tier.priceCase : product.priceCase;
  }
}
```

### Success Metrics

- **Adoption**: 60% of customers have at least one price override
- **Large Account Wins**: 90% of high-volume customers have negotiated pricing
- **Sales Rep Usage**: 70% of sales reps use price override requests
- **Revenue Impact**: 20% increase in revenue from customers with overrides (due to higher volumes)

---

## 6. Advanced Analytics Dashboard

**Priority**: MEDIUM
**Timeline**: Q4 2025 (3 months)
**Complexity**: High

### Description

Comprehensive analytics dashboard for admins to track product performance, customer behavior, and sales trends.

### Key Metrics

#### Product Performance
- Sales volume by product (cases sold)
- Revenue by product
- Profit margin by product
- Best sellers (top 20)
- Worst performers (bottom 20)
- Stock turnover rate

#### Customer Insights
- Customer lifetime value (CLV)
- Average order value (AOV)
- Order frequency
- Customer segments (high-value, at-risk, new)
- Geographic distribution

#### Sales Trends
- Daily/weekly/monthly sales
- Seasonal patterns
- Category performance
- Brand performance
- Sales rep performance

### Dashboard Views

**Overview Dashboard**:
```
┌────────────────────────────────────────────┐
│  Revenue Overview                          │
│  ┌──────────────────────────────────────┐ │
│  │  Today: $12,450  (+15% vs yesterday) │ │
│  │  This Week: $78,320  (+8% vs last)   │ │
│  │  This Month: $324,100  (+12% vs last)│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Top Products This Week                    │
│  1. Coca-Cola 12oz - 450 cases             │
│  2. Lay's Chips 1oz - 320 cases            │
│  3. Pepsi 20oz - 285 cases                 │
│                                            │
│  Low Stock Alerts  (5)                     │
│  • Doritos Nacho - 12 cases left           │
│  • Sprite 12oz - 18 cases left             │
│                                            │
│  [View Full Report]                        │
└────────────────────────────────────────────┘
```

### Technical Dependencies

**Data Warehouse**:
- Separate analytics database (PostgreSQL or ClickHouse)
- ETL pipeline to sync from production DB
- Pre-aggregated metrics tables

**Visualization**:
- Chart library (Chart.js, Recharts, or D3.js)
- Export to PDF/Excel

**Backend**:
- Analytics API endpoints
- Real-time metrics calculation
- Scheduled report generation

---

## 7. Multi-Language Support

**Priority**: LOW
**Timeline**: Q4 2025 (2 months)
**Complexity**: Medium

### Description

Support for Spanish (primary) and English languages throughout the platform.

### Implementation

**i18n Library**: react-i18next

**Supported Languages**:
- English (default)
- Spanish (primary customer language)

**Translated Elements**:
- All UI text
- Product names and descriptions (optional override)
- Email notifications
- PDF invoices

**Admin Features**:
- Set default language per customer
- Allow customers to switch language
- Translate product descriptions per language

---

## 8. Mobile Admin App

**Priority**: LOW
**Timeline**: 2026 (4-6 months)
**Complexity**: Very High

### Description

Native mobile app (iOS + Android) for admins and sales reps to manage products, orders, and customer accounts on the go.

### Key Features

- Product management (add, edit, update stock)
- Order creation and management
- Customer account lookup
- Price override requests
- Photo upload for product images
- Offline mode for field use
- Push notifications for low stock, new orders

### Tech Stack

- React Native or Flutter
- Sync with main API
- Local SQLite database for offline mode

---

## 9. Inventory Forecasting

**Priority**: MEDIUM
**Timeline**: Q4 2025 (3-4 months)
**Complexity**: High

### Description

Predict future inventory needs based on historical sales, seasonal trends, and upcoming promotions.

### Features

- Weekly/monthly demand forecast
- Reorder point calculation
- Safety stock recommendations
- Supplier lead time integration
- What-if scenario planning (e.g., "What if we run a 20% off promo?")

### Benefits

- Reduce stockouts by 60%
- Optimize warehouse space
- Reduce over-ordering and waste
- Improve cash flow planning

---

## 10. QuickBooks Integration

**Priority**: HIGH
**Timeline**: Q2 2025 (2 months)
**Complexity**: Medium

### Description

Bi-directional sync between Azteka DSD system and QuickBooks for accounting and financial management.

### Sync Features

**From Azteka → QuickBooks**:
- New orders → Invoices
- Customer accounts → QuickBooks customers
- Products → QuickBooks items
- Payments → QuickBooks payments

**From QuickBooks → Azteka**:
- Customer credit limits
- Payment status updates
- Account balances

### Technical Implementation

**QuickBooks API**:
- OAuth 2.0 authentication
- REST API integration
- Webhook notifications for real-time sync

**Sync Schedule**:
- Orders: Real-time (within 5 minutes)
- Customers: Every 6 hours
- Products: Daily
- Payments: Real-time

### Success Metrics

- **Accounting Time Saved**: 80% reduction in manual data entry
- **Accuracy**: 99%+ data accuracy between systems
- **Reconciliation**: Automated monthly reconciliation
- **Adoption**: 90% of customers opt-in to QB sync

---

## Implementation Roadmap

### Q2 2025 (Apr - Jun)

- ✅ Bundle Builder System (HIGH priority)
- ✅ Seasonal Promotion Engine (HIGH priority)
- ✅ Customer-Specific Pricing Matrix (HIGH priority)
- ✅ QuickBooks Integration (HIGH priority)

### Q3 2025 (Jul - Sep)

- ✅ Smart Reorder AI (MEDIUM priority)
- ✅ Brand Promo Generator (MEDIUM priority)
- ⚪ Inventory Forecasting (start planning)

### Q4 2025 (Oct - Dec)

- ✅ Advanced Analytics Dashboard (MEDIUM priority)
- ✅ Multi-Language Support (LOW priority)
- ✅ Inventory Forecasting (complete implementation)

### 2026

- ✅ Mobile Admin App (LOW priority, long-term)
- ⚪ Additional features based on customer feedback

---

## Summary

This future features document outlines:

- **10 major enhancements** across various priority levels
- **Bundle Builder**: Create product bundles with special pricing
- **Seasonal Promotions**: Automated holiday campaigns
- **Smart Reorder AI**: Predict customer reorder needs
- **Brand Promo Generator**: Co-marketing with brand partners
- **Customer Pricing**: Personalized pricing per customer
- **Advanced Analytics**: Comprehensive performance dashboard
- **Multi-Language**: Spanish + English support
- **Mobile App**: Native iOS/Android admin app
- **Inventory Forecasting**: Predict future inventory needs
- **QuickBooks Integration**: Bi-directional accounting sync

**Estimated Total Development Time**: 24-30 months for all features

**Priority Order**:
1. HIGH: Bundle Builder, Seasonal Engine, Customer Pricing, QuickBooks (Q2 2025)
2. MEDIUM: Smart AI, Brand Promos, Analytics, Inventory Forecast (Q3-Q4 2025)
3. LOW: Multi-Language, Mobile App (Q4 2025 - 2026)

---

**Related Documentation**:
- [Product Fields Reference](./product-fields.md)
- [Visual Presets Library](./visual-presets.md)
- [Editor Workflow](./editor-workflow.md)
- [API Contract](./api-contract.md)
