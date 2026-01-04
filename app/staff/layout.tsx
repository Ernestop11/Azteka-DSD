import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Azteka Employee Portal',
  description: 'Clock in, manage inventory, and view tasks',
  manifest: '/manifest-employee.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Azteka Work',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Azteka Work',
  },
}

export const viewport: Viewport = {
  themeColor: '#065f46',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
