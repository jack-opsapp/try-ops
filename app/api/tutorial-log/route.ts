import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://ijeekuhbatykdomumfjx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZWVrdWhiYXR5a2RvbXVtZmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzM2MTgsImV4cCI6MjA4Njg0OTYxOH0.pXYn9WRpVkWSJg2vHw2fjw8RsAmytnRGwEjb2Jwrn-c'

/** Insert a row into the Supabase tutorial_analytics table (fire-and-forget). */
async function logToSupabase(payload: {
  phase: string
  phaseIndex: number
  action: string
  durationMs: number
  totalElapsedMs: number
  flowType: string
  sessionId: string
}) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tutorial_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        platform: 'web',
        flow_type: payload.flowType,
        phase: payload.phase,
        phase_index: payload.phaseIndex,
        action: payload.action,
        duration_ms: payload.durationMs,
        total_elapsed_ms: payload.totalElapsedMs,
        session_id: payload.sessionId,
      }),
    })
  } catch (err) {
    console.error('Supabase tutorial_analytics insert failed:', err)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stepDuration, totalTime, variant, phase, phaseIndex, action, flowType, sessionId } = body

    // Send to Supabase (fire-and-forget)
    if (phase && sessionId) {
      logToSupabase({
        phase,
        phaseIndex: phaseIndex ?? 0,
        action: action ?? 'completed',
        durationMs: stepDuration ?? 0,
        totalElapsedMs: totalTime ?? 0,
        flowType: flowType ?? variant ?? 'companyCreator',
        sessionId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tutorial log error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
