import { DEMO_VERSION, type DemoEvent, type DemoDelivery } from './contracts'

/** Retries share one UUID. No local storage or analytics SDK is required. */
export async function deliverDemoEvent(
  event: DemoEvent,
  send: typeof fetch = fetch,
  pause: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<DemoDelivery> {
  try {
    const body = JSON.stringify({ ...event, version: DEMO_VERSION, eventId: crypto.randomUUID() })
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await send('/api/demo/events', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
          credentials: 'same-origin', keepalive: true, signal: AbortSignal.timeout(1500),
        })
        if (response.status === 204) return 'excluded'
        if (response.ok) return 'recorded'
        if (response.status < 500 && response.status !== 429) return 'rejected'
      } catch { /* Offline and timeout are bounded retries, never UI failures. */ }
      if (attempt < 2) await pause(150 * (attempt + 1))
    }
  } catch { /* Privacy/browser API restrictions must not escape into the UI. */ }
  return 'unavailable'
}
