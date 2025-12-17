// Catalog UI Module Exports

// Pages
export { default as SalesRepCatalog } from './pages/salesrep';
export { default as CustomerCatalog } from './pages/customer';
export { default as OrderConfirmation } from './pages/order-confirmation';
export { default as TestIngestion } from './pages/test-ingestion';
export { default as DevDesignPreview } from './pages/dev-design-preview';

// Components
export { HeroBanner } from './components/HeroBanner';
export { ProductGrid } from './components/ProductGrid';
export { BrandRow } from './components/BrandRow';
export { BundleSection } from './components/BundleSection';
export { FloatingCartButton } from './components/FloatingCartButton';
export { CartDrawer } from './components/CartDrawer';
export { LoadingOverlay } from './components/LoadingOverlay';

// Skeleton Loaders
export {
  Skeleton,
  HeroSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  BrandCardSkeleton,
  BrandRowSkeleton,
  BundleCardSkeleton,
  BundleSectionSkeleton,
  SearchBarSkeleton,
  CategoryTabsSkeleton,
  SalesRepSkeleton,
  CustomerSkeleton,
  SkeletonStyles,
} from './components/Skeletons';

// Error States
export {
  ErrorState,
  EmptyState,
  SectionError,
  NetworkError,
  ErrorBoundary,
  OfflineIndicator,
} from './components/ErrorStates';

// Context
export { CartProvider, useCart } from './context/CartContext';

// API
export * from './lib/api';

// Pricing Utilities
export * from './lib/pricing';

// Service Worker
export * from './lib/serviceWorkerHelper';

// Theme & Visuals (NEW)
export { default as catalogVisuals } from './theme/catalogVisuals';
export * from './theme/catalogVisuals';

