import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import { buildSmartDSDResponse } from '../app/api/orders/smart-dsd/route'
import { loadBundleManifest, filterBundles } from '../app/api/catalog/bundles/route'
import { fetchCatalogFilters } from '../app/api/catalog/filters/route'
import { mapCatalogProductRow } from '../lib/queries/catalog'
import { catalogCache } from '../lib/cache'

describe('Smart DSD API', () => {
  beforeEach(() => {
    catalogCache.clear()
  })

  it('returns recommendations with quantity suggestions', async () => {
    const prismaStub = {
      customer: {
        findUnique: async () => ({
          id: 'cust-1',
          businessName: 'Tiendita',
          createdAt: new Date('2024-01-01'),
        }),
      },
      order: {
        findMany: async () => [
          {
            createdAt: new Date(),
            items: [
              {
                productId: 'prod-1',
                quantity: 4,
                priceCase: 18,
                product: { id: 'prod-1', sku: 'JR-MANGO', price: 18 },
              },
            ],
          },
        ],
      },
      product: {
        findMany: async () => [
          {
            id: 'prod-1',
            name: 'Jarritos Mango',
            sku: 'JR-MANGO',
            priceCase: 18,
            unitsPerCase: 24,
            price: 18,
            featured: true,
            category: { id: 'cat-1', name: 'Beverages' },
            brand: { id: 'brand-1', name: 'Jarritos' },
          },
        ],
      },
    }

    const result = await buildSmartDSDResponse(prismaStub as any, 'cust-1')
    assert.equal(result.customer.id, 'cust-1')
    assert.ok(result.recommendations.length >= 1)
    assert.equal(result.recommendations[0]?.productId, 'prod-1')
    assert.ok(result.recommendations[0]?.suggestedQuantity >= 1)
  })
})

describe('Bundles API', () => {
  beforeEach(() => {
    catalogCache.clear()
  })

  it('loads Claude bundle manifest and filters by product trigger', async () => {
    const manifest = await loadBundleManifest()
    assert.ok(manifest.bundles.length >= 1)

    const filtered = filterBundles(manifest, 'jarritos-mango')
    assert.ok(filtered.length >= 1)
    filtered.forEach((bundle) => {
      const triggers = bundle.triggerProducts ?? []
      assert.ok(triggers.some((trigger) => trigger.toLowerCase().includes('jarritos')))
    })
  })
})

describe('Catalog filters API', () => {
  beforeEach(() => {
    catalogCache.clear()
  })

  it('returns unique brands, categories, and price range', async () => {
    let queryCount = 0
    const prismaStub = {
      brand: {
        findMany: async () => [
          { id: 'b1', name: 'Jarritos', slug: 'jarritos' },
          { id: 'b2', name: 'Sabritas', slug: 'sabritas' },
        ],
      },
      category: {
        findMany: async () => [
          { id: 'c1', name: 'Beverages', slug: 'beverages' },
          { id: 'c2', name: 'Snacks', slug: 'snacks' },
        ],
      },
      $queryRaw: async () => {
        queryCount += 1
        if (queryCount === 1) {
          return [{ min_price: 10, max_price: 25 }]
        }
        if (queryCount === 2) {
          return [{ id: 'c1', name: 'Beverages', orders: 12 }]
        }
        return [{ id: 'b1', name: 'Jarritos', orders: 9 }]
      },
    }

    const payload = await fetchCatalogFilters(prismaStub as any)
    assert.equal(payload.brands.length, 2)
    assert.equal(payload.categories.length, 2)
    assert.equal(payload.priceRange.min, 10)
    assert.equal(payload.priceRange.max, 25)
    assert.equal(payload.popularFilters.categories.length, 1)
  })
})

describe('Product API mapping', () => {
  it('maps gradient + preset metadata into visual payload', () => {
    const row = {
      id: 'prod-42',
      name: 'Seasonal Mango',
      slug: 'seasonal-mango',
      sku: 'SKU-42',
      description: null,
      shortDescription: null,
      priceCase: 18,
      vendorPrice: 12,
      costCase: 12,
      unitsPerCase: 12,
      unitType: 'case',
      marginPercent: null,
      backgroundColor: '#ff8800',
      backgroundGradient: null,
      imageUrl: '/images/products/42.png',
      thumbnailUrl: null,
      hasImage: true,
      stock: 10,
      minStock: 2,
      inStock: true,
      supplier: 'Azteka',
      featured: true,
      minOrderQty: 1,
      meta: JSON.stringify({ visualPreset: 'fiesta-gradient', badgeText: 'New' }),
      businessModes: ['mexican_store'],
      displayOrder: 1,
      updatedAt: new Date().toISOString(),
      categoryId: 'cat-1',
      categoryName: 'Beverages',
      categorySlug: 'beverages',
      brandId: 'brand-1',
      brandName: 'Jarritos',
      brandSlug: 'jarritos',
      overridePrice: null,
      overrideCustomerId: null,
      revenue30d: 100,
      units30d: 25,
    } as any

    const mapped = mapCatalogProductRow(row)
    assert.equal(mapped.visual.preset, 'fiesta-gradient')
    assert.equal(mapped.visual.badgeText, 'New')
    assert.equal(mapped.stock.inStock, true)
  })
})
