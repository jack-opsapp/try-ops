import {describe,it,expect,vi,afterEach} from 'vitest'
import {fetchActiveVariant} from '@/lib/ab/fetch-config'
import {SEED_CONFIG_A} from '@/lib/ab/seed-config'
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
describe('safe incumbent serving',()=>{
 it('defaults to approved control while enrollment is disabled',async()=>{vi.stubEnv('AB_EXPERIMENTS_ENABLED','false');const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect(await fetchActiveVariant('A'.repeat(43))).toEqual({variantId:'fallback',config:SEED_CONFIG_A});expect(fetch).not.toHaveBeenCalled()})
 it('serves approved control on missing migration without consulting old generated variants',async()=>{vi.stubEnv('AB_EXPERIMENTS_ENABLED','true');vi.stubEnv('SUPABASE_URL','https://serving-test.invalid');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test');const paths:string[]=[];vi.stubGlobal('fetch',async(input:RequestInfo|URL)=>{paths.push(String(input));return Response.json({code:'PGRST202',message:'missing migration'},{status:404})});expect((await fetchActiveVariant('A'.repeat(43))).variantId).toBe('fallback');expect(paths).toHaveLength(1);expect(paths[0]).toContain('resolve_tryops_assignment');expect(paths.join()).not.toContain('ab_tests')})
})
