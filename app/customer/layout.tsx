import type { Metadata, Viewport } from 'next'
import CustomerLayoutClient from './CustomerLayoutClient'

export const metadata: Metadata = {
  title: 'Customer Portal - Azteka DSD',
  description: 'Customer Order Portal',
  manifest: '/manifest-customer.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Azteka',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Azteka',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>
}
