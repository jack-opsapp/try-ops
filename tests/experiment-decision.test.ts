import { describe, it, expect } from 'vitest'
import { decideExperiment, planSamplePerArm, type ExperimentPlan } from '@/lib/ab/decision'
const plan: ExperimentPlan = {baselineRate:.02, absoluteMde:.01, samplePerArm:3826, enrollmentEndsAt:'2026-08-01T00:00:00Z', conversionWindowDays:7, qualityWindowDays:7, activationNonInferiorityMargin:.01}
const now = new Date('2026-09-01T00:00:00Z')
const cohort=(n:number,conversions:number,activated=conversions)=>({assigned:n,exposed:n,trials:conversions,activated,collectionFailures:0})
describe('fixed horizon inference from fresh experiment cohort',()=>{
 it('matches predeclared two-proportion sample planning',()=>expect(planSamplePerArm(.02,.01)).toBe(3826))
 it.each([NaN,Infinity,undefined])('rejects malformed plan/cohort values %s',(value)=>{for(const key of ['conversionWindowDays','qualityWindowDays','activationNonInferiorityMargin'])expect(decideExperiment({...plan,[key]:value} as ExperimentPlan,cohort(5000,100),cohort(5000,200),now).status).toBe('invalid');expect(decideExperiment(plan,{...cohort(5000,100),trials:value} as any,cohort(5000,200),now).status).toBe('invalid')})
 it('rejects invalid clock',()=>expect(decideExperiment(plan,cohort(5000,100),cohort(5000,200),new Date('bad')).status).toBe('invalid'))
 it('refuses invented/missing baseline',()=>expect(()=>planSamplePerArm(0,.01)).toThrow())
 it('local A/A protocol: equal nonzero mature cohorts cannot select a winner',()=>expect(decideExperiment(plan,cohort(5000,100,80),cohort(5000,100,80),now)).toMatchObject({status:'inconclusive',reason:'no_supported_difference',effect:0}))
 it('zero/zero can never win',()=>expect(decideExperiment(plan,cohort(4000,0),cohort(4000,0),now).status).toBe('inconclusive'))
 it('insufficient sample cannot win',()=>expect(decideExperiment(plan,cohort(100,0),cohort(100,40),now).status).toBe('inconclusive'))
 it('waits until enrollment and quality maturity end',()=>expect(decideExperiment(plan,cohort(4000,80),cohort(4000,140),new Date('2026-08-04')).status).toBe('pending'))
 it('rejects sample ratio mismatch before effect calculation',()=>expect(decideExperiment(plan,cohort(8000,100),cohort(4000,120),now).status).toBe('invalid'))
 it('does not accept client or corrupt numerators',()=>expect(decideExperiment(plan,cohort(4000,5000),cohort(4000,80),now).status).toBe('invalid'))
 it('blocks a trial lift that harms activated visitor rate',()=>expect(decideExperiment(plan,cohort(5000,180,160),cohort(5000,300,20),now).status).toBe('inconclusive'))
 it('promotes only significant lift with activation guardrail proof',()=>expect(decideExperiment(plan,cohort(5000,100),cohort(5000,200),now).status).toBe('promote_challenger'))
 it('retains control for significant harm',()=>expect(decideExperiment(plan,cohort(5000,200),cohort(5000,100),now).status).toBe('retain_control'))
 it('fails invalid collection rather than treating errors as zero',()=>expect(decideExperiment(plan,{...cohort(5000,100),collectionFailures:1},cohort(5000,200),now).status).toBe('invalid'))
})
