export function Sidebar() {
  const items = ["Products", "Orders", "Deals", "Settings"];
  return (
    <aside className="w-64 bg-slate-950/80 border-r border-white/10 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Azteka Admin</h1>
      <nav className="space-y-2">
        {items.map((i) => (
          <button key={i} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50">
            {i}
          </button>
        ))}
      </nav>
    </aside>
  );
}
