import { describe, expect, it } from 'vitest'
import { deliverDemoEvent } from '../lib/demo/client'

describe('demo delivery', () => {
  it('retries a failed collection with the same event identity', async () => {
    const requests: string[] = []
    const result = await deliverDemoEvent({ action: 'job_assigned', step: 'assign', elapsedMs: 1200 }, async (_url, options) => {
      requests.push(String(options?.body))
      return new Response('{}', { status: requests.length < 3 ? 503 : 201 })
    }, async () => {})
    expect(result).toBe('recorded')
    expect(requests).toHaveLength(3)
    expect(new Set(requests).size).toBe(1)
    expect(JSON.parse(requests[0])).toMatchObject({ action: 'job_assigned', step: 'assign', version: 'crew-job-v1' })
  })
  it('returns a bounded failure instead of throwing or retrying forever', async () => {
    let attempts = 0
    expect(await deliverDemoEvent({ action: 'started', step: 'assign', elapsedMs: 0 }, async () => {
      attempts++; throw new Error('offline')
    }, async () => {})).toBe('unavailable')
    expect(attempts).toBe(3)
  })
  it('does not retry excluded traffic or rejected payloads', async () => {
    for (const [status, want] of [[204, 'excluded'], [400, 'rejected']] as const) {
      let attempts = 0
      expect(await deliverDemoEvent({ action: 'exit', step: 'crew', elapsedMs: 900 }, async () => {
        attempts++; return new Response(null, { status })
      }, async () => {})).toBe(want)
      expect(attempts).toBe(1)
    }
  })
})
