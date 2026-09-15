import { NextResponse } from 'next/server'
import { CANONICAL_REGISTER } from '@/lib/demo/navigation'
export const dynamic = 'force-dynamic'
/** Native navigation remains available without JS, cookies, storage or collection. */
export async function GET(_req: Request) {
  const response = NextResponse.redirect(CANONICAL_REGISTER, 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
