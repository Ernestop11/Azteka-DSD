export function Card({ title, children }: any) {
  return (
    <div className="rounded-2xl bg-white/5 p-5 border border-white/10 shadow-lg backdrop-blur-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
