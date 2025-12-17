/**
 * Accessibility Utilities for Azteka Catalog Components
 * Provides ARIA helpers and focus management for premium UI
 */

// ============================================================================
// ARIA LABEL GENERATORS
// ============================================================================

export function getProductCardAriaLabel(product: {
  name: string
  brand?: string
  price: number
  originalPrice?: number
  tier?: string
  badge?: string
}): string {
  const parts: string[] = []

  // Product name
  parts.push(product.name)

  // Brand
  if (product.brand) {
    const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || ''
    if (brandName) parts.push(`por ${brandName}`)
  }

  // Price
  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    parts.push(`Precio ${product.price} pesos, antes ${product.originalPrice} pesos, ${discount}% de descuento`)
  } else {
    parts.push(`Precio ${product.price} pesos`)
  }

  // Tier
  if (product.tier) {
    const tierNames = { A: 'Premium', B: 'Estándar', C: 'Económico' }
    parts.push(`Categoría ${tierNames[product.tier as 'A' | 'B' | 'C'] || product.tier}`)
  }

  // Badge
  if (product.badge) {
    const badgeNames = {
      NEW: 'Nuevo producto',
      SALE: 'En oferta',
      HOT: 'Producto popular',
      LIMITED: 'Edición limitada',
    }
    parts.push(badgeNames[product.badge as keyof typeof badgeNames] || product.badge)
  }

  return parts.join(', ')
}

export function getBrandCardAriaLabel(brand: {
  name: string
  productCount?: number
  featured?: boolean
}): string {
  const parts: string[] = []

  parts.push(`Marca ${brand.name}`)

  if (brand.productCount) {
    parts.push(`${brand.productCount} productos disponibles`)
  }

  if (brand.featured) {
    parts.push('Marca destacada')
  }

  return parts.join(', ')
}

export function getCategoryCardAriaLabel(category: {
  name: string
  productCount?: number
  description?: string
}): string {
  const parts: string[] = []

  parts.push(`Categoría ${category.name}`)

  if (category.description) {
    parts.push(category.description)
  }

  if (category.productCount) {
    parts.push(`${category.productCount} productos`)
  }

  return parts.join(', ')
}

export function getHeroBannerAriaLabel(banner: {
  headline: string
  subheadline?: string
  theme?: string
}): string {
  const parts: string[] = []

  parts.push(banner.headline)

  if (banner.subheadline) {
    parts.push(banner.subheadline)
  }

  if (banner.theme && banner.theme !== 'default') {
    const themeNames = {
      christmas: 'Promoción navideña',
      summer: 'Promoción de verano',
      'dia-muertos': 'Promoción Día de Muertos',
      posadas: 'Promoción Posadas',
      'new-year': 'Promoción Año Nuevo',
    }
    parts.push(themeNames[banner.theme as keyof typeof themeNames] || '')
  }

  return parts.join('. ')
}

export function getPromoPanelAriaLabel(promo: {
  title: string
  discount: number
  description?: string
}): string {
  return `Oferta especial: ${promo.title}, ${promo.discount}% de descuento${
    promo.description ? `, ${promo.description}` : ''
  }`
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

export function getFocusClasses(variant: 'default' | 'premium' | 'gold' = 'default'): string {
  const variants = {
    default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    premium: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white',
    gold: 'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-white',
  }

  return variants[variant]
}

export function getButtonFocusClasses(): string {
  return 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-600'
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

export function handleCardKeyDown(
  event: React.KeyboardEvent,
  onClick?: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onClick?.()
  }
}

export function handleGridNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  columns: number,
  onNavigate: (newIndex: number) => void
): void {
  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowRight':
      newIndex = Math.min(currentIndex + 1, totalItems - 1)
      break
    case 'ArrowLeft':
      newIndex = Math.max(currentIndex - 1, 0)
      break
    case 'ArrowDown':
      newIndex = Math.min(currentIndex + columns, totalItems - 1)
      break
    case 'ArrowUp':
      newIndex = Math.max(currentIndex - columns, 0)
      break
    case 'Home':
      newIndex = 0
      break
    case 'End':
      newIndex = totalItems - 1
      break
    default:
      return
  }

  if (newIndex !== currentIndex) {
    event.preventDefault()
    onNavigate(newIndex)
  }
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export function announceAddToCart(productName: string): void {
  announceToScreenReader(`${productName} agregado al carrito`)
}

export function announceTierChange(tier: 'A' | 'B' | 'C' | null): void {
  if (tier) {
    const tierNames = { A: 'Premium', B: 'Estándar', C: 'Económico' }
    announceToScreenReader(`Filtrado por categoría ${tierNames[tier]}`)
  } else {
    announceToScreenReader('Mostrando todos los productos')
  }
}

export function announceFilterChange(filterType: string, value: string): void {
  announceToScreenReader(`Filtro ${filterType} aplicado: ${value}`)
}

// ============================================================================
// SEMANTIC HTML HELPERS
// ============================================================================

export function getCardRole(interactive: boolean): 'article' | 'button' {
  return interactive ? 'button' : 'article'
}

export function getListRole(type: 'products' | 'categories' | 'brands'): string {
  return 'list'
}

export function getListItemRole(): string {
  return 'listitem'
}

// ============================================================================
// COLOR CONTRAST HELPERS
// ============================================================================

export function getAccessibleTextColor(backgroundColor: 'light' | 'dark'): string {
  return backgroundColor === 'light' ? 'text-gray-900' : 'text-white'
}

export function getAccessibleBorderColor(variant: 'default' | 'premium'): string {
  const variants = {
    default: 'border-gray-300',
    premium: 'border-purple-300',
  }
  return variants[variant]
}

// ============================================================================
// SKIP LINKS
// ============================================================================

export function getSkipLinkClasses(): string {
  return 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg'
}

// ============================================================================
// MOTION PREFERENCES
// ============================================================================

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getMotionProps(enableMotion: boolean = true) {
  if (!enableMotion || shouldReduceMotion()) {
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 },
    }
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const a11y = {
  // Labels
  getProductCardAriaLabel,
  getBrandCardAriaLabel,
  getCategoryCardAriaLabel,
  getHeroBannerAriaLabel,
  getPromoPanelAriaLabel,

  // Focus
  getFocusClasses,
  getButtonFocusClasses,

  // Keyboard
  handleCardKeyDown,
  handleGridNavigation,

  // Screen Reader
  announceToScreenReader,
  announceAddToCart,
  announceTierChange,
  announceFilterChange,

  // Semantic
  getCardRole,
  getListRole,
  getListItemRole,

  // Colors
  getAccessibleTextColor,
  getAccessibleBorderColor,

  // Skip Links
  getSkipLinkClasses,

  // Motion
  shouldReduceMotion,
  getMotionProps,
}

export default a11y
