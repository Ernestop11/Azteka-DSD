#!/usr/bin/env node

/**
 * Offline Cart Test Script
 * Tests offline mode and persistent cart functionality
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const errors = []
const warnings = []

console.log('🔍 Testing Offline Cart...\n')

// Test 1: Check network monitor
console.log('1. Checking network monitor...')
const networkMonitorPath = join(__dirname, 'lib', 'offline', 'networkMonitor.ts')
if (!existsSync(networkMonitorPath)) {
  errors.push('Missing network monitor: lib/offline/networkMonitor.ts')
} else {
  const content = readFileSync(networkMonitorPath, 'utf-8')
  if (!content.includes('isOnline') || !content.includes('subscribe')) {
    errors.push('Network monitor missing required functions')
  } else {
    console.log('   ✅ Network monitor found')
  }
}

// Test 2: Check storage utility
console.log('2. Checking storage utility...')
const storagePath = join(__dirname, 'lib', 'offline', 'storage.ts')
if (!existsSync(storagePath)) {
  errors.push('Missing storage utility: lib/offline/storage.ts')
} else {
  const content = readFileSync(storagePath, 'utf-8')
  const requiredFunctions = ['saveToStorage', 'loadFromStorage', 'removeFromStorage']
  const missing = requiredFunctions.filter(fn => !content.includes(fn))
  if (missing.length > 0) {
    errors.push(`Storage utility missing functions: ${missing.join(', ')}`)
  } else {
    console.log('   ✅ Storage utility found')
  }
}

// Test 3: Check persistent cart hook
console.log('3. Checking persistent cart hook...')
const persistentCartPath = join(__dirname, 'hooks', 'usePersistentCart.ts')
if (!existsSync(persistentCartPath)) {
  errors.push('Missing persistent cart hook: hooks/usePersistentCart.ts')
} else {
  const content = readFileSync(persistentCartPath, 'utf-8')
  if (!content.includes('usePersistentCart')) {
    errors.push('Persistent cart hook missing usePersistentCart function')
  } else {
    console.log('   ✅ Persistent cart hook found')
  }
}

// Test 4: Check Providers integration
console.log('4. Checking Providers integration...')
const providersPath = join(__dirname, 'components', 'Providers.tsx')
if (existsSync(providersPath)) {
  const content = readFileSync(providersPath, 'utf-8')
  if (!content.includes('PersistentCartInitializer') && !content.includes('usePersistentCart')) {
    warnings.push('Providers may not have persistent cart integrated')
  } else {
    console.log('   ✅ Providers has persistent cart integration')
  }
}

// Report results
console.log('\n📊 Test Results:')
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All offline cart tests passed!')
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

