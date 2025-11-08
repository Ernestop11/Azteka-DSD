import { useEffect, useState } from 'react';
import { fetchProducts } from '@/lib/api';

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Azteka Foods Catalog</h1>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.slug} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <img src={p.image_url} alt={p.name} className="rounded-lg mb-3" />
            <h2 className="text-sm font-semibold">{p.name}</h2>
            <p className="text-xs text-muted-foreground">{p.category}</p>
            <p className="text-sm font-medium text-green-600">${Number(p.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
