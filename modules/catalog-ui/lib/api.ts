// API client for catalog data fetching

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  brandName?: string;
  inStock: boolean;
  sku?: string | null;
  unitType?: string;
  unitsPerCase?: number | null;
  isNew?: boolean;
  isFeatured?: boolean;
  backgroundColor?: string | null;
  backgroundGradient?: string | null;
  shortDescription?: string | null;
  vendorPrice?: number | null;
  costCase?: number | null;
  marginPercent?: number | null;
  businessModes?: string[];
  isHidden?: boolean;
  slug?: string | null;
  status?: 'active' | 'draft' | 'inactive';
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  slug?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder?: number;
  parentId?: string | null;
  subcategories?: Category[];
}

export interface Store {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  storeCode?: string;
}

// Fetch products with optional filtering
export const fetchProducts = async (filters?: {
  segment?: string;
  categoryId?: string;
  brandId?: string;
  search?: string;
}): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.segment) params.append('segment', filters.segment);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.brandId) params.append('brandId', filters.brandId);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE_URL}/products${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter by category and brand on client side if needed
    let filteredData = data;
    if (filters?.categoryId) {
      filteredData = filteredData.filter((p: Product) => p.categoryId === filters.categoryId);
    }
    if (filters?.brandId) {
      filteredData = filteredData.filter((p: Product) => p.brandId === filters.brandId);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter((p: Product) => 
        p.name.toLowerCase().includes(searchLower) ||
        p.brandName?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredData;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Fetch all brands
export const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
};

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

// Fetch stores (for multi-store mode)
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stores`);
    
    if (!response.ok) {
      // If stores endpoint doesn't exist yet, return mock data
      console.warn('Stores endpoint not found, using mock data');
      return [
        { id: '1', name: 'Store A', storeCode: 'SA' },
        { id: '2', name: 'Store B', storeCode: 'SB' },
        { id: '3', name: 'Store C', storeCode: 'SC' },
      ];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    // Return mock stores if endpoint fails
    return [
      { id: '1', name: 'Store A', storeCode: 'SA' },
      { id: '2', name: 'Store B', storeCode: 'SB' },
      { id: '3', name: 'Store C', storeCode: 'SC' },
    ];
  }
};

// Submit order
export const submitOrder = async (orderData: {
  customerId?: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  notes?: string;
}, token?: string): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, orderId: data.id };
  } catch (error) {
    console.error('Failed to submit order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit order' 
    };
  }
};

// Submit multi-store order (Carlos mode)
export const submitMultiStoreOrder = async (orderData: {
  customerId?: string;
  storeOrders: Array<{
    storeId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }>;
  totalAmount: number;
  notes?: string;
}, token?: string): Promise<{ success: boolean; orderIds?: string[]; error?: string }> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Submit separate order for each store
    const orderPromises = orderData.storeOrders.map(async (storeOrder) => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId: orderData.customerId,
          storeId: storeOrder.storeId,
          items: storeOrder.items,
          totalAmount: storeOrder.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
          notes: orderData.notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit order for store ${storeOrder.storeId}`);
      }
      
      const data = await response.json();
      return data.id;
    });
    
    const orderIds = await Promise.all(orderPromises);
    return { success: true, orderIds };
  } catch (error) {
    console.error('Failed to submit multi-store order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit multi-store order' 
    };
  }
};
