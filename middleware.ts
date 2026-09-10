import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  FIRST_TOUCH_COOKIE_NAME,
  FIRST_TOUCH_MAX_AGE_SECONDS,
  LEGACY_ATTRIBUTION_COOKIE_NAME,
  resolveFirstTouch,
  serializeFirstTouchPayload,
} from '@/lib/analytics/first-touch'

/**
 * Write the shared `__ops_first_touch` cookie on `.opsapp.co` exactly as
 * ops-site's middleware does, so a paid click's Google id (gclid / gbraid /
 * wbraid), UTMs, landing path, and referrer survive the hop to
 * app.opsapp.co/register — the web signup whose company step records them.
 * First touch wins: an existing canonical cookie is never rewritten.
 */
function attachFirstTouch(request: NextRequest, response: NextResponse): NextResponse {
  const decision = resolveFirstTouch({
    canonicalValue: request.cookies.get(FIRST_TOUCH_COOKIE_NAME)?.value,
    legacyValue: request.cookies.get(LEGACY_ATTRIBUTION_COOKIE_NAME)?.value,
    url: request.nextUrl.toString(),
    referrer: request.headers.get('referer') ?? '',
    capturedAt: new Date().toISOString(),
    anonymousId: crypto.randomUUID(),
  })
  if (!decision.shouldWrite || !decision.payload) return response

  const isOpsProductionHost =
    request.nextUrl.hostname === 'opsapp.co' ||
    request.nextUrl.hostname.endsWith('.opsapp.co')
  response.cookies.set({
    name: FIRST_TOUCH_COOKIE_NAME,
    value: serializeFirstTouchPayload(decision.payload),
    path: '/',
    domain: isOpsProductionHost ? '.opsapp.co' : undefined,
    maxAge: FIRST_TOUCH_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    httpOnly: false,
  })
  return response
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const variantParam = request.nextUrl.searchParams.get('variant')
  const existingCookie = request.cookies.get('ops_variant')?.value

  if (variantParam === 'a' || variantParam === 'b' || variantParam === 'c') {
    // URL param takes precedence, set/update cookie
    response.cookies.set('ops_variant', variantParam, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  } else if (!existingCookie) {
    // No param and no cookie: random 33/33/34 split
    const rand = Math.random()
    const randomVariant = rand < 0.33 ? 'a' : rand < 0.66 ? 'b' : 'c'
    response.cookies.set('ops_variant', randomVariant, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  return attachFirstTouch(request, response)
}

export const config = {
  matcher: [
    '/',
    '/tutorial/:path*',
    '/tutorial-intro',
    '/tutorial-interactive',
    '/signup/:path*',
    '/download',
    // Paid landing pages — one per Google ad group. The first-touch cookie has
    // to be written on arrival or the click id never reaches the signup.
    // /scheduling and /quotes-invoices are gone: measured demand showed the
    // terms behind them have no volume, so those ad groups were never built.
    '/job-management',
    '/compare/:path*',
    '/for/:path*',
  ],
}
