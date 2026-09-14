import { z } from 'zod'
import { VariantConfigSchema,type SectionEntry,type VariantConfig } from '@/lib/ab/types'
export type ApprovedSections=Record<string,{section:SectionEntry;factIds:string[];validUntil:string|null}>
export const DraftSelectionSchema=z.object({hypothesis:z.string().min(10).max(1000),sectionIds:z.array(z.string().min(1).max(100)).min(4).max(12),reasoning:z.string().min(1).max(2000)}).strict()
export function materializeApprovedDraft(raw:unknown,registry:ApprovedSections,hypothesis:string,now=new Date()):{config:VariantConfig;sectionIds:string[];reasoning:string;validUntil:string|null} {
 const draft=DraftSelectionSchema.parse(raw)
 if(!Number.isFinite(now.getTime())||draft.hypothesis!==hypothesis)throw new Error('Hypothesis mismatch')
 if(new Set(draft.sectionIds).size!==draft.sectionIds.length)throw new Error('Duplicate section identity')
 const config=VariantConfigSchema.parse({sections:draft.sectionIds.map(id=>{
  const approved=registry[id];if(!approved)throw new Error('Unknown approved section')
  if(approved.validUntil!==null&&(!Number.isFinite(Date.parse(approved.validUntil))||Date.parse(approved.validUntil)<=now.getTime()))throw new Error('Expired approved content')
  return approved.section
 })})
 const types=config.sections.map(s=>s.type)
 if(types[0]!=='Hero'||types.at(-1)!=='ClosingCTA'||!types.includes('PricingSection')||!types.includes('FAQSection')||new Set(types).size!==types.length)throw new Error('Missing required section or invalid ordering')
 if(types.some(t=>['InlineSignupForm','RoadmapSection','DesktopDownload','Starburst','TestimonialsSection'].includes(t)))throw new Error('Unsupported acquisition section')
 const hero=config.sections[0],closing=config.sections.at(-1)!
 if(hero.type!=='Hero'||closing.type!=='ClosingCTA'||hero.props.primaryCtaLabel!==closing.props.primaryCtaLabel||hero.props.secondaryCtaLabel||closing.props.secondaryCtaLabel)throw new Error('Incoherent primary action')
 if(hero.props.heroMode!=='product-proof')throw new Error('Approved product evidence required')
 const dates=draft.sectionIds.map(id=>registry[id].validUntil).filter((v):v is string=>v!==null).sort()
 return {config,sectionIds:draft.sectionIds,reasoning:draft.reasoning,validUntil:dates[0]??null}
}
