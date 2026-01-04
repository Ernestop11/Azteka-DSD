import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Multi-Store Dashboard - Azteka DSD',
  description: 'Manage all your stores in one place',
  manifest: '/manifest-customer.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'My Stores',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669', // emerald-600 to match the header
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function MultiStoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Just pass through - the page handles its own layout
  return children
}
