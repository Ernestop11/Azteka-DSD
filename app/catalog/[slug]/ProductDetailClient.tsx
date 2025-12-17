'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { getPublicImageUrl } from '@/lib/imageUrl'
import GlossyProductCard from '@/components/catalog/GlossyProductCard'
import CaseQuantitySelector from '@/components/catalog/CaseQuantitySelector'
import TierPricingDisplay from '@/components/catalog/TierPricingDisplay'
import AddToCartModal from '@/components/catalog/AddToCartModal'
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    brand?: string
    price: number
    imageUrl: string | null
    tier?: 'A' | 'B' | 'C'
    rewardsPoints?: number
    priceTierA?: number | null
    priceTierB?: number | null
    priceTierC?: number | null
    badge?: 'NEW' | 'HOT' | 'LIMITED' | null
    theme?: 'default' | 'holiday' | 'summer' | 'muertos'
    glossLevel?: 'none' | 'soft' | 'premium'
    sparkle?: boolean
  }
  relatedProducts: Array<{
    id: string
    name: string
    brand?: string
    price: number
    imageUrl: string | null
    tier?: 'A' | 'B' | 'C'
    rewardsPoints?: number
    priceTierA?: number | null
    priceTierB?: number | null
    priceTierC?: number | null
    badge?: 'NEW' | 'HOT' | 'LIMITED' | null
    theme?: 'default' | 'holiday' | 'summer' | 'muertos'
    glossLevel?: 'none' | 'soft' | 'premium'
    sparkle?: boolean
  }>
  productDetails: {
    sku: string
    description: string | null
    unitsPerCase: number
    category: string | null
    brand: string | null
  }
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  productDetails,
}: ProductDetailClientProps) {
  const router = useRouter()
  const { add } = useCart()
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    setShowAddToCartModal(true)
  }

  const handleQuantityChange = (cases: number, totalUnits: number, totalPrice: number) => {
    setQuantity(cases)
  }

  const handleAddToCartComplete = () => {
    // Cart will open automatically via CartDrawer
  }

  const productForModal: CatalogProduct = {
    id: product.id,
    name: product.name,
    sku: productDetails.sku,
    description: productDetails.description,
    price: product.price,
    brand: typeof product.brand === 'string' ? product.brand : '',
    category: productDetails.category || '',
    imageUrl: getPublicImageUrl(product.imageUrl),
    unitsPerCase: productDetails.unitsPerCase,
    // priceTierA: product.priceTierA || null,
    // priceTierB: product.priceTierB || null,
    // priceTierC: product.priceTierC || null,
    // tier: product.tier || null,
  }

  const handleRelatedProductClick = (productId: string) => {
    router.push(`/catalog/${productId}`)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
            <img
              src={getPublicImageUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div className="space-y-2">
              {product.brand && (
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {typeof product.brand === 'string' ? product.brand : (product.brand as any)?.name || ''}
                </div>
              )}
              {productDetails.category && (
                <div className="text-sm text-gray-600">
                  Category: {typeof productDetails.category === 'string' ? productDetails.category : (productDetails.category as any)?.name || ''}
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

            {/* SKU */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>SKU: {productDetails.sku}</span>
            </div>

            {/* Description */}
            {productDetails.description && (
              <p className="text-gray-700 leading-relaxed">{productDetails.description}</p>
            )}

            {/* Price Section */}
            <div className="space-y-4 p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </div>
              
              {/* Tier Pricing Display */}
              {(product.priceTierA || product.priceTierB || product.priceTierC) && (
                <div className="pt-4 border-t border-gray-200">
                  <TierPricingDisplay
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      priceTierA: product.priceTierA || null,
                      priceTierB: product.priceTierB || null,
                      priceTierC: product.priceTierC || null,
                      tier: product.tier || null,
                    }}
                    currentTier={product.tier || undefined}
                  />
                </div>
              )}

              {/* Case Quantity Selector */}
              <div className="pt-4 border-t border-gray-200">
                <CaseQuantitySelector
                  product={{
                    id: product.id,
                    name: product.name,
                    unitsPerCase: productDetails.unitsPerCase,
                    price: product.price,
                  }}
                  onQuantityChange={handleQuantityChange}
                  initialCases={quantity}
                />
              </div>

              {/* Rewards Points */}
              {product.rewardsPoints && (
                <div className="text-sm text-gray-600">
                  Earn {product.rewardsPoints} reward points
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Add to Cart Modal */}
        {showAddToCartModal && (
          <AddToCartModal
            product={productForModal}
            isOpen={showAddToCartModal}
            onClose={() => setShowAddToCartModal(false)}
            onAddComplete={handleAddToCartComplete}
          />
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} onClick={() => handleRelatedProductClick(relatedProduct.id)}>
                  <GlossyProductCard
                    product={{
                      ...relatedProduct,
                      imageUrl: getPublicImageUrl(relatedProduct.imageUrl),
                    }}
                    onClick={() => handleRelatedProductClick(relatedProduct.id)}
                    onAddToCart={() => {
                      add({
                        id: relatedProduct.id,
                        name: relatedProduct.name,
                        price: relatedProduct.price,
                        quantity: 1,
                        imageUrl: getPublicImageUrl(relatedProduct.imageUrl),
                        tierPricing: {
                          priceCase: relatedProduct.price,
                          priceTierA: relatedProduct.priceTierA || null,
                          priceTierB: relatedProduct.priceTierB || null,
                          priceTierC: relatedProduct.priceTierC || null,
                        },
                      })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}

