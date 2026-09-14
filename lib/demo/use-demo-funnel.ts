'use client'

import { useCallback, useEffect, useRef } from 'react'
import { DEMO_SIGNUP_HREF, type DemoEvent } from './contracts'
import { deliverDemoEvent } from './client'
import { shouldCollectProductionAnalytics } from '@/lib/analytics/production-boundary'

/** Call track at semantic action boundaries. Never await it to advance the demo. */
export function useDemoFunnel() {
  const ready = useRef<Promise<unknown>>(Promise.resolve())
  const pending = useRef(0)
  useEffect(() => {
    if (!shouldCollectProductionAnalytics()) return
    ready.current = fetch('/api/demo/session', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, body: '{}',
      signal: AbortSignal.timeout(1500),
    }).catch(() => undefined)
  }, [])
  const track = useCallback((event: DemoEvent): void => {
    if (!shouldCollectProductionAnalytics() || pending.current >= 32) return
    pending.current++
    void ready.current.then(() => deliverDemoEvent(event)).then(result => {
      if (result === 'unavailable') console.warn('[demo] collection_unavailable')
    }).catch(() => undefined).finally(() => { pending.current-- })
  }, [])
  return { signupHref: DEMO_SIGNUP_HREF, track }
}
