import { NextResponse } from 'next/server'
import { readDemoToken, demoRequestEligible, demoSameOrigin, demoRpc, hashIdentity, readBoundedBody, parseDemoEvent } from '@/lib/demo/server'
export const dynamic = 'force-dynamic'
export async function POST(req: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!demoSameOrigin(req)) return NextResponse.json({ error: 'invalid_origin' }, { status: 403, headers })
  if (!demoRequestEligible(req)) return new NextResponse(null, { status: 204, headers })
  let event
  try { event = parseDemoEvent(await readBoundedBody(req)) } catch { /* invalid or oversized JSON */ }
  if (!event) return NextResponse.json({ error: 'invalid_event' }, { status: 400, headers })
  const token = readDemoToken(req.headers.get('cookie'))
  if (!token) return NextResponse.json({ error: 'session_required' }, { status: 409, headers })
  try {
    const result = await demoRpc('collect_tryops_demo_event', {
      p_token_hash: await hashIdentity(token), p_event_id: event.eventId,
      p_action: event.action, p_step: event.step, p_elapsed_ms: event.elapsedMs,
      p_error_code: event.errorCode ?? null,
    })
    if (result.status === 'recorded' || result.status === 'duplicate') return NextResponse.json(result, { status: result.status === 'recorded' ? 201 : 200, headers })
    if (result.status === 'rejected') return NextResponse.json(result, { status: result.reason === 'session_limit' ? 429 : 409, headers })
    throw new Error('invalid_response')
  } catch {
    console.error('[demo] collection_unavailable', { eventId: event.eventId })
    return NextResponse.json({ error: 'collection_unavailable' }, { status: 503, headers })
  }
}
