import { Brand } from '../types';

const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const brandsApi = {
  async getAll(): Promise<Brand[]> {
    const response = await fetch(`${API_BASE}/brands`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch brands');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Brand> {
    const response = await fetch(`${API_BASE}/brands/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch brand');
    return response.json();
  },

  async create(data: Partial<Brand>): Promise<Brand> {
    const response = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create brand: ${error}`);
    }
    return response.json();
  },

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const response = await fetch(`${API_BASE}/brands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update brand: ${error}`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/brands/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete brand');
  },
};
