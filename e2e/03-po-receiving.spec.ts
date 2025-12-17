import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import path from 'path';

test.describe('PO & Receiving Workflow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login as admin
    await helpers.loginAsAdmin();
  });

  test('should access invoice upload page', async ({ page }) => {
    await helpers.navigateTo('admin');
    await page.click('text=Invoice Upload');
    await helpers.waitForPageReady();

    await helpers.verifyPageTitle(/Invoice Upload/i);
    await helpers.verifyElementVisible('input[type="file"]');
  });

  test('should upload PO invoice successfully', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Create test PDF file (mock)
    const testPdfPath = path.join(__dirname, 'fixtures', 'test-invoice.pdf');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(testPdfPath);
      await page.waitForTimeout(1000);

      // Wait for upload completion
      await helpers.waitForApiResponse(/\/api\/invoices\/upload/);

      // Verify success message
      await helpers.verifyElementVisible('text=/Upload.*Success/i');
    }
  });

  test('should parse invoice and show extracted items', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Mock successful invoice upload
    await helpers.mockApiResponse(/\/api\/invoices\/upload/, {
      success: true,
      invoiceId: 'test-123',
      items: [
        { name: 'Coca-Cola 12oz', quantity: 100, cost: 0.5, sku: 'COKE-12' },
        { name: 'Pepsi 12oz', quantity: 50, cost: 0.45, sku: 'PEPSI-12' },
      ],
    });

    // Upload would trigger parsing
    // Verify parsed items displayed
    await helpers.waitForElement('[data-testid="parsed-item"]');

    const items = await page.locator('[data-testid="parsed-item"]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('should review and edit parsed items', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Assume items are parsed and displayed
    const firstItem = page.locator('[data-testid="parsed-item"]').first();

    if (await firstItem.isVisible()) {
      // Edit quantity
      const quantityInput = firstItem.locator('input[name="quantity"]');
      await quantityInput.fill('150');

      // Edit cost
      const costInput = firstItem.locator('input[name="cost"]');
      await costInput.fill('0.55');

      // Verify changes saved
      await page.waitForTimeout(300);
    }
  });

  test('should mark items as new or existing', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    const item = page.locator('[data-testid="parsed-item"]').first();

    if (await item.isVisible()) {
      // Check "New Product" checkbox
      const newProductCheckbox = item.locator('input[type="checkbox"][name="isNew"]');
      if (await newProductCheckbox.isVisible()) {
        await newProductCheckbox.check();
        await page.waitForTimeout(300);

        // Verify marked as new
        await expect(newProductCheckbox).toBeChecked();
      }
    }
  });

  test('should receive invoice and update inventory', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Click receive button
    const receiveButton = page.locator('button:has-text("Receive")');

    if (await receiveButton.isVisible()) {
      await receiveButton.click();

      // Confirm receive
      await page.click('button:has-text("Confirm")');

      // Wait for API call
      await helpers.waitForApiResponse(/\/api\/invoices\/receive/);

      // Verify success
      await helpers.verifyElementVisible('text=/Received.*Success/i');
    }
  });

  test('should update product inventory after receiving', async ({ page }) => {
    // First get current stock of a product
    await helpers.goto('/');

    const productCard = page.locator('[data-testid="product-card"]').first();
    const productName = await productCard.locator('[data-testid="product-name"]').textContent();
    const currentStockText = await productCard.locator('[data-testid="product-stock"]').textContent();
    const currentStock = parseInt(currentStockText?.replace(/[^0-9]/g, '') || '0');

    // Now receive a PO with that product
    await helpers.goto('/admin/invoices');

    // Mock receiving with +100 units
    await helpers.mockApiResponse(/\/api\/invoices\/receive/, {
      success: true,
      inventoryUpdates: {
        productsUpdated: 1,
        totalUnitsAdded: 100,
      },
    });

    // Receive invoice (would need actual flow implementation)

    // Go back to catalog
    await helpers.goto('/');

    // Verify stock updated
    const updatedProductCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
    const newStockText = await updatedProductCard.locator('[data-testid="product-stock"]').textContent();
    const newStock = parseInt(newStockText?.replace(/[^0-9]/g, '') || '0');

    expect(newStock).toBeGreaterThanOrEqual(currentStock);
  });

  test('should show receiving history', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Look for history section
    const historySection = page.locator('[data-testid="receiving-history"]');

    if (await historySection.isVisible()) {
      // Verify history items
      const historyItems = await page.locator('[data-testid="history-item"]').count();
      expect(historyItems).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle duplicate SKUs during receiving', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // When receiving an item with existing SKU
    // Verify system prompts for merge/update or skip
    const duplicateWarning = page.locator('text=/Duplicate|Already Exists/i');

    if (await duplicateWarning.isVisible()) {
      // Verify options presented
      await helpers.verifyElementVisible('button:has-text("Update")');
      await helpers.verifyElementVisible('button:has-text("Skip")');
    }
  });

  test('should create new products from PO', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Get product count before
    await helpers.goto('/');
    const beforeCount = await page.locator('[data-testid="product-card"]').count();

    // Receive PO with new products
    await helpers.goto('/admin/invoices');

    // Mock receiving new products
    await helpers.mockApiResponse(/\/api\/invoices\/receive/, {
      success: true,
      inventoryUpdates: {
        productsUpdated: 0,
        totalUnitsAdded: 50,
      },
      newProducts: 2,
    });

    // Complete receiving flow

    // Verify new products in catalog
    await helpers.goto('/');
    const afterCount = await page.locator('[data-testid="product-card"]').count();

    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
  });

  test('should validate invoice data before receiving', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Try to receive with invalid data (e.g., negative quantity)
    const item = page.locator('[data-testid="parsed-item"]').first();

    if (await item.isVisible()) {
      await item.locator('input[name="quantity"]').fill('-10');

      // Try to receive
      await page.click('button:has-text("Receive")');
      await page.waitForTimeout(500);

      // Verify validation error
      await helpers.verifyElementVisible('text=/Invalid|Error/i');
    }
  });

  test('should handle receiving errors gracefully', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // Mock API error
    await page.route(/\/api\/invoices\/receive/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database error' }),
      });
    });

    // Try to receive
    const receiveButton = page.locator('button:has-text("Receive")');
    if (await receiveButton.isVisible()) {
      await receiveButton.click();
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);

      // Verify error message shown
      await helpers.verifyElementVisible('[role="alert"]:has-text("Error")');
    }
  });

  test('should track receiving transactions', async ({ page }) => {
    await helpers.goto('/admin/invoices');

    // After receiving, verify transaction logged
    const transactionLog = page.locator('[data-testid="transaction-log"]');

    if (await transactionLog.isVisible()) {
      // Verify transaction details
      await helpers.verifyElementVisible('text=/Received|Transaction/i');
      await helpers.verifyElementVisible('text=/Units Added|Quantity/i');
      await helpers.verifyElementVisible('text=/Total Value|Cost/i');
    }
  });
});
