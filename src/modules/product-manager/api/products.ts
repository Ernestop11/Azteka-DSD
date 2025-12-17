import { Product } from '../types';

const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getById(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async create(data: FormData): Promise<Product> {
    // Upload image first if present
    const imageFile = data.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);

      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: imageFormData,
      });

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json();
        data.delete('image');
        data.append('imageUrl', url);
        data.append('image_url', url);
      }
    }

    // Convert FormData to JSON for API
    const jsonData: Record<string, any> = {};
    data.forEach((value, key) => {
      if (key !== 'image') {
        // Handle boolean and number conversions
        if (value === 'true') jsonData[key] = true;
        else if (value === 'false') jsonData[key] = false;
        else if (key === 'price' || key === 'cost' || key === 'stock' || key === 'unitsPerCase' || key === 'minOrderQty') {
          jsonData[key] = parseFloat(value as string);
        } else {
          jsonData[key] = value;
        }
      }
    });

    const response = await fetch(`${API_BASE}/products/manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create product: ${error}`);
    }
    return response.json();
  },

  async update(id: string, data: FormData): Promise<Product> {
    // Upload image first if present
    const imageFile = data.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);

      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: imageFormData,
      });

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json();
        data.delete('image');
        data.append('imageUrl', url);
        data.append('image_url', url);
      }
    }

    // Convert FormData to JSON for API
    const jsonData: Record<string, any> = {};
    data.forEach((value, key) => {
      if (key !== 'image') {
        // Handle boolean and number conversions
        if (value === 'true') jsonData[key] = true;
        else if (value === 'false') jsonData[key] = false;
        else if (key === 'price' || key === 'cost' || key === 'stock' || key === 'unitsPerCase' || key === 'minOrderQty') {
          jsonData[key] = parseFloat(value as string);
        } else {
          jsonData[key] = value;
        }
      }
    });

    const response = await fetch(`${API_BASE}/products/manage/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update product: ${error}`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/products/manage/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },

  async uploadImage(file: File): Promise<{ url: string; success: boolean }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  async importCSV(file: File): Promise<{ success: boolean; imported: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await fetch(`${API_BASE}/products/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to import CSV: ${error}`);
    }
    return response.json();
  },
};
