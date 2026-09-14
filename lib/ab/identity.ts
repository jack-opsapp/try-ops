import { isProductionAnalyticsRequestUrl } from '@/lib/analytics/production-boundary'
export const ASSIGNMENT_COOKIE='__ops_experiment'
export const VISITOR_COOKIE='__ops_experiment_visitor'
export const MAX_AGE_SECONDS=30*86400
export function isOpaqueToken(value:unknown):value is string{return typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value)}
export function newOpaqueToken():string {
 const bytes=crypto.getRandomValues(new Uint8Array(32))
 return btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}
export async function hashIdentity(value:string):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('')}
export function isEligibleRequest(url:URL,headers:Headers):boolean {
 if(!isProductionAnalyticsRequestUrl(url)||url.pathname!=='/')return false
 if(['variant','preview','qa','ab_preview'].some(key=>url.searchParams.has(key)))return false
 if(headers.get('x-ops-qa')||headers.get('x-ops-internal')||headers.get('purpose')==='prefetch'||headers.get('next-router-prefetch'))return false
 if(/(?:bot|crawler|spider|headless|lighthouse|preview|monitor)/i.test(headers.get('user-agent')??''))return false
 if(/(?:^|;\s*)ops_qa=1(?:;|$)/.test(headers.get('cookie')??''))return false
 return true
}
