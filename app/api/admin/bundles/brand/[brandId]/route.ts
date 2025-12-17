import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { toCatalogProduct } from '@/lib/queries/catalog'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export const dynamic = 'force-dynamic'

// GET - Get brand bundle with all products
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    // Get brand
    const brand = await prisma.brand.findUnique({
      where: { id: params.brandId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Get all products for this brand
    const products = await prisma.product.findMany({
      where: { brandId: params.brandId },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Get or create bundle for this brand
    let bundle = await (prisma as any).productBundle.findFirst({
      where: {
        brandId: params.brandId,
        active: true,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // If no bundle exists, create a default one
    if (!bundle) {
      const totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0)
      const discountPercent = products.length >= 5 ? 15 : products.length >= 3 ? 10 : 0

      bundle = await (prisma as any).productBundle.create({
        data: {
          name: `${brand.name} Complete Collection`,
          slug: `${brand.name.toLowerCase().replace(/\s+/g, '-')}-bundle`,
          description: `Complete ${brand.name} product collection with special pricing`,
          brandId: params.brandId,
          price: totalPrice * (1 - discountPercent / 100),
          discountPercent,
          stock: 100,
          minStock: 10,
          inStock: true,
          featured: true,
          active: true,
          badgeText: discountPercent > 0 ? `${discountPercent}% OFF` : 'BEST VALUE',
          badgeColor: '#10b981',
          items: {
            create: products.map((product) => ({
              productId: product.id,
              quantity: 1,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    }

    // Normalize products
    const normalizedProducts = products.map(toCatalogProduct)

    // Calculate bundle price
    const bundlePrice = Number(bundle.price) || normalizedProducts.reduce((sum, p) => sum + p.price, 0)
    const discountPercent = Number(bundle.discountPercent) || 0

    // Rack offer (can be customized per brand)
    const rackOffer = {
      title: 'Free Display Rack Included!',
      description: `Order this ${brand.name} bundle and receive a free display rack to showcase all products.`,
      imageUrl: null,
    }

    const brandBundle = {
      id: bundle.id,
      name: bundle.name,
      brandId: brand.id,
      brandName: brand.name,
      imageUrl: getPublicImageUrl(brand.imageUrl || bundle.imageUrl),
      products: normalizedProducts,
      price: bundlePrice,
      discountPercent,
      rackOffer,
      badgeText: bundle.badgeText,
      badgeColor: bundle.badgeColor,
    }

    const response: TApiResponse<typeof brandBundle> = { data: brandBundle }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching brand bundle:', error)
    const err: ErrorResponse = {
      error: 'Failed to fetch brand bundle',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

