import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sales Rep - Azteka DSD',
  description: 'Sales Representative Dashboard',
  manifest: '/manifest-rep.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sales Rep',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Sales Rep',
  },
}

export default function RepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
