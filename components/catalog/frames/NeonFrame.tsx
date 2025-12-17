import type { HTMLAttributes, ReactNode } from 'react';

interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: 'cyan' | 'rose' | 'amber';
}

const accentMap: Record<string, string> = {
  cyan: 'from-sky-400 via-cyan-500 to-sky-400',
  rose: 'from-rose-500 via-pink-500 to-rose-500',
  amber: 'from-amber-400 via-orange-500 to-amber-400',
};

/**
 * Neon tube inspired frame (Chedraui style).
 */
export function NeonFrame({ children, accent = 'cyan', className = '', ...props }: FrameProps) {
  const gradient = accentMap[accent] ?? accentMap.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 text-white ${className}`}
      {...props}
    >
      <div
        className={`absolute inset-0 rounded-[1.5rem] border-2 border-transparent bg-gradient-to-r ${gradient} opacity-50 blur-xl`}
        aria-hidden
      />
      <div className="relative z-10 space-y-4">
        <div className="fx-neon-tube inline-flex items-center">NEON</div>
        {children}
      </div>
    </div>
  );
}
