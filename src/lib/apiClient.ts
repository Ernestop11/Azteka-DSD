const API_BASE = import.meta.env?.VITE_API_URL ?? '';

// Helper to construct URL properly
function buildUrl(endpoint: string): string {
  // If API_BASE is set, use it with a slash
  if (API_BASE) {
    return `${API_BASE}/${endpoint}`;
  }
  // Otherwise use relative path with leading slash
  return `/${endpoint}`;
}

export async function fetchFromAPI<T>(endpoint: string): Promise<T[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(buildUrl(endpoint), {
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn(`API ${endpoint} returned ${res.status}, using empty array`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

export async function postToAPI<T>(endpoint: string, body: any): Promise<T | null> {
  try {
    const token = localStorage.getItem('auth_token');
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
      body: JSON.stringify(body),
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
