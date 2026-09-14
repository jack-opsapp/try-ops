import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getABSupabase } from '@/lib/ab/supabase'
import { isProductionAnalyticsRequestUrl } from '@/lib/analytics/production-boundary'
import { ASSIGNMENT_COOKIE, hashIdentity, isOpaqueToken } from '@/lib/ab/identity'
import { PAID_PAGE_CONFIGS } from '@/lib/landing/page-configs'

const fixedPageIds = new Set([
  'fallback',
  ...Object.keys(PAID_PAGE_CONFIGS).map((slug) => `paid:${slug}`),
])
const experimentId = z.uuid()
const optionalText = z.string().max(256).nullable().optional().default(null)
const eventSchema = z.object({
  variant_id: z.string().refine((id) => fixedPageIds.has(id) || experimentId.safeParse(id).success),
  session_id: z.string().min(1).max(128),
  event_id: z.uuid().optional(),
  assignment_id: z.uuid().optional(),
  route: z.literal('/').optional(),
  event_type: z.enum([
    'page_view', 'signup_start', 'signup_complete', 'section_view',
    'element_click', 'scroll_depth', 'app_store_click', 'exposure', 'section_dwell',
  ]),
  section_name: z.string().max(80).nullable().optional().default(null),
  element_id: z.string().max(80).nullable().optional().default(null),
  dwell_ms: z.number().int().min(0).max(1800000).nullable().optional().default(null),
  value: z.number().min(0).max(100).nullable().optional().default(null),
  device_type: optionalText,
  referrer: optionalText,
  utm_source: optionalText,
  utm_medium: optionalText,
  utm_campaign: optionalText,
})

export async function POST(req: NextRequest) {
  if (!isProductionAnalyticsRequestUrl(req.url)) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const origin=req.headers.get('origin')
  if(origin&&origin!=='https://try.opsapp.co')return NextResponse.json({error:'Invalid origin'},{status:403})
  if(req.cookies.get('ops_qa')?.value==='1'||req.headers.get('x-ops-qa')||/(bot|crawler|headless|lighthouse)/i.test(req.headers.get('user-agent')??''))return NextResponse.json({ok:true,skipped:true})
  if(Number(req.headers.get('content-length')??0)>4096)return NextResponse.json({error:'Event too large'},{status:413})
  let body: unknown
  try {
    const raw=await req.text()
    if(raw.length>4096)return NextResponse.json({error:'Event too large'},{status:413})
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }

  try {
    const event = parsed.data
    const supabase: SupabaseClient = getABSupabase()

    // Fixed paid pages and the organic fallback are not experiment variants.
    // Preserve their telemetry in the existing text/JSON ledger without
    // fabricating A/B membership or incrementing canonical signup totals.
    if (fixedPageIds.has(event.variant_id)) {
      const { error } = await supabase.from('onboarding_events').insert({
        event_type: `landing_${event.event_type}`,
        variant: event.variant_id,
        metadata: event,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if(event.event_type==='signup_complete')return NextResponse.json({error:'Server outcome required'},{status:400})
    const token=req.cookies.get(ASSIGNMENT_COOKIE)?.value
    if(!isOpaqueToken(token)||!event.assignment_id||!event.event_id||!event.route)return NextResponse.json({error:'Verified assignment required'},{status:401})
    const tokenHash=await hashIdentity(token)
    const {data,error}=await supabase.rpc('collect_tryops_event',{
      p_token_hash:tokenHash,p_assignment_id:event.assignment_id,p_arm_id:event.variant_id,p_route:event.route,
      p_event:{event_id:event.event_id,event_type:event.event_type,section_name:event.section_name,element_id:event.element_id,dwell_ms:event.dwell_ms,value:event.value},
    })
    if(error){
      const loss=await supabase.rpc('report_tryops_collection_failure',{p_key:event.event_id,p_reason:'collection_failed',p_assignment_id:event.assignment_id,p_token_hash:tokenHash})
      if(loss.error)console.error('[tryops] collection_failure_unpersisted',event.event_id)
      return NextResponse.json({error:'Collection unavailable'},{status:503})
    }
    if(data?.status==='rejected')return NextResponse.json({error:'Invalid assignment',reason:data.reason},{status:409})
    if(!['collected','duplicate'].includes(data?.status))return NextResponse.json({error:'Collection unavailable'},{status:503})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
