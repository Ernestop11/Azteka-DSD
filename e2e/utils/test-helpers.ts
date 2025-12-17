import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for Azteka DSD E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a specific route
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(email: string = 'admin@azteka.com', password: string = 'admin123') {
    await this.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.waitForPageReady();
  }

  /**
   * Login as sales rep
   */
  async loginAsSales(email: string = 'sales@azteka.com', password: string = 'sales123') {
    await this.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.waitForPageReady();
  }

  /**
   * Navigate using the main navigation
   */
  async navigateTo(section: 'admin' | 'sales' | 'customer' | 'driver' | 'catalog') {
    const selectors = {
      admin: 'text=Admin',
      sales: 'text=Sales',
      customer: 'text=Customer',
      driver: 'text=Driver',
      catalog: 'text=Catalog',
    };

    await this.page.click(selectors[section]);
    await this.waitForPageReady();
  }

  /**
   * Search for products in catalog
   */
  async searchProducts(query: string) {
    await this.page.fill('input[placeholder*="Search"]', query);
    await this.page.waitForTimeout(500); // Debounce delay
  }

  /**
   * Filter products by category
   */
  async filterByCategory(category: string) {
    await this.page.click(`button:has-text("${category}")`);
    await this.page.waitForTimeout(300);
  }

  /**
   * Add product to cart
   */
  async addToCart(productName: string, quantity: number = 1) {
    const productCard = this.page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();

    // Set quantity
    const quantityInput = productCard.locator('input[type="number"]');
    await quantityInput.fill(quantity.toString());

    // Click add to cart
    await productCard.locator('button:has-text("Add to Cart")').click();

    // Wait for confirmation
    await this.page.waitForTimeout(500);
  }

  /**
   * Open cart
   */
  async openCart() {
    await this.page.click('button:has-text("Cart")');
    await this.page.waitForTimeout(300);
  }

  /**
   * Checkout
   */
  async checkout() {
    await this.page.click('button:has-text("Checkout")');
    await this.waitForPageReady();
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(url: string | RegExp, timeout: number = 10000) {
    return await this.page.waitForResponse(url, { timeout });
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string | RegExp, response: any) {
    await this.page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Verify element visible
   */
  async verifyElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verify element text
   */
  async verifyElementText(selector: string, text: string | RegExp) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(title: string | RegExp) {
    await expect(this.page.locator('h1')).toContainText(title);
  }

  /**
   * Wait for element
   */
  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Click element
   */
  async click(selector: string) {
    await this.page.click(selector);
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill input
   */
  async fill(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  /**
   * Select option
   */
  async select(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async check(selector: string) {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector: string) {
    await this.page.uncheck(selector);
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Get element text
   */
  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  /**
   * Verify URL
   */
  async verifyURL(path: string) {
    expect(this.page.url()).toContain(path);
  }

  /**
   * Verify toast message
   */
  async verifyToast(message: string) {
    await expect(this.page.locator('[role="alert"]')).toContainText(message);
  }

  /**
   * Close modal
   */
  async closeModal() {
    await this.page.click('button[aria-label="Close"]');
    await this.page.waitForTimeout(300);
  }

  /**
   * Wait for loading to finish
   */
  async waitForLoading() {
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 30000 });
  }

  /**
   * Verify no errors on page
   */
  async verifyNoErrors() {
    const errors = await this.page.locator('[role="alert"]:has-text("Error")').count();
    expect(errors).toBe(0);
  }
}

/**
 * Generate test data
 */
export class TestData {
  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static randomEmail(): string {
    return `test-${this.randomString()}@example.com`;
  }

  static randomPhone(): string {
    return `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
  }

  static randomProduct() {
    return {
      name: `Test Product ${this.randomString(5)}`,
      sku: `SKU-${this.randomString(8).toUpperCase()}`,
      price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      stock: Math.floor(Math.random() * 100) + 10,
      description: 'Test product description',
      category: 'Beverages',
    };
  }

  static randomCustomer() {
    return {
      businessName: `Test Business ${this.randomString(5)}`,
      contactName: `John Doe ${this.randomString(3)}`,
      email: this.randomEmail(),
      phone: this.randomPhone(),
      address: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
    };
  }

  static randomOrder(productCount: number = 3) {
    const products = [];
    for (let i = 0; i < productCount; i++) {
      products.push({
        ...this.randomProduct(),
        quantity: Math.floor(Math.random() * 10) + 1,
      });
    }
    return {
      customer: this.randomCustomer(),
      products,
      notes: 'Test order notes',
    };
  }
}

/**
 * API Test helpers
 */
export class ApiHelpers {
  constructor(private baseURL: string = 'http://localhost:3000') {}

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async get(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  /**
   * Create test product via API
   */
  async createProduct(product: any, token: string) {
    return this.post('/api/products', product, token);
  }

  /**
   * Create test customer via API
   */
  async createCustomer(customer: any, token: string) {
    return this.post('/api/customers', customer, token);
  }

  /**
   * Create test order via API
   */
  async createOrder(order: any, token: string) {
    return this.post('/api/orders', order, token);
  }

  /**
   * Clean up test data
   */
  async cleanup(token: string) {
    // Delete test products
    await this.delete('/api/test/cleanup/products', token);

    // Delete test customers
    await this.delete('/api/test/cleanup/customers', token);

    // Delete test orders
    await this.delete('/api/test/cleanup/orders', token);
  }
}
