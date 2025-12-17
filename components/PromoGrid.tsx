import type { ReactNode } from 'react'

type PromoGridProps = {
  children: ReactNode
}

export default function PromoGrid({ children }: PromoGridProps) {
  return (
    <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
      {children}
    </div>
  )
}
