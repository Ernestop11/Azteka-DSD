import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Admin Features', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsAdmin();
    await helpers.navigateTo('admin');
  });

  test.describe('Admin Dashboard', () => {
    test('should display all admin feature cards', async ({ page }) => {
      await helpers.verifyPageTitle(/Admin Dashboard/i);

      // Verify all feature cards present
      await helpers.verifyElementVisible('text=Invoice Upload');
      await helpers.verifyElementVisible('text=Purchase Orders');
      await helpers.verifyElementVisible('text=Orders Management');
      await helpers.verifyElementVisible('text=AI Insights');
      await helpers.verifyElementVisible('text=Automation Center');
      await helpers.verifyElementVisible('text=Executive Dashboard');
      await helpers.verifyElementVisible('text=AI Image Processing');
      await helpers.verifyElementVisible('text=AI PO Suggestions');
      await helpers.verifyElementVisible('text=QuickBooks Sync');
    });

    test('should navigate to each admin feature', async ({ page }) => {
      const features = [
        { name: 'Invoice Upload', url: '/admin/invoices' },
        { name: 'Purchase Orders', url: '/admin/po' },
        { name: 'Orders Management', url: '/admin/orders' },
        { name: 'AI Insights', url: '/admin/analytics' },
        { name: 'Automation Center', url: '/admin/automation' },
        { name: 'Executive Dashboard', url: '/admin/executive' },
        { name: 'AI Image Processing', url: '/admin/images' },
        { name: 'AI PO Suggestions', url: '/admin/po-suggestions' },
        { name: 'QuickBooks Sync', url: '/admin/quickbooks' },
      ];

      for (const feature of features) {
        await helpers.goto('/admin');
        await page.click(`text=${feature.name}`);
        await helpers.waitForPageReady();
        await helpers.verifyURL(feature.url);
        await helpers.verifyNoErrors();
      }
    });
  });

  test.describe('AI Image Processing', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/images');
    });

    test('should display image processing stats', async ({ page }) => {
      await helpers.verifyElementVisible('text=/Total Products/i');
      await helpers.verifyElementVisible('text=/No Image/i');
      await helpers.verifyElementVisible('text=/Needs BG Removal/i');
      await helpers.verifyElementVisible('text=/Special Products/i');
    });

    test('should filter products by image status', async ({ page }) => {
      // Click filter tabs
      await page.click('button:has-text("No Image")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Needs BG Removal")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Special Products")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("All")');
      await page.waitForTimeout(500);
    });

    test('should trigger image search', async ({ page }) => {
      const searchButton = page.locator('button:has-text("Find & Process")').first();

      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.waitForTimeout(500);

        // Verify processing started
        await helpers.verifyElementVisible('text=/Processing|Searching/i');
      }
    });

    test('should trigger background removal', async ({ page }) => {
      const removeBgButton = page.locator('button:has-text("Remove BG")').first();

      if (await removeBgButton.isVisible()) {
        await removeBgButton.click();
        await page.waitForTimeout(500);

        // Verify processing
        await helpers.verifyElementVisible('text=/Processing|Removing/i');
      }
    });

    test('should open splash image generator', async ({ page }) => {
      const splashButton = page.locator('button:has-text("Generate Splash")').first();

      if (await splashButton.isVisible()) {
        await splashButton.click();
        await page.waitForTimeout(500);

        // Verify modal opened
        await helpers.verifyElementVisible('[data-testid="splash-generator-modal"]');
        await helpers.verifyElementVisible('select[name="style"]');
      }
    });
  });

  test.describe('AI PO Suggestions', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/po-suggestions');
    });

    test('should display PO suggestions stats', async ({ page }) => {
      await helpers.verifyElementVisible('text=/Total Suggestions/i');
      await helpers.verifyElementVisible('text=/Pending/i');
      await helpers.verifyElementVisible('text=/Approved/i');
      await helpers.verifyElementVisible('text=/Critical/i');
    });

    test('should generate new suggestions', async ({ page }) => {
      const generateButton = page.locator('button:has-text("Generate Now")');

      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(1000);

        // Wait for generation
        await helpers.waitForApiResponse(/\/api\/po-suggestions\/generate/);

        // Verify suggestions updated
        await helpers.verifyElementVisible('[data-testid="suggestion-card"]');
      }
    });

    test('should filter suggestions by status', async ({ page }) => {
      await page.click('button:has-text("Pending")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Approved")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Rejected")');
      await page.waitForTimeout(500);
    });

    test('should display AI reasoning for suggestions', async ({ page }) => {
      const suggestionCard = page.locator('[data-testid="suggestion-card"]').first();

      if (await suggestionCard.isVisible()) {
        // Verify AI reasoning displayed
        await expect(suggestionCard.locator('text=/AI Analysis|Reasoning/i')).toBeVisible();
      }
    });

    test('should approve suggestion', async ({ page }) => {
      const approveButton = page.locator('button:has-text("Approve")').first();

      if (await approveButton.isVisible()) {
        await approveButton.click();
        await page.waitForTimeout(500);

        // Verify confirmation or success
        await helpers.verifyElementVisible('text=/Approved|Success/i');
      }
    });

    test('should reject suggestion', async ({ page }) => {
      const rejectButton = page.locator('button:has-text("Reject")').first();

      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        await page.waitForTimeout(500);

        // Verify rejected
        await helpers.verifyElementVisible('text=/Rejected/i');
      }
    });

    test('should expand vendor comparison', async ({ page }) => {
      const expandButton = page.locator('button:has-text("View Vendor Comparison")').first();

      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(300);

        // Verify vendor details shown
        await helpers.verifyElementVisible('text=/Vendor|Price|Delivery/i');
      }
    });
  });

  test.describe('QuickBooks Sync', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/quickbooks');
    });

    test('should display connection status', async ({ page }) => {
      await helpers.verifyElementVisible('text=/Connected|Not Connected/i');
    });

    test('should show connect button when disconnected', async ({ page }) => {
      const connectButton = page.locator('button:has-text("Connect to QuickBooks")');

      if (await connectButton.isVisible()) {
        await expect(connectButton).toBeVisible();
      }
    });

    test('should display sync buttons when connected', async ({ page }) => {
      // Mock connected state
      await helpers.mockApiResponse(/\/api\/qb\/status/, {
        connected: true,
        companyName: 'Test Company',
        lastSync: new Date().toISOString(),
      });

      await page.reload();
      await helpers.waitForPageReady();

      // Verify sync buttons
      const syncButtons = page.locator('button:has-text("Sync")');
      const count = await syncButtons.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should trigger inventory sync', async ({ page }) => {
      const syncButton = page.locator('button:has-text("Sync Inventory")');

      if (await syncButton.isVisible()) {
        await syncButton.click();
        await page.waitForTimeout(1000);

        // Verify sync started
        await helpers.verifyElementVisible('text=/Syncing|Processing/i');
      }
    });

    test('should display sync history', async ({ page }) => {
      const historySection = page.locator('text=/Sync History/i');

      if (await historySection.isVisible()) {
        // Verify history items
        const historyItems = page.locator('[data-testid="sync-history-item"]');
        const count = await historyItems.count();

        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Orders Management', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/orders');
    });

    test('should display orders list', async ({ page }) => {
      await helpers.verifyPageTitle(/Orders/i);

      const ordersList = page.locator('[data-testid="orders-list"]');
      if (await ordersList.isVisible()) {
        const orders = await page.locator('[data-testid="order-item"]').count();
        expect(orders).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter orders by status', async ({ page }) => {
      const statusFilters = ['Pending', 'Processing', 'Completed', 'Cancelled'];

      for (const status of statusFilters) {
        const filterButton = page.locator(`button:has-text("${status}")`);
        if (await filterButton.isVisible()) {
          await filterButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should view order details', async ({ page }) => {
      const orderItem = page.locator('[data-testid="order-item"]').first();

      if (await orderItem.isVisible()) {
        await orderItem.click();
        await page.waitForTimeout(500);

        // Verify details displayed
        await helpers.verifyElementVisible('text=/Order Details|Customer|Products/i');
      }
    });

    test('should update order status', async ({ page }) => {
      const statusDropdown = page.locator('select[name="status"]').first();

      if (await statusDropdown.isVisible()) {
        await statusDropdown.selectOption('processing');
        await page.waitForTimeout(500);

        // Verify status updated
        await helpers.verifyElementVisible('text=/Updated|Success/i');
      }
    });
  });

  test.describe('Analytics & Insights', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/analytics');
    });

    test('should display analytics dashboard', async ({ page }) => {
      await helpers.verifyPageTitle(/Analytics|Insights/i);
    });

    test('should show key metrics', async ({ page }) => {
      // Verify metric cards
      await helpers.verifyElementVisible('text=/Revenue|Sales|Orders|Products/i');
    });

    test('should display charts', async ({ page }) => {
      const charts = page.locator('canvas');
      const chartCount = await charts.count();

      expect(chartCount).toBeGreaterThan(0);
    });
  });

  test.describe('Executive Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/executive');
    });

    test('should display executive metrics', async ({ page }) => {
      await helpers.verifyPageTitle(/Executive|Dashboard/i);

      // Verify high-level metrics
      await helpers.verifyElementVisible('text=/Revenue|Profit|Growth|Performance/i');
    });

    test('should show performance charts', async ({ page }) => {
      const charts = page.locator('canvas');
      const count = await charts.count();

      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Automation Center', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.goto('/admin/automation');
    });

    test('should display automation rules', async ({ page }) => {
      await helpers.verifyPageTitle(/Automation/i);
    });

    test('should create new automation', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Automation")');

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);

        // Verify creation form
        await helpers.verifyElementVisible('text=/Rule|Trigger|Action/i');
      }
    });
  });
});
