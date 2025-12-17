/**
 * EXAMPLE: Complete Catalog Page Integration
 * Copy this example for quick Cursor integration
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HeroBanner,
  PromoPanel,
  TrendingRowVisual,
  BrandsRowVisual,
  CategoriesRowVisual,
  ProductGrid,
  PriceTierBar,
  a11y,
  type ProductTier,
  type TrendingProduct,
  type BrandVisual,
  type CategoryVisual,
} from '@/components/catalog'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogProduct } from '@/types/catalog'

export default function CatalogPage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTier, setActiveTier] = useState<ProductTier | null>(null)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products', activeTier],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeTier) params.set('tier', activeTier)

      const res = await fetch(`/api/catalog/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  // Fetch trending
  const { data: trendingData } = useQuery<{ data: any[] }>({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?trending=true&limit=10')
      if (!res.ok) throw new Error('Failed to fetch trending')
      return res.json()
    },
  })

  // Fetch brands
  const { data: brandsData } = useQuery<{ data: any[] }>({
    queryKey: ['catalog-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  // Fetch categories
  const { data: categoriesData } = useQuery<{ data: any[] }>({
    queryKey: ['catalog-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  // ============================================================================
  // DATA TRANSFORMATION
  // ============================================================================

  const products: CatalogProduct[] = productsData?.data ?? []

  const trendingProducts: TrendingProduct[] = (trendingData?.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: getPublicImageUrl(p.imageUrl),
    price: Number(p.price),
    discount: p.discountPercent,
    badge: p.badge,
  }))

  const brands: BrandVisual[] = (brandsData?.data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    logoUrl: getPublicImageUrl(b.imageUrl), // Map imageUrl → logoUrl
    productCount: b.productCount,
    featured: b.featured ?? false,
  }))

  const categories: CategoryVisual[] = (categoriesData?.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: getPublicImageUrl(c.imageUrl),
    productCount: c.productCount,
    description: c.description,
  }))

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)

    // TODO: Wire to actual cart system
    console.log('Add to cart:', productId)

    // Accessibility announcement
    if (product) {
      a11y.announceAddToCart(product.name)
    }
  }

  const handleTierChange = (tier: ProductTier | null) => {
    setActiveTier(tier)
    a11y.announceTierChange(tier) // Screen reader announcement
  }

  const handleProductClick = (productId: string) => {
    // TODO: Navigate to product detail page
    console.log('Product clicked:', productId)
  }

  const handleBrandClick = (brandId: string) => {
    // TODO: Navigate to brand page
    console.log('Brand clicked:', brandId)
  }

  const handleCategoryClick = (categoryId: string) => {
    // TODO: Navigate to category page
    console.log('Category clicked:', categoryId)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className={a11y.getSkipLinkClasses()}>
        Saltar al contenido principal
      </a>

      {/* ========================================================================
          HERO BANNER
      ======================================================================== */}
      <section className="mb-12">
        <HeroBanner
          imageUrl="/images/hero/christmas-sale.jpg"
          headline="¡Ofertas de Temporada!"
          subheadline="Hasta 50% de Descuento"
          theme="christmas"
          overlay="festive"
          ctaText="Ver Ofertas"
          onCtaClick={() => console.log('Hero CTA clicked')}
          aria-label={a11y.getHeroBannerAriaLabel({
            headline: '¡Ofertas de Temporada!',
            subheadline: 'Hasta 50% de Descuento',
            theme: 'christmas',
          })}
        />
      </section>

      {/* ========================================================================
          TRENDING ROW
      ======================================================================== */}
      {trendingProducts.length > 0 && (
        <section className="mb-12">
          <TrendingRowVisual
            title="¡Tendencias Ahora!"
            subtitle="Los más vendidos"
            products={trendingProducts}
            gradientTheme="red"
            onProductClick={handleProductClick}
          />
        </section>
      )}

      {/* ========================================================================
          PRICE TIER BAR (Sticky)
      ======================================================================== */}
      <PriceTierBar
        activeTier={activeTier}
        onTierSelect={handleTierChange}
        showCounts
        tierCounts={{
          A: products.filter((p) => p.tier === 'A').length,
          B: products.filter((p) => p.tier === 'B').length,
          C: products.filter((p) => p.tier === 'C').length,
        }}
        highlightActive
      />

      {/* ========================================================================
          PRODUCT GRID
      ======================================================================== */}
      <main id="main-content" role="main">
        <section className="container mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Catálogo de Productos
            </h1>
            <p className="text-lg text-gray-600">
              {activeTier
                ? `Mostrando productos Categoría ${activeTier}`
                : 'Todos los productos disponibles'}
            </p>
          </div>

          <ProductGrid
            products={products}
            activeTier={activeTier}
            loading={productsLoading}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            emptyMessage={
              activeTier
                ? `No hay productos en Categoría ${activeTier}`
                : 'No hay productos disponibles'
            }
          />
        </section>
      </main>

      {/* ========================================================================
          PROMO PANELS
      ======================================================================== */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <PromoPanel
            productImage="/images/products/coca-cola-2l.png"
            title="Coca-Cola 2L"
            discount={30}
            description="Lleva 2 por el precio de 1"
            badge="OFERTA"
            variant="chedraui"
            ctaText="Agregar al Carrito"
            onCtaClick={() => handleAddToCart('coca-cola-2l')}
          />

          <PromoPanel
            productImage="/images/products/sabritas-pack.png"
            title="Sabritas Variedad"
            discount={25}
            description="Pack familiar con 6 bolsas"
            badge="NUEVO"
            variant="walmart"
            ctaText="Agregar al Carrito"
            onCtaClick={() => handleAddToCart('sabritas-pack')}
          />
        </div>
      </section>

      {/* ========================================================================
          BRANDS ROW
      ======================================================================== */}
      {brands.length > 0 && (
        <BrandsRowVisual
          title="Marcas Premium"
          subtitle="Calidad garantizada"
          brands={brands}
          onBrandClick={handleBrandClick}
          onViewAll={() => console.log('View all brands')}
        />
      )}

      {/* ========================================================================
          CATEGORIES ROW
      ======================================================================== */}
      {categories.length > 0 && (
        <CategoriesRowVisual
          title="Explora por Categoría"
          subtitle="Encuentra lo que necesitas"
          categories={categories}
          layout="grid"
          festiveEdges
          onCategoryClick={handleCategoryClick}
          onViewAll={() => console.log('View all categories')}
        />
      )}
    </div>
  )
}

// ============================================================================
// NOTES FOR CURSOR INTEGRATION:
// ============================================================================

/*

1. REPLACE TODO COMMENTS WITH ACTUAL IMPLEMENTATIONS:
   - handleAddToCart → Wire to cart system
   - handleProductClick → Add router.push('/products/[id]')
   - handleBrandClick → Add router.push('/brands/[id]')
   - handleCategoryClick → Add router.push('/categories/[id]')

2. UPDATE IMAGE PATHS:
   - Replace '/images/...' with actual image URLs
   - Use getPublicImageUrl() for API images

3. ADD TOAST NOTIFICATIONS:
   import { toast } from 'sonner'

   const handleAddToCart = (productId: string) => {
     addToCart(productId)
     toast.success('Producto agregado al carrito')
   }

4. ADD AUTHENTICATION:
   - Detect user tier from auth context
   - Set activeTier default based on user tier

5. ADD ANALYTICS:
   const handleProductClick = (productId: string) => {
     track('product_view', { productId })
     router.push(`/products/${productId}`)
   }

6. OPTIMIZE PERFORMANCE:
   - Add React.memo() to expensive components
   - Use Next.js <Image> component
   - Add virtualization for large product lists

7. SEO OPTIMIZATION:
   - Add metadata to page
   - Add structured data (schema.org)
   - Add canonical URLs

8. ERROR HANDLING:
   - Add error boundaries
   - Add retry logic for failed queries
   - Add fallback UI for errors

9. LOADING STATES:
   - ProductGrid already handles loading
   - Add skeleton loaders for other sections

10. RESPONSIVE TESTING:
    - Test on mobile (320px - 768px)
    - Test on tablet (768px - 1024px)
    - Test on desktop (1024px+)

*/
