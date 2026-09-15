'use client'

import { useCallback, useEffect } from 'react'
import { DEMO_SIGNUP_HREF, type DemoEvent } from './contracts'
import { createDemoDelivery } from './client'
import { shouldCollectProductionAnalytics } from '@/lib/analytics/production-boundary'

// Document-scoped, so React StrictMode remounts cannot race two bearer creations.
let delivery: ReturnType<typeof createDemoDelivery> | undefined
const getDelivery = () => delivery ??= createDemoDelivery()

/** Call track at semantic action boundaries. Never await it to advance the demo. */
export function useDemoFunnel() {
  useEffect(() => {
    if (!shouldCollectProductionAnalytics()) return
    void getDelivery().initialize().then(result => {
      if (result === 'unavailable') console.warn('[demo] session_unavailable')
    }).catch(() => undefined)
  }, [])
  const track = useCallback((event: DemoEvent): void => {
    if (!shouldCollectProductionAnalytics()) return
    void getDelivery().track(event).then(result => {
      if (result === 'session_unavailable' || result === 'unavailable' || result === 'rejected') console.warn('[demo] collection_failure', { reason: result })
    }).catch(() => undefined)
  }, [])
  return { signupHref: DEMO_SIGNUP_HREF, track }
}
