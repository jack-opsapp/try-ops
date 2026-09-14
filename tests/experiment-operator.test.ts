import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest'
import {POST} from '@/app/api/ab-rotate/route'
import {GET} from '@/app/api/ab-cron/route'
import {NextRequest} from 'next/server'
import {runOperator} from '@/lib/ab/operator'
let calls:string[]=[]
beforeEach(()=>{calls=[];vi.stubEnv('SUPABASE_URL','https://operator-test.invalid');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test');vi.stubEnv('AB_ADMIN_SECRET','operator');vi.stubEnv('CRON_SECRET','cron')})
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
const post=(body:unknown,secret='operator')=>POST(new NextRequest('http://localhost/api/ab-rotate',{method:'POST',headers:{'x-ab-admin-secret':secret},body:JSON.stringify(body)}))
describe('operator publication boundaries',()=>{
 it('rejects old force rotation and unauthenticated operations',async()=>{expect((await post({force:true})).status).toBe(400);expect((await post({operation:'health',key:'health-001'},'wrong')).status).toBe(401)})
 it('fails missing migration explicitly',async()=>{vi.stubGlobal('fetch',async()=>Response.json({code:'PGRST202',message:'missing function'},{status:404}));expect((await post({operation:'health',key:'health-001'})).status).toBe(503)})
 it('does not allow Bearer undefined cron credentials',async()=>{vi.stubEnv('CRON_SECRET','');expect((await GET(new NextRequest('http://localhost/api/ab-cron',{headers:{authorization:'Bearer undefined'}}))).status).toBe(401)})
 it.each(['publish','promote','rollback'] as const)('keeps incumbent and persists rejected disabled %s',async(operation)=>{
  vi.stubEnv('AB_PUBLISH_ENABLED','false')
  vi.stubGlobal('fetch',async(input:RequestInfo|URL)=>{const path=new URL(String(input)).pathname;calls.push(path);return Response.json(path.endsWith('claim_tryops_run')?{status:'claimed',run_id:'id',lease_token:'token'}:{status:'failed'})})
  const result=await runOperator({operation,key:'publish-fixture',expectedVersion:0,experimentId:'00000000-0000-4000-8000-000000000001'})
  expect(result.status).toBe(409);expect(calls).toEqual(['/rest/v1/rpc/claim_tryops_run','/rest/v1/rpc/finish_tryops_run'])
 })
 it.each([{assigned:0,exposed:0,status:'low_traffic'},{assigned:100,exposed:0,status:'measurement_unverified'},{assigned:100,exposed:90,status:'no_mature_cohort'}])('classifies health without confusing assigned traffic and unverified exposure: $status',async(fixture)=>{
  vi.stubGlobal('fetch',async(input:RequestInfo|URL)=>{const path=new URL(String(input)).pathname;return Response.json(path.endsWith('claim_tryops_run')?{status:'claimed',run_id:'id',lease_token:'token'}:path.endsWith('tryops_routes')?{active_experiment_id:'experiment'}:path.endsWith('tryops_cohort')?{arms:[{assigned:fixture.assigned,exposed:fixture.exposed,collectionFailures:0}],plan:{enrollment_ends_at:'2099-01-01',conversion_window_days:7,quality_window_days:7}}:{status:'reconciled'})})
  const result=await runOperator({operation:'health',key:'health-classification'});expect(result.body).toMatchObject({status:fixture.status,measurement:{assigned:fixture.assigned,exposed:fixture.exposed},automaticPublish:false})
 })
 it('returns conflict when another lease owns work',async()=>{vi.stubGlobal('fetch',async()=>Response.json({status:'busy'}));expect((await runOperator({operation:'health',key:'health-fixture'})).status).toBe(409)})
})
