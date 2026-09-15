import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { demoRequestEligible, readDemoToken, parseDemoEvent } from '../lib/demo/server'
import { GET as startTrial } from '../app/demo/start-trial/route'

const token = 'a'.repeat(43)
describe('demo collection trust boundary', () => {
  it('requires exact production host and excludes QA/preview even with forged headers', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const req=(url:string,headers:Record<string,string>={}) => new Request(url,{headers})
    expect(demoRequestEligible(req('https://try.opsapp.co/api/demo/session'))).toBe(true)
    for(const url of ['http://localhost:3142/api/demo/session','https://evil.try.opsapp.co/api/demo/session','https://try.opsapp.co/api/demo/session?qa=1']) expect(demoRequestEligible(req(url))).toBe(false)
    for(const headers of [{'x-ops-qa':'1'},{cookie:'ops_qa=1'},{referer:'https://try.opsapp.co/demo?preview=1'},{'user-agent':'HeadlessChrome'}] as Record<string,string>[]) expect(demoRequestEligible(req('https://try.opsapp.co/api/demo/session',headers))).toBe(false)
    vi.stubEnv('VERCEL_ENV','preview')
    expect(demoRequestEligible(req('https://try.opsapp.co/api/demo/session'))).toBe(false)
  })
  it('rejects ambiguous, spoofed and malformed cookie identity', () => {
    expect(readDemoToken(`__ops_demo=${token}`)).toBe(token)
    for(const cookie of [null,'__ops_demo=spoofed',`__ops_demo=${token}; __ops_demo=${token}`]) expect(readDemoToken(cookie)).toBeNull()
  })
  it('rejects free text, invalid steps, forged versions and unbounded duration', () => {
    const valid={eventId:'5a54ef2e-5342-4ce2-b457-9f68d299a7de',version:'crew-job-v1',action:'job_assigned',step:'assign',elapsedMs:5}
    expect(parseDemoEvent(valid)).not.toBeNull()
    for (const step of ['assign','crew','complete']) expect(parseDemoEvent({...valid,action:'started',step})).not.toBeNull()
    for(const extra of [{email:'test@example.test'},{action:'signup_complete'},{elapsedMs:Infinity},{elapsedMs:-1},{elapsedMs:1.2},{elapsedMs:86400001},{step:'complete'},{version:'v999'}]) expect(parseDemoEvent({...valid,...extra})).toBeNull()
  })
  it('always sends native trial navigation to canonical registration without network or cookie dependency', async () => {
    const fetchSpy=vi.spyOn(globalThis,'fetch').mockRejectedValue(new Error('offline'))
    const response=await startTrial(new NextRequest('https://try.opsapp.co/demo/start-trial?next=https://evil.test&userId=spoofed'))
    expect(response.headers.get('location')).toBe('https://app.opsapp.co/register')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
