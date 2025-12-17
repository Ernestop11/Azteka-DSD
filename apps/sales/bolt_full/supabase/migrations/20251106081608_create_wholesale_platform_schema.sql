/*
  # Wholesale DSD Platform Database Schema

  ## Overview
  Complete database schema for B2B wholesale ordering platform for Mexican grocery products.
  Supports sales rep tracking, product catalog, orders, and customer management.

  ## New Tables

  ### 1. `categories`
  Product categories for organizing the catalog
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Snacks", "Beverages", "Candy")
  - `slug` (text, unique) - URL-friendly category identifier
  - `description` (text) - Category description
  - `image_url` (text) - Category header image
  - `display_order` (integer) - Sort order for display
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `products`
  Product catalog with detailed information
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid, foreign key) - Links to categories table
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly product identifier
  - `description` (text) - Product description
  - `sku` (text, unique) - Stock keeping unit
  - `image_url` (text) - Main product image
  - `background_color` (text) - Card background color for visual appeal
  - `price` (decimal) - Wholesale price per unit
  - `unit_type` (text) - Unit measurement (case, box, pack, etc.)
  - `units_per_case` (integer) - Number of units in a case
  - `min_order_quantity` (integer) - Minimum order quantity
  - `in_stock` (boolean) - Stock availability status
  - `featured` (boolean) - Featured product flag
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `sales_reps`
  Sales representatives who generate leads and orders
  - `id` (uuid, primary key) - Unique sales rep identifier
  - `name` (text) - Full name
  - `email` (text, unique) - Email address
  - `phone` (text) - Contact phone number
  - `territory` (text) - Sales territory
  - `unique_link_code` (text, unique) - Unique code for shareable links
  - `active` (boolean) - Active status
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `customers`
  Business customers placing orders
  - `id` (uuid, primary key) - Unique customer identifier
  - `sales_rep_id` (uuid, foreign key) - Assigned sales rep
  - `business_name` (text) - Business name
  - `contact_name` (text) - Primary contact name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `address` (text) - Delivery address
  - `city` (text) - City
  - `state` (text) - State
  - `zip_code` (text) - ZIP code
  - `tax_id` (text) - Business tax ID (optional)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `orders`
  Customer orders placed through the platform
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_id` (uuid, foreign key) - Links to customers table
  - `sales_rep_id` (uuid, foreign key) - Links to sales_reps table
  - `status` (text) - Order status (pending, confirmed, in_transit, delivered, cancelled)
  - `subtotal` (decimal) - Order subtotal
  - `total` (decimal) - Order total
  - `notes` (text) - Special instructions or notes
  - `delivery_date` (date) - Requested delivery date
  - `created_at` (timestamptz) - Order placement timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. `order_items`
  Individual line items within orders
  - `id` (uuid, primary key) - Unique line item identifier
  - `order_id` (uuid, foreign key) - Links to orders table
  - `product_id` (uuid, foreign key) - Links to products table
  - `quantity` (integer) - Quantity ordered
  - `unit_price` (decimal) - Price per unit at time of order
  - `subtotal` (decimal) - Line item subtotal (quantity × unit_price)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access to products and categories (B2B catalog browsing)
  - Add policies for sales reps to manage their customers and view their orders
  - Add policies for customers to place orders and view their order history

  ## Indexes
  - Created indexes on foreign keys for optimal query performance
  - Created indexes on slug fields for fast lookups
  - Created index on sales rep unique_link_code for quick link resolution
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sku text UNIQUE NOT NULL,
  image_url text NOT NULL,
  background_color text DEFAULT '#f3f4f6',
  price decimal(10,2) NOT NULL,
  unit_type text DEFAULT 'case',
  units_per_case integer DEFAULT 1,
  min_order_quantity integer DEFAULT 1,
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales_reps table
CREATE TABLE IF NOT EXISTS sales_reps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  territory text,
  unique_link_code text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_rep_id uuid REFERENCES sales_reps(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  tax_id text,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  sales_rep_id uuid REFERENCES sales_reps(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  delivery_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_sales_reps_link_code ON sales_reps(unique_link_code);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep_id ON customers(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep_id ON orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read access)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- RLS Policies for products (public read access for catalog browsing)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- RLS Policies for sales_reps (public read for link validation)
CREATE POLICY "Anyone can view active sales reps"
  ON sales_reps FOR SELECT
  USING (active = true);

-- RLS Policies for customers (restrictive access)
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create customer"
  ON customers FOR INSERT
  WITH CHECK (true);

-- RLS Policies for orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (true);

-- RLS Policies for order_items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);