'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Pages that don't need auth
  const publicPaths = ['/customer/login']

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (stored) {
      const parsed = JSON.parse(stored) as CustomerSession
      // Check expiration
      if (new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('customerSession')
        if (!publicPaths.includes(pathname)) {
          router.replace('/customer/login')
        }
        return
      }
      setSession(parsed)
    } else if (!publicPaths.includes(pathname)) {
      router.replace('/customer/login')
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('customerSession')
    router.replace('/customer/login')
  }

  // Don't show nav on login page
  if (publicPaths.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(true)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{session?.businessName || 'Loading...'}</h1>
              <p className="text-xs text-emerald-400">Customer Portal</p>
            </div>
          </div>

          {/* Cart Button (links to catalog) */}
          <Link
            href={`/catalog?customer=${session?.customerId}`}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Slide-out Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 border-r border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">{session?.businessName}</h2>
                <p className="text-xs text-slate-400">
                  {session?.role === 'OWNER' ? 'Multi-Store Owner' :
                   session?.role === 'MANAGER' ? 'Store Manager' : 'Customer'}
                </p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-4 space-y-2">
              <Link
                href="/customer/dashboard"
                onClick={() => setShowMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === '/customer/dashboard'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>

              <Link
                href={`/catalog?customer=${session?.customerId}`}
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                New Order
              </Link>

              <Link
                href="/customer/reorder"
                onClick={() => setShowMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === '/customer/reorder'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reorder Favorites
              </Link>

              <Link
                href="/customer/orders"
                onClick={() => setShowMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === '/customer/orders'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order History
              </Link>

              {session?.role === 'OWNER' && (
                <Link
                  href="/customer/stores"
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    pathname === '/customer/stores'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  My Stores
                </Link>
              )}

              <div className="border-t border-slate-700 my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/customer/dashboard"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/customer/dashboard' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            href="/customer/reorder"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/customer/reorder' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs">Reorder</span>
          </Link>

          <Link
            href={`/catalog?customer=${session?.customerId}`}
            className="flex flex-col items-center gap-1 px-4 py-2 -mt-4"
          >
            <div className="bg-emerald-600 p-4 rounded-full shadow-lg shadow-emerald-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xs text-emerald-400">Order</span>
          </Link>

          <Link
            href="/customer/orders"
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              pathname === '/customer/orders' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs">Orders</span>
          </Link>

          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
