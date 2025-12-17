import { useEffect, useState } from 'react';
import { fetchProducts } from '@/lib/api';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
  return (
    <div className="grid p-6 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map(p => (
        <div key={p.slug} className="p-4 rounded-xl border border-white/10 bg-white/5">
          <img src={p.image_url} alt={p.name} className="rounded-lg mb-3" />
          <h2 className="text-sm font-semibold">{p.name}</h2>
          <p className="text-xs text-muted-foreground">{p.category}</p>
          <p className="text-sm">${Number(p.price).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
