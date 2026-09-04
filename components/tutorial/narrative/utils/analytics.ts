// Fire-and-forget analytics for the narrative tutorial.
// Uses the existing /api/tutorial-log route for Supabase + Bubble compat.

import { shouldCollectProductionAnalytics } from '@/lib/analytics/production-boundary'

const FLOW_TYPE = 'leadToRevenue'
const VARIANT = 'narrative'

interface AnalyticsEvent {
  phase: string
  phaseIndex: number
  action: string
  durationMs?: number
  totalElapsedMs?: number
  sessionId: string
}

/** POST a single event to the tutorial-log API route. Never throws. */
export function sendTutorialEvent(event: AnalyticsEvent): void {
  if (!shouldCollectProductionAnalytics()) return

  fetch('/api/tutorial-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phase: event.phase,
      phaseIndex: event.phaseIndex,
      action: event.action,
      stepDuration: event.durationMs ?? 0,
      totalTime: event.totalElapsedMs ?? 0,
      flowType: FLOW_TYPE,
      variant: VARIANT,
      sessionId: event.sessionId,
    }),
  }).catch(() => {}) // fire-and-forget — never block the tutorial
}
