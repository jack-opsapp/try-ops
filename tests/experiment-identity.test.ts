import {describe,it,expect} from 'vitest'
import {isEligibleRequest,hashIdentity,isOpaqueToken,newOpaqueToken} from '@/lib/ab/identity'
describe('opaque experiment identity',()=>{
 it('uses 256-bit non-PII random tokens with SHA256-only persistence',async()=>{const a=newOpaqueToken(),b=newOpaqueToken();expect(isOpaqueToken(a)).toBe(true);expect(a).not.toBe(b);expect(await hashIdentity(a)).toMatch(/^[a-f0-9]{64}$/)})
 it.each(['','a'.repeat(42),'a'.repeat(44),'../abc'])('rejects malformed bearer %s',(t)=>expect(isOpaqueToken(t)).toBe(false))
 it.each(['https://try.opsapp.co/?variant=b','https://try.opsapp.co/?preview=true','http://localhost:3000/'])('excludes preview/local traffic',url=>expect(isEligibleRequest(new URL(url),new Headers())).toBe(false))
 it('excludes known bots and internal QA',()=>{expect(isEligibleRequest(new URL('https://try.opsapp.co'),new Headers({'user-agent':'Googlebot'}))).toBe(false);expect(isEligibleRequest(new URL('https://try.opsapp.co'),new Headers({'x-ops-qa':'1'}))).toBe(false)})
 it('permits ordinary root visitors independently from tutorial variant',()=>expect(isEligibleRequest(new URL('https://try.opsapp.co'),new Headers({'cookie':'ops_variant=c'}))).toBe(true))
})
