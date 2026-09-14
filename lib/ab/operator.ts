import {z} from 'zod'
import {hashIdentity} from '@/lib/ab/identity'
import {getABSupabase} from '@/lib/ab/supabase'
import {decideExperiment,planSamplePerArm,type Cohort,type ExperimentPlan} from '@/lib/ab/decision'
import {materializeApprovedDraft,type ApprovedSections} from '@/lib/ab/content'
import {generateChallenger} from '@/lib/ab/generate'
const Spec=z.object({hypothesis:z.string().min(10).max(1000),registryVersion:z.string().min(1),baselineRate:z.number().positive().lt(1),baselineSource:z.string().min(10).max(1000),absoluteMde:z.number().positive().lt(1),samplePerArm:z.number().int().positive(),enrollmentStartsAt:z.iso.datetime(),enrollmentEndsAt:z.iso.datetime(),conversionWindowDays:z.number().int().min(1).max(30),qualityWindowDays:z.number().int().min(7).max(90),activationNonInferiorityMargin:z.number().positive().lt(1)}).strict()
export const OperatorRequest=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('health'),key:z.string().min(8).max(128)}),
 z.object({operation:z.literal('evaluate'),key:z.string().min(8).max(128),experimentId:z.uuid()}),
 z.object({operation:z.literal('prepare'),key:z.string().min(8).max(128),spec:Spec,controlIds:z.array(z.string()).min(4).max(12),challengerIds:z.array(z.string()).min(4).max(12).optional(),generate:z.boolean().default(false)}),
 z.object({operation:z.literal('validate'),key:z.string().min(8).max(128),experimentId:z.uuid(),evidence:z.record(z.string(),z.unknown())}),
 z.object({operation:z.literal('publish'),key:z.string().min(8).max(128),experimentId:z.uuid(),expectedVersion:z.number().int().nonnegative()}),
 z.object({operation:z.literal('promote'),key:z.string().min(8).max(128),experimentId:z.uuid(),expectedVersion:z.number().int().nonnegative()}),
 z.object({operation:z.literal('rollback'),key:z.string().min(8).max(128),expectedVersion:z.number().int().nonnegative()}),
])
export type OperatorInput=z.infer<typeof OperatorRequest>
export async function runOperator(input:OperatorInput,approved?:{registry:ApprovedSections;version:string}) {
 const db=getABSupabase()
 const rpc=async(name:string,args:Record<string,unknown>={})=>{const {data,error}=await db.rpc(name,args);if(error)throw new Error(error.code==='PGRST202'||error.code==='42P01'?'migration_unavailable':'worker_failed');if(data===null)throw new Error('worker_failed');return data}
 const claim=await rpc('claim_tryops_run',{p_key:input.key,p_operation:input.operation,p_request_hash:await hashIdentity(JSON.stringify(input))})
 if(claim.status==='busy')return {status:409,body:{status:'busy'}}
 if(claim.status==='complete')return {status:200,body:claim.result}
 if(claim.status!=='claimed')throw new Error('worker_failed')
 const validateStoredContent=async(experimentId:string)=>{
  if(!approved)throw new Error('registry_mismatch')
  const {data:experiment,error:experimentError}=await db.from('tryops_experiments').select('hypothesis,registry_version').eq('id',experimentId).single()
  const {data:arms,error:armError}=await db.from('tryops_arms').select('config,section_ids').eq('experiment_id',experimentId)
  if(experimentError||armError||!experiment||arms?.length!==2)throw new Error('worker_failed')
  if(experiment.registry_version!==approved.version)throw new Error('registry_mismatch')
  const canonical=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((out,key)=>({...out,[key]:v[key]}),{}):v)
  for(const arm of arms){
   const current=materializeApprovedDraft({hypothesis:experiment.hypothesis,sectionIds:arm.section_ids,reasoning:'Revalidate exact approved content'},approved.registry,experiment.hypothesis)
   if(canonical(current.config)!==canonical(arm.config))throw new Error('registry_mismatch')
  }
 }
 let completed=false
 const execute=async(payload:Record<string,unknown>)=>{const result=await rpc('execute_tryops_operation',{p_run_id:claim.run_id,p_lease_token:claim.lease_token,p_operation:input.operation,p_payload:payload});completed=true;return result}
 let result:unknown
 try {
  if(input.operation==='health') {
   const recovery=await rpc('reconcile_tryops_experiments')
   const {data:route,error}=await db.from('tryops_routes').select('active_experiment_id,version').eq('route','/').single();if(error)throw new Error('collection_failure')
   let health='no_experiment'
   let measurement:{assigned:number;exposed:number}|undefined
   if(route?.active_experiment_id){
    const cohort=await rpc('tryops_cohort',{p_experiment_id:route.active_experiment_id})
    measurement=cohort.arms.reduce((sum:{assigned:number;exposed:number},arm:{assigned:number;exposed:number})=>({assigned:sum.assigned+arm.assigned,exposed:sum.exposed+arm.exposed}),{assigned:0,exposed:0})
    if(cohort.arms.some((a:{collectionFailures:number})=>a.collectionFailures>0))health='collection_failure'
    else if(measurement!.assigned===0)health='low_traffic'
    else if(measurement!.exposed===0)health='measurement_unverified'
    else if(new Date(cohort.plan.enrollment_ends_at).getTime()+(cohort.plan.conversion_window_days+cohort.plan.quality_window_days)*86400000>Date.now())health='no_mature_cohort'
    else health=cohort.plan.decision?'decision_complete':'ready_for_fixed_horizon_review'
   }
   if(health==='collection_failure')throw new Error('collection_failure')
   result={status:health,automaticPublish:false,recovery,route,measurement,...(health==='measurement_unverified'?{review:'Assigned visits have no confirmed visible exposure. Review collection before interpreting this cohort.'}:{})}
  }else if(input.operation==='prepare') {
   if(!approved||input.spec.registryVersion!==approved.version)throw new Error('registry_mismatch')
   if(input.spec.samplePerArm<planSamplePerArm(input.spec.baselineRate,input.spec.absoluteMde))throw new Error('underpowered_plan')
   if([...input.controlIds,...(input.challengerIds??[])].some(id=>!id.startsWith('general.')))throw new Error('route_content_mismatch')
   const control=materializeApprovedDraft({hypothesis:input.spec.hypothesis,sectionIds:input.controlIds,reasoning:'Approved control'},approved.registry,input.spec.hypothesis)
   const challenger=input.generate?await generateChallenger({hypothesis:input.spec.hypothesis,registry:approved.registry,registryVersion:approved.version,allowedSectionIds:Object.keys(approved.registry).filter(id=>id.startsWith('general.'))}):materializeApprovedDraft({hypothesis:input.spec.hypothesis,sectionIds:input.challengerIds,reasoning:'Approved challenger'},approved.registry,input.spec.hypothesis)
   if(JSON.stringify(control.config)===JSON.stringify(challenger.config))throw new Error('identical_treatment')
   result=await execute({spec:input.spec,control,challenger})
  }else if(input.operation==='validate') {
   await validateStoredContent(input.experimentId)
   result=await execute({experimentId:input.experimentId,evidence:input.evidence})
  }else if(input.operation==='publish'||input.operation==='promote'||input.operation==='rollback') {
   if(process.env.AB_PUBLISH_ENABLED!=='true')throw new Error('publication_disabled')
   if(input.operation==='publish'||input.operation==='promote')await validateStoredContent(input.experimentId)
   result=await execute({...input})
  }else {
   await rpc('reconcile_tryops_experiments')
   const cohort=await rpc('tryops_cohort',{p_experiment_id:input.experimentId})
   if(cohort.plan.decision)result=cohort.plan.decision
   else {
    const p=cohort.plan,plan:ExperimentPlan={baselineRate:Number(p.baseline_rate),absoluteMde:Number(p.absolute_mde),samplePerArm:p.sample_per_arm,enrollmentEndsAt:p.enrollment_ends_at,conversionWindowDays:p.conversion_window_days,qualityWindowDays:p.quality_window_days,activationNonInferiorityMargin:Number(p.activation_margin)}
    const arm=(slot:string):Cohort=>{const a=cohort.arms.find((a:{slot:string})=>a.slot===slot);return {assigned:a?.assigned,exposed:a?.exposed,trials:a?.trials,activated:a?.activated,collectionFailures:a?.collectionFailures}}
    const decision=decideExperiment(plan,arm('a'),arm('b'),new Date())
    result=decision.status==='pending'?decision:await execute({experimentId:input.experimentId,decision:{...decision,cohort}})
   }
  }
  if(!completed)await rpc('finish_tryops_run',{p_run_id:claim.run_id,p_lease_token:claim.lease_token,p_result:result})
  return {status:200,body:result}
 }catch(error){
  const reason=error instanceof Error?error.message:'worker_failed'
  const code=['migration_unavailable','collection_failure','generation_disabled','publication_disabled','registry_mismatch','underpowered_plan','identical_treatment'].includes(reason)?reason:'invalid_draft_or_worker_failure'
  try{await rpc('finish_tryops_run',{p_run_id:claim.run_id,p_lease_token:claim.lease_token,p_result:{status:'failed',reason:code},p_error:code})}catch{console.error('[tryops] durable_run_failure_unavailable')}
  return {status:code==='publication_disabled'||code==='generation_disabled'?409:503,body:{status:'failed',reason:code}}
 }
}
