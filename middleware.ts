import { withinLandingDeadline } from '@/lib/ab/landing-deadline'
import { NextResponse } from 'next/server'
import { ASSIGNMENT_COOKIE, VISITOR_COOKIE, MAX_AGE_SECONDS, hashIdentity, isOpaqueToken, newOpaqueToken, isEligibleRequest } from '@/lib/ab/identity'
import { getABSupabase } from '@/lib/ab/supabase'
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

export async function middleware(request: NextRequest) {
  const forwarded=new Headers(request.headers)
  forwarded.delete('x-tryops-excluded')
  const eligible=isEligibleRequest(request.nextUrl,request.headers)
  if(!eligible)forwarded.set('x-tryops-excluded','1')
  let newToken:string|undefined,newVisitor:string|undefined
  if(eligible && process.env.AB_EXPERIMENTS_ENABLED==='true') {
    try {
      const assigned=await withinLandingDeadline(async signal=>{
      const existing=request.cookies.get(ASSIGNMENT_COOKIE)?.value
      const db=getABSupabase()
      const resolved=isOpaqueToken(existing)?await db.rpc('resolve_tryops_assignment',{p_token_hash:await hashIdentity(existing),p_route:'/'}).abortSignal(signal):null
      if(!resolved?.data&&!resolved?.error) {
        const visitor=request.cookies.get(VISITOR_COOKIE)?.value
        const identity=isOpaqueToken(visitor)?visitor:newOpaqueToken()
        const token=newOpaqueToken()
        const {data,error}=await db.rpc('assign_tryops_experiment',{p_visitor_hash:await hashIdentity(identity),p_token_hash:await hashIdentity(token),p_route:'/'}).abortSignal(signal)
        if(!error&&data?.status==='assigned')return {token,visitor:isOpaqueToken(visitor)?undefined:identity}
      }
      return undefined
      })
      newToken=assigned?.token;newVisitor=assigned?.visitor
    }catch{forwarded.set('x-tryops-excluded','1');console.error('[tryops] assignment_unavailable')}
  }
  if(newToken) {
    const cookieParts=(forwarded.get('cookie')??'').split(';').filter(c=>!c.trim().startsWith(ASSIGNMENT_COOKIE+'='))
    cookieParts.push(ASSIGNMENT_COOKIE+'='+newToken)
    forwarded.set('cookie',cookieParts.join('; '))
  }
  const response = NextResponse.next({request:{headers:forwarded}})
  if(newToken)response.cookies.set(ASSIGNMENT_COOKIE,newToken,{maxAge:MAX_AGE_SECONDS,path:'/',domain:'.opsapp.co',sameSite:'lax',secure:true,httpOnly:true})
  if(newVisitor)response.cookies.set(VISITOR_COOKIE,newVisitor,{maxAge:MAX_AGE_SECONDS,path:'/',sameSite:'lax',secure:true,httpOnly:true})
  if(request.nextUrl.searchParams.has('variant')||request.nextUrl.searchParams.has('preview')||request.nextUrl.searchParams.has('qa'))response.cookies.set('ops_qa','1',{maxAge:86400,path:'/',sameSite:'lax',httpOnly:true})
  // Demo visits capture first touch without the retired tutorial split.
  if (request.nextUrl.pathname.startsWith('/demo')) return attachFirstTouch(request, response)
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
    '/demo/:path*',
    // Paid landing pages — one per Google ad group. The first-touch cookie has
    // to be written on arrival or the click id never reaches the signup.
    // /scheduling and /quotes-invoices are gone: measured demand showed the
    // terms behind them have no volume, so those ad groups were never built.
    '/job-management',
    '/compare/:path*',
    '/for/:path*',
  ],
}
