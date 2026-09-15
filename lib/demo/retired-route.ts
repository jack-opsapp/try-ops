import { NextResponse } from 'next/server'
import { CANONICAL_REGISTER } from './navigation'

/** Deliberately does not parse credentials, resolve identity, or send messages. */
export function retiredSignupRoute() {
  return NextResponse.json({
    error: 'Continue on OPS to sign in or finish setup.',
    destination: CANONICAL_REGISTER,
  }, { status: 410, headers: { 'Cache-Control': 'no-store' } })
}
