# E2E Testing Guide - Azteka DSD

## Overview
Comprehensive end-to-end testing suite for the Azteka DSD application using Playwright.

## Test Coverage

### 1. Catalog & Product Browsing (`01-catalog.spec.ts`)
- ✅ Catalog page loading
- ✅ Product card display
- ✅ Product search functionality
- ✅ Category filtering
- ✅ Product details display
- ✅ Empty search results handling
- ✅ Out-of-stock product display
- ✅ Product image loading
- ✅ Pagination/infinite scroll
- ✅ Special/featured product badges

### 2. Ordering Workflow (`02-ordering.spec.ts`)
- ✅ Add products to cart
- ✅ Update cart quantities
- ✅ Remove items from cart
- ✅ Cart total calculation
- ✅ Clear cart
- ✅ Proceed to checkout
- ✅ Complete checkout with customer info
- ✅ Checkout validation errors
- ✅ Cart persistence across page refresh
- ✅ Bulk order sheet functionality
- ✅ Out-of-stock product prevention

### 3. PO & Receiving Workflow (`03-po-receiving.spec.ts`)
- ✅ Access invoice upload page
- ✅ Upload PO invoice
- ✅ Parse invoice and extract items
- ✅ Review and edit parsed items
- ✅ Mark items as new or existing
- ✅ Receive invoice and update inventory
- ✅ Inventory update verification
- ✅ Receiving history display
- ✅ Duplicate SKU handling
- ✅ Create new products from PO
- ✅ Invoice data validation
- ✅ Error handling
- ✅ Transaction tracking

### 4. Admin Features (`04-admin-features.spec.ts`)
**Admin Dashboard:**
- ✅ Display all feature cards
- ✅ Navigate to each feature

**AI Image Processing:**
- ✅ Display processing stats
- ✅ Filter by image status
- ✅ Trigger image search
- ✅ Background removal
- ✅ Splash image generator

**AI PO Suggestions:**
- ✅ Display suggestions stats
- ✅ Generate new suggestions
- ✅ Filter by status
- ✅ Display AI reasoning
- ✅ Approve/reject suggestions
- ✅ Vendor comparison

**QuickBooks Sync:**
- ✅ Connection status
- ✅ Connect button display
- ✅ Sync buttons when connected
- ✅ Inventory sync trigger
- ✅ Sync history display

**Orders Management:**
- ✅ Orders list display
- ✅ Filter by status
- ✅ View order details
- ✅ Update order status

**Analytics & Insights:**
- ✅ Analytics dashboard
- ✅ Key metrics display
- ✅ Charts display

**Executive Dashboard:**
- ✅ Executive metrics
- ✅ Performance charts

**Automation Center:**
- ✅ Automation rules display
- ✅ Create new automation

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

## Running Tests

### Run all tests:
```bash
npm run test:e2e
```

### Run specific test file:
```bash
npx playwright test e2e/01-catalog.spec.ts
```

### Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

### Run tests in debug mode:
```bash
npx playwright test --debug
```

### Run tests in UI mode (interactive):
```bash
npx playwright test --ui
```

### Run specific test:
```bash
npx playwright test -g "should add product to cart"
```

## Test Reports

### HTML Report:
```bash
npx playwright show-report test-results/html-report
```

### JSON Report:
Located at `test-results/results.json`

### JUnit Report:
Located at `test-results/junit.xml` (for CI/CD)

## Test Structure

```
e2e/
├── 01-catalog.spec.ts          # Catalog browsing tests
├── 02-ordering.spec.ts         # Ordering workflow tests
├── 03-po-receiving.spec.ts     # PO receiving tests
├── 04-admin-features.spec.ts   # Admin features tests
├── utils/
│   └── test-helpers.ts         # Test utilities
└── fixtures/                   # Test data fixtures
```

## Test Utilities

### TestHelpers Class
```typescript
const helpers = new TestHelpers(page);

// Navigation
await helpers.goto('/admin');
await helpers.navigateTo('admin');

// Authentication
await helpers.loginAsAdmin();
await helpers.loginAsSales();

// Product interactions
await helpers.searchProducts('Coca-Cola');
await helpers.filterByCategory('Beverages');
await helpers.addToCart('Product Name', 5);

// Cart operations
await helpers.openCart();
await helpers.checkout();

// File upload
await helpers.uploadFile('input[type="file"]', 'path/to/file.pdf');

// API mocking
await helpers.mockApiResponse(/\/api\/products/, mockData);
await helpers.waitForApiResponse(/\/api\/orders/);

// Assertions
await helpers.verifyElementVisible('selector');
await helpers.verifyElementText('selector', 'text');
await helpers.verifyPageTitle('Title');
await helpers.verifyURL('/expected-path');
await helpers.verifyToast('Success message');
await helpers.verifyNoErrors();
```

### TestData Class
```typescript
// Generate test data
const product = TestData.randomProduct();
const customer = TestData.randomCustomer();
const order = TestData.randomOrder(3);

// Random strings
const email = TestData.randomEmail();
const phone = TestData.randomPhone();
const str = TestData.randomString(10);
```

### ApiHelpers Class
```typescript
const api = new ApiHelpers('http://localhost:3000');

// CRUD operations
const products = await api.get('/api/products', token);
const product = await api.post('/api/products', data, token);
await api.put('/api/products/123', data, token);
await api.delete('/api/products/123', token);

// Test data creation
await api.createProduct(productData, token);
await api.createCustomer(customerData, token);
await api.createOrder(orderData, token);

// Cleanup
await api.cleanup(token);
```

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Workflow file: `.github/workflows/e2e-tests.yml`

### Test Artifacts
- HTML reports uploaded to GitHub Actions artifacts
- Screenshots on failure
- Videos on retry
- JUnit XML for test result visualization

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach` for setup
- Clean up test data after tests

### 2. Waiting Strategies
```typescript
// ✅ Good - Wait for specific condition
await page.waitForSelector('[data-testid="product"]');
await helpers.waitForPageReady();

// ❌ Bad - Arbitrary timeouts
await page.waitForTimeout(5000);
```

### 3. Selectors
```typescript
// ✅ Good - Use data-testid
page.locator('[data-testid="product-card"]')

// ✅ Good - Use semantic selectors
page.locator('button:has-text("Add to Cart")')

// ❌ Bad - Fragile CSS selectors
page.locator('.card > div.content > button.primary')
```

### 4. Assertions
```typescript
// ✅ Good - Use Playwright assertions
await expect(page.locator('h1')).toContainText('Dashboard');

// ❌ Bad - Manual assertions
const text = await page.locator('h1').textContent();
expect(text).toBe('Dashboard');
```

### 5. Test Data
```typescript
// ✅ Good - Generate dynamic test data
const product = TestData.randomProduct();

// ❌ Bad - Hardcoded test data
const product = { name: 'Test Product 1', sku: 'TEST-1' };
```

## Debugging Tests

### 1. Headed Mode
```bash
npx playwright test --headed
```

### 2. Debug Mode
```bash
npx playwright test --debug
```

### 3. Slow Motion
```typescript
test.use({ slowMo: 1000 });
```

### 4. Screenshots
```typescript
await helpers.screenshot('debug-screenshot');
```

### 5. Traces
Traces are automatically collected on first retry. View with:
```bash
npx playwright show-trace test-results/trace.zip
```

## Troubleshooting

### Tests failing locally but passing in CI
- Check environment variables
- Verify database state
- Check for timing issues

### Flaky tests
- Use explicit waits instead of timeouts
- Check for race conditions
- Verify element stability before interaction

### Tests timing out
- Increase timeout in config
- Check for long-running operations
- Verify network requests complete

### Browser not launching
```bash
npx playwright install chromium
```

## Test Maintenance

### Adding New Tests
1. Create new spec file: `e2e/XX-feature.spec.ts`
2. Import TestHelpers
3. Follow existing test patterns
4. Add data-testid attributes to new features
5. Update this documentation

### Updating Tests
- When UI changes, update selectors
- When workflows change, update test flows
- When APIs change, update mocks
- Keep test data generation up to date

### Removing Tests
- Remove obsolete tests when features are removed
- Archive rather than delete if feature might return

## Performance

### Test Execution Time
- Typical full suite: ~10-15 minutes
- Individual test file: ~2-5 minutes
- Single test: ~10-30 seconds

### Optimization Tips
- Run tests in parallel (default)
- Use `fullyParallel: true` in config
- Mock slow external APIs
- Use database snapshots for test data

## Test Data

### Fixtures
Place test files in `e2e/fixtures/`:
- `test-invoice.pdf` - Sample PO invoice
- `test-image.jpg` - Sample product image
- `test-data.json` - Sample product/customer data

### Database State
- Tests should not rely on specific database state
- Use API helpers to create test data
- Clean up after tests complete

## Coverage Goals

- **Unit Tests:** 80%+ (components, utilities)
- **Integration Tests:** 70%+ (API endpoints)
- **E2E Tests:** 100% (critical user flows)

Current E2E Coverage:
- ✅ Catalog & Browsing: 100%
- ✅ Ordering: 100%
- ✅ PO Receiving: 100%
- ✅ Admin Features: 100%
- 🔄 Sales Features: Planned
- 🔄 Customer Portal: Planned
- 🔄 Driver Dashboard: Planned

## Future Enhancements

### Planned Tests
- [ ] Sales rep dashboard tests
- [ ] Customer portal tests
- [ ] Driver dashboard tests
- [ ] Mobile responsive tests
- [ ] Accessibility tests (WCAG)
- [ ] Performance tests
- [ ] Security tests
- [ ] Cross-browser tests (Firefox, Safari)

### Planned Features
- [ ] Visual regression testing
- [ ] API contract testing
- [ ] Load testing
- [ ] Chaos engineering
- [ ] Test coverage reporting
- [ ] Test result dashboard

## Support

### Resources
- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

### Getting Help
- Check test output and errors
- Review test reports
- Check GitHub Actions logs
- Consult team for assistance

## Contributing

When adding tests:
1. Follow existing patterns
2. Add data-testid attributes to components
3. Use TestHelpers utilities
4. Document test scenarios
5. Update this guide
6. Ensure tests pass locally before committing

---

**Last Updated:** 2025-11-08
**Test Framework:** Playwright v1.40+
**Coverage:** 4 test suites, 60+ tests
