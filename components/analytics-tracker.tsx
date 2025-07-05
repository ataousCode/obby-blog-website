'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AnalyticsTrackerProps {
  postId?: string
}

export default function AnalyticsTracker({ postId }: AnalyticsTrackerProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    // Generate or get session ID
    let sessionId = localStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = generateSessionId()
      localStorage.setItem('analytics_session_id', sessionId)
    }

    // Track page view
    trackPageView({
      path: pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId,
      userId: session?.user?.id,
      postId
    })

    // Update session activity
    updateSessionActivity(sessionId)

    // Track session end on page unload
    const handleBeforeUnload = () => {
      endSession(sessionId)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname, session?.user?.id, postId])

  return null
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function trackPageView(data: {
  path: string
  referrer: string
  userAgent: string
  sessionId: string
  userId?: string
  postId?: string
}) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  } catch (error) {
        // Page view tracking failed silently
      }
}

function updateSessionActivity(sessionId: string) {
  const startTime = localStorage.getItem(`session_start_${sessionId}`)
  if (!startTime) {
    localStorage.setItem(`session_start_${sessionId}`, Date.now().toString())
  }
  
  // Update last activity time
  localStorage.setItem(`session_last_activity_${sessionId}`, Date.now().toString())
}

function endSession(sessionId: string) {
  const startTime = localStorage.getItem(`session_start_${sessionId}`)
  const lastActivity = localStorage.getItem(`session_last_activity_${sessionId}`)
  
  if (startTime && lastActivity) {
    const duration = Math.floor((parseInt(lastActivity) - parseInt(startTime)) / 1000)
    
    // Send session end data
    navigator.sendBeacon('/api/analytics/session-end', JSON.stringify({
      sessionId,
      duration
    }))
  }
}

// Hook for manual event tracking
export function useAnalytics() {
  const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          properties,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      // Event tracking failed silently
    }
  }

  return { trackEvent }
}