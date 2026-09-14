import {getABSupabase} from '@/lib/ab/supabase'
/** Supporting diagnostics only; SQL aggregates the complete eligible exposure cohort. */
export async function aggregateExperimentSections(experimentId:string) {
 const {data,error}=await getABSupabase().rpc('tryops_section_diagnostics',{p_experiment_id:experimentId})
 if(error)throw error
 if(!Array.isArray(data))throw new Error('Invalid diagnostic response')
 return data
}
