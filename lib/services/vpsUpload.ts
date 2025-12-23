/**
 * VPS Direct Upload Service
 *
 * Uploads files directly to VPS via SSH/SCP instead of saving locally.
 * This ensures the VPS is always the single source of truth for images.
 */

import { NodeSSH } from 'node-ssh'
import path from 'path'

// VPS Configuration from environment
const VPS_CONFIG = {
  host: process.env.VPS_HOST || process.env.VPS_SSH_HOST || '77.243.85.8',
  username: process.env.VPS_USER || process.env.VPS_SSH_USER || 'root',
  privateKeyPath: process.env.VPS_SSH_KEY_PATH || `${process.env.HOME}/.ssh/id_rsa`,
  basePath: process.env.VPS_PATH || '/srv/azteka-api-live',
  uploadsPath: '/srv/azteka-api-live/public/uploads',
}

// Upload types and their paths
type UploadType = 'products' | 'brands' | 'categories' | 'catalog' | 'rack' | 'vendor' | 'brand' | 'backdrop' | 'background' | 'character' | 'hero-banners' | 'promos' | 'seasonal' | 'backdrops' | 'backgrounds'

const UPLOAD_PATHS: Record<UploadType, string> = {
  products: 'products',
  brands: 'brands',
  categories: 'categories',
  catalog: 'catalog',
  rack: 'catalog/rack',
  vendor: 'catalog/vendor',
  brand: 'catalog/brand',
  backdrop: 'catalog/backdrops',
  background: 'catalog/backgrounds',
  character: 'catalog/characters',
  'hero-banners': 'catalog/hero-banners',
  promos: 'catalog/promos',
  seasonal: 'catalog/seasonal',
  backdrops: 'catalog/backdrops',
  backgrounds: 'catalog/backgrounds',
}

interface UploadResult {
  success: boolean
  url: string
  error?: string
}

/**
 * Check if VPS upload is enabled
 */
export function isVpsUploadEnabled(): boolean {
  // Check if we have SSH key access
  const fs = require('fs')
  try {
    fs.accessSync(VPS_CONFIG.privateKeyPath)
    return true
  } catch {
    console.warn('[VPS Upload] SSH key not found at', VPS_CONFIG.privateKeyPath)
    return false
  }
}

/**
 * Upload a file buffer directly to VPS
 */
export async function uploadToVps(
  buffer: Buffer,
  filename: string,
  type: UploadType = 'products'
): Promise<UploadResult> {
  const ssh = new NodeSSH()

  try {
    // Get the upload subdirectory
    const subdir = UPLOAD_PATHS[type] || type
    const remotePath = `${VPS_CONFIG.uploadsPath}/${subdir}`
    const remoteFilePath = `${remotePath}/${filename}`
    const publicUrl = `/uploads/${subdir}/${filename}`

    console.log(`[VPS Upload] Connecting to ${VPS_CONFIG.host}...`)

    // Connect to VPS
    await ssh.connect({
      host: VPS_CONFIG.host,
      username: VPS_CONFIG.username,
      privateKeyPath: VPS_CONFIG.privateKeyPath,
    })

    console.log(`[VPS Upload] Connected. Ensuring directory exists: ${remotePath}`)

    // Ensure the directory exists
    await ssh.execCommand(`mkdir -p ${remotePath}`)

    // Upload the file using putBuffer
    console.log(`[VPS Upload] Uploading ${filename} (${buffer.length} bytes)...`)

    // Write buffer to temp file first, then SCP it
    const tempPath = `/tmp/azteka-upload-${Date.now()}-${filename}`
    const fs = require('fs').promises
    await fs.writeFile(tempPath, buffer)

    await ssh.putFile(tempPath, remoteFilePath)

    // Clean up temp file
    await fs.unlink(tempPath)

    // Set proper permissions
    await ssh.execCommand(`chmod 644 ${remoteFilePath}`)

    console.log(`[VPS Upload] Successfully uploaded to ${remoteFilePath}`)

    ssh.dispose()

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[VPS Upload] Failed:', message)

    ssh.dispose()

    return {
      success: false,
      url: '',
      error: message,
    }
  }
}

/**
 * Delete a file from VPS
 */
export async function deleteFromVps(
  filename: string,
  type: UploadType = 'products'
): Promise<boolean> {
  const ssh = new NodeSSH()

  try {
    const subdir = UPLOAD_PATHS[type] || type
    const remoteFilePath = `${VPS_CONFIG.uploadsPath}/${subdir}/${filename}`

    await ssh.connect({
      host: VPS_CONFIG.host,
      username: VPS_CONFIG.username,
      privateKeyPath: VPS_CONFIG.privateKeyPath,
    })

    await ssh.execCommand(`rm -f ${remoteFilePath}`)

    console.log(`[VPS Delete] Deleted ${remoteFilePath}`)

    ssh.dispose()
    return true
  } catch (error) {
    console.error('[VPS Delete] Failed:', error)
    ssh.dispose()
    return false
  }
}

/**
 * Check if a file exists on VPS
 */
export async function existsOnVps(
  filename: string,
  type: UploadType = 'products'
): Promise<boolean> {
  const ssh = new NodeSSH()

  try {
    const subdir = UPLOAD_PATHS[type] || type
    const remoteFilePath = `${VPS_CONFIG.uploadsPath}/${subdir}/${filename}`

    await ssh.connect({
      host: VPS_CONFIG.host,
      username: VPS_CONFIG.username,
      privateKeyPath: VPS_CONFIG.privateKeyPath,
    })

    const result = await ssh.execCommand(`test -f ${remoteFilePath} && echo "exists"`)

    ssh.dispose()
    return result.stdout.includes('exists')
  } catch (error) {
    console.error('[VPS Check] Failed:', error)
    ssh.dispose()
    return false
  }
}

/**
 * Get VPS configuration for debugging
 */
export function getVpsConfig() {
  return {
    host: VPS_CONFIG.host,
    username: VPS_CONFIG.username,
    basePath: VPS_CONFIG.basePath,
    uploadsPath: VPS_CONFIG.uploadsPath,
    sshKeyConfigured: isVpsUploadEnabled(),
  }
}
