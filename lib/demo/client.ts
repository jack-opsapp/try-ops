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
        const response = await sendWithDeadline(send, '/api/demo/events', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
          credentials: 'same-origin', keepalive: true,
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

/** A hard deadline also covers implementations that ignore AbortController. */
async function sendWithDeadline(send: typeof fetch, input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = typeof AbortController === 'undefined' ? undefined : new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      send(input, { ...init, signal: controller?.signal }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => { controller?.abort(); reject(new Error('timeout')) }, 1500) }),
    ])
  } finally { clearTimeout(timer) }
}

export function createDemoDelivery(
  send: typeof fetch = fetch,
  pause: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
) {
  let session: Promise<DemoDelivery> | undefined
  let pending = 0
  async function establish(): Promise<DemoDelivery> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await sendWithDeadline(send, '/api/demo/session', {
          method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}',
        })
        if (response.status === 204) return 'excluded'
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'ready') return 'recorded'
        } else if (response.status < 500 && response.status !== 429 && response.status !== 409) return 'rejected'
      } catch { /* Privacy, offline and server failures are optional diagnostics. */ }
      if (attempt < 2) await pause(150 * (attempt + 1))
    }
    return 'unavailable'
  }
  function initialize(): Promise<DemoDelivery> {
    // All effects and taps in this document share the same establishment.
    return session ??= establish()
  }
  async function track(event: DemoEvent): Promise<DemoDelivery | 'session_unavailable'> {
    if (pending >= 32) return 'unavailable'
    pending++
    try {
      const result = await initialize()
      if (result === 'unavailable') return 'session_unavailable'
      if (result !== 'recorded') return result
      return await deliverDemoEvent(event, send, pause)
    } finally { pending-- }
  }
  return { initialize, track }
}
