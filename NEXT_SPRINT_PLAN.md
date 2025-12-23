# 🚀 Next Sprint Plan - Price Management & PO Workflow

## ✅ Completed This Sprint

1. **Price Management System**
   - ✅ CustomerPriceOverride database model
   - ✅ Price override API endpoints (CRUD + bulk)
   - ✅ Price calculation utility (`getCustomerPrice`)
   - ✅ Admin pricing management UI (`/admin/pricing`)
   - ✅ Bulk price operations
   - ✅ Seed scripts for CSV/Excel import

2. **PO Workflow Visualization**
   - ✅ PO workflow page (`/admin/po/[id]/workflow`)
   - ✅ Shows receiving tasks, work orders, inventory status
   - ✅ Links to all workflow screens

3. **Deployment**
   - ✅ Deployed to VPS
   - ✅ Database migration ready

---

## 🎯 Next Sprint Goals

### Sprint 1: Price Management Integration (Week 1)

**Priority: HIGH**

1. **Integrate Price Overrides into Order Creation**
   - [ ] Update `app/api/orders/route.ts` to use `getCustomerPrice()`
   - [ ] Apply customer-specific prices in cart calculations
   - [ ] Show override prices in order confirmation
   - [ ] Track which orders used price overrides

2. **Integrate Price Overrides into Catalog**
   - [ ] Update `lib/queries/catalog.ts` to include override prices
   - [ ] Show customer-specific prices in product listings
   - [ ] Display price savings/discounts to customers
   - [ ] Cache override prices for performance

3. **Las Superior Special Pricing**
   - [ ] Bulk import Las Superior prices from Excel
   - [ ] Set up multi-store pricing (9 stores)
   - [ ] Configure 15-day payment terms
   - [ ] Set up returns/credit memo system
   - [ ] Create invoice statement generation

**Deliverables:**
- Orders use customer-specific pricing
- Catalog shows override prices
- Las Superior pricing imported and active

---

### Sprint 2: PO Workflow Enhancements (Week 1-2)

**Priority: MEDIUM**

1. **Receiving Flow Improvements**
   - [ ] Add barcode scanning to receiving page
   - [ ] Real-time inventory updates during receiving
   - [ ] Quality check workflow
   - [ ] Photo capture for damaged goods
   - [ ] Auto-print receiving labels

2. **Work Orders for Ernesto**
   - [ ] Enhanced work order detail page
   - [ ] Quick product editor from work order
   - [ ] Batch approve multiple work orders
   - [ ] Image upload from work order
   - [ ] Price review and update workflow

3. **Inventory Pre-Seed**
   - [ ] Auto-create inventory records from PO
   - [ ] Set warehouse locations
   - [ ] Track lot numbers and expiration dates
   - [ ] Low stock alerts for new products

**Deliverables:**
- Complete receiving workflow with scanning
- Streamlined work order processing
- Automatic inventory creation

---

### Sprint 3: P&L & Expense Automation (Week 2-3)

**Priority: HIGH** (Business Critical)

1. **Expense Tracking**
   - [ ] Create ExpenseCategory and Expense models
   - [ ] Weekly payroll automation (Ana's activities)
   - [ ] Gas/vehicle expense tracking
   - [ ] Recurring expense automation
   - [ ] Expense approval workflow

2. **P&L Calculation**
   - [ ] True P&L statements (gross & net)
   - [ ] Cost of goods sold (COGS) calculation
   - [ ] Operating expenses tracking
   - [ ] Margin analysis by product/customer
   - [ ] Automated weekly/monthly reports

3. **Financial Dashboard**
   - [ ] Real-time P&L view
   - [ ] Expense vs revenue charts
   - [ ] Margin trends
   - [ ] Cash flow projections

**Deliverables:**
- Automated expense tracking
- Accurate P&L statements
- Financial dashboard for decision-making

---

### Sprint 4: Enhanced PO Suggestions (Week 3)

**Priority: MEDIUM**

1. **Seasonality & Trends**
   - [ ] Historical sales analysis
   - [ ] Seasonal demand forecasting
   - [ ] Trend detection (increasing/decreasing)
   - [ ] Holiday/event-based suggestions

2. **Margin Optimization**
   - [ ] Suggest products with best margins
   - [ ] Identify low-margin products to discontinue
   - [ ] Volume discount recommendations
   - [ ] Vendor price comparison

3. **Inventory Intelligence**
   - [ ] Days of inventory remaining
   - [ ] Sales velocity calculations
   - [ ] Safety stock recommendations
   - [ ] Never-out-of-stock for key customers (Las Superior)

**Deliverables:**
- AI-powered PO suggestions
- Seasonality-aware forecasting
- Margin-optimized recommendations

---

### Sprint 5: Las Superior Automation (Week 3-4)

**Priority: HIGH** (Customer Critical)

1. **Customer-Specific Features**
   - [ ] Las Superior account setup (9 stores)
   - [ ] 15-day payment terms tracking
   - [ ] Open invoice statements
   - [ ] Returns/credit memo system
   - [ ] Account manager assignment (Carlos)

2. **PO Forecasting**
   - [ ] Parse historical Excel data
   - [ ] Identify ordering patterns
   - [ ] Forecast weekly PO needs
   - [ ] Auto-generate PO suggestions
   - [ ] Never-out-of-stock alerts

3. **Service Monitoring**
   - [ ] On-time delivery tracking
   - [ ] Order accuracy metrics
   - [ ] Return rate tracking
   - [ ] Customer satisfaction dashboard

**Deliverables:**
- Complete Las Superior account management
- Automated PO forecasting
- Service quality monitoring

---

## 📊 Sprint Metrics

### Success Criteria

**Sprint 1:**
- ✅ 100% of orders use customer-specific pricing
- ✅ Catalog shows override prices correctly
- ✅ Las Superior prices imported

**Sprint 2:**
- ✅ Receiving workflow < 5 minutes per PO
- ✅ Work orders processed < 2 minutes each
- ✅ Inventory auto-created from POs

**Sprint 3:**
- ✅ P&L accuracy within $100
- ✅ Expenses tracked automatically
- ✅ Weekly reports generated

**Sprint 4:**
- ✅ PO suggestions accuracy > 80%
- ✅ Never-out-of-stock for Las Superior
- ✅ Margin optimization recommendations

**Sprint 5:**
- ✅ Las Superior PO forecasting accuracy > 75%
- ✅ Service metrics tracked
- ✅ Returns processed automatically

---

## 🔧 Technical Debt

1. **Database Migrations**
   - [ ] Clean up shadow database issues
   - [ ] Consolidate migration files
   - [ ] Add migration rollback scripts

2. **Performance**
   - [ ] Cache price calculations
   - [ ] Optimize catalog queries
   - [ ] Add database indexes

3. **Testing**
   - [ ] Unit tests for price calculation
   - [ ] Integration tests for PO workflow
   - [ ] E2E tests for pricing UI

---

## 📝 Notes

- **Las Superior Priority**: This is the biggest account - prioritize their features
- **P&L Critical**: Need accurate financials for business decisions
- **PO Workflow**: Current flow works but needs polish for efficiency
- **Price Management**: Foundation is built, now integrate everywhere

---

## 🎯 Recommended Sprint Order

1. **Week 1**: Sprint 1 (Price Integration) + Sprint 2 (PO Enhancements)
2. **Week 2**: Sprint 3 (P&L & Expenses)
3. **Week 3**: Sprint 4 (PO Suggestions) + Sprint 5 (Las Superior)

This balances business-critical features (pricing, P&L) with customer-critical features (Las Superior) while improving operational efficiency (PO workflow).



