/** Fixed-horizon, two-sided pooled two-proportion z test, alpha=.05/power=.8.
 * Balanced independent visitor allocation only. No optional stopping or legacy rates.
 * Sample formula uses null pooled variance and alternative variance of the same test.
 * References and limitations: docs/artifacts engine/statistical-method.md (PM handoff).
 */
export interface ExperimentPlan {
  baselineRate: number
  absoluteMde: number
  samplePerArm: number
  enrollmentEndsAt: string
  conversionWindowDays: number
  qualityWindowDays: number
  activationNonInferiorityMargin: number
}
export interface Cohort { assigned:number; exposed:number; trials:number; activated:number; collectionFailures:number }
export interface Decision {
  status:'pending'|'inconclusive'|'invalid'|'retain_control'|'promote_challenger'
  reason:string
  effect?:number
  pValue?:number
  interval?:[number,number]
  srmPValue?:number
  activationLowerBound?:number
}
const Z_ALPHA=1.959963984540054
const Z_POWER=.8416212335729143
const DAY=86400000
export function planSamplePerArm(baseline:number,mde:number):number {
  if(!Number.isFinite(baseline)||!Number.isFinite(mde)||baseline<=0||mde<=0||baseline+mde>=1) throw new Error('A measured baseline and valid absolute MDE are required')
  const challenger=baseline+mde, pooled=(baseline+challenger)/2
  return Math.ceil((Z_ALPHA*Math.sqrt(2*pooled*(1-pooled))+Z_POWER*Math.sqrt(baseline*(1-baseline)+challenger*(1-challenger)))**2/mde**2)
}
// Abramowitz-Stegun erf approximation, absolute error <1.5e-7.
export function normalCdf(x:number):number {
 const sign=x<0?-1:1,a=Math.abs(x)/Math.SQRT2,t=1/(1+.3275911*a)
 const erf=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-a*a)
 return .5*(1+sign*erf)
}
function srm(a:number,b:number):number {
 if(a+b===0)return 1
 return 2*(1-normalCdf(Math.abs(a-b)/Math.sqrt(a+b)))
}
export function decideExperiment(plan:ExperimentPlan,a:Cohort,b:Cohort,now:Date):Decision {
 if(!plan||!a||!b||!(now instanceof Date)||!Number.isFinite(now.getTime()))return {status:'invalid',reason:'invalid_input'}
 if(![plan.conversionWindowDays,plan.qualityWindowDays].every(Number.isInteger)||!Number.isFinite(plan.activationNonInferiorityMargin))return {status:'invalid',reason:'invalid_plan'}
 let required:number
 try{required=planSamplePerArm(plan.baselineRate,plan.absoluteMde)}catch{return {status:'invalid',reason:'unconfigured_baseline'}}
 const end=Date.parse(plan.enrollmentEndsAt)
 if(!Number.isFinite(end)||!Number.isInteger(plan.samplePerArm)||plan.samplePerArm<required||plan.conversionWindowDays<1||plan.conversionWindowDays>30||plan.qualityWindowDays<7||plan.qualityWindowDays>90||plan.activationNonInferiorityMargin<=0||plan.activationNonInferiorityMargin>=1)return {status:'invalid',reason:'invalid_plan'}
 for(const c of [a,b]) {
  if([c.assigned,c.exposed,c.trials,c.activated,c.collectionFailures].some(x=>!Number.isSafeInteger(x)||x<0)||c.exposed>c.assigned||c.trials>c.exposed||c.activated>c.trials)return {status:'invalid',reason:'corrupt_cohort'}
  if(c.collectionFailures>0)return {status:'invalid',reason:'collection_failure'}
 }
 const srmPValue=srm(a.assigned,b.assigned)
 if(srmPValue<.001)return {status:'invalid',reason:'sample_ratio_mismatch',srmPValue}
 // Exposure is post-allocation: imbalance is diagnostic for collection/render failures.
 if(srm(a.exposed,b.exposed)<.001)return {status:'invalid',reason:'exposure_ratio_mismatch',srmPValue}
 if(now.getTime()<end+(plan.conversionWindowDays+plan.qualityWindowDays)*DAY)return {status:'pending',reason:'cohort_not_mature',srmPValue}
 if(a.exposed<plan.samplePerArm||b.exposed<plan.samplePerArm)return {status:'inconclusive',reason:'insufficient_sample',srmPValue}
 if(Math.min(a.trials,b.trials,a.exposed-a.trials,b.exposed-b.trials)<10)return {status:'inconclusive',reason:'sparse_outcomes',srmPValue}
 const pa=a.trials/a.exposed,pb=b.trials/b.exposed,effect=pb-pa,pool=(a.trials+b.trials)/(a.exposed+b.exposed)
 const se0=Math.sqrt(pool*(1-pool)*(1/a.exposed+1/b.exposed))
 const pValue=2*(1-normalCdf(Math.abs(effect/se0)))
 const se=Math.sqrt(pa*(1-pa)/a.exposed+pb*(1-pb)/b.exposed)
 const interval:[number,number]=[effect-Z_ALPHA*se,effect+Z_ALPHA*se]
 if(![effect,pValue,se0,se,...interval,srmPValue].every(Number.isFinite))return {status:'invalid',reason:'nonfinite_inference'}
 const base={effect,pValue,interval,srmPValue}
 if(pValue>=.05)return {...base,status:'inconclusive',reason:'no_supported_difference'}
 if(effect<0)return {...base,status:'retain_control',reason:'challenger_harm'}
 if(Math.min(a.activated,b.activated,a.exposed-a.activated,b.exposed-b.activated)<10)return {...base,status:'inconclusive',reason:'activation_guardrail_sparse'}
 const qa=a.activated/a.exposed,qb=b.activated/b.exposed
 // One-sided 95% lower confidence bound, predeclared non-inferiority margin.
 const activationLowerBound=qb-qa-1.6448536269514722*Math.sqrt(qa*(1-qa)/a.exposed+qb*(1-qb)/b.exposed)
 if(!Number.isFinite(activationLowerBound))return {status:'invalid',reason:'nonfinite_guardrail'}
 if(activationLowerBound<=-plan.activationNonInferiorityMargin)return {...base,activationLowerBound,status:'inconclusive',reason:'activation_guardrail_not_met'}
 return {...base,activationLowerBound,status:'promote_challenger',reason:'trial_lift_and_quality_supported'}
}
