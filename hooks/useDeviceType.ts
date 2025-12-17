'use client'

import { useState, useEffect } from 'react'

export interface DeviceType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

/**
 * Device detection hook optimized for Samsung Galaxy Tab S9 FE
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px (Samsung Tab S9 FE: 1024x768 - 2560x1920)
 * - Desktop: > 1024px
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width <= 1024,
      isDesktop: width > 1024,
      width,
      height,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setDeviceType({
        isMobile: width < 768,
        isTablet: width >= 768 && width <= 1024,
        isDesktop: width > 1024,
        width,
        height,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}

