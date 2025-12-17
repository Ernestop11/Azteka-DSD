'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ToastProvider } from './ui/toast'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { usePersistentCart } from '@/hooks/usePersistentCart'
import { getNetworkMonitor } from '@/lib/offline/networkMonitor'

// Component to initialize persistent cart
function PersistentCartInitializer({ children }: { children: React.ReactNode }) {
  usePersistentCart()
  
  // Initialize network monitor
  useEffect(() => {
    const monitor = getNetworkMonitor()
    const unsubscribe = monitor.subscribe((status) => {
      if (status.isOnline) {
        console.log('[Network] Back online')
      } else {
        console.log('[Network] Offline detected')
      }
    })
    
    return unsubscribe
  }, [])

  // Initialize session check - delay to avoid race condition with cookie setting
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('[Providers] Initializing session check...')
      const clearAuthState = () => {
        try {
          localStorage.removeItem('aztekaAuth')
        } catch (error) {
          console.warn('[Providers] Failed to clear auth state', error)
        }
      }

      const checkSession = async () => {
        try {
          const pathname = window.location.pathname
          console.log('[Providers] Fetching /api/auth/me...')
          const res = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          })
          
          console.log('[Providers] /api/auth/me response status:', res.status)
          
          if (res.ok) {
            const data = await res.json()
            console.log('[Providers] Session valid, user:', data.email || data.user?.email)
            return
          } else {
            // If 401 and on public pages (catalog, admin/products), don't clear session immediately
            // Let the page continue to load
            if (res.status === 401 && (pathname.startsWith('/catalog') || pathname.startsWith('/admin/products'))) {
              console.log('[Providers] 401 on public page - allowing page to load without clearing session')
              return
            }
            console.log('[Providers] Session invalid or expired (401) - clearing session state only')
            clearAuthState()
          }
        } catch (error: any) {
          console.error('[Providers] Session check error:', error)
          const pathname = window.location.pathname
          // Don't clear on public pages (catalog, admin/products) errors
          if (!pathname.startsWith('/catalog') && !pathname.startsWith('/admin/products')) {
            clearAuthState()
          }
        }
      }
      
      checkSession()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [])

  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <PersistentCartInitializer>
            <ToastProvider>
              {children}
            </ToastProvider>
          </PersistentCartInitializer>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
