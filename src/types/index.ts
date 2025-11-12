// Product and Catalog Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  margin?: number;
  imageUrl?: string;
  inStock: boolean;
  stock: number;
  minStock: number;
  supplier?: string;
  featured: boolean;
  unitType: string;
  unitsPerCase: number;
  minOrderQty: number;
  backgroundColor?: string;

  // Relations
  categoryId?: string;
  brandId?: string;
  subcategoryId?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Marketing and Promotions
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountPercent: number;
  startDate: string | Date;
  endDate: string | Date;
  active: boolean;
}

export interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  discountPercent: number;
  price: number;
  active: boolean;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink?: string;
  validUntil?: string | Date;
  active: boolean;
}

// Sales and Customers
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone?: string;
  territory?: string;
  uniqueLinkCode: string;
  active: boolean;
}

export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  salesRepId?: string;
  active: boolean;
}

// Orders
export interface Order {
  id: string;
  orderNumber?: string;
  status: string;
  customerName: string;
  total: number;
  userId?: string;
  driverId?: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product?: Product;
}

// Loyalty and Rewards
export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  tier: string;
  updatedAt: string | Date;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl?: string;
  active: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  iconUrl?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string | Date;
}

// User Management
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Procurement
export interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  total: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  cost: number;
  purchaseOrderId: string;
}

export interface Invoice {
  id: string;
  supplier: string;
  invoiceDate?: string | Date;
  fileUrl: string;
  status: string;
  total: number;
  createdAt: string | Date;
}

// Incentives
export interface Incentive {
  id: string;
  title: string;
  description: string;
  threshold: number;
  reward: number;
  createdAt: string | Date;
}
