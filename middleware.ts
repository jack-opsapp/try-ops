import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const variantParam = request.nextUrl.searchParams.get('variant')
  const existingCookie = request.cookies.get('ops_variant')?.value

  if (variantParam === 'a' || variantParam === 'b') {
    // URL param takes precedence, set/update cookie
    response.cookies.set('ops_variant', variantParam, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  } else if (!existingCookie) {
    // No param and no cookie: random 50/50 split
    const randomVariant = Math.random() < 0.5 ? 'a' : 'b'
    response.cookies.set('ops_variant', randomVariant, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/', '/tutorial/:path*', '/tutorial-intro', '/tutorial-interactive', '/signup/:path*', '/download'],
}
