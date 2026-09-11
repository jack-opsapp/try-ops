import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getABSupabase } from '@/lib/ab/supabase'
import { isProductionAnalyticsRequestUrl } from '@/lib/analytics/production-boundary'
import { PAID_PAGE_CONFIGS } from '@/lib/landing/page-configs'

const fixedPageIds = new Set([
  'fallback',
  ...Object.keys(PAID_PAGE_CONFIGS).map((slug) => `paid:${slug}`),
])
const experimentId = z.uuid()
const optionalText = z.string().nullable().optional().default(null)
const eventSchema = z.object({
  variant_id: z.string().refine((id) => fixedPageIds.has(id) || experimentId.safeParse(id).success),
  session_id: z.string().min(1),
  event_type: z.enum([
    'page_view', 'signup_start', 'signup_complete', 'section_view',
    'element_click', 'scroll_depth', 'app_store_click',
  ]),
  section_name: optionalText,
  element_id: optionalText,
  dwell_ms: z.number().int().nullable().optional().default(null),
  value: z.number().nullable().optional().default(null),
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

  let body: unknown
  try {
    body = await req.json()
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

    const { error } = await supabase.from('ab_events').insert(event)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (event.event_type === 'page_view') {
      await supabase.rpc('increment_visitor_count', { variant_id: event.variant_id })
    }
    if (event.event_type === 'signup_complete') {
      await supabase.rpc('increment_signup_count', { variant_id: event.variant_id })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
