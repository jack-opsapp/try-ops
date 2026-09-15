import { z } from 'zod'
import { DEMO_ACTIONS, DEMO_STEPS, DEMO_VERSION } from './contracts'
import { hashIdentity, isOpaqueToken } from '@/lib/ab/identity'
import { getABSupabase } from '@/lib/ab/supabase'

export const DEMO_COOKIE = '__ops_demo'
export const DEMO_COOKIE_AGE = 30 * 86400
export function readOpaqueCookie(header: string | null, name: string): string | null {
  const cookies = header?.split(';').map(v => v.trim()).filter(v => v.startsWith(`${name}=`)) ?? []
  if (cookies.length !== 1) return null
  const token = cookies[0].slice(name.length + 1)
  return isOpaqueToken(token) ? token : null
}
export const readDemoToken = (header: string | null) => readOpaqueCookie(header, DEMO_COOKIE)
const excludedQuery = (url: URL) => ['variant', 'preview', 'qa', 'ab_preview'].some(k => url.searchParams.has(k))
export function demoRequestEligible(req: Request): boolean {
  if (process.env.VERCEL_ENV !== 'production') return false
  try {
    const url = new URL(req.url)
    if (url.origin !== 'https://try.opsapp.co' || excludedQuery(url)) return false
    const referer = req.headers.get('referer')
    if (referer && (new URL(referer).origin !== url.origin || excludedQuery(new URL(referer)))) return false
    if (req.headers.get('x-ops-qa') || req.headers.get('x-ops-internal') || req.headers.get('purpose') === 'prefetch' || req.headers.get('next-router-prefetch')) return false
    if (/(?:bot|crawler|spider|headless|lighthouse|preview|monitor)/i.test(req.headers.get('user-agent') ?? '')) return false
    return !/(?:^|;\s*)ops_qa=1(?:;|$)/.test(req.headers.get('cookie') ?? '')
  } catch { return false }
}
export function demoSameOrigin(req: Request): boolean {
  return req.headers.get('origin') === new URL(req.url).origin &&
    (!req.headers.get('sec-fetch-site') || req.headers.get('sec-fetch-site') === 'same-origin')
}
const eventSchema = z.object({
  eventId: z.string().uuid(), version: z.literal(DEMO_VERSION),
  action: z.enum(DEMO_ACTIONS), step: z.enum(DEMO_STEPS),
  elapsedMs: z.number().int().min(0).max(86400000),
  errorCode: z.enum(['asset_unavailable', 'storage_unavailable', 'render_failed']).optional(),
}).strict().refine(e => (!e.errorCode || e.action === 'error') &&
  (e.action !== 'job_assigned' || e.step === 'assign') &&
  (e.action !== 'crew_viewed' || e.step === 'crew') &&
  (e.action !== 'task_completed' || e.step === 'complete'))
export function parseDemoEvent(value: unknown) {
  const result = eventSchema.safeParse(value)
  return result.success ? result.data : null
}
export async function readBoundedBody(req: Request): Promise<unknown> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new Error('invalid_body')
  const reader = req.body?.getReader()
  if (!reader) throw new Error('invalid_body')
  let text = '', size = 0
  const decoder = new TextDecoder()
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(new Error('invalid_body')); void reader.cancel().catch(() => {}) }, 1500)
  })
  try {
    for (;;) {
      const chunk = await Promise.race([reader.read(), deadline])
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > 2048) { void reader.cancel().catch(() => {}); throw new Error('invalid_body') }
      text += decoder.decode(chunk.value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally { clearTimeout(timer); reader.releaseLock() }
}
export async function demoRpc(name: string, args: Record<string, unknown>, timeoutMs = 1000): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('storage_unavailable')) }, timeoutMs)
    })
    const result = await Promise.race([getABSupabase().rpc(name, args).abortSignal(controller.signal), deadline])
    if (result.error || !result.data || typeof result.data !== 'object' || typeof result.data.status !== 'string') throw new Error('storage_unavailable')
    return result.data
  } finally { clearTimeout(timer) }
}
export { hashIdentity }
