import type { HTMLAttributes, ReactNode } from 'react';

interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Gold embossed frame for hero or bundle highlights.
 */
export function GoldFrameEmboss({ children, className = '', ...props }: FrameProps) {
  return (
    <div
      className={`relative rounded-[2.5rem] border border-white/30 bg-foil-green/80 p-1 shadow-glow-hard ${className}`}
      {...props}
    >
      <div className="glossy-card-surface rounded-[2.2rem] border border-white/40 bg-white/90 p-6 text-slate-900 shadow-lg">
        {children}
      </div>
    </div>
  );
}
