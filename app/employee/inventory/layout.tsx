import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory - Azteka Employee',
  description: 'Warehouse inventory management',
  manifest: '/manifest-employee.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inventory',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Inventory',
  },
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
