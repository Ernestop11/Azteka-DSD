const STORAGE_KEY = 'aztekaAuth';
const DEFAULT_API_BASE = '/api';

const normalizeBase = (value?: string | null) => {
  if (!value) return DEFAULT_API_BASE;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const API_BASE = normalizeBase(import.meta.env?.VITE_API_URL);

const buildUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
};

export async function fetchFromAPI<T>(endpoint: string): Promise<T[]> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = buildUrl(endpoint);
    console.log(`[API] Fetching: ${url}`); // Debug log
    
    const res = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      console.error(`[API] ${endpoint} returned ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle object responses with data property
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.bundles)) return data.bundles;
      if (Array.isArray(data.results)) return data.results;
    }
    
    return [];
  } catch (error) {
    console.error(`[API] Error fetching ${endpoint}:`, error);
    return [];
  }
}

export async function postToAPI<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      console.warn(`Failed to post to ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    return null;
  }
}

export async function putToAPI<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      console.warn(`Failed to put to ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error putting to ${endpoint}:`, error);
    return null;
  }
}

