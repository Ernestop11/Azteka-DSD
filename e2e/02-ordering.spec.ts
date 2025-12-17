import { test, expect } from '@playwright/test';
import { TestHelpers, TestData } from './utils/test-helpers';

test.describe('Ordering Workflow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.goto('/');
  });

  test('should add product to cart', async ({ page }) => {
    // Find first available product
    const productCard = page.locator('[data-testid="product-card"]').first();
    const productName = await productCard.locator('[data-testid="product-name"]').textContent();

    // Set quantity
    await productCard.locator('input[type="number"]').fill('5');

    // Click add to cart
    await productCard.locator('button:has-text("Add to Cart")').click();

    // Verify cart updated
    await page.waitForTimeout(500);

    // Check if cart count/badge updated
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    if (await cartBadge.isVisible()) {
      const badgeText = await cartBadge.textContent();
      expect(parseInt(badgeText || '0')).toBeGreaterThan(0);
    }
  });

  test('should update cart quantity', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('input[type="number"]').fill('3');
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Open cart
    await helpers.openCart();

    // Update quantity in cart
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await cartItem.locator('input[type="number"]').fill('10');
    await page.waitForTimeout(300);

    // Verify quantity updated
    const quantity = await cartItem.locator('input[type="number"]').inputValue();
    expect(quantity).toBe('10');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Open cart
    await helpers.openCart();

    // Get initial cart item count
    const initialCount = await page.locator('[data-testid="cart-item"]').count();

    // Remove first item
    await page.locator('[data-testid="remove-cart-item"]').first().click();
    await page.waitForTimeout(300);

    // Verify item removed
    const newCount = await page.locator('[data-testid="cart-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should calculate cart total correctly', async ({ page }) => {
    // Add multiple products
    const productCards = page.locator('[data-testid="product-card"]');
    const firstProduct = productCards.nth(0);
    const secondProduct = productCards.nth(1);

    // Add first product
    await firstProduct.locator('input[type="number"]').fill('2');
    const price1Text = await firstProduct.locator('[data-testid="product-price"]').textContent();
    const price1 = parseFloat(price1Text?.replace(/[^0-9.]/g, '') || '0');
    await firstProduct.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Add second product
    await secondProduct.locator('input[type="number"]').fill('3');
    const price2Text = await secondProduct.locator('[data-testid="product-price"]').textContent();
    const price2 = parseFloat(price2Text?.replace(/[^0-9.]/g, '') || '0');
    await secondProduct.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Open cart
    await helpers.openCart();

    // Verify total
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

    const expectedTotal = (price1 * 2) + (price2 * 3);
    expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01); // Allow for rounding
  });

  test('should clear cart', async ({ page }) => {
    // Add products
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Open cart
    await helpers.openCart();

    // Clear cart
    const clearButton = page.locator('button:has-text("Clear Cart")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify cart is empty
      const cartItems = await page.locator('[data-testid="cart-item"]').count();
      expect(cartItems).toBe(0);
    }
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Open cart
    await helpers.openCart();

    // Click checkout
    await helpers.checkout();

    // Verify navigated to checkout page
    await helpers.verifyURL('/checkout');
  });

  test('should complete checkout with customer info', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Proceed to checkout
    await helpers.openCart();
    await helpers.checkout();

    // Fill customer information
    const customer = TestData.randomCustomer();
    await helpers.fill('input[name="businessName"]', customer.businessName);
    await helpers.fill('input[name="contactName"]', customer.contactName);
    await helpers.fill('input[name="email"]', customer.email);
    await helpers.fill('input[name="phone"]', customer.phone);
    await helpers.fill('input[name="address"]', customer.address);
    await helpers.fill('input[name="city"]', customer.city);
    await helpers.fill('input[name="state"]', customer.state);
    await helpers.fill('input[name="zipCode"]', customer.zipCode);

    // Submit order
    await page.click('button:has-text("Place Order")');

    // Wait for order confirmation
    await helpers.waitForApiResponse(/\/api\/orders/);
    await page.waitForTimeout(2000);

    // Verify order success
    await helpers.verifyElementVisible('text=/Order Placed|Success/i');
  });

  test('should show validation errors for incomplete checkout', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Proceed to checkout
    await helpers.openCart();
    await helpers.checkout();

    // Try to submit without filling form
    await page.click('button:has-text("Place Order")');
    await page.waitForTimeout(500);

    // Verify validation errors
    const errors = await page.locator('[role="alert"]').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('should persist cart across page refresh', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first();
    const productName = await productCard.locator('[data-testid="product-name"]').textContent();
    await productCard.locator('button:has-text("Add to Cart")').click();
    await page.waitForTimeout(500);

    // Refresh page
    await page.reload();
    await helpers.waitForPageReady();

    // Open cart
    await helpers.openCart();

    // Verify cart still has items
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBeGreaterThan(0);
  });

  test('should handle bulk order sheet', async ({ page }) => {
    // Look for bulk order button
    const bulkOrderButton = page.locator('button:has-text("Bulk Order")');

    if (await bulkOrderButton.isVisible()) {
      await bulkOrderButton.click();
      await page.waitForTimeout(500);

      // Verify bulk order sheet opened
      await helpers.verifyElementVisible('[data-testid="bulk-order-sheet"]');

      // Fill quantities for multiple products
      const quantityInputs = page.locator('[data-testid="bulk-quantity-input"]');
      const count = await quantityInputs.count();

      if (count > 0) {
        await quantityInputs.nth(0).fill('10');
        await quantityInputs.nth(1).fill('5');
        await quantityInputs.nth(2).fill('15');
      }

      // Add all to cart
      await page.click('button:has-text("Add All to Cart")');
      await page.waitForTimeout(500);

      // Verify items added
      await helpers.openCart();
      const cartItems = await page.locator('[data-testid="cart-item"]').count();
      expect(cartItems).toBeGreaterThan(0);
    }
  });

  test('should prevent ordering out-of-stock products', async ({ page }) => {
    // Find out-of-stock product
    const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Out of Stock")').first();

    if (await outOfStockProduct.isVisible()) {
      // Verify add to cart button is disabled
      const addButton = outOfStockProduct.locator('button:has-text("Add to Cart")');
      await expect(addButton).toBeDisabled();
    }
  });
});
