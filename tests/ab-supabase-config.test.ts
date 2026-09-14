import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'

beforeEach(()=>{
 vi.resetModules()
 vi.stubEnv('SUPABASE_URL',undefined)
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL',undefined)
 vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','local-server-key')
 vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','local-public-key')
})
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})

async function requestWithConfiguredClient(){
 const requests:{url:string;authorization:string|null;apiKey:string|null}[]=[]
 vi.stubGlobal('fetch',async(input:RequestInfo|URL,init:RequestInit)=>{
  const headers=new Headers(init.headers)
  requests.push({url:String(input),authorization:headers.get('authorization'),apiKey:headers.get('apikey')})
  return Response.json({status:'local-fixture'})
 })
 const {getABSupabase}=await import('@/lib/ab/supabase')
 const result=await getABSupabase().rpc('local_configuration_probe')
 expect(result.error).toBeNull()
 return requests
}

describe('server experiment Supabase configuration compatibility',()=>{
 it('uses the existing public URL with only the server service-role key',async()=>{
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://legacy-config.invalid')
  expect(await requestWithConfiguredClient()).toEqual([{url:'https://legacy-config.invalid/rest/v1/rpc/local_configuration_probe',authorization:'Bearer local-server-key',apiKey:'local-server-key'}])
 })
 it('gives the explicit server URL precedence',async()=>{
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://legacy-config.invalid')
  vi.stubEnv('SUPABASE_URL','https://explicit-config.invalid')
  expect((await requestWithConfiguredClient())[0].url).toBe('https://explicit-config.invalid/rest/v1/rpc/local_configuration_probe')
 })
 it('rejects a missing URL before any request',async()=>{
  const request=vi.fn();vi.stubGlobal('fetch',request)
  const {getABSupabase}=await import('@/lib/ab/supabase')
  expect(()=>getABSupabase()).toThrow('Supabase URL')
  expect(request).not.toHaveBeenCalled()
 })
 it('rejects a missing service-role key even when a public anon key exists',async()=>{
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://legacy-config.invalid')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY',undefined)
  const request=vi.fn();vi.stubGlobal('fetch',request)
  const {getABSupabase}=await import('@/lib/ab/supabase')
  expect(()=>getABSupabase()).toThrow('SUPABASE_SERVICE_ROLE_KEY')
  expect(request).not.toHaveBeenCalled()
 })
 it('retains URL validation when an explicit override is malformed',async()=>{
  vi.stubEnv('SUPABASE_URL','invalid-url')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://legacy-config.invalid')
  const {getABSupabase}=await import('@/lib/ab/supabase')
  expect(()=>getABSupabase()).toThrow()
 })
})
