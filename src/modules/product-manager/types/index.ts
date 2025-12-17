// Use shared types from the main types file
export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price?: number;
  cost?: number;
  imageUrl?: string;
  image_url?: string;
  categoryId?: string;
  category_id?: string;
  brandId?: string;
  brand_id?: string;
  inStock?: boolean;
  in_stock?: boolean;
  stock?: number;
  featured?: boolean;
  unitType?: 'case' | 'unit';
  unit_type?: string;
  unitsPerCase?: number;
  units_per_case?: number;
  minOrderQty?: number;
  min_order_quantity?: number;
  backgroundColor?: string;
  background_color?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // AI-related fields
  isDraft?: boolean;
  is_draft?: boolean;
  aiGenerated?: boolean;
  ai_generated?: boolean;
  poExtracted?: boolean;
  po_extracted?: boolean;
  aiConfidence?: number;
  ai_confidence?: number;
  hasWarnings?: boolean;
  has_warnings?: boolean;
  warningMessage?: string;
  warning_message?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  displayOrder?: number;
  display_order?: number;
  createdAt?: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  logo_url?: string;
  createdAt?: Date;
}

export type SectionType =
  | 'hero'
  | 'two-column-grid'
  | 'brand-row'
  | 'bundle-block'
  | 'scrolling-section';

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  displayOrder: number;
  config: SectionConfig;
  products?: Product[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SectionConfig {
  // Hero config
  heroImageUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  heroCtaLink?: string;

  // Grid config
  columns?: number;
  productIds?: string[];

  // Brand row config
  brandId?: string;
  maxProducts?: number;

  // Bundle config
  bundleTitle?: string;
  bundlePrice?: number;
  bundleProductIds?: string[];

  // Scrolling section config
  scrollSpeed?: 'slow' | 'medium' | 'fast';
  categoryId?: string;
}

export interface FrontPageLayout {
  id: string;
  name: string;
  isActive: boolean;
  sections: Section[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DragItem {
  id: string;
  type: string;
  index: number;
}
