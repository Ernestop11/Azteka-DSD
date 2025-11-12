import { Settings } from "lucide-react";
export function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between border-b border-white/10 px-6 backdrop-blur-md bg-white/5">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <button className="p-2 hover:bg-white/10 rounded-lg"><Settings /></button>
    </header>
  );
}
