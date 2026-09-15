import { NextResponse } from 'next/server'
import { newOpaqueToken, ASSIGNMENT_COOKIE } from '@/lib/ab/identity'
import { DEMO_COOKIE, DEMO_COOKIE_AGE, readDemoToken, readOpaqueCookie, demoRequestEligible, demoSameOrigin, demoRpc, hashIdentity } from '@/lib/demo/server'
import type { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!demoSameOrigin(req)) return NextResponse.json({ error: 'invalid_origin' }, { status: 403, headers })
  if (!demoRequestEligible(req)) return new NextResponse(null, { status: 204, headers })
  try {
    const existing = readDemoToken(req.headers.get('cookie'))
    const token = existing ?? newOpaqueToken()
    const assignment = readOpaqueCookie(req.headers.get('cookie'), ASSIGNMENT_COOKIE)
    const result = await demoRpc('create_tryops_demo_session', {
      p_token_hash: await hashIdentity(token), p_create: !existing,
      p_assignment_token_hash: assignment ? await hashIdentity(assignment) : null,
    })
    if (result.status !== 'ready') {
      if (result.status !== 'rejected') throw new Error('invalid_response')
      const response = NextResponse.json(result, { status: 409, headers })
      if (existing) response.cookies.set(DEMO_COOKIE, '', { path: '/', domain: '.opsapp.co', maxAge: 0, httpOnly: true, secure: true, sameSite: 'lax' })
      return response
    }
    const response = NextResponse.json({ status: 'ready' }, { status: 200, headers })
    // Existing cookies are not refreshed; browser expiry follows original session.
    if (!existing) response.cookies.set(DEMO_COOKIE, token, { path: '/', domain: '.opsapp.co', maxAge: DEMO_COOKIE_AGE, httpOnly: true, secure: true, sameSite: 'lax' })
    return response
  } catch {
    console.error('[demo] session_unavailable')
    return NextResponse.json({ error: 'session_unavailable' }, { status: 503, headers })
  }
}
