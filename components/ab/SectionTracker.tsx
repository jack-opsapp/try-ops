'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  sectionName: string
  variantId: string
}

export function SectionTracker({ children, sectionName, variantId }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const entryTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entryTimeRef.current = Date.now()
        } else if (entryTimeRef.current !== null) {
          const dwell_ms = Date.now() - entryTimeRef.current
          entryTimeRef.current = null
          fireEvent('section_view', { section_name: sectionName, dwell_ms })
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionName, variantId])

  function fireEvent(eventType: string, extra: Record<string, unknown> = {}) {
    const sessionId = sessionStorage.getItem('ops_ab_session') ?? ''
    const utmParams = getUTMParams()
    fetch('/api/ab-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        session_id: sessionId,
        event_type: eventType,
        device_type: getDeviceType(),
        referrer: document.referrer || null,
        ...utmParams,
        ...extra,
      }),
      keepalive: true,
    }).catch(() => {}) // fire-and-forget
  }

  return <div ref={ref}>{children}</div>
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function getUTMParams() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  }
}
