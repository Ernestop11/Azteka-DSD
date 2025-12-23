#!/usr/bin/env node
/**
 * Sync Images to VPS Script
 * 
 * This script syncs local images to VPS server
 * Usage: node scripts/sync-images-to-vps.mjs [--dry-run]
 */

import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'products')
const DRY_RUN = process.argv.includes('--dry-run')

// VPS connection details from environment
const VPS_HOST = process.env.VPS_HOST || process.env.VPS_SSH_HOST
const VPS_USER = process.env.VPS_USER || process.env.VPS_SSH_USER || 'root'
const VPS_PATH = process.env.VPS_UPLOADS_PATH || '/srv/azteka-dsd/public/uploads/products'

if (!VPS_HOST) {
  console.error('❌ VPS_HOST not set in environment variables')
  console.log('\nPlease set VPS_HOST in your .env file:')
  console.log('VPS_HOST=your-vps-ip-or-hostname')
  console.log('VPS_USER=your-ssh-user (default: root)')
  console.log('VPS_UPLOADS_PATH=/path/to/vps/uploads (default: /srv/azteka-dsd/public/uploads/products)')
  process.exit(1)
}

async function syncImages() {
  console.log('🚀 Starting Image Sync to VPS\n')
  console.log('='.repeat(60))
  console.log(`VPS Host: ${VPS_HOST}`)
  console.log(`VPS User: ${VPS_USER}`)
  console.log(`VPS Path: ${VPS_PATH}`)
  console.log(`Local Path: ${UPLOADS_DIR}`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log('='.repeat(60) + '\n')

  if (!existsSync(UPLOADS_DIR)) {
    console.error(`❌ Local uploads directory not found: ${UPLOADS_DIR}`)
    process.exit(1)
  }

  const files = readdirSync(UPLOADS_DIR).filter(f => 
    f.match(/\.(png|jpg|jpeg)$/i)
  )

  console.log(`Found ${files.length} image files to sync\n`)

  if (files.length === 0) {
    console.log('No files to sync')
    return
  }

  // Use rsync for efficient syncing
  const rsyncCmd = [
    'rsync',
    '-avz', // archive, verbose, compress
    '--progress', // show progress
    '--delete', // delete files on VPS that don't exist locally
    `${UPLOADS_DIR}/`, // trailing slash = contents of directory
    `${VPS_USER}@${VPS_HOST}:${VPS_PATH}/`
  ]

  if (DRY_RUN) {
    rsyncCmd.push('--dry-run')
  }

  try {
    console.log('📤 Syncing images...\n')
    console.log(`Command: ${rsyncCmd.join(' ')}\n`)
    
    const output = execSync(rsyncCmd.join(' '), {
      encoding: 'utf-8',
      stdio: 'inherit'
    })

    if (!DRY_RUN) {
      console.log('\n✅ Sync complete!')
    } else {
      console.log('\n✅ Dry run complete! Remove --dry-run to perform actual sync')
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Ensure SSH key is set up for passwordless login')
    console.log('2. Check VPS hostname/IP is correct')
    console.log('3. Verify VPS user has write permissions to target directory')
    console.log('4. Test SSH connection: ssh ' + VPS_USER + '@' + VPS_HOST)
    process.exit(1)
  }
}

syncImages()

