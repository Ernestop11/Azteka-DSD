import type { HTMLAttributes, ReactNode } from 'react';

interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Festive border with papel-picado texture + shine.
 */
export function FestiveFrameOutline({ children, className = '', ...props }: FrameProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border-2 border-white/60 bg-latin-fiesta/40 p-6 shadow-glow-edge shine-sweep ${className}`}
      {...props}
    >
      <div className="fx-papel-picado absolute inset-0 opacity-80" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
