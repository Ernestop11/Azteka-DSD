'use client'

import { motion } from 'framer-motion'
import ImagePreviewCard from './ImagePreviewCard'
import HeroBanner from './HeroBanner'
import PromoPanel from './PromoPanel'

export interface CatalogImagePreviewsProps {
  // Hero Banner
  heroBannerUrl?: string | null
  heroBannerHeadline?: string
  heroBannerSubheadline?: string
  heroBannerTheme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'

  // Promo Banner
  promoBannerUrl?: string | null
  promoBannerTitle?: string
  promoBannerDiscount?: number
  promoBannerVariant?: 'chedraui' | 'walmart' | 'default'

  // Brand Image
  brandImageUrl?: string | null
  brandName?: string

  // Category Image
  categoryImageUrl?: string | null
  categoryName?: string

  // Callbacks
  onHeroBannerClick?: () => void
  onPromoBannerClick?: () => void
  onBrandImageClick?: () => void
  onCategoryImageClick?: () => void
}

export default function CatalogImagePreviews({
  heroBannerUrl,
  heroBannerHeadline = 'Preview Hero Banner',
  heroBannerSubheadline = 'Upload an image to see preview',
  heroBannerTheme = 'default',

  promoBannerUrl,
  promoBannerTitle = 'Preview Promo',
  promoBannerDiscount = 30,
  promoBannerVariant = 'default',

  brandImageUrl,
  brandName = 'Brand Preview',

  categoryImageUrl,
  categoryName = 'Category Preview',

  onHeroBannerClick,
  onPromoBannerClick,
  onBrandImageClick,
  onCategoryImageClick,
}: CatalogImagePreviewsProps) {
  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Catalog Image Previews
        </h3>
        <p className="text-gray-600">
          See how your uploaded images will appear in the catalog
        </p>
      </div>

      {/* Hero Banner Preview */}
      {heroBannerUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              Hero Banner Preview
            </h4>
            <p className="text-sm text-gray-600">
              This is how your hero banner will appear on the catalog page
            </p>
          </div>
          <HeroBanner
            imageUrl={heroBannerUrl}
            title={heroBannerHeadline || 'Premium Wholesale Products'}
            subtitle={heroBannerSubheadline}
            theme={heroBannerTheme}
            ctaText="Shop Now"
            onCtaClick={onHeroBannerClick}
          />
        </motion.div>
      )}

      {/* Promo Panel Preview */}
      {promoBannerUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              Promo Panel Preview
            </h4>
            <p className="text-sm text-gray-600">
              This is how your promotional banner will appear
            </p>
          </div>
          <PromoPanel
            productImage={promoBannerUrl}
            title={promoBannerTitle}
            discount={promoBannerDiscount}
            description="Special promotional offer"
            variant={promoBannerVariant}
            ctaText="Add to Cart"
            onCtaClick={onPromoBannerClick}
          />
        </motion.div>
      )}

      {/* Image Grid Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hero Banner Card */}
        <ImagePreviewCard
          src={heroBannerUrl}
          label="Hero Banner"
          aspect="video"
          showCheckmark={Boolean(heroBannerUrl)}
          onClick={onHeroBannerClick}
        />

        {/* Promo Banner Card */}
        <ImagePreviewCard
          src={promoBannerUrl}
          label="Promo Banner"
          aspect="square"
          showCheckmark={Boolean(promoBannerUrl)}
          onClick={onPromoBannerClick}
        />

        {/* Brand Image Card */}
        <ImagePreviewCard
          src={brandImageUrl}
          label={brandName}
          aspect="square"
          showCheckmark={Boolean(brandImageUrl)}
          onClick={onBrandImageClick}
        />

        {/* Category Image Card */}
        <ImagePreviewCard
          src={categoryImageUrl}
          label={categoryName}
          aspect="portrait"
          showCheckmark={Boolean(categoryImageUrl)}
          onClick={onCategoryImageClick}
        />
      </div>
    </div>
  )
}
