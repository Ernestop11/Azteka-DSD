import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ProductEditor } from "../components/ProductEditor";

const API_BASE = import.meta.env.VITE_API_BASE || "https://aztekafoods.com";

export default function ProductsManager() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosAuth.get("/api/products/all");
      setProducts(data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveProduct = async (productId: string, updates: any) => {
    await axiosAuth.put(`/api/products/${productId}`, {
      name: updates.name,
      price: updates.price,
      sku: updates.sku,
      image_url: updates.image_url,
    });
    if (typeof updates.featured !== "undefined" || typeof updates.discount !== "undefined") {
      await axiosAuth.patch(`/api/deals/${productId}`, {
        featured: updates.featured,
        discount: updates.discount,
      });
    }
    await loadProducts();
  };

  const deleteProduct = async (productId: string) => {
    await axiosAuth.delete(`/api/products/${productId}`);
    await loadProducts();
  };

  if (loading) return <div className="p-10 text-white/70">Loading products…</div>;
  if (error) return <div className="p-10 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/60">Inventory</p>
          <h1 className="text-3xl font-bold">Products Manager</h1>
        </div>
        <button
          onClick={loadProducts}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Refresh
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <ProductEditor
            key={product.id}
            product={product}
            onSave={saveProduct}
            onDelete={deleteProduct}
          />
        ))}
      </div>
    </div>
  );
}
