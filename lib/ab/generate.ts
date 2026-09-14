import OpenAI from 'openai'
import { materializeApprovedDraft,type ApprovedSections } from '@/lib/ab/content'
interface GenerationInput {hypothesis:string;registry:ApprovedSections;allowedSectionIds:string[];registryVersion:string}
/** Real bounded adapter retained, dormant unless explicitly enabled. No call during tests. */
export async function generateChallenger(input:GenerationInput) {
 if(process.env.AB_GENERATION_ENABLED!=='true')throw new Error('generation_disabled')
 if(input.hypothesis.length<10||input.hypothesis.length>1000)throw new Error('Invalid hypothesis')
 const registry=Object.fromEntries(input.allowedSectionIds.map(id=>{if(!input.registry[id])throw new Error('Unknown section');return [id,input.registry[id]]}))
 const client=new OpenAI({timeout:90000,maxRetries:0})
 const response=await client.chat.completions.create({model:process.env.AB_GENERATION_MODEL||'gpt-4o',max_tokens:1500,temperature:0.2,response_format:{type:'json_object'},messages:[
  {role:'system',content:'Select only approved section IDs for a landing page experiment. Never write or alter copy, claims, prices, endorsements, images or destinations. Required order: Hero first, PricingSection and FAQSection present, ClosingCTA last. One of each type. Return exactly {hypothesis,sectionIds,reasoning}; hypothesis must match the supplied hypothesis verbatim. Supporting engagement diagnostics cannot choose a winner.'},
  {role:'user',content:JSON.stringify({hypothesis:input.hypothesis,registryVersion:input.registryVersion,approvedSections:registry})},
 ]})
 // Rejected output stays a rejection; no silent sanitization or treatment rewrites.
 return materializeApprovedDraft(JSON.parse(response.choices[0]?.message?.content??''),registry,input.hypothesis)
}
