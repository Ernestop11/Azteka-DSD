import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/app/api/lib/auth'

/**
 * GET /api/admin/prevention/image-monitor
 * 
 * Prevention monitoring endpoint
 * Returns health status and recommendations
 */
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    
    // Get recent uploads (last 24 hours)
    const recentProducts = await prisma.product.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        },
        imageUrl: { not: null }
      },
      select: {
        id: true,
        imageUrl: true,
        updatedAt: true
      },
      take: 100
    })

    // Check if files exist for recent uploads
    const recentIssues = recentProducts.filter(p => {
      if (!p.imageUrl) return true
      const filename = p.imageUrl
        .replace('/uploads/products/', '')
        .replace('/uploads/prod/', '')
        .split('?')[0]
      const filepath = join(uploadsDir, filename)
      return !existsSync(filepath)
    })

    // Get all products with images
    const allProducts = await prisma.product.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, imageUrl: true }
    })

    let allIssues = 0
    for (const p of allProducts.slice(0, 100)) {
      if (!p.imageUrl) continue
      const filename = p.imageUrl.replace('/uploads/products/', '').replace('/uploads/prod/', '').split('?')[0]
      if (!existsSync(join(uploadsDir, filename))) {
        allIssues++
      }
    }

    const healthStatus = {
      overall: 'healthy' as 'healthy' | 'warning' | 'critical',
      metrics: {
        recentUploads: recentProducts.length,
        recentIssues: recentIssues.length,
        estimatedTotalIssues: allIssues,
        uploadsDirExists: existsSync(uploadsDir)
      },
      recommendations: [] as string[]
    }

    // Determine health status
    if (recentIssues.length > recentProducts.length * 0.1) {
      healthStatus.overall = 'critical'
      healthStatus.recommendations.push('More than 10% of recent uploads have missing files - urgent attention needed')
    } else if (recentIssues.length > 0) {
      healthStatus.overall = 'warning'
      healthStatus.recommendations.push('Some recent uploads have missing files')
    }

    if (!existsSync(uploadsDir)) {
      healthStatus.overall = 'critical'
      healthStatus.recommendations.push('Uploads directory does not exist - create it immediately')
    }

    if (allIssues > 50) {
      healthStatus.recommendations.push('Large number of missing image files detected - run fix script')
    }

    // Prevention recommendations
    healthStatus.recommendations.push('Run image sync script regularly: node scripts/sync-images-to-vps.mjs')
    healthStatus.recommendations.push('Monitor health daily: node scripts/monitor-image-health.mjs')
    healthStatus.recommendations.push('Check diagnostics: GET /api/admin/diagnostics/images')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: healthStatus
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

