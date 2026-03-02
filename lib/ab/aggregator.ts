import { getABSupabase } from '@/lib/ab/supabase'

export interface SectionSummary {
  sectionName: string
  pctViewers: number    // % of page_view sessions who had a section_view for this section
  avgDwellMs: number    // avg dwell_ms across section_view events that have it
  clickRate: number     // element_click events / page_view sessions
}

export interface VariantSummary {
  variantId: string
  slot: 'a' | 'b'
  generation: number
  visitorCount: number
  signupCount: number
  conversionRate: number
  aiReasoning: string
  config: object
  sections: SectionSummary[]
  utmBreakdown: { source: string; visitors: number; signups: number }[]
}

export async function aggregateVariant(variantId: string): Promise<VariantSummary> {
  const supabase = getABSupabase() as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: variant } = await supabase
    .from('ab_variants')
    .select('id, slot, generation, visitor_count, signup_count, conversion_rate, ai_reasoning, config')
    .eq('id', variantId)
    .single()

  if (!variant) throw new Error(`Variant ${variantId} not found`)

  const totalVisitors = variant.visitor_count || 1 // avoid div/0

  // Section summaries
  const { data: sectionEvents } = await supabase
    .from('ab_events')
    .select('section_name, dwell_ms, event_type')
    .eq('variant_id', variantId)
    .in('event_type', ['section_view', 'element_click'])

  const sectionMap = new Map<string, { views: number; totalDwell: number; clicks: number }>()
  for (const e of sectionEvents ?? []) {
    if (!e.section_name) continue
    const s = sectionMap.get(e.section_name) ?? { views: 0, totalDwell: 0, clicks: 0 }
    if (e.event_type === 'section_view') {
      s.views++
      if (e.dwell_ms) s.totalDwell += e.dwell_ms
    }
    if (e.event_type === 'element_click') s.clicks++
    sectionMap.set(e.section_name, s)
  }

  const sections: SectionSummary[] = Array.from(sectionMap.entries()).map(([name, s]) => ({
    sectionName: name,
    pctViewers: Math.round((s.views / totalVisitors) * 100),
    avgDwellMs: s.views > 0 ? Math.round(s.totalDwell / s.views) : 0,
    clickRate: Math.round((s.clicks / totalVisitors) * 100) / 100,
  }))

  // UTM breakdown
  const { data: utmEvents } = await supabase
    .from('ab_events')
    .select('utm_source, event_type')
    .eq('variant_id', variantId)
    .in('event_type', ['page_view', 'signup_complete'])

  const utmMap = new Map<string, { visitors: number; signups: number }>()
  for (const e of utmEvents ?? []) {
    const src = e.utm_source ?? 'direct'
    const u = utmMap.get(src) ?? { visitors: 0, signups: 0 }
    if (e.event_type === 'page_view') u.visitors++
    if (e.event_type === 'signup_complete') u.signups++
    utmMap.set(src, u)
  }

  const utmBreakdown = Array.from(utmMap.entries()).map(([source, u]) => ({ source, ...u }))

  return {
    variantId: variant.id,
    slot: variant.slot as 'a' | 'b',
    generation: variant.generation,
    visitorCount: variant.visitor_count,
    signupCount: variant.signup_count,
    conversionRate: variant.conversion_rate,
    aiReasoning: variant.ai_reasoning,
    config: variant.config,
    sections,
    utmBreakdown,
  }
}
