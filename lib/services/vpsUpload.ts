/**
 * VPS Direct Upload Service
 *
 * Uploads files directly to VPS via SSH/SCP instead of saving locally.
 * This ensures the VPS is always the single source of truth for images.
 */

import { NodeSSH } from 'node-ssh'
import path from 'path'

// VPS Configuration from environment
// NOTE: Production runs from /srv/azteka-dsd on NEW VPS (72.62.162.163)
const VPS_CONFIG = {
  host: process.env.VPS_HOST || process.env.VPS_SSH_HOST || '72.62.162.163',
  username: process.env.VPS_USER || process.env.VPS_SSH_USER || 'root',
  privateKeyPath: process.env.VPS_SSH_KEY_PATH || `${process.env.HOME}/.ssh/id_rsa`,
  basePath: process.env.VPS_PATH || '/srv/azteka-dsd',
  uploadsPath: process.env.VPS_UPLOADS_PATH || '/srv/azteka-dsd/public/uploads',
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
 * Check if we're running directly on the VPS
 */
function isRunningOnVps(): boolean {
  const fs = require('fs')
  // If the VPS uploads path exists locally, we're on the VPS
  return fs.existsSync(VPS_CONFIG.uploadsPath)
}

/**
 * Check if VPS upload is enabled
 */
export function isVpsUploadEnabled(): boolean {
  // If we're on the VPS, we can always upload (direct filesystem write)
  if (isRunningOnVps()) {
    return true
  }

  // Otherwise check if we have SSH key access for remote upload
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
 * If running on VPS, writes directly to filesystem
 * If running locally, uses SSH/SCP
 */
export async function uploadToVps(
  buffer: Buffer,
  filename: string,
  type: UploadType = 'products'
): Promise<UploadResult> {
  const fs = require('fs')
  const fsPromises = require('fs').promises

  // Get the upload subdirectory
  const subdir = UPLOAD_PATHS[type] || type
  const uploadDir = `${VPS_CONFIG.uploadsPath}/${subdir}`
  const filePath = `${uploadDir}/${filename}`
  const publicUrl = `/uploads/${subdir}/${filename}`

  // If we're running ON the VPS, write directly to filesystem
  if (isRunningOnVps()) {
    try {
      console.log(`[VPS Upload] Running on VPS, writing directly to: ${filePath}`)

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        await fsPromises.mkdir(uploadDir, { recursive: true })
      }

      // Write file
      await fsPromises.writeFile(filePath, buffer)

      console.log(`[VPS Upload] Direct write successful: ${filePath}`)

      return {
        success: true,
        url: publicUrl,
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[VPS Upload] Direct write failed:', message)
      return {
        success: false,
        url: '',
        error: message,
      }
    }
  }

  // Otherwise use SSH for remote upload
  const ssh = new NodeSSH()

  try {
    console.log(`[VPS Upload] Connecting to ${VPS_CONFIG.host}...`)

    // Connect to VPS
    await ssh.connect({
      host: VPS_CONFIG.host,
      username: VPS_CONFIG.username,
      privateKeyPath: VPS_CONFIG.privateKeyPath,
    })

    console.log(`[VPS Upload] Connected. Ensuring directory exists: ${uploadDir}`)

    // Ensure the directory exists
    await ssh.execCommand(`mkdir -p ${uploadDir}`)

    // Upload the file using putBuffer
    console.log(`[VPS Upload] Uploading ${filename} (${buffer.length} bytes)...`)

    // Write buffer to temp file first, then SCP it
    const tempPath = `/tmp/azteka-upload-${Date.now()}-${filename}`
    await fsPromises.writeFile(tempPath, buffer)

    await ssh.putFile(tempPath, filePath)

    // Clean up temp file
    await fsPromises.unlink(tempPath)

    // Set proper permissions
    await ssh.execCommand(`chmod 644 ${filePath}`)

    console.log(`[VPS Upload] Successfully uploaded to ${filePath}`)

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
