import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://aztekafoods.com";

interface Props {
  onUploaded: (url: string) => void;
  label?: string;
}

export function ImageUploader({ onUploaded, label = "Upload image" }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      const { data } = await axios.post(`${API_BASE}/api/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(data.url);
      setStatus("✅ Uploaded");
    } catch (err: any) {
      setStatus("❌ " + (err.response?.data?.error || "Upload failed"));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <button
        type="button"
        onClick={upload}
        disabled={!file}
        className="bg-lime-600 hover:bg-lime-700 text-white px-3 py-1 rounded text-xs"
      >
        Upload
      </button>
      {status && <p className="text-xs text-white/70">{status}</p>}
    </div>
  );
}
