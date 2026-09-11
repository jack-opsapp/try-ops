import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/ab-events/route'

// Exercise the real route and Supabase request builder. Only the HTTP boundary
// is replaced: these tests must never write analytics into production.
const experimentId = 'd1189933-c87c-47ae-8e3a-31d38bc41ff2'
let requests: Array<{ path: string; body: Record<string, unknown> }>
let ledger: Array<{ table: string; row: Record<string, unknown> }>
let rejectWrites: boolean

beforeEach(() => {
  requests = []
  ledger = []
  rejectWrites = false
  vi.stubEnv('SUPABASE_URL', 'https://analytics-test.invalid')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unit-test-key')
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    if (url.origin !== 'https://analytics-test.invalid') throw new Error('Unexpected external request')
    const body = JSON.parse(String(init?.body ?? '{}'))
    requests.push({ path: url.pathname, body })
    const table = url.pathname.split('/').at(-1)!
    if (rejectWrites) return Response.json({ code: 'XX000', message: 'Storage unavailable' }, { status: 500 })
    if (url.pathname.includes('/rpc/')) return Response.json(null)
    const row = Array.isArray(body) ? body[0] : body
    if (table === 'ab_events' && row.variant_id !== experimentId) {
      return Response.json({ code: '22P02', message: 'invalid input syntax for type uuid' }, { status: 400 })
    }
    ledger.push({ table, row })
    return new Response(null, { status: 201 })
  })
})

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

function send(body: unknown, host = 'try.opsapp.co') {
  return POST(new NextRequest(`https://${host}/api/ab-events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }))
}

describe('fixed-page telemetry', () => {
  it.each([
    'paid:job-management', 'paid:compare/jobber', 'paid:compare/housecall-pro',
    'paid:compare/servicetitan', 'paid:for/cleaning', 'paid:for/landscaping',
    'paid:for/roofing', 'fallback',
  ])('retains %s without inserting it into the UUID experiment ledger', async (variant_id) => {
    const response = await send({ variant_id, session_id: 'visit-1', event_type: 'page_view' })
    expect(response.status).toBe(200)
    expect(ledger).toEqual([{ table: 'onboarding_events', row: {
      event_type: 'landing_page_view', variant: variant_id,
      metadata: {
        variant_id, session_id: 'visit-1', event_type: 'page_view', section_name: null,
        element_id: null, dwell_ms: null, value: null, device_type: null, referrer: null,
        utm_source: null, utm_medium: null, utm_campaign: null,
      },
    } }])
    expect(requests.map((r) => r.path)).toEqual(['/rest/v1/onboarding_events'])
  })

  it('retains section and campaign evidence including numeric zero', async () => {
    const payload = {
      variant_id: 'paid:for/roofing', session_id: 'visit-2', event_type: 'section_view',
      section_name: 'PricingSection', element_id: 'signup', dwell_ms: 0, value: 0,
      device_type: 'mobile', referrer: 'https://example.com/', utm_source: 'google',
      utm_medium: 'cpc', utm_campaign: 'roofing',
    }
    expect((await send(payload)).status).toBe(200)
    expect(ledger[0]).toEqual({ table: 'onboarding_events', row: {
      event_type: 'landing_section_view', variant: 'paid:for/roofing', metadata: payload,
    } })
  })

  it('keeps paid signup telemetry out of experiment and canonical signup totals', async () => {
    expect((await send({ variant_id: 'paid:job-management', session_id: 'visit-3', event_type: 'signup_complete' })).status).toBe(200)
    expect(ledger[0].row.event_type).toBe('landing_signup_complete')
    expect(requests).toHaveLength(1)
  })

  it('reports a rejected fixed-page write as failure', async () => {
    rejectWrites = true
    expect((await send({ variant_id: 'paid:job-management', session_id: 'visit-4', event_type: 'page_view' })).status).toBe(500)
    expect(ledger).toHaveLength(0)
  })
})

describe('real A/B experiments', () => {
  it.each([
    ['page_view', 'increment_visitor_count'], ['signup_complete', 'increment_signup_count'],
    ['element_click', null],
  ])('preserves %s and its existing counter behavior', async (event_type, rpc) => {
    expect((await send({ variant_id: experimentId, session_id: 'experiment-visit', event_type })).status).toBe(200)
    expect(ledger[0].table).toBe('ab_events')
    expect(ledger[0].row).toMatchObject({ variant_id: experimentId, session_id: 'experiment-visit', event_type })
    expect(requests.filter((r) => r.path.includes('/rpc/'))).toEqual(rpc ? [{ path: `/rest/v1/rpc/${rpc}`, body: { variant_id: experimentId } }] : [])
  })
})

describe('collection boundary', () => {
  it.each(['localhost', 'try-example.vercel.app', 'try.opsapp.co.example.com'])('does not collect from %s', async (host) => {
    const response = await send({ variant_id: 'paid:job-management', session_id: 'preview', event_type: 'page_view' }, host)
    expect(await response.json()).toEqual({ ok: true, skipped: true })
    expect(requests).toHaveLength(0)
  })

  it.each([
    null, {}, { variant_id: 'paid:unknown', session_id: 's', event_type: 'page_view' },
    { variant_id: 'not-a-uuid', session_id: 's', event_type: 'page_view' },
    { variant_id: 'paid:job-management', session_id: '', event_type: 'page_view' },
    { variant_id: experimentId, session_id: 's', event_type: 'unsupported_event' },
    { variant_id: 'paid:job-management', session_id: 's', event_type: 'page_view', dwell_ms: 'oops' },
  ])('rejects invalid input before any database call: %j', async (body) => {
    expect((await send(body)).status).toBe(400)
    expect(requests).toHaveLength(0)
  })

  it('treats malformed JSON as a client error', async () => {
    const response = await POST(new NextRequest('https://try.opsapp.co/api/ab-events', { method: 'POST', body: '{' }))
    expect(response.status).toBe(400)
    expect(requests).toHaveLength(0)
  })
})
