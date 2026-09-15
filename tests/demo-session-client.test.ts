import { describe, expect, it } from 'vitest'
import { createDemoDelivery } from '../lib/demo/client'

describe('shared demo session establishment', () => {
  it('coalesces StrictMode/effect and rapid event races into one successful session request', async () => {
    const requests: string[]=[]
    const transport=createDemoDelivery(async (url) => {
      requests.push(String(url)); await Promise.resolve(); return Response.json({status:'ready'})
    }, async()=>{})
    await Promise.all([transport.initialize(),transport.initialize(),transport.track({action:'started',step:'assign',elapsedMs:0}),transport.track({action:'crew_viewed',step:'crew',elapsedMs:10})])
    expect(requests.filter(url=>url==='/api/demo/session')).toHaveLength(1)
    expect(requests.filter(url=>url==='/api/demo/events')).toHaveLength(2)
  })
  it('recovers a transient session storage failure before sending events', async () => {
    let sessions=0; const requests:string[]=[]
    const transport=createDemoDelivery(async url=>{
      requests.push(String(url));
      return Response.json({status:'ready'}, {status:url==='/api/demo/session' && ++sessions<3 ? 503 : 200})
    },async()=>{})
    expect(await transport.track({action:'started',step:'assign',elapsedMs:0})).toBe('recorded')
    expect(requests).toEqual(['/api/demo/session','/api/demo/session','/api/demo/session','/api/demo/events'])
  })
  it('bounds exhausted session failure and reports it distinctly without sending unbound events', async () => {
    const requests:string[]=[]
    const transport=createDemoDelivery(async url=>{requests.push(String(url));throw new Error('offline')},async()=>{})
    expect(await transport.track({action:'started',step:'assign',elapsedMs:0})).toBe('session_unavailable')
    expect(requests).toEqual(['/api/demo/session','/api/demo/session','/api/demo/session'])
  })
})
