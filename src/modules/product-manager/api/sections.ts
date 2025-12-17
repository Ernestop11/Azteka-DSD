import { Section, FrontPageLayout } from '../types';

const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const sectionsApi = {
  async getLayout(layoutId?: string): Promise<FrontPageLayout> {
    const url = layoutId
      ? `${API_BASE}/front-page/layouts/${layoutId}`
      : `${API_BASE}/front-page/layouts/active`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Return empty layout if endpoint doesn't exist yet
      if (response.status === 404) {
        return { id: 'default', name: 'Default Layout', isActive: true, sections: [] };
      }
      throw new Error('Failed to fetch layout');
    }
    return response.json();
  },

  async getAllLayouts(): Promise<FrontPageLayout[]> {
    const response = await fetch(`${API_BASE}/front-page/layouts`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Return empty array if endpoint doesn't exist yet
      if (response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch layouts');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async createLayout(data: Partial<FrontPageLayout>): Promise<FrontPageLayout> {
    const response = await fetch(`${API_BASE}/front-page/layouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create layout: ${error}`);
    }
    return response.json();
  },

  async updateLayout(
    id: string,
    data: Partial<FrontPageLayout>
  ): Promise<FrontPageLayout> {
    const response = await fetch(`${API_BASE}/front-page/layouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update layout: ${error}`);
    }
    return response.json();
  },

  async deleteLayout(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/front-page/layouts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete layout');
  },

  async createSection(layoutId: string, data: Partial<Section>): Promise<Section> {
    const response = await fetch(`${API_BASE}/front-page/layouts/${layoutId}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create section: ${error}`);
    }
    return response.json();
  },

  async updateSection(
    layoutId: string,
    sectionId: string,
    data: Partial<Section>
  ): Promise<Section> {
    const response = await fetch(
      `${API_BASE}/front-page/layouts/${layoutId}/sections/${sectionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update section: ${error}`);
    }
    return response.json();
  },

  async deleteSection(layoutId: string, sectionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/front-page/layouts/${layoutId}/sections/${sectionId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to delete section');
  },

  async reorderSections(
    layoutId: string,
    sectionIds: string[]
  ): Promise<FrontPageLayout> {
    const response = await fetch(
      `${API_BASE}/front-page/layouts/${layoutId}/reorder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ sectionIds }),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to reorder sections: ${error}`);
    }
    return response.json();
  },
};
