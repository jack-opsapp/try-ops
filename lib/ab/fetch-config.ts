import { withinLandingDeadline } from '@/lib/ab/landing-deadline'
import { getABSupabase } from '@/lib/ab/supabase'
import { VariantConfigSchema, type VariantConfig } from '@/lib/ab/types'
import { SEED_CONFIG_A } from '@/lib/ab/seed-config'
import { hashIdentity, isOpaqueToken } from '@/lib/ab/identity'
export interface ActiveVariant { variantId:string; config:VariantConfig; assignmentId?:string; configHash?:string }
export async function fetchActiveVariant(token?:string):Promise<ActiveVariant> {
 if(process.env.AB_EXPERIMENTS_ENABLED!=='true')return fallback()
 try {
  return await withinLandingDeadline(async signal=>{
  const db=getABSupabase()
  if(isOpaqueToken(token)) {
   const {data,error}=await db.rpc('resolve_tryops_assignment',{p_token_hash:await hashIdentity(token),p_route:'/'}).abortSignal(signal)
   if(error)throw error
   if(data){const parsed=VariantConfigSchema.safeParse(data.config);if(parsed.success)return {variantId:data.arm_id,assignmentId:data.assignment_id,configHash:data.config_hash,config:parsed.data}}
  }
  // Completed/rolled-back incumbent content remains available without collecting a new cohort.
  const {data:route,error}=await db.from('tryops_routes').select('active_experiment_id,incumbent_arm_id').eq('route','/').abortSignal(signal).single()
  if(error)throw error
  if(!route?.incumbent_arm_id)return fallback()
  // Statistical evaluation never switches this pointer. Only explicit gated
  // publish/promote/rollback operations may select served incumbent content.
  const {data:arm,error:armError}=await db.from('tryops_arms').select('config').eq('id',route.incumbent_arm_id).abortSignal(signal).single()
  if(armError)throw armError
  const parsed=VariantConfigSchema.safeParse(arm?.config)
  if(parsed.success)return {variantId:'fallback',config:parsed.data}
  return fallback()
  })
 }catch{console.error('[tryops] collection_unavailable: serving approved control')}
 return fallback()
}
function fallback():ActiveVariant{return {variantId:'fallback',config:SEED_CONFIG_A}}
