'use client'

import { useEffect, useRef, useCallback } from 'react'

export type CustomerEventType =
  | 'LINK_OPENED'
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'SCROLL_DEPTH'
  | 'TIME_ON_PAGE'
  | 'CATEGORY_VIEWED'
  | 'BRAND_VIEWED'
  | 'SEARCH_PERFORMED'
  | 'PRODUCT_VIEWED'
  | 'PRODUCT_ADDED'
  | 'PRODUCT_REMOVED'
  | 'QUANTITY_CHANGED'
  | 'CART_OPENED'
  | 'CHECKOUT_STARTED'
  | 'ORDER_PLACED'
  | 'PWA_PROMPT_SHOWN'
  | 'PWA_INSTALLED'
  | 'PIN_CREATED'
  | 'ONBOARDING_COMPLETED'

interface EventPayload {
  eventType: CustomerEventType
  eventData?: Record<string, unknown>
  timestamp: string
}

interface TrackingConfig {
  sessionId: string
  enabled?: boolean
}

export function useEventTracking(config: TrackingConfig | null) {
  const eventBuffer = useRef<EventPayload[]>([])
  const startTime = useRef<number>(Date.now())
  const maxScrollDepth = useRef<number>(0)
  const passedTimeMilestones = useRef<Set<number>>(new Set())
  const passedScrollMilestones = useRef<Set<number>>(new Set())
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isEnabled = config?.enabled !== false && !!config?.sessionId

  // Flush events to server
  const flush = useCallback(() => {
    if (!isEnabled || !config?.sessionId || eventBuffer.current.length === 0) return

    const events = [...eventBuffer.current]
    eventBuffer.current = []

    // Use sendBeacon for reliability on page unload
    const payload = JSON.stringify({
      sessionId: config.sessionId,
      events
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/customer/events', payload)
    } else {
      // Fallback to fetch
      fetch('/api/customer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {
        // Silently fail - events are best-effort
      })
    }
  }, [isEnabled, config?.sessionId])

  // Track an event
  const trackEvent = useCallback((
    eventType: CustomerEventType,
    eventData?: Record<string, unknown>
  ) => {
    if (!isEnabled) return

    eventBuffer.current.push({
      eventType,
      eventData,
      timestamp: new Date().toISOString()
    })

    // Flush immediately for important events
    const immediateFlushEvents: CustomerEventType[] = [
      'ORDER_PLACED', 'CHECKOUT_STARTED', 'SESSION_ENDED',
      'PWA_INSTALLED', 'PIN_CREATED', 'ONBOARDING_COMPLETED'
    ]
    if (immediateFlushEvents.includes(eventType)) {
      flush()
    }
  }, [isEnabled, flush])

  // Set up scroll tracking
  useEffect(() => {
    if (!isEnabled) return

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100]
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !passedScrollMilestones.current.has(milestone)) {
          passedScrollMilestones.current.add(milestone)
          trackEvent('SCROLL_DEPTH', { depth: milestone })
        }
      })

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isEnabled, trackEvent])

  // Set up time on page tracking
  useEffect(() => {
    if (!isEnabled) return

    const milestones = [30000, 60000, 120000, 300000] // 30s, 1m, 2m, 5m

    const checkTime = () => {
      const elapsed = Date.now() - startTime.current
      milestones.forEach(ms => {
        if (elapsed >= ms && !passedTimeMilestones.current.has(ms)) {
          passedTimeMilestones.current.add(ms)
          trackEvent('TIME_ON_PAGE', {
            milliseconds: ms,
            seconds: ms / 1000
          })
        }
      })
    }

    const interval = setInterval(checkTime, 5000)
    return () => clearInterval(interval)
  }, [isEnabled, trackEvent])

  // Set up periodic flush and cleanup
  useEffect(() => {
    if (!isEnabled) return

    // Track session start
    trackEvent('SESSION_STARTED', {})

    // Flush every 5 seconds
    flushIntervalRef.current = setInterval(flush, 5000)

    // Flush on page unload
    const handleUnload = () => {
      trackEvent('SESSION_ENDED', {
        duration: Date.now() - startTime.current,
        maxScrollDepth: maxScrollDepth.current
      })
      flush()
    }

    window.addEventListener('beforeunload', handleUnload)
    window.addEventListener('pagehide', handleUnload)

    // Also handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current)
      }
      window.removeEventListener('beforeunload', handleUnload)
      window.removeEventListener('pagehide', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flush()
    }
  }, [isEnabled, trackEvent, flush])

  return {
    trackEvent,
    flush,
    isEnabled
  }
}

// Helper hook to get tracking config from localStorage
export function useTrackingSession(): TrackingConfig | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('customerSession')
    if (!stored) return null

    const session = JSON.parse(stored)
    // Only track if this is a link-based session
    if (!session.sessionId || !session.linkPurpose) return null

    return {
      sessionId: session.sessionId,
      enabled: true
    }
  } catch {
    return null
  }
}
