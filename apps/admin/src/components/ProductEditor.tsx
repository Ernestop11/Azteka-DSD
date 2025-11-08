import { useState } from "react";
import { ImageUploader } from "./ImageUploader";

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  image_url?: string;
  featured?: boolean;
  description?: string;
  discount?: number;
}

interface Props {
  product: Product;
  onSave: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

export function ProductEditor({ product, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Product>(product);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (key: keyof Product, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(product.id, {
        name: form.name,
        price: Number(form.price),
        sku: form.sku,
        image_url: form.image_url,
        featured: form.featured,
        discount: form.discount,
      });
      setMessage("✅ Saved");
    } catch (e) {
      setMessage("❌ Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${product.name}?`)) return;
    setSaving(true);
    await onDelete(product.id);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 shadow-xl">
      <div className="flex items-center gap-4">
        <img
          src={form.image_url || "https://placehold.co/160x160"}
          alt={form.name}
          className="w-24 h-24 rounded-xl object-cover border border-white/20"
        />
        <div className="flex-1 space-y-2">
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full bg-transparent border-b border-white/20 pb-1 text-lg font-semibold"
          />
          <div className="flex gap-4 text-sm">
            <label className="flex flex-col">
              <span className="text-white/60">Price</span>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="bg-transparent border-b border-white/20"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white/60">SKU</span>
              <input
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                className="bg-transparent border-b border-white/20"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white/60">Deal %</span>
              <input
                type="number"
                value={form.discount ?? 0}
                onChange={(e) => updateField("discount", Number(e.target.value) || 0)}
                className="bg-transparent border-b border-white/20"
              />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={!!form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            Featured
          </label>
        </div>
      </div>

      <ImageUploader
        label="Product image"
        onUploaded={(url) => updateField("image_url", url)}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-white"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
          >
            Delete
          </button>
        </div>
        {message && <span className="text-xs text-white/70">{message}</span>}
      </div>
    </div>
  );
}
