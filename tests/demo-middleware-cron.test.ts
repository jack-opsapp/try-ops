import { describe, expect, it, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
const mocks=vi.hoisted(()=>({rpc:vi.fn(),operator:vi.fn()}))
vi.mock('@/lib/ab/supabase',()=>({getABSupabase:()=>({rpc:mocks.rpc})}))
vi.mock('@/lib/ab/operator',()=>({runOperator:mocks.operator}))
import {middleware} from '../middleware'
import {GET} from '../app/api/ab-cron/route'
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();mocks.rpc.mockReset();mocks.operator.mockReset()})
describe('independent demo acquisition and recovery',()=>{
 it('captures direct demo first-touch without assignment, exposure or old tutorial split',async()=>{
  vi.stubEnv('AB_EXPERIMENTS_ENABLED','true');mocks.rpc.mockImplementation(()=>{throw Error('must not enroll')})
  const response=await middleware(new NextRequest('https://try.opsapp.co/demo?utm_source=google&gclid=local-click',{headers:{'user-agent':'Mozilla/5.0',cookie:'__ops_experiment='+'a'.repeat(43)}}))
  expect(response.cookies.get('__ops_first_touch')?.value).toContain('google')
  expect(response.cookies.get('__ops_experiment')).toBeUndefined()
  expect(response.cookies.get('ops_variant')).toBeUndefined()
  expect(response.headers.get('x-middleware-request-cookie')).toContain('__ops_experiment='+'a'.repeat(43))
  expect(mocks.rpc).not.toHaveBeenCalled()
 })
 it('reconciles demos while AB is dormant, retaining authorization',async()=>{
  vi.stubEnv('CRON_SECRET','local-test');vi.stubEnv('AB_EXPERIMENTS_ENABLED','false')
  mocks.rpc.mockImplementation(()=>({abortSignal:async()=>({data:{status:'reconciled',attempted:1,failed:0},error:null})}));mocks.operator.mockResolvedValue({status:200,body:{status:'no_experiment'}})
  expect((await GET(new NextRequest('https://try.opsapp.co/api/ab-cron'))).status).toBe(401)
  expect(mocks.rpc).not.toHaveBeenCalled()
  const response=await GET(new NextRequest('https://try.opsapp.co/api/ab-cron',{headers:{authorization:'Bearer local-test'}}))
  expect(response.status).toBe(200);expect((await response.json()).demo).toEqual({status:'reconciled',attempted:1,failed:0})
  expect(mocks.rpc).toHaveBeenCalledWith('reconcile_tryops_demo',{})
 })
 it('still runs existing health recovery when the optional demo schema is missing',async()=>{
  vi.stubEnv('CRON_SECRET','local-test');vi.spyOn(console,'error').mockImplementation(()=>{})
  mocks.rpc.mockImplementation(()=>({abortSignal:async()=>({data:null,error:{code:'PGRST202'}})}));mocks.operator.mockResolvedValue({status:200,body:{status:'no_experiment'}})
  const response=await GET(new NextRequest('https://try.opsapp.co/api/ab-cron',{headers:{authorization:'Bearer local-test'}}))
  expect(response.status).toBe(503);expect(await response.json()).toEqual({status:'no_experiment',demo:{status:'unavailable'}})
  expect(mocks.operator).toHaveBeenCalledOnce()
 })
})
