import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { validateRawProductRow } from '../lib/data-tools/productGuards'
import { resolveBrand, resolveCategory } from '../lib/data-tools/brandCategoryResolver'

describe('productGuards.validateRawProductRow', () => {
  it('flags invalid rows with errors', () => {
    const result = validateRawProductRow({
      Name: '',
      SKU: '',
      Category: '',
      Brand: '',
      'Sales Price': 'not-a-number',
      'Case Pack': '0',
    })

    assert.equal(result.ok, false)
    assert.ok(result.errors.length >= 4)
  })

  it('returns clean product for valid rows', () => {
    const result = validateRawProductRow({
      Name: 'Jarritos Tamarind',
      SKU: 'jar-123',
      Category: 'Beverages',
      Brand: 'Jarritos',
      'Sales Price': '24.90',
      'Case Pack': '8',
    })

    assert.equal(result.ok, true)
    if (result.ok) {
      assert.equal(result.value.slug, 'jarritos-tamarind')
      assert.equal(result.value.unitsPerCase, 8)
    }
  })
})

describe('brandCategoryResolver', () => {
  it('normalizes and suggests brand names', () => {
    const resolved = resolveBrand('  jarritos  ')
    assert.equal(resolved.normalized, 'Jarritos')
    assert.equal(resolved.suggestion, 'Jarritos')
  })

  it('suggests closest category name for typos', () => {
    const resolved = resolveCategory('bevrages')
    assert.equal(resolved.normalized, 'Bevrages')
    assert.equal(resolved.suggestion, 'Beverages')
  })
})
