import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/app/api/lib/auth'

type ImageDiagnosticRow = {
  productId: string
  name: string
  sku: string
  imageUrl: string | null
  inStock?: boolean | null
  expectedFilename?: string
  fileExists: boolean
  fileSize?: number
  fileModified?: Date | null
  filepath?: string | null
  reason: string
  httpStatus?: number | null
  httpOk?: boolean | null
  publicUrl?: string | null
  httpError?: string | null
}

async function headWithTimeout(url: string, timeoutMs: number): Promise<{ status: number; ok: boolean } | { error: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })
    return { status: res.status, ok: res.ok }
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'timeout' : (err?.message || String(err))
    return { error: message }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * GET /api/admin/diagnostics/images
 * 
 * Diagnostic endpoint to check image status:
 * - Products with imageUrl in database
 * - Actual image files on disk
 * - Mismatches between DB and filesystem
 * - Image serving status
 */
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const url = new URL(request.url)
    const origin = url.origin
    const limitParam = Number(url.searchParams.get('limit') ?? '0')
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 2000) : 0
    const includeAll = url.searchParams.get('includeAll') === 'true'
    const checkHttp = url.searchParams.get('checkHttp') === 'true'
    const httpTimeoutMsParam = Number(url.searchParams.get('httpTimeoutMs') ?? '0')
    const httpTimeoutMs = Number.isFinite(httpTimeoutMsParam) && httpTimeoutMsParam > 0
      ? Math.min(Math.floor(httpTimeoutMsParam), 10_000)
      : 2000

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    const uploadsDirExists = existsSync(uploadsDir)

    // Get all products with images
    const whereClause = includeAll
      ? {}
      : {
          imageUrl: { not: null },
        }

    const productsWithImages = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        sku: true,
        imageUrl: true,
        inStock: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      ...(limit ? { take: limit } : {}),
    })

    // Check which files exist on disk
    const fileChecks: ImageDiagnosticRow[] = productsWithImages.map(p => {
      if (!p.imageUrl) {
        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          imageUrl: null,
          fileExists: false,
          reason: 'No imageUrl in database'
        }
      }

      // Extract filename from URL
      let filename = p.imageUrl
        .replace('/uploads/products/', '')
        .replace('/uploads/prod/', '')
        .split('?')[0] // Remove query params
        .split('#')[0] // Remove hash

      // If productId.png format, use that
      if (p.imageUrl.includes(`${p.id}.png`)) {
        filename = `${p.id}.png`
      }

      const filepath = join(uploadsDir, filename)
      const exists = uploadsDirExists && existsSync(filepath)

      let fileSize = 0
      let fileModified = null
      if (exists) {
        try {
          const stats = statSync(filepath)
          fileSize = stats.size
          fileModified = stats.mtime
        } catch (e) {
          // Ignore stat errors
        }
      }

      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        imageUrl: p.imageUrl,
        inStock: p.inStock,
        expectedFilename: filename,
        fileExists: exists,
        fileSize,
        fileModified,
        filepath: exists ? filepath : null,
        reason: exists ? 'OK' : `File not found: ${filename}`
      }
    })

    // Optional: check whether the image URL is actually being served over HTTP.
    // Keep this limited to problematic rows by default to avoid long response times.
    if (checkHttp) {
      const rowsToCheck = fileChecks.filter(fc => {
        // Only check /uploads/* paths, and prioritize rows that look wrong.
        const path = (fc.imageUrl || '').trim()
        const isUploads = path.startsWith('/uploads/') || path.includes('/uploads/')
        const isProblem = !fc.fileExists || !fc.imageUrl
        return isUploads && (isProblem || includeAll)
      })

      await Promise.all(
        rowsToCheck.map(async (row) => {
          const imgPathRaw = (row.imageUrl || '').trim()
          if (!imgPathRaw) {
            row.httpStatus = null
            row.httpOk = null
            row.publicUrl = null
            row.httpError = 'no imageUrl'
            return
          }

          const uploadsIndex = imgPathRaw.indexOf('/uploads/')
          const imgPath = uploadsIndex >= 0 ? imgPathRaw.slice(uploadsIndex) : imgPathRaw
          const publicUrl = imgPath.startsWith('http') ? imgPath : `${origin}${imgPath}`
          row.publicUrl = publicUrl

          const result = await headWithTimeout(publicUrl, httpTimeoutMs)
          if ('error' in result) {
            row.httpStatus = null
            row.httpOk = null
            row.httpError = result.error
            return
          }

          row.httpStatus = result.status
          row.httpOk = result.ok
          row.httpError = null
        })
      )
    }

    // Get all files in uploads directory
    let filesOnDisk: Array<{ name: string; size: number; modified: Date }> = []
    if (uploadsDirExists) {
      try {
        filesOnDisk = readdirSync(uploadsDir)
          .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
          .map(f => {
            const filepath = join(uploadsDir, f)
            try {
              const stats = statSync(filepath)
              return {
                name: f,
                size: stats.size,
                modified: stats.mtime
              }
            } catch {
              return { name: f, size: 0, modified: new Date() }
            }
          })
      } catch (e) {
        // Directory read error
      }
    }

    // Find orphaned files (files not referenced in DB)
    const referencedFilenames = new Set(
      fileChecks
        .filter(fc => fc.expectedFilename)
        .map(fc => fc.expectedFilename!)
    )
    
    const orphanedFiles = filesOnDisk.filter(
      f => !referencedFilenames.has(f.name)
    )

    // Statistics
    const stats = {
      totalProductsWithImageUrl: productsWithImages.length,
      filesExistOnDisk: fileChecks.filter(fc => fc.fileExists).length,
      filesMissingFromDisk: fileChecks.filter(fc => !fc.fileExists).length,
      totalFilesOnDisk: filesOnDisk.length,
      orphanedFiles: orphanedFiles.length,
      outOfStockProducts: fileChecks.filter(fc => fc.inStock === false).length,
      uploadsDirExists,
      uploadsDirPath: uploadsDir
    }

    // Sample problematic products (first 20)
    const problematic = fileChecks
      .filter(fc => !fc.fileExists || fc.inStock === false || (checkHttp && fc.httpOk === false))
      .slice(0, 20)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      problematicProducts: problematic,
      sampleFiles: filesOnDisk.slice(0, 10),
      orphanedFiles: orphanedFiles.slice(0, 10),
      notes: {
        checkHttp,
        includeAll,
        limit: limit || null,
        httpTimeoutMs: checkHttp ? httpTimeoutMs : null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        uploadsDir
      }
    })
  } catch (error: any) {
    console.error('[Image Diagnostics] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

