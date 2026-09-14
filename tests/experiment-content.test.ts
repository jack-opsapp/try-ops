import {describe,it,expect,vi} from 'vitest'
import {materializeApprovedDraft,type ApprovedSections} from '@/lib/ab/content'
import {generateChallenger} from '@/lib/ab/generate'
const registry:ApprovedSections={h:{section:{type:'Hero',props:{headline:'Approved',subtext:'Approved',primaryCtaLabel:'START MY FREE TRIAL',secondaryCtaLabel:'',heroMode:'product-proof'}},factIds:['product'],validUntil:null},p:{section:{type:'PricingSection',props:{}},factIds:['offer'],validUntil:null},f:{section:{type:'FAQSection',props:{faqs:[]}},factIds:['product'],validUntil:null},c:{section:{type:'ClosingCTA',props:{headline:'Approved',subtext:'Approved',primaryCtaLabel:'START MY FREE TRIAL',secondaryCtaLabel:''}},factIds:['offer'],validUntil:null}}
const draft={hypothesis:'Approved hypothesis',sectionIds:['h','p','f','c'],reasoning:'Approved selection'}
describe('approved content boundary',()=>{
 it('materializes exact approved section bytes',()=>expect(materializeApprovedDraft(draft,registry,draft.hypothesis).config.sections[0]).toEqual(registry.h.section))
 it('rejects invented prose and testimonials',()=>expect(()=>materializeApprovedDraft({...draft,config:{testimonials:['invented']}},registry,draft.hypothesis)).toThrow())
 it('rejects unknown, missing, repeated and incorrectly ordered sections',()=>{for(const sectionIds of [['h','x','f','c'],['h','f','c'],['h','p','p','c'],['p','h','f','c']])expect(()=>materializeApprovedDraft({...draft,sectionIds},registry,draft.hypothesis)).toThrow()})
 it('rejects stale claims without silently repairing a draft',()=>expect(()=>materializeApprovedDraft(draft,{...registry,p:{...registry.p,validUntil:'2020-01-01'}},draft.hypothesis)).toThrow())
 it('cannot change declared hypothesis',()=>expect(()=>materializeApprovedDraft(draft,registry,'Different hypothesis')).toThrow())
 it('keeps model adapter dormant without API invocation',async()=>{vi.stubEnv('AB_GENERATION_ENABLED','false');await expect(generateChallenger({hypothesis:draft.hypothesis,registry,allowedSectionIds:draft.sectionIds,registryVersion:'1'})).rejects.toThrow('generation_disabled');vi.unstubAllEnvs()})
})
