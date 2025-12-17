'use client'

import { useEffect, useState } from 'react'
import { getFieldTestConfig } from '@/config/fieldTest'
import { useCart } from '@/hooks/useCart'

interface DebugOverlayProps {
  layoutVariant?: string
  themePack?: string
  priceTierMode?: string
}

export default function DebugOverlay({
  layoutVariant = 'default',
  themePack = 'default',
  priceTierMode = 'none',
}: DebugOverlayProps) {
  const [fps, setFps] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { getCartCount, totals } = useCart()
  const config = getFieldTestConfig()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!config.debugOverlay || typeof window === 'undefined') return

    let lastTime = performance.now()
    let frameCount = 0
    let fpsInterval = 1000 // Update FPS every second

    const updateFPS = () => {
      frameCount++
      const currentTime = performance.now()
      const elapsed = currentTime - lastTime

      if (elapsed >= fpsInterval) {
        setFps(Math.round((frameCount * 1000) / elapsed))
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(updateFPS)
    }

    const rafId = requestAnimationFrame(updateFPS)
    return () => cancelAnimationFrame(rafId)
  }, [config.debugOverlay])

  if (!config.debugOverlay || !mounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/60 text-white text-xs p-3 rounded-lg font-mono backdrop-blur-sm">
      <div className="space-y-1">
        <div>Cart: {getCartCount()} items</div>
        <div>Subtotal: ${totals.subtotal.toFixed(2)}</div>
        <div>FPS: {fps}</div>
        <div>Layout: {layoutVariant}</div>
        <div>Theme: {themePack}</div>
        <div>Tier: {priceTierMode}</div>
      </div>
    </div>
  )
}

