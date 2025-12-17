import type { HTMLAttributes, ReactNode } from 'react';

interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Lightweight floating panel with subtle 3D hover.
 */
export function FloatingPanelFrame({ children, className = '', ...props }: FrameProps) {
  return (
    <div
      className={`product-pop-hover rounded-[1.75rem] border border-white/20 bg-white/90 p-6 text-slate-900 shadow-glow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
