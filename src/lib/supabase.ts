import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  console.error('Please create a .env file with:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing required Supabase environment variables. Check console for details.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
