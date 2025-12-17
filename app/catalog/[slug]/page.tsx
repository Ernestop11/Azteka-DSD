import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import { normalizeProductImage } from '@/lib/imageUrl'
import GlossyProductCard from '@/components/catalog/GlossyProductCard'
import ProductDetailClient from './ProductDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: slug },
          { id: slug },
        ],
      },
      include: {
        category: true,
        brand: true,
      },
    })

    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getRelatedProducts(categoryId: string | null, excludeId: string, limit: number = 4) {
  if (!categoryId) return []

  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
      },
      include: {
        category: true,
        brand: true,
      },
      take: limit,
    })

    return products
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4)

  // Transform product for GlossyProductCard
  const productData = {
    id: product.id,
    name: product.name,
    brand: product.brand?.name,
    price: Number(product.price),
    imageUrl: normalizeProductImage({ imageUrl: product.imageUrl }),
    tier: (product.tier as 'A' | 'B' | 'C' | undefined) || undefined,
    rewardsPoints: product.points || undefined,
    priceTierA: product.priceTierA ? Number(product.priceTierA) : null,
    priceTierB: product.priceTierB ? Number(product.priceTierB) : null,
    priceTierC: product.priceTierC ? Number(product.priceTierC) : null,
    badge: (product.badge as 'NEW' | 'HOT' | 'LIMITED' | null) || null,
    theme: (product.theme as 'default' | 'holiday' | 'summer' | 'muertos' | undefined) || undefined,
    glossLevel: (product.glossLevel as 'none' | 'soft' | 'premium' | undefined) || undefined,
    sparkle: product.sparkle || false,
  }

  const relatedProductsData = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name,
    price: Number(p.price),
    imageUrl: normalizeProductImage({ imageUrl: p.imageUrl }),
    tier: (p.tier as 'A' | 'B' | 'C' | undefined) || undefined,
    rewardsPoints: p.points || undefined,
    priceTierA: p.priceTierA ? Number(p.priceTierA) : null,
    priceTierB: p.priceTierB ? Number(p.priceTierB) : null,
    priceTierC: p.priceTierC ? Number(p.priceTierC) : null,
    badge: (p.badge as 'NEW' | 'HOT' | 'LIMITED' | null) || null,
    theme: (p.theme as 'default' | 'holiday' | 'summer' | 'muertos' | undefined) || undefined,
    glossLevel: (p.glossLevel as 'none' | 'soft' | 'premium' | undefined) || undefined,
    sparkle: p.sparkle || false,
  }))

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    }>
      <ProductDetailClient
        product={productData}
        relatedProducts={relatedProductsData}
        productDetails={{
          sku: product.sku,
          description: product.description,
          unitsPerCase: product.unitsPerCase,
          category: product.category?.name || null,
          brand: product.brand?.name || null,
        }}
      />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'

