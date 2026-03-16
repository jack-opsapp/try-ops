import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase/server-client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventType, userId, variant, decision, step, metadata } = body

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 })
    }

    const db = getServiceRoleClient()
    await db.from('onboarding_events').insert({
      event_type: eventType,
      user_id: userId || null,
      variant: variant || null,
      decision: decision || null,
      step: step || null,
      metadata: metadata || {},
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/onboarding-events] Error:', err)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}
