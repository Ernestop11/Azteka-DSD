'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'

/**
 * CartHydration Component
 *
 * This component manually triggers Zustand's persist middleware rehydration
 * on the client side. This is required because we use skipHydration: true
 * to prevent SSR/hydration mismatches.
 *
 * Add this component to your root layout to ensure cart state is restored
 * from localStorage on page load.
 */
export default function CartHydration() {
  useEffect(() => {
    // Manually trigger rehydration after component mounts (client-side only)
    useCartStore.persist.rehydrate()
  }, [])

  // This component doesn't render anything
  return null
}
