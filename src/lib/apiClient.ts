const API_BASE = import.meta.env?.VITE_API_URL ?? '';

export async function fetchFromAPI<T>(endpoint: string): Promise<T[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/${endpoint}`, {
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

    const res = await fetch(`${API_BASE}/${endpoint}`, {
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
