import { useEffect, useState } from "react";

type Product = {
  id: number | string;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
};

export default function SuperAdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();
        const items: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        setProducts(items);
      } catch (apiError) {
        if ((apiError as Error).name !== "AbortError") {
          console.error("Failed to load products", apiError);
          setError("Unable to load products from API");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading products...</div>;
  }

  if (error) {
    return (
      <main style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>⚙️ Super-Admin Dashboard</h1>
        <p style={{ color: "crimson" }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>⚙️ Super-Admin Dashboard</h1>
      <p>Live product list from API (port 4102)</p>
      <table border={1} cellPadding={8} style={{ marginTop: 20, borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ background: "#eee" }}>
          <tr>
            <th align="left">ID</th>
            <th align="left">Name</th>
            <th align="left">Description</th>
            <th align="left">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "24px 0" }}>
                No products returned from the API.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name ?? "—"}</td>
                <td>{product.description ?? "—"}</td>
                <td>{product.price ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
