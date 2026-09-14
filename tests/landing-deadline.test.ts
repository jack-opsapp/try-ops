import {afterEach,describe,expect,it,vi} from 'vitest'
import {NextRequest} from 'next/server'
import {fetchActiveVariant} from '@/lib/ab/fetch-config'
import {middleware} from '@/middleware'
import {SEED_CONFIG_A} from '@/lib/ab/seed-config'
import {LANDING_LOOKUP_BUDGET_MS} from '@/lib/ab/landing-deadline'
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();vi.unstubAllEnvs()})
function setup(){vi.useFakeTimers();vi.stubEnv('AB_EXPERIMENTS_ENABLED','true');vi.stubEnv('SUPABASE_URL','https://deadline.invalid');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test');vi.stubEnv('VERCEL_ENV','production')}
describe('bounded landing availability',()=>{
 it('returns approved control at the total render deadline even if fetch ignores abort',async()=>{
  setup();let signal:AbortSignal|undefined
  vi.stubGlobal('fetch',(_input:unknown,init:RequestInit)=>{signal=init.signal!;return new Promise(()=>{})})
  const page=fetchActiveVariant();await vi.advanceTimersByTimeAsync(LANDING_LOOKUP_BUDGET_MS)
  expect(await page).toEqual({variantId:'fallback',config:SEED_CONFIG_A});expect(signal?.aborted).toBe(true)
 })
 it('shares the same deadline across sequential route and config lookups',async()=>{
  setup();let count=0;let signal:AbortSignal|undefined
  vi.stubGlobal('fetch',(_input:unknown,init:RequestInit)=>{signal=init.signal!;count++;return count===1?new Promise(resolve=>setTimeout(()=>resolve(Response.json({incumbent_arm_id:'arm'})),400)):new Promise(()=>{})})
  const page=fetchActiveVariant();await vi.advanceTimersByTimeAsync(599);expect(count).toBe(2);expect(signal?.aborted).toBe(false)
  await vi.advanceTimersByTimeAsync(1);expect((await page).assignmentId).toBeUndefined();expect(signal?.aborted).toBe(true)
 })
 it('returns middleware on deadline without issuing an assignment cookie or exposure identity',async()=>{
  setup();vi.useRealTimers();let signal:AbortSignal|undefined
  vi.stubGlobal('fetch',(_input:unknown,init:RequestInit)=>{signal=init.signal!;return new Promise(()=>{})})
  const start=performance.now()
  const response=middleware(new NextRequest('https://try.opsapp.co/'))
  const resolved=await response;expect(performance.now()-start).toBeLessThan(1200);
 expect(resolved.headers.get('set-cookie')).not.toContain('__ops_experiment=')
  expect(resolved.headers.get('x-middleware-request-x-tryops-excluded')).toBe('1');expect(signal?.aborted).toBe(true)
 })
})
