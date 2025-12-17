export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  imageUrl?: string;
  display_order?: number;
  displayOrder?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  logoUrl?: string;
  description?: string;
  is_featured?: boolean;
  isFeatured?: boolean;
  display_order?: number;
  displayOrder?: number;
}

export interface Subcategory {
  id: string;
  category_id?: string;
  categoryId?: string;
  name: string;
  description?: string;
  display_order?: number;
  displayOrder?: number;
}

export interface Product {
  id: string;
  category_id?: string;
  categoryId?: string;
  brand_id?: string;
  brandId?: string;
  subcategory_id?: string;
  subcategoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  shortDescription?: string;
  sku?: string;
  image_url?: string;
  imageUrl?: string;
  background_color?: string;
  backgroundColor?: string;
  background_gradient?: string;
  backgroundGradient?: string;
  price?: number;
  priceCase?: number;
  vendor_price?: number;
  vendorPrice?: number;
  cost_case?: number;
  costCase?: number;
  margin_percent?: number;
  marginPercent?: number;
  unit_type?: string;
  unitType?: string;
  units_per_case?: number;
  unitsPerCase?: number;
  min_order_quantity?: number;
  minOrderQty?: number;
  in_stock?: boolean;
  inStock?: boolean;
  featured?: boolean;
  stock?: number;
  min_stock?: number;
  cost?: number;
  supplier?: string;
  source?: string;
  packSize?: string;
  meta?: Record<string, unknown>;
  gallery?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id?: string;
  business_name?: string;
  businessName?: string;
  contact_name?: string;
  contactName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  zipCode?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone?: string;
  territory?: string;
  unique_link_code?: string;
  uniqueLinkCode?: string;
}

