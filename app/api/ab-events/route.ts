import { NextRequest, NextResponse } from 'next/server'
import { getABSupabase } from '@/lib/ab/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.variant_id || !body.session_id || !body.event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getABSupabase()
    const { error } = await supabase.from('ab_events').insert({
      variant_id: body.variant_id,
      session_id: body.session_id,
      event_type: body.event_type,
      section_name: body.section_name ?? null,
      element_id: body.element_id ?? null,
      dwell_ms: body.dwell_ms ?? null,
      value: body.value ?? null,
      device_type: body.device_type ?? null,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (body.event_type === 'page_view') {
      await supabase.rpc('increment_visitor_count', { variant_id: body.variant_id })
    }

    if (body.event_type === 'signup_complete') {
      await supabase.rpc('increment_signup_count', { variant_id: body.variant_id })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
