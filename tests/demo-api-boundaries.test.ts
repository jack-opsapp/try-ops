import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const rpc = vi.hoisted(() => vi.fn())
vi.mock('@/lib/ab/supabase', () => ({ getABSupabase: () => ({ rpc }) }))
import { POST as session } from '../app/api/demo/session/route'
import { POST as event } from '../app/api/demo/events/route'
import { readBoundedBody } from '../lib/demo/server'
const token = 'a'.repeat(43)
const payload = { eventId: '5a54ef2e-5342-4ce2-b457-9f68d299a7de', version: 'crew-job-v1', action: 'started', step: 'assign', elapsedMs: 0 }
const request = (body: string, headers: Record<string,string> = {}) => new NextRequest('https://try.opsapp.co/api/demo/events', { method: 'POST', headers: { origin: 'https://try.opsapp.co', 'content-type': 'application/json', cookie: `__ops_demo=${token}`, ...headers }, body })
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); rpc.mockReset() })
describe('public demo HTTP boundaries', () => {
 it('rejects cross-site and absent origins before reading storage', async () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  for (const origin of ['', 'https://evil.test']) {
   expect((await session(request('', { origin }))).status).toBe(403)
   expect((await event(request(JSON.stringify(payload), { origin }))).status).toBe(403)
  }
  expect((await event(request(JSON.stringify(payload), { 'sec-fetch-site': 'cross-site' }))).status).toBe(403)
  expect(rpc).not.toHaveBeenCalled()
 })
 it('ignores QA collection and rejects oversized, free-text and cookieless events before storage', async () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  expect((await event(request(JSON.stringify(payload), { 'x-ops-qa': '1' }))).status).toBe(204)
  expect((await event(request(' '.repeat(2049)))).status).toBe(400)
  expect((await event(request(JSON.stringify({ ...payload, email: 'never@collect.test' })))).status).toBe(400)
  expect((await event(request(JSON.stringify(payload), { cookie: '' }))).status).toBe(409)
  expect(rpc).not.toHaveBeenCalled()
 })
 it('bounds a stalled body even if its cancellation never resolves', async () => {
  vi.useFakeTimers()
  const stream = new ReadableStream({ pull: () => new Promise(() => {}), cancel: () => new Promise(() => {}) })
  const req = new Request('https://try.opsapp.co/api/demo/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' } as RequestInit)
  const result = expect(readBoundedBody(req)).rejects.toThrow('invalid_body')
  await vi.advanceTimersByTimeAsync(1501)
  await result
 })
 it('does not link ambiguous experiment cookies or refresh an established demo cookie', async () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  rpc.mockReturnValue({ abortSignal: async () => ({ data: { status: 'ready' }, error: null }) })
  const response = await session(request('', { cookie: `__ops_demo=${token}; __ops_experiment=${token}; __ops_experiment=${'b'.repeat(43)}` }))
  expect(response.status).toBe(200)
  expect(response.cookies.get('__ops_demo')).toBeUndefined()
  expect(rpc.mock.calls[0][1]).toMatchObject({ p_create: false, p_assignment_token_hash: null })
 })
})
