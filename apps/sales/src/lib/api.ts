const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5177';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
