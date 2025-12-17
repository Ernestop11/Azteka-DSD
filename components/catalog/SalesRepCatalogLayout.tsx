'use client'

import ThemeSwitcher from './ThemeSwitcher'

interface SalesRepCatalogLayoutProps {
  userId?: string
  children: React.ReactNode
}

export default function SalesRepCatalogLayout({
  userId,
  children,
}: SalesRepCatalogLayoutProps) {
  return (
    <div>
      {/* Theme Switcher - Top Right */}
      <div className="sticky top-4 z-40 px-4 md:px-6 lg:px-10 py-4 flex justify-end">
        <ThemeSwitcher userId={userId} />
      </div>

      {/* Catalog Content */}
      {children}
    </div>
  )
}
