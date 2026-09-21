import {describe,it,expect,vi} from 'vitest'
import {materializeApprovedDraft,type ApprovedSections} from '@/lib/ab/content'
import {generateChallenger} from '@/lib/ab/generate'
import { VariantConfigSchema } from '@/lib/ab/types'
import { APPROVED_SECTIONS } from '@/lib/landing/page-configs'
const registry:ApprovedSections={h:{section:{type:'Hero',props:{headline:'Approved',subtext:'Approved',primaryCtaLabel:'START MY FREE TRIAL',secondaryCtaLabel:'',heroMode:'product-proof'}},factIds:['product'],validUntil:null},p:{section:{type:'PricingSection',props:{}},factIds:['offer'],validUntil:null},f:{section:{type:'FAQSection',props:{faqs:[]}},factIds:['product'],validUntil:null},c:{section:{type:'ClosingCTA',props:{headline:'Approved',subtext:'Approved',primaryCtaLabel:'START MY FREE TRIAL',secondaryCtaLabel:''}},factIds:['offer'],validUntil:null}}
const draft={hypothesis:'Approved hypothesis',sectionIds:['h','p','f','c'],reasoning:'Approved selection'}
describe('approved content boundary',()=>{
 it('materializes exact approved section bytes',()=>expect(materializeApprovedDraft(draft,registry,draft.hypothesis).config.sections[0]).toEqual(registry.h.section))
 it('rejects invented prose and testimonials',()=>expect(()=>materializeApprovedDraft({...draft,config:{testimonials:['invented']}},registry,draft.hypothesis)).toThrow())
 it('rejects unknown, missing, repeated and incorrectly ordered sections',()=>{for(const sectionIds of [['h','x','f','c'],['h','f','c'],['h','p','p','c'],['p','h','f','c']])expect(()=>materializeApprovedDraft({...draft,sectionIds},registry,draft.hypothesis)).toThrow()})
 it('rejects stale claims without silently repairing a draft',()=>expect(()=>materializeApprovedDraft(draft,{...registry,p:{...registry.p,validUntil:'2020-01-01'}},draft.hypothesis)).toThrow())
 it('cannot change declared hypothesis',()=>expect(()=>materializeApprovedDraft(draft,registry,'Different hypothesis')).toThrow())
 it('keeps model adapter dormant without API invocation',async()=>{vi.stubEnv('AB_GENERATION_ENABLED','false');await expect(generateChallenger({hypothesis:draft.hypothesis,registry,allowedSectionIds:draft.sectionIds,registryVersion:'1'})).rejects.toThrow('generation_disabled');vi.unstubAllEnvs()})
 it('allows a reviewed job workflow without giving the generator prose authority',()=>{
  const workflow = {type:'WorkflowSection',props:{heading:'THE WHOLE JOB.',intro:'Follow the work.',steps:[{stage:'Plan',title:'Give the crew the details.',copy:'Keep the address with the job.',platform:'Web + iPhone'}]}}
  const config = VariantConfigSchema.safeParse({sections:[registry.h.section,workflow,registry.p.section,registry.f.section,registry.c.section]})
  expect(config.success).toBe(true)
  if(!config.success)return
  const reviewed = {...registry,w:{section:config.data.sections[1],factIds:['jobs.details'],validUntil:null}}
  expect(materializeApprovedDraft({...draft,sectionIds:['h','w','p','f','c']},reviewed,draft.hypothesis).config.sections[1]).toEqual(workflow)
 })
 it('rejects unapproved customer identities even when a section is submitted as reviewed',()=>{
  const unverified = {type:'CustomerProofSection',props:{heading:'Customer proof',proofIds:['unverified-person']}}
  expect(VariantConfigSchema.safeParse({sections:[unverified]}).success).toBe(false)
  const invented = {type:'CustomerProofSection',props:{heading:'Customer proof',proofIds:[],quote:'Invented praise',name:'Invented person'}}
  expect(VariantConfigSchema.safeParse({sections:[invented]}).success).toBe(false)
  const changedQuote = {type:'CustomerProofSection',props:{heading:'Customer proof',proofIds:['ryan-crew-adoption-2026-07-06'],quote:'A fabricated result'}}
  expect(VariantConfigSchema.safeParse({sections:[changedQuote]}).success).toBe(false)
 })
 it('accepts an approved customer reference without accepting a duplicate endorsement',()=>{
  const section = {type:'CustomerProofSection',props:{heading:'Customer proof',proofIds:['ryan-crew-adoption-2026-07-06']}}
  expect(VariantConfigSchema.safeParse({sections:[section]}).success).toBe(true)
  expect(VariantConfigSchema.safeParse({sections:[{...section,props:{...section.props,proofIds:['ryan-crew-adoption-2026-07-06','ryan-crew-adoption-2026-07-06']}}]}).success).toBe(false)
 })
 it('keeps the approved proof, job mechanism and first-value argument in generated treatments',()=>{
  const sectionIds=['general.Hero','general.CustomerProofSection','general.WorkflowSection','general.GettingStartedSection','general.PricingSection','general.FAQSection','general.ClosingCTA']
  expect(()=>materializeApprovedDraft({...draft,sectionIds},APPROVED_SECTIONS,draft.hypothesis)).not.toThrow()
  for(const missing of ['general.CustomerProofSection','general.WorkflowSection','general.GettingStartedSection']) {
   expect(()=>materializeApprovedDraft({...draft,sectionIds:sectionIds.filter(id=>id!==missing)},APPROVED_SECTIONS,draft.hypothesis)).toThrow('Missing required persuasion section')
  }
 })
})
