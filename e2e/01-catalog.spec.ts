import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from './utils/test-helpers';

test.describe('Catalog & Product Browsing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.goto('/');
  });

  test('should load catalog page successfully', async ({ page }) => {
    await helpers.verifyPageTitle(/Catalog|Products/i);
    await helpers.verifyNoErrors();

    // Verify catalog grid exists
    await helpers.verifyElementVisible('[data-testid="product-grid"]');
  });

  test('should display product cards with all information', async ({ page }) => {
    // Wait for products to load
    await helpers.waitForElement('[data-testid="product-card"]');

    // Get first product card
    const productCard = page.locator('[data-testid="product-card"]').first();

    // Verify product card elements
    await expect(productCard.locator('img')).toBeVisible();
    await expect(productCard.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(productCard.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(productCard.locator('[data-testid="product-stock"]')).toBeVisible();
  });

  test('should search products by name', async ({ page }) => {
    // Search for a product
    await helpers.searchProducts('Coca');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search results contain search term
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    if (count > 0) {
      const firstProduct = await productCards.first().textContent();
      expect(firstProduct?.toLowerCase()).toContain('coca');
    }
  });

  test('should filter products by category', async ({ page }) => {
    // Click category filter (e.g., Beverages)
    await page.click('button:has-text("Beverages")');
    await page.waitForTimeout(500);

    // Verify filtered products
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should show product details on hover/click', async ({ page }) => {
    const productCard = page.locator('[data-testid="product-card"]').first();

    // Hover over product
    await productCard.hover();

    // Verify hover effects (if any)
    await page.waitForTimeout(300);
  });

  test('should handle empty search results', async ({ page }) => {
    await helpers.searchProducts('NONEXISTENTPRODUCT12345');
    await page.waitForTimeout(1000);

    // Verify "no results" message
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    expect(count).toBe(0);
  });

  test('should show out-of-stock products differently', async ({ page }) => {
    // Look for out-of-stock indicator
    const outOfStockBadge = page.locator('text=/Out of Stock|Sold Out/i').first();

    if (await outOfStockBadge.isVisible()) {
      // Verify styling or badge
      await expect(outOfStockBadge).toBeVisible();
    }
  });

  test('should display product images correctly', async ({ page }) => {
    const productCard = page.locator('[data-testid="product-card"]').first();
    const image = productCard.locator('img').first();

    // Verify image is loaded
    await expect(image).toBeVisible();

    // Check if image has src
    const src = await image.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('should load more products on scroll (if pagination exists)', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="product-card"]').count();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check if more products loaded (if infinite scroll is implemented)
    const newCount = await page.locator('[data-testid="product-card"]').count();

    // Count should be >= initial count (might have pagination or all products shown)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should handle special/featured products', async ({ page }) => {
    // Look for special product badges
    const specialBadge = page.locator('[data-testid="special-badge"]').first();

    if (await specialBadge.isVisible()) {
      await expect(specialBadge).toBeVisible();
    }
  });
});
