import type { ReactNode } from 'react'

type PageWrapperProps = {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  )
}
