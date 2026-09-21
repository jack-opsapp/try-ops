import {describe,it,expect,vi,afterEach} from 'vitest'
import {fetchActiveVariant} from '@/lib/ab/fetch-config'
import {SEED_CONFIG_A} from '@/lib/ab/seed-config'
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
describe('safe incumbent serving',()=>{
 it('defaults to approved control while enrollment is disabled',async()=>{vi.stubEnv('AB_EXPERIMENTS_ENABLED','false');const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect(await fetchActiveVariant('A'.repeat(43))).toEqual({variantId:'fallback',config:SEED_CONFIG_A});expect(fetch).not.toHaveBeenCalled()})
 it('serves approved control on missing migration without consulting old generated variants',async()=>{vi.stubEnv('AB_EXPERIMENTS_ENABLED','true');vi.stubEnv('SUPABASE_URL','https://serving-test.invalid');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test');const paths:string[]=[];vi.stubGlobal('fetch',async(input:RequestInfo|URL)=>{paths.push(String(input));return Response.json({code:'PGRST202',message:'missing migration'},{status:404})});expect((await fetchActiveVariant('A'.repeat(43))).variantId).toBe('fallback');expect(paths).toHaveLength(1);expect(paths[0]).toContain('resolve_tryops_assignment');expect(paths.join()).not.toContain('ab_tests')})
 it.each(['assignment','incumbent'])('rejects a persisted legacy endorsement as a whole on the %s path',async(path)=>{
  vi.stubEnv('AB_EXPERIMENTS_ENABLED','true');vi.stubEnv('SUPABASE_URL','https://serving-test.invalid');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test')
  const config={sections:[SEED_CONFIG_A.sections[0],{type:'TestimonialsSection',props:{testimonials:[{quote:'Unverified legacy claim',name:'Invented person',trade:'Trade',location:'City'}]}},...SEED_CONFIG_A.sections.slice(1)]}
  vi.stubGlobal('fetch',async(input:RequestInfo|URL)=>{
   const url=String(input)
   if(url.includes('resolve_tryops_assignment'))return Response.json({arm_id:'assigned-arm',assignment_id:'assigned-visitor',config_hash:'stored-hash',config})
   if(url.includes('tryops_routes'))return Response.json({active_experiment_id:null,incumbent_arm_id:'incumbent-arm'})
   if(url.includes('tryops_arms'))return Response.json({config})
   throw new Error('Unexpected request')
  })
  expect(await fetchActiveVariant(path==='assignment'?'A'.repeat(43):undefined)).toEqual({variantId:'fallback',config:SEED_CONFIG_A})
 })
})
