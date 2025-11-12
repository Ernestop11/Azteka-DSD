// Supabase removed - using local API at http://77.243.85.8:3000/api/
// TODO: integrate local auth

// Stub supabase object for backwards compatibility during migration
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  brand_id?: string;
  subcategory_id?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  image_url: string;
  background_color: string;
  price: number;
  unit_type: string;
  units_per_case: number;
  min_order_quantity: number;
  in_stock: boolean;
  featured: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  is_featured: boolean;
  display_order: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  unique_link_code: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Order {
  order_number: string;
  customer_id: string;
  sales_rep_id?: string;
  status: string;
  subtotal: number;
  total: number;
  notes?: string;
  delivery_date?: string;
}
