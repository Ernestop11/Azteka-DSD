#!/usr/bin/env node

/**
 * Warehouse Print Test Script
 * Tests print trigger pipeline and warehouse sync
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Warehouse Print...\n')

// Test 1: Check print queue
console.log('1. Checking print queue...')
const queuePath = join(__dirname, 'lib', 'print', 'queuePrintJob.ts')
if (!existsSync(queuePath)) {
  errors.push('Missing print queue: lib/print/queuePrintJob.ts')
} else {
  const content = readFileSync(queuePath, 'utf-8')
  if (!content.includes('queuePrintJob')) {
    errors.push('Print queue missing queuePrintJob function')
  } else {
    console.log('   ✅ Print queue found')
  }
}

// Test 2: Check print trigger
console.log('2. Checking print trigger...')
const triggerPath = join(__dirname, 'lib', 'print', 'triggerPrint.ts')
if (!existsSync(triggerPath)) {
  errors.push('Missing print trigger: lib/print/triggerPrint.ts')
} else {
  const content = readFileSync(triggerPath, 'utf-8')
  if (!content.includes('triggerPrint') || !content.includes('triggerPrintMultiple')) {
    errors.push('Print trigger missing required functions')
  } else {
    console.log('   ✅ Print trigger found')
  }
}

// Test 3: Check warehouse queue
console.log('3. Checking warehouse queue...')
const warehouseQueuePath = join(__dirname, 'src', 'warehouse-sync', 'warehouseQueue.ts')
if (!existsSync(warehouseQueuePath)) {
  errors.push('Missing warehouse queue: src/warehouse-sync/warehouseQueue.ts')
} else {
  const content = readFileSync(warehouseQueuePath, 'utf-8')
  if (!content.includes('enqueue') || !content.includes('processNext')) {
    errors.push('Warehouse queue missing required methods')
  } else {
    console.log('   ✅ Warehouse queue found')
  }
}

// Test 4: Check warehouse sync engine
console.log('4. Checking warehouse sync engine...')
const syncEnginePath = join(__dirname, 'src', 'warehouse-sync', 'warehouseSyncEngine.ts')
if (!existsSync(syncEnginePath)) {
  errors.push('Missing warehouse sync engine: src/warehouse-sync/warehouseSyncEngine.ts')
} else {
  const content = readFileSync(syncEnginePath, 'utf-8')
  if (!content.includes('queueWarehouseJob')) {
    errors.push('Warehouse sync engine missing queueWarehouseJob')
  } else {
    console.log('   ✅ Warehouse sync engine found')
  }
}

// Test 5: Check confirm page integration
console.log('5. Checking confirm page integration...')
const confirmPath = join(__dirname, 'app', 'multistore-order', 'confirm', 'page.tsx')
if (existsSync(confirmPath)) {
  const content = readFileSync(confirmPath, 'utf-8')
  if (!content.includes('triggerPrint')) {
    warnings.push('Confirm page may not trigger print')
  } else {
    console.log('   ✅ Confirm page has print trigger')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All warehouse print tests passed!')
  process.exit(0)
} else {
  if (errors.length > 0) {
    console.error('\n❌ Errors:')
    errors.forEach(error => console.error(`  - ${error}`))
  }
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  process.exit(errors.length > 0 ? 1 : 0)
}

